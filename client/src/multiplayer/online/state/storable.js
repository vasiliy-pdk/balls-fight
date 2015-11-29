var storablesRegistry = {};

var FrameStorable = function(entity, config) {
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

FrameStorable.prototype = {
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

var RigidBodyFrameStorable = function(entity, config) {
  FrameStorable.call(this, entity, config);
};

// @TODO: Implement correct inheritance here
_.extend(RigidBodyFrameStorable.prototype, FrameStorable.prototype, {
  getState: function() {
    var state = FrameStorable.prototype.getState.apply(this);
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

FrameStorable.factory = function (entity, config) {
  var storable = storablesRegistry[entity.getName()];

  if(!storable) {
    if(entity.rigidbody && !entity.rigidbody.isStaticOrKinematic())
      storable = new RigidBodyFrameStorable(entity, config);
    else
      storable = new FrameStorable(entity, config);

    storablesRegistry[entity.getName()] = storable;
  }

  return storable;
};

FrameStorable.getAll = function() {
  return storablesRegistry;
};
  
exports.FrameStorable = FrameStorable;
exports.RigidBodyFrameStorable = RigidBodyFrameStorable;
