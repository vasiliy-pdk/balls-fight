var app = require('./app'),
    Ui = require('./ui');

var Launcher = function(app) {
  this.app = app;
  this.ui = null;
  this.currentScene = null;

  this.onStart = this.onStart.bind(this);
  this.launchTraining = this.launchTraining.bind(this);
  this.launchLocalMultiplayer = this.launchLocalMultiplayer.bind(this);
  this.launchOnlineMultiplayer = this.launchOnlineMultiplayer.bind(this);
  this.launchMainMenu = this.launchMainMenu.bind(this);


  this.app.on('start', this.onStart);
};

Launcher.prototype.constructor = Launcher;

_.extend(Launcher.prototype, {
  onStart: function(ts, app) {
    this.initUi();
    this.currentScene = this.app.scene;
  },

  initUi: function() {
    this.ui = new Ui(this.app);
    this.ui.init();

    this.bindUiHandlers(this.ui);
  },

  bindUiHandlers: function(ui) {
    ui.on('launch-mp-online', this.launchOnlineMultiplayer);
    ui.on('launch-mp-local', this.launchLocalMultiplayer);
    ui.on('launch-training', this.launchTraining);
    ui.on('launch-main-menu', this.launchMainMenu);
  },

  launchMainMenu: function() {
    this.ui.startLoading();
    var sceneId = 395430,
        url = sceneId + '.json',
        self = this;

    this.app.loadScene(url, function() {
      self.ui.showMainMenu();
      self.ui.stopLoading();
    });
  },

  launchTraining: function() {

  },

  launchLocalMultiplayer: function() {
    this.ui.startLoading();
    var sceneId = 395741,
        url = sceneId + '.json',
        self = this;

    this.app.loadScene(url, function() {
      self.ui.hideMainMenu();
      self.ui.stopLoading();
    });
  },

  launchOnlineMultiplayer: function() {
    this.ui.startLoading();
    var sceneId = 394962,
        url = sceneId + '.json',
        self = this;
    this.app.loadScene(url, function() {
      // show progress somewhere
      self.ui.hideMainMenu();
      self.ui.stopLoading();
    });
  }
});

var launcher = new Launcher(app);

module.exports = launcher;
