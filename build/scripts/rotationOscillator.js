// Adds visual effect to a mesh.
// 
// Rotates the mesh with specified amplitude
pc.script.attribute('ampl', 'vector', [0, 0, 0], {
  displayName: 'Rotation amplitude'
});

pc.script.attribute('duration', 'number', 1000, {
  min: 0,
  displayName: 'Duration in ms'
});

pc.script.attribute('func', 'enumeration', 'Sin', {
  enumerations: [
    {
      name: 'Discrete',
      value: 'Discr'
    },
    {
      name: 'Sin',
      value: 'Sin'
    },
    {
      name: 'Linear',
      value: 'Linear'
    }
  ],
  displayName: 'Ascilate timing function'
});

pc.script.create('rotationOscillator', function (app) {
  // Creates a new TransitionEffect instance
  var RotationOscillator = function (entity) {
    this.entity = entity;
    this.time = 0;
  };

  RotationOscillator.prototype = {
    // Called once after all resources are loaded and before the first update
    initialize: function () {
      this.duration /= 1000;
      this.ascilateFunction = this.getAscilateFunction();
    },

    // Called every frame, dt is time in seconds since last update
    update: function (dt) {
      this.time += dt;
      this.doRotate(this.time, dt);
    },

    doRotate: function(time, dt) {
      var rotation;
      rotation = this.ampl.clone().scale(this.ascilateFunction((2 * Math.PI * time / this.duration)));
      this.entity.setLocalEulerAngles(rotation);
    },

    getAscilateFunction: function() {
      return this['ascilateTime' + this.func];
    },

    ascilateTimeSin: function(time) {
      return Math.sin(time);
    },

    ascilateTimeDiscr: function(time) {
      var sin = Math.sin(time);
      if (sin > 0)
        return 1;
      else if (sin < 0)
        return -1;
      else
        return 0;
    },

    ascilateTimeLinear: function(time) {
      return 2 * Math.asin(Math.sin(time/2*Math.PI)) / Math.PI;
    }
  };

  return RotationOscillator;
});
