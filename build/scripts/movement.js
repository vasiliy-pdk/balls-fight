// Controls the movement speed
pc.script.attribute('speed', 'number', 0.1, {
  min: 0.05,
  max: 0.5,
  step: 0.05,
  decimalPrecision: 2
});

pc.script.attribute('controlMap', 'enumeration', 0, {
  enumerations: [{
    name: 'Arrows',
    value: Game.Input.DirectionMap.MAP_ARROWS
  }, {
    name: 'Wsad',
    value: Game.Input.DirectionMap.MAP_WSAD
  }, {
    name: 'Numbers',
    value: Game.Input.DirectionMap.MAP_NUMBERS
  }]
});

// Script Definition
pc.script.create('movement', function (app) {

  // Creates a new Movement instance
  var Movement = function (entity) {
    this.entity = entity;
    this.force = new pc.Vec3();
  };

  Movement.prototype = {
    initialize: function () {
      this.input = Game.Input.getEntityInput(this.entity);
      if(this.controlMap) {
        var dMap = new Game.Input.DirectionMap(this.controlMap);
        this.input.setInputSource(new Game.Input.KeyboardSource(dMap));
      }

      this.entity.collision.on('collisionstart', this.onCollisionStart, this);
    },

    // Called every frame, dt is time in seconds since last update
    update: function (dt) {
      var forceX = 0;
      var forceZ = 0;

      // calculate force based on pressed keys
      if (this.input.isApplied('w')) {
        forceX = -this.speed;
      }

      if (this.input.isApplied('e')) {
        forceX += this.speed;
      }

      if (this.input.isApplied('n')) {
        forceZ = -this.speed;
      }

      if (this.input.isApplied('s')) {
        forceZ += this.speed;
      }

      this.force.x = forceX;
      this.force.z = forceZ;

      // if we have some non-zero force
      if (this.force.length()) {

        // calculate force vector
        var rX = Math.cos(-Math.PI * 0.25);
        var rY = Math.sin(-Math.PI * 0.25);
        this.force.set(this.force.x * rX - this.force.z * rY, 0, this.force.z * rX + this.force.x * rY);

        // clamp force to the speed
        if (this.force.length() > this.speed) {
          this.force.normalize().scale(this.speed);
        }
      }

      // apply impulse to move the entity
      this.entity.rigidbody.applyImpulse(this.force);
    },

    onCollisionStart: function (result) {
      if (result.other.rigidbody.type === pc.BODYTYPE_DYNAMIC) {
        this.entity.audiosource.play('ball_hit');
      }
    }
  };

  return Movement;
});
