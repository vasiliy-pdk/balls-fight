var StateBuffer = require('./state/buffer');
var roles = require('./role');

module.exports = (function (app, _, io) {

  var getServerUrl = function () {
    var search = document.location.search,
        serverUrl = 'http://shielded-scrubland-7178.herokuapp.com';

    // Run the game launched with local codebase on the local server by default.
    // Add ?server=remote url argument to run on remote server
    //
    // Run the game launched with original codebase on the remote server by default.
    // But allow to switch to the local one using ?server=local url argument
    if (!search.match('server=remote') && (search.match('server=local') || search.match('local=')))
      serverUrl = 'http://localhost:3000';

    return serverUrl;
  };

  OnlineMultiplayer = function () {
    this.role = null;
    this.stateBuffer = null;
    this.stateProxy = null;
  };

  OnlineMultiplayer.prototype = {
    initialize: function () {
      this.stateProxy = this.initStateProxy();
      this.stateBuffer = this.initStateBuffer();
    },

    initStateProxy: function () {
      var socket = io(getServerUrl());
      this.bindProxyHandlers(socket);
      return socket;
    },

    initStateBuffer: function () {
      var buffer = new StateBuffer();
      buffer.initialize();
      return buffer;
    },

    bindProxyHandlers: function (proxy) {
      var self = this;
      proxy
          .on('set-role', function (data) {
            console.log('Setting role: ', data);
            self.setRole(data.role, data.entityName);
          })
          .on('disconnect', function (data) {
            console.log('Server disconnected', data);
          })
          .on('player-connected', function (data) {
            console.log('Player connected: ', data.entityName);
          })
          .on('player-disconnected', function (data) {
            console.log('Player disconnected: ', data.entityName);
          });
    },

    newRole: function (role, ownPlayer) {
      var roleClass;
      if (role === 'master') {
        roleClass = 'Master';
      } else {
        roleClass = 'Slave';
      }

      return new roles[roleClass](this.stateBuffer, this.stateProxy, ownPlayer);
    },

    setRole: function (role, entityName) {
      if (this.role) {
        if (this.role.name === role) return;
        this.role.unbindProxyHandlers(this.stateProxy);
        this.role = null;
      }

      this.role = this.newRole(role, entityName);
      this.role.bindProxyHandlers(this.stateProxy);
    },

    update: function (dt) {
      if (this.role) this.role.update(dt);
    }
  };

  return OnlineMultiplayer;
})(pc.Application.getApplication(), _, io);
