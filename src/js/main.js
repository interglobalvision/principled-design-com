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
  $mapPattern: $('.map-pattern'),
  $patterns: [
    $('#pattern-1'),
    $('#pattern-2'),
    $('#pattern-3'),
    $('#pattern-4'),
    $('#pattern-5'),
  ],
  patternMin: 0,
  patternMax: 4,
  currentPattern: 0,
  timer: null,
  interval: 100,
  animating: false,

  init: function() {
    var _this = this;

    _this.showPattern();

    var map = document.getElementById('map');

    map.addEventListener('startpan', function() {
      _this.startAnimation();
    });

    map.addEventListener('stoppan', function() {
      _this.stopAnimation();
    });

  },

  showPattern: function() {
    var _this = this;

    // Choose 1 or 0
    var patternStyle = parseInt(Math.random() * 2);

    if (patternStyle === 1) {
      // If 1, fill paths
      $('#background-pattern-holder').addClass('fill-path');
    } else {
      // If 0, stroke paths
      $('#background-pattern-holder').addClass('stroke-path');
    }

    // Assign random current pattern array index
    _this.currentPattern = Math.floor(Math.random() * (_this.patternMax - _this.patternMin + 1)) + _this.patternMin;

    // Show current pattern
    _this.$patterns[_this.currentPattern].addClass('show');
  },

  changePattern: function() {
    var _this = this;

    // Check is animating has been stopped; we do this here to fail faster
    if (!_this.animating) {
      return false;
    }

    // Hide current pattern
    _this.$mapPattern.removeClass('show');

    // Assign next current pattern
    if (_this.currentPattern >= _this.patternMax) {
      // If last pattern, start from min index
      _this.currentPattern = _this.patternMin;
    } else {
      // Else, assign next index
      _this.currentPattern++;
    }

    // Show new current pattern
    _this.$patterns[_this.currentPattern].addClass('show');

    // Animate recursively
    window.requestAnimationFrame(_this.changePattern.bind(_this));
  },

  startAnimation: function() {
    var _this = this;

    _this.animating = true;

    window.requestAnimationFrame(_this.changePattern.bind(_this));
  },

  stopAnimation: function() {
    var _this = this;

    _this.animating = false;
  },
};

