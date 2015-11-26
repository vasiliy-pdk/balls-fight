/*
 * Top level namespace for all custom components
 */

Game = (function (app, _) {
  console.log('Game module loaded');

  var Game = function (app) {
    this.app = app;
  };

  Game.prototype = {};

  return Game;
})(pc.Application.getApplication(), _);
