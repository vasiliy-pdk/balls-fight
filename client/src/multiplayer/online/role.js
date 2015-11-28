Game.Multiplayer = Game.Multiplayer || {};

Game.Multiplayer.Online.Role = (function (app, _, io) {

  var MasterRole = function(stateBuffer, stateProxy) {
    this.stateBuffer = stateBuffer;
    this.stateProxy = stateProxy;

    this.ownPlayer = app.root.findByName('ball1');

    this.input = Game.Input.getEntityInput(app.root.findByName('ball2'));
    this.input.setInputSource(new Game.Multiplayer.Online.InputSource(this.stateProxy, 'ball2'));
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

  var SlaveRole = function(stateBuffer, stateProxy) {
    this.stateBuffer = stateBuffer;
    this.stateProxy = stateProxy;
    this.statePlayer = new Game.Multiplayer.Online.State.Player();

    this.onNewFrame = _.bind(this.onNewFrame, this);

    this.ownPlayer = app.root.findByName('ball2');

    this.input = Game.Input.getEntityInput(app.root.findByName('ball2'));

    this.syncFrameTimer = 0;
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

      if((_.now() - this.syncFrameTimer) >= this.syncFrameInterval && this.lastFrames) {
        this.statePlayer.play(this.lastFrames);
        this.syncFrameTimer = 0;
        this.lastFrames = null;
      } else {
        this.syncFrameTimer += dt;
      }
    },

    sendOwnInput: function() {
      // TODO: take into account game's id
      this.stateProxy.emit('frame-input', {
        from: this.ownPlayer.getName(),
        frame: this.getOwnInput()
      });
    },

    getOwnInput: function() {
      var commands = Game.Input.DirectionMap.DIRECTIONS,
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
