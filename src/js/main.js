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

    $('.header-menu-active').removeClass('header-menu-active');
    $(item).addClass('header-menu-active');
  }
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
  distanceThreshold: 80, // percent of longest axis
  thresholdRadious: false,
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
  mouse: {
    x: 0,
    y: 0,
  },
  center: {
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

    // detect mouse outside window
    document.body.addEventListener('mouseleave', _this.noPan.bind(_this));
  },

  getWindowSize: function() {
    var _this =  this;

    _this.window.width = window.innerWidth;
    _this.window.height = window.innerHeight;
    _this.window.center = {
      x: _this.window.width / 2,
      y: _this.window.height / 2,
    };

  },

  setPanZones: function() {
    var _this =  this;

    // Set threshold
    if (_this.window.height / _this.window.width <= 1) { // Horizontal major axis or same size axis
      _this.thresholdRadious = _this.window.height * (_this.distanceThreshold/100) / 2;
    } else if (_this.window.width / _this.window.height > 1) { // Vertical major axis
      _this.thresholdRadious = _this.window.width * (_this.distanceThreshold/100) / 2;
    }

  },

  handleMouseMove: function(event) {
    var _this =  this;

    /*
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

*/

    _this.mouse.x = event.clientX;
    _this.mouse.y = event.clientY;

    _this.triggerAnimation();

  },

  noPan: function() {
    var _this =  this;

    _this.pan =  {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    _this.panning = false;

  },

  triggerAnimation: function() {
    var _this =  this;

    window.requestAnimationFrame(_this.animate.bind(_this));
  },

  animate: function() {
    var _this =  this;

    if (!_this.animate) {
      return false;
    }

    // Check if above threshold
    if (_this.distanceFromCenter() > _this.thresholdRadious) {
      var angle = _this.angleFromCenter();
      var distance = ( _this.distanceFromCenter() - _this.thresholdRadious) * 0.01;

      if (!_this.mapPosition) {
        _this.mapPosition = _this.getMapPosition();
      }

      _this.mapPosition[4] += distance * Math.cos(angle)
      _this.mapPosition[5] += distance * Math.sin(angle)

      _this.map.style.transform = 'matrix(' + _this.mapPosition.toString() + ')';

      window.requestAnimationFrame(_this.animate.bind(_this));

    }

    /*

    // Get current map position
    if (!_this.mapPosition) {
      _this.mapPosition = _this.getMapPosition();
    }

    // Move up
    if (_this.pan.up && _this.mapPosition[5] <= 0) {
      _this.mapPosition[5] = _this.mapPosition[5] + 0.1;
    }

    // Move down
    if (_this.pan.down && _this.mapPosition[5] >= (_this.window.height * -2)) {
      _this.mapPosition[5] = _this.mapPosition[5] - 0.1;
    }

    // Move left
    if (_this.pan.left && _this.mapPosition[4] <= 0) {
      _this.mapPosition[4] = _this.mapPosition[4] + 0.1;
    }

    // Move right
    if (_this.pan.right && _this.mapPosition[4] >= (_this.window.width * -2)) {
      _this.mapPosition[4] = _this.mapPosition[4] - 0.1;
    }

    _this.map.style.transform = 'matrix(' + _this.mapPosition.toString() + ')';
    */

    //console.log('angleFromCenter', _this.angleFromCenter());


  },

  distanceFromCenter: function() {
    var _this = this;

    var xs = Math.pow(_this.window.center.x - _this.mouse.x, 2);
    var ys = Math.pow(_this.window.center.y - _this.mouse.y, 2);
    var distance = Math.sqrt(xs + ys);

    return distance;
  },

  angleFromCenter: function() {
    var _this = this;

    var dy = _this.window.center.y - this.mouse.y;
    var dx = _this.window.center.x - this.mouse.x;

    var theta = Math.atan2(dy, dx); // range (-PI, PI]

    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]

    if (theta < 0) {
      theta = 360 + theta; // range [0, 360)
    }

    return theta;
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
    }); // Returns an array like [0,0,0,0,0,0]
  }
};

Site.init();
