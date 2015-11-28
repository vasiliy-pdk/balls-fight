Game = (function (app, _) {

  var Game = function (app) {
    this.app = app;
  };

  Game.prototype = {};

  Game.config = {};

  return Game;
})(pc.Application.getApplication(), _);

// TODO: use requirejs or commonjs instead of this
Game.Multiplayer = {};
Game.Multiplayer.Online = {};