Site.Map = {
  panZoneSize: 100, // in pixels
  panSpeed: 0.04,
  panning: false, // is it panning or not?
  window: {},
  center: {},
  mouse: {},
  mapPosition: false,

  init: function() {
    var _this =  this;

    // Set windowSize
    _this.getWindowSize();

    // Set map element
    _this.map = document.getElementById('map');

    // init pan zones
    _this.setPanZones();

    // Bind mouse position
    document.addEventListener('mousemove', _this.handleMouseMove.bind(_this));

    // Detect mouse outside window
    document.body.addEventListener('mouseleave', _this.stopPanning.bind(_this));
  },

  getWindowSize: function() {
    var _this =  this;

    // Save window size
    _this.window = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Save window center
    _this.window.center = {
      x: _this.window.width / 2,
      y: _this.window.height / 2,
    };

  },

  // Set Up, Left, Down and Right pan zones based on window size
  setPanZones: function() {
    var _this =  this;

    _this.panZones = {
      up: {
        min: 0,
        max: _this.panZoneSize,
      },
      down: {
        min: _this.window.height - _this.panZoneSize,
        max: _this.window.height,
      },
      left: {
        min: 0,
        max: _this.panZoneSize,
      },
      right: {
        min: _this.window.width - _this.panZoneSize,
        max: _this.window.width,
      },
    };

  },

  handleMouseMove: function(event) {
    var _this =  this;

    // Save mouse position
    _this.mouse.x = event.clientX;
    _this.mouse.y = event.clientY;


    if(_this.isInsidePanZone() && !_this.panning) {
      _this.triggerPanning(); // Trigger animation
    } else if(_this.panning && !_this.isInsidePanZone()) {
      _this.stopPanning(); // Stop animation
    }

  },

  stopPanning: function() {
    var _this =  this;

    _this.panning = false;

    _this.stopPanEvent();

  },

  // (Bool) check if mouse is inside any pan zone
  isInsidePanZone: function() {
    var _this =  this;

    var posX = _this.mouse.x;
    var posY = _this.mouse.y;

    if ( (posX >= _this.panZones.left.min && posX <= _this.panZones.left.max) || // Left
      (posX >= _this.panZones.right.min && posX <= _this.panZones.right.max) || // Right
      (posY >= _this.panZones.up.min && posY <= _this.panZones.up.max) || // Up
      (posY >= _this.panZones.down.min && posY <= _this.panZones.down.max) ) { //  Down

        return true;
      }

    return false;

  },

  // Trigger panning animation
  triggerPanning: function() {
    var _this =  this;

    _this.panning = true;

    _this.startPanEvent();

    window.requestAnimationFrame(_this.pan.bind(_this));

  },

  startPanEvent: function() {
    var _this =  this;

    var startPanEvent = new CustomEvent('startpan', {
      detail: {
        map: {
          position: {
            x: _this.mapPosition[4],
            y: _this.mapPosition[5],
          },
        },
      },
    });

    _this.map.dispatchEvent(startPanEvent);

  },

  stopPanEvent: function() {
    var _this =  this;

    var stopPanEvent = new CustomEvent('stoppan', {
      detail: {
        map: {
          position: {
            x: _this.mapPosition[4],
            y: _this.mapPosition[5],
          },
        },
      },
    });

    _this.map.dispatchEvent(stopPanEvent);

  },

  // Main panning logic
  pan: function() {
    var _this =  this;

    // Check is panning has been stopped; we do this here to fail faster
    if (!_this.panning) {
      return false;
    }

    // Get the angle between center and mouse position
    var angle = _this.angleFromCenter();

    // Get the translation value based on mouse position from the center and speed
    var translation = _this.distanceFromCenter() * _this.panSpeed;

    // If we don't know the map's current postion we get it
    if (!_this.mapPosition) {
      _this.mapPosition = _this.getMapPosition();
    }

    // Get new coordinates based on the angle and the translation value
    var newX = _this.mapPosition[4] + (translation * Math.cos(angle));
    var newY = _this.mapPosition[5] + (translation * Math.sin(angle));

    // Check for left limit
    if (newX >= 0) {
      newX = 0;
    }

    // Check for right limit
    if (newX <= _this.window.width * -2) {
      newX = _this.window.width * -2;
    }

    // Check for upper limit
    if (newY >= 0) {
      newY = 0;
    }

    // Check for bottom limit
    if (newY <= _this.window.height * -2) {
      newY = _this.window.height * -2;
    }

    // Move the map
    _this.moveMap(newX,newY);

    // Animate recursevly
    window.requestAnimationFrame(_this.pan.bind(_this));

  },

  // Move the map to given coordinates
  moveMap: function(x,y) {
    var _this =  this;

    // If we don't know the map's current postion we get it
    if (!_this.mapPosition) {
      _this.mapPosition = _this.getMapPosition();
    }

    // Set new coordinates
    _this.mapPosition[4] = x;
    _this.mapPosition[5] = y;

    // Apply new coordinates
    _this.map.style.transform = 'matrix(' + _this.mapPosition.toString() + ')';

  },

  // Return distance between center and mouse positon in pixels
  distanceFromCenter: function() {
    var _this = this;

    var xs = Math.pow(_this.window.center.x - _this.mouse.x, 2);
    var ys = Math.pow(_this.window.center.y - _this.mouse.y, 2);
    var distance = Math.sqrt(xs + ys);

    return distance;
  },

  // Return angle in rad from center of the window and mouse position relative to X-axis
  angleFromCenter: function() {
    var _this = this;

    var dy = _this.window.center.y - this.mouse.y;
    var dx = _this.window.center.x - this.mouse.x;

    var theta = Math.atan2(dy, dx); // range (-PI, PI]

    return theta;
  },

  // Return current map postion
  getMapPosition: function() {
    var _this =  this;

    // Get current element position (transform values)
    var transformMatrix = getComputedStyle(this.map)['transform']; // Returns a string like "matrix(0,0,0,0,0,0)"

    // Get only the values
    transformMatrix = transformMatrix.replace('matrix(','').replace(')', ''); // Returns a string like "0,0,0,0,0,0"

    // Make it into an array
    return transformMatrix = transformMatrix.split(', ').map( function(item) {
      return parseInt(item, 10);
    }); // Returns an array like [0,0,0,0,0,0]
  }
};

Site.init();
