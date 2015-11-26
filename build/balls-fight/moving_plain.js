pc.script.create('moving_plain', function (app) {
    // Creates a new Moving_plain instance
    var Moving_plain = function (entity) {
        this.entity = entity;
        this.direction = -1;
        this.range = 1.1;
        this.speed = 0.45;
        this.startPos = null;
        this.maxPos = null;
        this.minPos = null;
    };

    Moving_plain.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.startPosZ = this.entity.getPosition().z;
            this.maxPos = this.startPosZ + this.range;
            this.minPos = this.startPosZ - this.range;
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            this.move(dt);
        },
        
        move: function(dt) {
            var newPosZ,
                offset,
                currentPos = this.entity.getPosition(),
                currentPosZ = currentPos.z;
            
            if(currentPosZ <= this.minPos || currentPosZ >= this.maxPos) {
                this.direction *= -1;
            }
            
            offset = this.speed * dt * this.direction;
            newPosZ = currentPosZ + offset;
            this.entity.setPosition(currentPos.x, currentPos.y, newPosZ);
        }
    };

    return Moving_plain;
});