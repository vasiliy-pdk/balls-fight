var Game = Game || {};

Game.Multiplayer = (function (app, _) {

  var getServerUrl = function() {
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

  Game.config.serverUrl = getServerUrl();

  OnlineSpectator = function (app) {
    Game.call(this, app);

    this.stateBuffer = null;
    // TODO: stateProxy? / networkProxy?
    this.proxy = null;
  };

  _.extend(OnlineSpectator.prototype, {
    initialize: function () {
      this.statePlayer = this.newStatePlayer();
      this.proxy = this.newProxy();
      this.syncInterval = 0.05;
      this.timeSinseLastSync = 0;
      this.lastReceivedFrames = null;
      console.log('OnlineSpectator initialized');
    },

    update: function (dt) {
//             this.timeSinseLastSync += dt;
//             if (this.lastReceivedFrames && this.timeSinseLastSync >= this.syncInterval) {
//                 this.statePlayer.play(this.lastReceivedFrames);
//                 this.time = 0;
//             }
    },

    newStatePlayer: function () {
      return new Game.State.Player();
    },

    newProxy: function () {
      var socket = io(Game.config.serverUrl);
      socket.on('greeting', function (data) {
        console.log(data);
      });


      socket
        .on('set-role', function(data) {
          console.log('Setting role: ', data);
        })
        .on('new_frame', _.bind(function (data) {
            this.statePlayer.play(data.frames);
    //                 this.statePlayer.setFrames(data.frames);
    //                 this.lastReceivedFrames = data.frames;
        }, this))
        .on('disconnect', function(data) {
          console.log('Server disconnected', data);
        });

      socket.on('player-connected', function(data) {
        console.log('player connected');
      });

      socket.on('player-disconnected', function(data) {
        console.log('player disconnected');
      });

      return socket;
    }
  });

  exports = {};
  exports.Online = {};
  exports.Online.Spectator = OnlineSpectator;

  return exports;
})(pc.Application.getApplication(), _);
