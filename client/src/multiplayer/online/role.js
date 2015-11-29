var Input = require('../../input');
var OnlineInputSource = require('../../input/source/online');
var StatePlayer = require('./state/player');

module.exports = (function (app, _, io) {

  var playableEntities = ['ball1', 'ball2'];

  var MasterRole = function(stateBuffer, stateProxy, ownPlayer) {
    this.stateBuffer = stateBuffer;
    this.stateProxy = stateProxy;

    if(!ownPlayer)
      this.ownPlayer = playableEntities[0];
    else
      this.ownPlayer = ownPlayer;

    _.without(playableEntities, this.ownPlayer).forEach(function(playableEntityName){
      this.input = Input.getEntityInput(app.root.findByName(playableEntityName));
      this.input.setInputSource(new OnlineInputSource(this.stateProxy, playableEntityName));
    }, this);
  };

  MasterRole.prototype = {
    bindProxyHandlers: function(proxy) {},
    unbindProxyHandlers: function(proxy) {},

    update: function(dt) {
      this.stateBuffer.storeFrame(dt);
      this.stateProxy.emit('tick', this.stateBuffer.frames);
      this.stateBuffer.flush();
    }
  };

  var SlaveRole = function(stateBuffer, stateProxy, ownPlayer) {
    this.stateBuffer = stateBuffer;
    this.stateProxy = stateProxy;
    this.statePlayer = new StatePlayer();

    this.onNewFrame = _.bind(this.onNewFrame, this);

    if(!ownPlayer)
      this.ownPlayer = playableEntities[1];
    else
      this.ownPlayer = ownPlayer;

    this.input = Input.getEntityInput(app.root.findByName(this.ownPlayer));
    this.input.setInputSource(new Input.KeyboardSource());

    this.syncFrameTimer = null;
    this.syncFrameInterval = 0;
    this.lastFrames = null;
  };

  SlaveRole.prototype = {
    bindProxyHandlers: function(proxy) {
      proxy.on('new_frame', this.onNewFrame);
    },

    unbindProxyHandlers: function(proxy) {
      proxy.removeListener('new_frame', this.onNewFrame);
    },

    update: function(dt) {
      this.sendOwnInput();

      if((this.syncFrameTimer >= this.syncFrameInterval && this.lastFrames) || this.syncFrameTimer === null) {
        this.statePlayer.play(this.lastFrames);
        this.syncFrameTimer = 0;
        this.lastFrames = null;
      } else {
        this.syncFrameTimer += dt;
      }
    },

    sendOwnInput: function() {
      this.stateProxy.emit('frame-input', {
        from: this.ownPlayer,
        frame: this.getOwnInput()
      });
    },

    getOwnInput: function() {
      var commands = Input.KeyboardSource.DirectionMap.DIRECTIONS,
          input = [];

      for (var i = 0; i < commands.length; i++) {
        var command = commands[i];
        if(this.input.isApplied(command))
          input.push(command);
      }

      return input;
    },

    onNewFrame: function(data) {
      //this.statePlayer.play(data.frames);
      this.lastFrames = data.frames;
    }
  };

  return {
    Master: MasterRole,
    Slave: SlaveRole
  };

})(pc.Application.getApplication(), _);
