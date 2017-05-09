/* jshint browser: true, devel: true, indent: 2, curly: true, eqeqeq: true, futurehostile: true, latedef: true, undef: true, unused: true */
/* global $, jQuery, document, Site, Modernizr */

Site = {
  mobileThreshold: 601,
  init: function() {
    var _this = this;

    Site.Menu.init();

    $(window).resize(function(){
      _this.onResize();
    });

    $(document).ready(function () {
      Site.Shapes.init();
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

Site.Menu = {
  $headerItems: $('.header-menu-item'),
  init: function() {
    var _this = this;

    _this.bind();
  },

  bind: function() {
    var _this = this;

    _this.$headerItems.on('click', function(e) {
      _this.onItemClick(this, e);
    });
  },

  onItemClick: function(item, event) {
    var _this = this;
    var href = $(item).children('a').attr('href');
    var hash = href.substr(1);

    $('.header-menu-active').removeClass('header-menu-active');
    $(item).addClass('header-menu-active');

    $('.page-content').removeClass('page-content-active');
    $('.page-content[data-slug="' + hash + '"]').addClass('page-content-active');
  },
};

Site.Shapes = {
  currentState: 0,
  maxState: 7,
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

    $('#background-shape')
    .removeClass('shape-state-' + _this.currentState)
    .addClass('shape-state-' + _this.nextState());
  },
};

Site.Map = {
  panZoneSize: 100, // in pixels
  panning: false,
  pan: {
    up: false,
    down: false,
    left: false,
    right: false,
  },
  window: {
    width: 0,
    height: 0,
  },
  mapPosition: false,

  init: function() {
    var _this =  this;

    // Set windowSize
    _this.getWindowSize();

    // Set map element
    _this.map = document.getElementById('map');

    // init pan zones
    _this.setPanZones();

    // bind mouse position
    document.addEventListener('mousemove', _this.handleMouseMove.bind(_this));

  },

  getWindowSize: function() {
    var _this =  this;

    _this.window.width = window.innerWidth;
    _this.window.height = window.innerHeight;
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

    if (!_this.panning) {
      return true;
    }

    // Get current map position
    if (!_this.mapPosition) {
      _this.mapPosition = _this.getMapPosition();
    }

    // Move up
    if (_this.pan.up && _this.mapPosition[5] <= 0) {
      _this.mapPosition[5] = _this.mapPosition[5] + 1;
    }

    // Move down
    if (_this.pan.down && _this.mapPosition[5] >= (_this.window.height * -2)) {
      _this.mapPosition[5] = _this.mapPosition[5] - 1;
    }

    // Move left
    if (_this.pan.left && _this.mapPosition[4] <= 0) {
      _this.mapPosition[4] = _this.mapPosition[4] + 1;
    }

    // Move right
    if (_this.pan.right && _this.mapPosition[4] >= (_this.window.width * -2)) {
      _this.mapPosition[4] = _this.mapPosition[4] - 1;
    }

    _this.map.style.transform = 'matrix(' + _this.mapPosition.toString() + ')';

    window.requestAnimationFrame(_this.animate.bind(_this));

  },

  getMapPosition: function() {
    var _this =  this;

    // Get current element position (transform values)
    var transformMatrix = getComputedStyle(this.map)['transform']; // Returns a string like "matrix(0,0,0,0,0,0)"

    // Get only the values
    transformMatrix = transformMatrix.replace('matrix(','').replace(')', ''); // Returns a string like "0,0,0,0,0,0"

    // Make it into an array
    return transformMatrix = transformMatrix.split(', ').map( function(item) {
          return parseInt(item, 10);
    });; // Returns an array like [0,0,0,0,0,0]
  },
};

Site.init();
