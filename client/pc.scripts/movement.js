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
        value: 0
    }, {
        name: 'Wsad',
        value: 1
    }, {
        name: 'Numbers',
        value: 2
    }]
});

// Script Definition
pc.script.create('movement', function (app) {
    
    var DirectionMap = function(mapType) {
        this.map = DirectionMap.MAPS[mapType];
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
    
    DirectionMap.prototype = {
        getKey: function (dir) {
            return this.map[dir];
        }
    };
    
    // Creates a new Movement instance
    var Movement = function (entity) {
        this.entity = entity;
        this.force = new pc.Vec3();
    };
    
    Movement.prototype = {
        initialize: function() {
            this.dMap = new DirectionMap(this.controlMap);
            this.entity.collision.on('collisionstart', this.onCollisionStart, this);
        },
        
        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            var forceX = 0;
            var forceZ = 0;
            
            // calculate force based on pressed keys
            if (app.keyboard.isPressed(this.dMap.getKey('w'))) {
                forceX = -this.speed;
            } 
            
            if (app.keyboard.isPressed(this.dMap.getKey('e'))) {
                forceX += this.speed;
            }
            
            if (app.keyboard.isPressed(this.dMap.getKey('n'))) {
                forceZ = -this.speed;
            } 
            
            if (app.keyboard.isPressed(this.dMap.getKey('s'))) {
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
        
        onCollisionStart: function(result) {
            if (result.other.rigidbody.type === pc.BODYTYPE_DYNAMIC) {
                this.entity.audiosource.play('ball_hit');
            }
        }
    };

    return Movement;
});