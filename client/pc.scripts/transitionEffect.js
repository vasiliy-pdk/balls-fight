// Adds visual effect to a mesh.
// 
// Scales the mesh with specified amplitude
pc.script.attribute('min', 'vector', [1, 1, 1], {
    displayName: 'Minimum scale'
});

pc.script.attribute('max', 'vector', [1, 1, 1], {
    displayName: 'Maximum scale'
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

// pc.script.attribute('parametr', 'enumerable');

pc.script.create('transitionEffect', function (app) {
    // Creates a new TransitionEffect instance
    var TransitionEffect = function (entity) {
        this.entity = entity;
        this.time = 0;
    };

    TransitionEffect.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.duration /= 1000;
            this.ascilateFunction = this.getAscilateFunction();
            
            this.entity.setLocalScale(this.min);
            
            this.ratio = this.max.clone().sub(this.min).scale(1/2);
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            this.time += dt;   
            var scale = this.ratio.clone().scale(this.ascilateFunction((2 * Math.PI * this.time / this.duration)) + 1).add(this.min);
            this.entity.setLocalScale(scale);
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

    return TransitionEffect;
});