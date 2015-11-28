Game.Input = Game.Input || {};

// TODO: Better name - controlInput?

Game.Input = (function(app, _){
  var instance,
      registry = [];

  var KeyboardSource = function(dMap) {
    this.dMap = dMap || new Game.Input.DirectionMap(Game.Input.DirectionMap.MAP_ARROWS);
  };

  KeyboardSource.prototype = {
    isApplied: function(command) {
      return app.keyboard.isPressed(this.dMap.getKey(command));
    },

    destroy: function() {
      delete this.dMap;
    }
  };

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

  // TODO: Maybe it's better to a controlInput object right to the
  // entity?
  var getEntityInput = function(entity) {
    var entityInput = _.findWhere(registry, {entity: entity});

    if (!entityInput) {
      entityInput = new EntityInput(entity);
      entityInput.setInputSource();
      registry.push(entityInput);
    }

    // TODO: handle entity destroy event

    return entityInput;
  };

  return {
    getEntityInput: getEntityInput,
    EntityInput: EntityInput,
    KeyboardSource: KeyboardSource
  };

})(pc.Application.getApplication(), _);
