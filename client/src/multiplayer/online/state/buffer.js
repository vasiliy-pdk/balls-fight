var FrameStorable = require('./storable').FrameStorable;

module.exports = (function(app, _, FrameStorable) {

  // Creates a new GameStateBuffer instance
  var GameStateBuffer = function () {
    // Entities to store
    this.storables = null;

    this.frames = null;
  };

  GameStateBuffer.prototype = {
    // Called once after all resources are loaded and before the first update
    initialize: function () {
      this.frames = [];
      this.initStorables(this.getStorableNames());
    },

    initStorables: function (names) {
      names.forEach(function (name) {
        var entity = app.root.findByName(name);
        FrameStorable.factory(entity);
      }, this);
    },

    storeFrame: function (dt) {
      var frame = {
        dt: dt,
        time: _.now(),
        entities: []
      };

      this.getStorables().forEach(function (storable) {
        frame.entities.push(storable.getState());
      }, this);

      this.frames.push(frame);
    },

    flush: function() {
      this.frames = [];
    },

    getStorables: function() {
      return _.values(FrameStorable.getAll());
    },

    // @TODO: get from the config
    getStorableNames: function () {
      var names = ['ball1', 'ball2', 'teleport-b'];
      _.range(1, 3).forEach(function (id) {
         names.push('wooden-crate-' + id);
      });
      return names;
    }
  };

  return GameStateBuffer;

})(pc.Application.getApplication(), _, FrameStorable);
