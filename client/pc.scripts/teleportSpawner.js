// Identifies the entity to be respawned
pc.script.attribute('respawnableEntityName', 'string', 'teleport-b');

// How many seconds to wait before respawning the respawnable.
// Don't respawn after interval if was set to 0 
pc.script.attribute('interval', 'number', 0);

// Event triggering the respawn.
pc.script.attribute('raspawnEvent', 'string', 'goal');

// Height above the container
pc.script.attribute('respawnableUpOffset', 'number', 0.1125);

pc.script.create('teleportSpawner', function (app) {
    // Creates a new TeleportSpawner instance
    var TeleportSpawner = function (entity) {
        this.entity = entity;
        this.respawnTime = null;
        this._intervalId = null;
        // last entity which contained the respawnable
        this._from = null;
    };

    TeleportSpawner.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            console.log("interval: ", this.interval);
            this.respawnTime = this.interval * 1000;
            
            this.initIntervalRespawn();
            app.on('goal', this.onRespawn, this);
        },

        initIntervalRespawn: function() {
            if(!this.respawnTime) return;
            
            var doRespawn = _.bind(function() {
                this.respawn(this.getEntity());    
            }, this);
            this._intervalId = setInterval(doRespawn, this.respawnTime);
        },
        
        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        },
        
        getEntity: function() {
            return app.root.findByName(this.respawnableEntityName);
        },
        
        getTarget: function() {
            var targets = this.entity.getChildren();
            if (this._from)
                targets = _.without(targets, this._from);
            return targets[_.random(0, targets.length - 1)];
        },
        
        respawn: function(entity) {
            var to;
            to = this.getTarget();
            
            entity.setRotation(to.getRotation());
            entity.setPosition(
                to.getPosition().add(
                    entity.up.scale(this.respawnableUpOffset)
                )
            );
            
            this._from = to;
        },
        
        onRespawn: function() {
            if(this._intervalId)
                clearInterval(this._intervalId);
            
            this.initIntervalRespawn();
            this.respawn(this.getEntity());
        },

        destroy: function() {
            if(this._intervalId)
                clearInterval(this._intervalId);

            delete this.entity;
        }
    };

    return TeleportSpawner;
});
