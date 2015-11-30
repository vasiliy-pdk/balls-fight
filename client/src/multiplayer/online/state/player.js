var app = require('../../../app'),
    storables = require('./storable');

// GameStatePlayer replays a stored game state
var GameStatePlayer = function (frames) {
  this.frames = frames || [];
  this.framesLeft = this.frames.length;
};

GameStatePlayer.prototype = {
  play: function (frames) {
    if (frames) this.setFrames(frames);

    if (!this.framesLeft) return;

    this.playFrame();

    this.framesLeft--;
  },

  playFrame: function () {
    var frame = this.frames.shift();

    frame.entities.forEach(function (entityState) {
      var entity = app.root.findByName(entityState.name);
      var storable = storables.factory(entity);
      storable.restore(entityState);
    }, this);
  },

  setFrames: function (frames) {
    this.frames = frames;
    this.framesLeft = frames.length;
  }
};

module.exports = GameStatePlayer;
