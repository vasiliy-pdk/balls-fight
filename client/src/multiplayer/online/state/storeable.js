Game.Multiplayer.Online.State = Game.Multiplayer.Online.State || {};

Game.Multiplayer.Online.State = (function(app, _) {
  var storablesRegistry = {};

  var FrameStoreable = function(entity, config) {
    this.entity = entity;
    this.state = null;

    if(config) {
      if(config.getState) {
        this.getState = config.getState;
      }

      if(config.restore) {
        this.restore = config.restore;
      }
    }
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

  var RigidBodyFrameStoreable = function(entity, config) {
    FrameStoreable.call(this, entity, config);
  };

  // @TODO: Implement correct inheritance here
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

  FrameStoreable.factory = function (entity, config) {
    var storeable = storablesRegistry[entity.getName()];

    if(!storeable) {
      if(entity.rigidbody && !entity.rigidbody.isStaticOrKinematic())
        storeable = new RigidBodyFrameStoreable(entity, config);
      else
        storeable = new FrameStoreable(entity, config);

      storablesRegistry[entity.getName()] = storeable;
    }

    return storeable;
  };

  FrameStoreable.getAll = function() {
    return storablesRegistry;
  };
  
  return {
    FrameStoreable: FrameStoreable,
    RigidBodyFrameStoreable: RigidBodyFrameStoreable
  };

})(pc.Application.getApplication(), _);
