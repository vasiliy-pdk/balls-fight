var app = require('../app');

var Ui = function(app) {
  this.app = app;

  this.uiHtmlAssetId = 2973997;
  this.uiCssAssetId = 2973982;

  pc.extend(this, pc.events);
};

Ui.prototype.constructor = Ui;

_.extend(Ui.prototype, {
  init: function () {
    console.log('Initializing UI');
    var self = this,
        htmlAsset = this.getUiHtmlAsset(),
        cssAsset = this.getUiCssAsset(),
        style = pc.createStyle(cssAsset.resource || ''),
        html = htmlAsset.resource || '',
        injectHtml = function () {
          $('body').append(htmlAsset.resource);
          self.showMainMenu();
          self.bindHandlers();
        };

    document.head.appendChild(style);

    if (!cssAsset.resource) {
      cssAsset.on('load', function () {
        style.innerHTML = cssAsset.resource;
      });
      this.app.assets.load(cssAsset);
    }

    if (!html) {
      htmlAsset.on('load', injectHtml);
      this.app.assets.load(htmlAsset);
    } else {
      injectHtml();
    }
  },

  startLoading: function() {

  },

  stopLoading: function() {

  },

  showMainMenu: function () {
    $('.main-menu').show();
  },

  hideMainMenu: function() {
    $('.main-menu').hide();
  },

  getUiHtmlAsset: function () {
    if (this.uiHtmlAssetId)
      return this.app.assets.get(this.uiHtmlAssetId);

    //return new pc.Asset('uiHtml', 'html', {
    //  url: 'http://localhost:51000/client/ui/html/ui.html'
    //});
  },

  getUiCssAsset: function () {
    if (this.uiCssAssetId)
      return this.app.assets.get(this.uiCssAssetId);

    //return new pc.Asset('uiCss', 'css', {
    //  url: 'http://localhost:51000/build/css/ui.css'
    //});
  },

  bindHandlers: function() {
    var self = this;
    $('.js-launcher-action').click(function(e) {
      var el = $(e.target),
          action = el.attr('id');

      if(action.match(/.*(local|online)$/)) {
        action = action.replace('start-', 'launch-mp-');
      } else {
        action = action.replace('start-', 'launch');
      }

      self.fire(action);
    });
  }
});

module.exports = Ui;
