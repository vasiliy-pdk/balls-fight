var _ = require('underscore');
var GameServer = require('gameServer');

var GamesCluster = function() {
  this.maxActiveGames = 8;
  this.games = [];
};

GamesCluster.prototype = {
  dispatchPlayer: function(player) {
    var freeServer = this.findGameServer();
    if(!freeServer) {
      player.emit('game-unavailable', {reason: 'Server is full'});
      player.disconnect();
    } else
      freeServer.addPlayer(player);
  },

  findGameServer: function() {
    var gameServer;

    this.cleanDestroyed();

    gameServer = _.find(this.games, function(game) {
      return game.needPlayers();
    });

    if(!gameServer && this.games.length < this.maxActiveGames) {
      gameServer = new GameServer();
      this.games.push(gameServer);
    }

    return gameServer;
  },

  cleanDestroyed: function() {
    var destroyed = _.filter(this.games, function(game) {
      return game.toDelete;
    });

    this.games = _.without(this.games, destroyed);
  }
};

var instance;

if(!instance)
  instance = new GamesCluster();

module.exports = instance;
