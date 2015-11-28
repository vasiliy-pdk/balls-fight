pc.script.create('game', function (app) {
  // Creates a new GameStateBuffer instance
  var GameScript = function (entity) {
    this.entity = entity;
    this.game = null;
  };

  GameScript.prototype = {
    // Called once after all resources are loaded and before the first update
    initialize: function () {
      this.game = Game.Multiplayer.Online();
      this.game.initialize();
    },

    // Called every frame, dt is time in seconds since last update
    update: function (dt) {
      this.game.update(dt);
    }
  };

  return GameScript;
});
