var Game = Game || {};

Game.Multiplayer = (function(app, _) {
    console.log('Game.Multiplayer loaded');
    
    OnlineSpectator = function(app) {
        Game.call(this, app);
        
        this.stateBuffer = null;
        // TODO: stateProxy? / networkProxy? 
        this.proxy = null;
    };
    
    _.extend(OnlineSpectator.prototype, {
        initialize: function() {
            this.statePlayer = this.newStatePlayer();
            this.proxy = this.newProxy();
            this.syncInterval = 0.05;
            this.timeSinseLastSync = 0;
            this.lastReceivedFrames = null;
            console.log('OnlineSpectator initialized');
        },
        
        update: function(dt) {
//             this.timeSinseLastSync += dt;
//             if (this.lastReceivedFrames && this.timeSinseLastSync >= this.syncInterval) {
//                 this.statePlayer.play(this.lastReceivedFrames);
//                 this.time = 0;
//             }
        },
        
        newStatePlayer: function() {
            return new Game.State.Player();
        },
        
        newProxy: function() {
            var socket = io('http://shielded-scrubland-7178.herokuapp.com');
            socket.on('greeting', function(data) {
                console.log(data);
            });
            
            socket.on('new_frame', _.bind(function (data) {
                this.statePlayer.play(data.frames);
//                 this.statePlayer.setFrames(data.frames);
//                 this.lastReceivedFrames = data.frames;
            }, this));
            return socket;
        }
    });
    
    exports = {};
    exports.Online = {};
    exports.Online.Spectator = OnlineSpectator;
    
    return exports;
})(pc.Application.getApplication(), _);
