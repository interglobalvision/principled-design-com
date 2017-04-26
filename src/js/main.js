/* jshint browser: true, devel: true, indent: 2, curly: true, eqeqeq: true, futurehostile: true, latedef: true, undef: true, unused: true */
/* global $, jQuery, document, Site, Modernizr */

Site = {
  mobileThreshold: 601,
  init: function() {
    var _this = this;

    $(window).resize(function(){
      _this.onResize();
    });

    $(document).ready(function () {
      _this.Shapes.init();
    });

  },

  onResize: function() {
    var _this = this;

  },

  fixWidows: function() {
    // utility class mainly for use on headines to avoid widows [single words on a new line]
    $('.js-fix-widows').each(function(){
      var string = $(this).html();
      string = string.replace(/ ([^ ]*)$/,'&nbsp;$1');
      $(this).html(string);
    });
  },
};

Site.Shapes = {
  currentState: 0,
  maxState: 6,
  timer: null,
  interval: 12000,
  init: function() {
    var _this = this;

    _this.setState();
    _this.startInterval();
  },

  startInterval: function() {
    var _this = this;

    _this.timer = setInterval(function() {_this.setState();}, _this.interval);
  },

  nextState: function() {
    var _this = this;

    _this.currentState++;

    if (_this.currentState > _this.maxState) {
      _this.currentState = 1;
    }

    return _this.currentState;
  },

  setState: function() {
    var _this = this;

    $('.background-shape')
    .removeClass('shape-state-' + _this.currentState)
    .addClass('shape-state-' + _this.nextState());
  },
};

Site.init();
