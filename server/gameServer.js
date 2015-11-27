var _ = require('underscore');

var GameServer = function() {
  this.maxPlayers = 2;
  this.activityCheckDelay = 5000;

  this.master = null;
  this.slaves = [];
  this.lastTick = null;
  this.players = [];

  this.toDelete = false;

  this.onMasterTick = _.bind(this.onMasterTick, this);
  this.checkActivity = _.bind(this.checkActivity, this);

  this.activityCheckIntervalId = this.initActivityCheck();
};

GameServer.prototype = {
  addPlayers: function(players) {
    players.forEach(this.addPlayer, this);
  },

  addPlayer: function(player) {
    if(!this.needPlayers())
      return false;

    if (!this.master) {
      this.master = player;
      this.master.on('tick', this.onMasterTick);
      this.master.emit('set-role', 'master');
      console.log('Master connected');
    } else {
      this.slaves.push(player);
      player.emit('set-role', 'slave');
      console.log('Slave connected');
    }

    this.players.push(player);
    return true;
  },

  needPlayers: function() {
    if (this.toDelete)
      return 0;

    return this.maxPlayers - this.players.length;
  },

  isActive: function() {
    return (this.master && (_.now() - this.lastTick) < this.activityCheckDelay);
  },

  checkActivity: function() {
    if (!this.isActive()) {
      console.log('Activity timed out');
      this.destroy();
    }
  },

  kickPlayer: function(player) {
    this.players = _.without(this.players, player);
    player.disconnect();

    if(player.id === this.master.id) {
      console.log('Master disconnected');
    } else if (_.indexOf(this.slaves, player) ) {
      console.log('Slave disconnected');
    } else {
      console.log('Player disconnected');
    }
  },

  kickAll: function() {
    this.players.forEach(this.kickPlayer, this);
  },

  destroy: function() {
    this.toDelete = true;
    clearInterval(this.activityCheckIntervalId);
    this.kickAll();
    delete this.master;
    delete this.slaves;
    delete this.players;
    console.log('Game destroyed');
  },

  initActivityCheck: function() {
    return setInterval(this.checkActivity, this.activityCheckDelay);
  },

  onMasterTick: function(data) {
    this.lastTick = _.now();
    for(var i = 0; i < this.slaves.length; i++) {
      this.slaves[i].emit('new_frame', {frames: data});
    }
  }
};

module.exports = GameServer;
