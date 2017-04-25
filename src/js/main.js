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
      Site.Map.init();

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

Site.Map = {
  panZoneSize: 50, // in pixels
  panning: false,
  pan: {
    up: false,
    down: false,
    left: false,
    right: false,
  },

  init: function() {
    var _this =  this;

    // Set map element
    _this.map = document.getElementById('map');

    // init pan zones
    _this.setPanZones();

    // bind mouse position
    document.addEventListener('mousemove', _this.handleMouseMove.bind(_this));

  },

  setPanZones: function() {
    var _this =  this;

    // Get window dimensions
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    // Set
    _this.panZones = {
      up: {
        min: 0,
        max: _this.panZoneSize,
      },
      down: {
        min: windowHeight - _this.panZoneSize,
        max: windowHeight,
      },
      left: {
        min: 0,
        max: _this.panZoneSize,
      },
      right: {
        min: windowWidth - _this.panZoneSize,
        max: windowWidth,
      },
    };

  },

  handleMouseMove: function(event) {
    var _this =  this;

    var posX = event.clientX;
    var posY = event.clientY;

    _this.noPan();

    if (posY > _this.panZones.up.max && posY < _this.panZones.down.min && posX > _this.panZones.left.max && posX < _this.panZones.right.min) { // not in a zone
      _this.panning = false;
      console.log('-');
    } else {
      _this.panning = true;

      // Check inside which zones
      if (posY >= _this.panZones.up.min && posY <= _this.panZones.up.max) { //up
        _this.pan.up = true;
      }

      if (posY >= _this.panZones.down.min && posY <= _this.panZones.down.max) { //down
        _this.pan.down = true;
      }

      if (posX >= _this.panZones.left.min && posX <= _this.panZones.left.max) { //left
        _this.pan.left = true;
      }

      if (posX >= _this.panZones.right.min && posX <= _this.panZones.right.max) { //right
        _this.pan.right = true;
      }

      console.log(_this.pan);
      _this.triggerAnimation();
    }

  },

  noPan: function() {
    var _this =  this;

    _this.pan =  {
      up: false,
      down: false,
      left: false,
      right: false,
    };

  },

  triggerAnimation: function() {
    var _this =  this;

    window.requestAnimationFrame(_this.animate.bind(_this));
  },

  animate: function() {
    var _this =  this;

    // Get current map position

    // Move

  },
};

Site.init();
