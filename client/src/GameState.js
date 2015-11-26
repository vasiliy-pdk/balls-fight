/*
 * StateBuffer module
 */
var Game = Game || {};

Game.State = (function(app, _) {
    console.log('Game.State loaded');
    
    var FrameStoreable = function(entity) {
        this.entity = entity;
        this.state = null;
    };

    FrameStoreable.prototype = {
        store: function() {
            this.state = this.getState();
        },

        restore: function(state) {
            this.entity.setPosition(this.restoreVector(state.position));
            this.entity.setEulerAngles(this.restoreVector(state.rotation));
        },

        getState: function() {
            var state = {};
            state.name = this.entity.getName();
            state.position = this.storeVector(this.entity.getPosition());
            state.rotation = this.storeVector(this.entity.getEulerAngles());
            return state;
        },

        storeVector: function (vec) {
            return _.object(['x','y','z'], _.values(vec.data));
        },

        restoreVector: function(state) {
            return new pc.Vec3(state.x, state.y, state.z);
        }
    };

    var RigidBodyFrameStoreable = function(entity) {
        FrameStoreable.call(this, entity);
    };

    _.extend(RigidBodyFrameStoreable.prototype, FrameStoreable.prototype, {
        getState: function() {
            var state = FrameStoreable.prototype.getState.apply(this);
            state.linearVelocity = this.storeVector(this.entity.rigidbody.linearVelocity);
            state.angularVelocity = this.storeVector(this.entity.rigidbody.angularVelocity);
            return state;
        },

        restore: function(state) {
            this.entity.rigidbody.teleport(this.restoreVector(state.position), this.restoreVector(state.rotation));
            this.entity.rigidbody.linearVelocity = this.restoreVector(state.linearVelocity);
            this.entity.rigidbody.angularVelocity = this.restoreVector(state.angularVelocity);
        }
    });

    FrameStoreable._registry = {};

    FrameStoreable.factory = function (entity) {
        var storeable = FrameStoreable._registry[entity.getName()];

        if(!storeable) {
            if(entity.rigidbody && !entity.rigidbody.isStaticOrKinematic())
                storeable = new RigidBodyFrameStoreable(entity);
            else
                storeable = new FrameStoreable(entity);

            FrameStoreable._registry[entity.getName()] = storeable;
        }

        return storeable;
    };

    // GameStatePlayer replays a stored game state
    // 
    var GameStatePlayer = function(frames) {
        this.frames = frames || [];
        this.framesLeft = this.frames.length;

        console.log('GameStatePlayer is ready to play ' + this.framesLeft + ' frames...');
    };

    GameStatePlayer.prototype = {
        play: function(frames) {
            if (frames) this.setFrames(frames);
            
            if (!this.framesLeft) return;

            this.playFrame();

            this.framesLeft--;
            if(!this.framesLeft) console.log('Replay done');
        },

        playFrame: function() {
            var frame = this.frames.shift();

            frame.entities.forEach(function(entityState) {
                var entity = app.root.findByName(entityState.name);
                var storeable = FrameStoreable.factory(entity);
                storeable.restore(entityState);
            }, this);
        },
        
        setFrames: function(frames) {
            this.frames = frames;
            this.framesLeft = frames.length;
        }
    };

    // Creates a new GameStateBuffer instance
    var GameStateBuffer = function (entity) {
        this.entity = entity;

        // Entities to store
        this.storables = null;
        this.frames = null;
        
        this.proxy = null;
        this.send = null;
    };

    GameStateBuffer.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.recordTime = 0;
            // game global time
            this.time = 0;
            this.storables = [];
            this.frames = [];
            this.initStoreables(this.getStorableNames());
            
            // TODO: separate concerns
            this.send = true;
            this.proxy = this.initStateProxy();
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (this.send) {
                this.recordTime += dt;
                this.storeFrame(dt);
                this.proxy.emit('tick', this.frames);
                this.flush();
            } else if(this.recordTime >= this.timeToStore) {
                if (this.replay) {
                    this.replayFrames();
                } else if (this.saveBuffer && !this.stored) {
                    console.log('BufferFilled! Storing... ');
                    var outputEl = document.createElement('pre');
                    document.body.appendChild(outputEl);
                    outputEl.innerHTML = JSON.stringify(this.frames);
                    console.log('Done! Check the page');
                    this.stored = true;
                } 
                return;
            } else {
                this.recordTime += dt;
                this.storeFrame(dt);
            }
        },

        initStoreables: function (names) {
            names.forEach(function (name) {
                var entity = app.root.findByName(name);
                this.storables.push(FrameStoreable.factory(entity));
            }, this);
        },

        storeFrame: function (dt) {
            this.time += dt;

            var frame = {
                dt: dt,
                time: this.time,
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
        
        getStorableNames: function () {
            var names = ['ball1', 'ball2', 'teleport-b'];
//             _.range(1, 10).forEach(function (id) {
//                 names.push('wooden-crate-' + id);
//             });
            return names;
        },

        // just to test
        replayFrames: function() {
            if (!this.statePlayer) {
                this.statePlayer = new GameStatePlayer(this.frames);
            }

            this.statePlayer.play();
        },
        
        initStateProxy: function() {
            var socket = io('http://shielded-scrubland-7178.herokuapp.com');
            return socket;
        }
    };

    return {
        Buffer: GameStateBuffer,
        Player: GameStatePlayer,
        FrameStoreable: FrameStoreable,
        RigidBodyFrameStoreable: RigidBodyFrameStoreable
    };

})(pc.Application.getApplication(), _);

/*
 * END StateBuffer module
 */
