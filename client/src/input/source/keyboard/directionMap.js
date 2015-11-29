var DirectionMap = function(mapType) {
  this.map = DirectionMap.MAPS[mapType];
};

DirectionMap.prototype = {
  getKey: function (dir) {
    return this.map[dir];
  }
};

DirectionMap.DIRECTIONS = ['n', 's', 'e', 'w'];

DirectionMap.MAPS = [
  // 0: Arrows
  {
    n: pc.KEY_UP,
    s: pc.KEY_DOWN,
    e: pc.KEY_RIGHT,
    w: pc.KEY_LEFT
  },
  // 1: Wsad
  {
    n: pc.KEY_W,
    s: pc.KEY_S,
    e: pc.KEY_D,
    w: pc.KEY_A
  },
  // 2: Numbers
  {
    n: pc.KEY_NUMPAD_5,
    s: pc.KEY_NUMPAD_2,
    e: pc.KEY_NUMPAD_3,
    w: pc.KEY_NUMPAD_1
  }
];

DirectionMap.MAP_ARROWS = 0;
DirectionMap.MAP_WSAD = 1;
DirectionMap.MAP_NUMBERS = 2;

module.exports = DirectionMap;
