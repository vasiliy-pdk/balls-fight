Game.Multiplayer.Online.State.Buffer = (function(app, _, FrameStoreable) {

  // Creates a new GameStateBuffer instance
  var GameStateBuffer = function () {
    // Entities to store
    this.storables = null;

    this.frames = null;
  };

  GameStateBuffer.prototype = {
    // Called once after all resources are loaded and before the first update
    initialize: function () {
      this.storables = [];
      this.frames = [];
      this.initStoreables(this.getStorableNames());
    },

    initStoreables: function (names) {
      names.forEach(function (name) {
        var entity = app.root.findByName(name);
        this.storables.push(FrameStoreable.factory(entity));
      }, this);
    },

    storeFrame: function (dt) {
      var frame = {
        dt: dt,
        time: _.now(),
        entities: []
      };

      this.storables.forEach(function (storable) {
        frame.entities.push(storable.getState());
      }, this);

      this.frames.push(frame);
    },

    flush: function() {
      this.frames = [];
    },

    // @TODO: get from the config
    getStorableNames: function () {
      var names = ['ball1', 'ball2', 'teleport-b'];
//             _.range(1, 10).forEach(function (id) {
//                 names.push('wooden-crate-' + id);
//             });
      return names;
    }
  };

  return GameStateBuffer;

})(pc.Application.getApplication(), _, Game.Multiplayer.Online.State.FrameStoreable);
