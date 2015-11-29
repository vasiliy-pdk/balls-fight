var instance,
    registry = [],
    KeyboardSource = require('./input/source/keyboard');

// TODO: Better name - controlInput?
var EntityInput = function(entity) {
  this.id = _.uniqueId('entity-input-');
  this.entity = entity;
  this.inputSource = null;
};

EntityInput.prototype = {
  isApplied: function(command) {
    return this.inputSource.isApplied(command);
  },

  setInputSource: function(inputSource) {
    if (this.inputSource) {
      this.inputSource.destroy();
      delete this.inputSource;
    }

    if (!inputSource) {
      inputSource = this.initDefaultInputSource();
    }

    this.inputSource = inputSource;
  },

  initDefaultInputSource: function() {
    return new KeyboardSource();
  }
};

exports.EntityInput = EntityInput;

// TODO: Maybe it's better to a controlInput object right to the
// entity?
exports.getEntityInput = function(entity) {
  var entityInput = _.findWhere(registry, {entity: entity});

  if (!entityInput) {
    entityInput = new EntityInput(entity);
    entityInput.setInputSource();
    registry.push(entityInput);
  }

  // TODO: handle entity destroy event

  return entityInput;
};

exports.KeyboardSource = KeyboardSource;

