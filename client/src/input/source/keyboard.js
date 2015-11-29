var app = require('../../app'),
    DirectionMap = require('./keyboard/directionMap');

var KeyboardSource = function(dMap) {
  this.dMap = dMap || new DirectionMap(DirectionMap.MAP_ARROWS);
};

KeyboardSource.prototype = {
  isApplied: function(command) {
    return app.keyboard.isPressed(this.dMap.getKey(command));
  },

  destroy: function() {
    delete this.dMap;
  }
};

KeyboardSource.DirectionMap = DirectionMap;

module.exports = KeyboardSource;
