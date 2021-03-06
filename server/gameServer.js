var _ = require('underscore');

var GameServer = function() {
  this.id = _.uniqueId('game-');

  this.maxPlayers = 2;
  this.activityCheckDelay = 5000;

  this.master = null;
  this.slaves = [];
  this.lastTick = null;
  this.players = [];

  this.entities = {};
  this.getPlayableEntities().forEach(function(entityName) {
    this.entities[entityName] = null;
  }, this);

  this.toDelete = false;

  this.onMasterTick = _.bind(this.onMasterTick, this);
  this.checkActivity = _.bind(this.checkActivity, this);
  this.onInputFrame = _.bind(this.onInputFrame, this);

  this.activityCheckIntervalId = this.initActivityCheck();
};

GameServer.prototype = {

  getPlayableEntities: function() {
    return ['ball1', 'ball2'];
  },

  getRoom: function(room) {
    return this.id + '-' + room;
  },

  setMaster: function(player, entityName) {
    var oldMaster = this.master;
    if(oldMaster) {
      // switching to other
      this.master.removeAllListeners();
    }

    this.master = player;
    this.master.on('tick', this.onMasterTick);
    // role confirmation is needed from the client
    this.master.emit('set-role', {role: 'master', entityName: entityName});
    this.master.on('disconnect', _.bind(this.onMasterDisconnect, this, player));

    if(oldMaster) {
      console.log('Selected another master');
    } else {
      console.log('Selected master');
    }
  },

  setSlave: function(player, entityName) {
    this.slaves.push(player);
    // role confirmation is needed from the client
    player.emit('set-role', {role: 'slave', entityName: entityName});
    player.on('frame-input', this.onInputFrame);
    player.on('disconnect', _.bind(this.onSlaveDisconnect, this, player));
    console.log('Slave added');
  },

  addPlayers: function(players) {
    players.forEach(this.addPlayer, this);
  },

  addPlayer: function(socket) {
    if(!this.needPlayers())
      return false;

    console.log('Player connected');

    var entityName = this.bindEntity(socket);

    if (!this.master) {
      this.setMaster(socket, entityName);
    } else {
      this.setSlave(socket, entityName);
    }

    this.players.push(socket);
    socket.join(this.getRoom('players'))
        .to(this.getRoom('players'))
        .emit('player-connected', {entityName: entityName});

    return true;
  },

  needPlayers: function() {
    if (this.toDelete)
      return 0;

    return this.maxPlayers - this.players.length;
  },

  isActive: function() {
    var now = _.now(),
        diff = now - this.lastTick;

    if (this.master && diff < this.activityCheckDelay) {
      console.log('Game #' + this.id + ' is active [players, slaves, master, now, lastTick, difference]: ',
          this.players.length, this.slaves.length, !!this.master, now, this.lastTick, diff
      );
      return true;
    } else {
      console.log('Game #' + this.id + ' is NOT active [players, slaves, master, now, lastTick, difference]: ',
          this.players.length, this.slaves.length, !!this.master, now, this.lastTick, diff
      );
      return false;
    }
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
    player.removeAllListeners();
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
  },

  onMasterDisconnect: function(master) {
    this.removePlayer(master);
    console.log('Master disconnected');

    if(this.slaves.length) {
      // Try to switch to another master
      var slave = this.slaves.splice(0, 1)[0];
      if (!slave) return;

      slave.removeListener('disconnect', this.onSlaveDisconnect);
      slave.removeListener('frame-input', this.onInputFrame);
      var entityName = _.findKey(this.entities, function(boundSocket) {
        return boundSocket === slave;
      });
      this.setMaster(slave, entityName);
    } else {
      this.destroy();
    }
  },

  onSlaveDisconnect: function(slave) {
    this.removePlayer(slave);
    this.slaves = _.without(this.slaves, slave);
    console.log('Slave disconnected');
  },

  onInputFrame: function(data) {
    this.master.emit('frame-input', data);
  },

  removePlayer: function(player) {
    this.players = _.without(this.players, player);
    var entityName = _.findKey(this.entities, function(boundSocket) {
      return boundSocket === player;
    });
    this.entities[entityName] = null;
    player.to(this.getRoom('players')).emit('player-disconnected', {entityName: entityName});
  },

  bindEntity: function(socket) {
    var unboundEntity = _.findKey(this.entities, function(boundSocket) {
      return !boundSocket;
    });
    this.entities[unboundEntity] = socket;

    return unboundEntity;
  }

};

module.exports = GameServer;
