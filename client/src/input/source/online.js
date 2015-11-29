var InputSource = function(stateProxy, entityName) {
  this.lastInputFrame = [];
  this.stateProxy = stateProxy;

  this.from = entityName;

  this.onInputFrame = _.bind(this.onInputFrame, this);
  this.bindProxyHandlers(this.stateProxy);
};

InputSource.prototype = {
  isApplied: function(command) {
    return _.contains(this.lastInputFrame, command);
  },

  destroy: function() {
    this.unbindProxyHandlers(this.stateProxy);
    delete this.stateProxy;
    delete this.lastInputFrame;
  },

  bindProxyHandlers: function(stateProxy) {
    stateProxy.on('frame-input', this.onInputFrame);
  },

  unbindProxyHandlers: function(stateProxy) {
    stateProxy.removeListener('frame-input', this.onInputFrame);
  },

  onInputFrame: function(data) {
    if (data.from === this.from) {
      this.lastInputFrame = data.frame;
    }
  }
};

module.exports = InputSource;

