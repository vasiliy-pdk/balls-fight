pc.script.attribute('timeToStore', 'number', 0, {
    displayName: 'Time to store in seconds'
});

pc.script.attribute('replay', 'number', 0, {
    min: 0,
    max: 1,
    step: 1
});

pc.script.attribute('saveBuffer', 'number', 0, {
    min: 0,
    max: 1,
    step: 1,
    displayName: 'Store to the DOM?'
});

pc.script.create('gameStateBuffer', function (app) {
    // Creates a new GameStateBuffer instance
    var GameStateBuffer = function (entity) {
        this.entity = entity;
        
        this.buffer = null;
    };

    GameStateBuffer.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.buffer = new Game.State.Buffer(this.entity);
            this.buffer.timeToStore = this.timeToStore;
            this.buffer.replay = this.replay;
            this.buffer.saveBuffer = this.saveBuffer;
            this.buffer.initialize();
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            this.buffer.update(dt);
        }
    };

    return GameStateBuffer;
});
