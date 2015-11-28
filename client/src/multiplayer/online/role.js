Game.Multiplayer = Game.Multiplayer || {};

Game.Multiplayer.Online.Role = (function (app, _, io) {

  var MasterRole = function(stateBuffer, stateProxy) {
    this.stateBuffer = stateBuffer;
    this.stateProxy = stateProxy;
  };

  MasterRole.prototype = {
    bindProxyHandlers: function(proxy) {},
    unbindProxyHandlers: function(proxy) {},

    update: function(dt) {
      // TODO: handle input
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
  };

  SlaveRole.prototype = {
    bindProxyHandlers: function(proxy) {
      proxy.on('new_frame', this.onNewFrame);
    },

    unbindProxyHandlers: function(proxy) {
      proxy.removeListener('new_frame', this.onNewFrame);
    },

    update: function(dt) {
      // TODO: send input
    },

    onNewFrame: function(data) {
      this.statePlayer.play(data.frames);
    }
  };

  return {
    Master: MasterRole,
    Slave: SlaveRole
  };

})(pc.Application.getApplication(), _);
