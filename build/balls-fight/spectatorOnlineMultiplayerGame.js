pc.script.create('spectatorOnlineMultiplayerGame', function (app) {
    // Creates a new SpectatorOnlineMultiplayerGame instance
    var SpectatorOnlineMultiplayerGame = function (entity) {
        this.entity = entity;
        this.game = null;
    };

    SpectatorOnlineMultiplayerGame.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.game = new Game.Multiplayer.Online.Spectator(app);
            this.game.initialize();
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            this.game.update(dt);
        }
    };

    return SpectatorOnlineMultiplayerGame;
});
