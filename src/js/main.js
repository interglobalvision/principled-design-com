/* jshint browser: true, devel: true, indent: 2, curly: true, eqeqeq: true, futurehostile: true, latedef: true, undef: true, unused: true */
/* global $, jQuery, document, Site, Modernizr, WP */

Site = {
  mobileThreshold: 601,
  init: function() {
    var _this = this;

    Site.Router.init();

    $(window).resize(function(){
      _this.onResize();
    });

    $(document).ready(function () {
      Site.Shapes.init();
      Site.Minimap.init();
      Site.Coordinates.init();
      Site.Map.init();
      Site.Fades.init();
      Site.Nav.init();
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

Site.Nav = {
  init: function() {
    this.bind();
  },

  bind: function() {
    var _this = this;

    $('#header-name').on('click', function() {
      _this.reset();
    });
  },

  reset: function() {
    Site.Map.moveMap(Site.Map.window.width * -1, Site.Map.window.height * -1);
    Site.Router.resetContent();
    Site.Router.cleanUrl();
  },
};

Site.Router = {
  init: function() {
    var _this = this;

    _this.bind();

    if (location.hash) {
      _this.loadRoute(_this.parseHash(location.hash));
    }
  },

  bind: function() {
    var _this = this;

    $(window).on('hashchange', function() {
      _this.loadRoute(_this.parseHash(location.hash));
    });

  },

  loadRoute: function(hash) {
    var _this = this;

    if (hash) {
      _this.resetContent();
      $('.page-content[data-slug="' + hash + '"]').addClass('page-content-active');

      _this.setMenuActive(hash);
    }
  },

  resetContent: function() {
    $('.page-content').removeClass('page-content-active');
    $('.header-menu-active').removeClass('header-menu-active');
  },

  setMenuActive: function(hash) {
    var _this = this;

    var $item = $('.header-menu-item[data-slug="' + hash + '"]');

    $('.header-menu-active').removeClass('header-menu-active');
    $item.addClass('header-menu-active');
  },

  parseHash: function(rawHash) {
    return rawHash.substr(3);
  },

  cleanUrl: function() {
    window.location.hash = '';
    history.pushState({}, '', './');
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
  interval: 1000,
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

    // Assign random current pattern array index
    _this.currentPattern = Math.floor(Math.random() * (_this.patternMax - _this.patternMin + 1)) + _this.patternMin;

    // Show current pattern
    _this.$patterns[_this.currentPattern].addClass('show');
  },

  changePattern: function() {
    var _this = this;

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
  },

  playAnimation: function() {
    var _this = this;

    // Check is animating has been stopped; we do this here to fail faster
    if (!_this.animating) {
      return false;
    }

    var currentTime = new Date().getTime();
    var delta = currentTime - _this.startTime;

    // If interval has passed since start time
    if (delta >= _this.interval) {

      // Change the background pattern
      _this.changePattern();

      // Reset start time
      _this.startTime = new Date().getTime();
    }

    // Play loop recursively
    _this.timer = window.requestAnimationFrame(_this.playAnimation.bind(_this));
  },

  startAnimation: function() {
    var _this = this;

    // Set initial start time
    _this.startTime = new Date().getTime() - _this.interval;

    _this.animating = true;

    // Initialize animation loop
    _this.playAnimation();
  },

  stopAnimation: function() {
    var _this = this;

    _this.animating = false;

    // Clear animation request
    window.cancelAnimationFrame(_this.timer);
  },
};

Site.Map = {
  panZoneSize: 48, // in pixels
  panSpeed: 0.04,
  panDelay: 100, // in ms
  panning: false, // is it panning or not?
  window: {},
  center: {},
  mouse: {},
  mapPosition: false,
  pointerInHeader: false,
  init: function() {
    var _this =  this;

    // Set windowSize
    _this.getWindowSize();

    // Set map element
    _this.map = document.getElementById('map');

    // Move map to match geolocation
    _this.geolocation();

    // init pan zones
    _this.setPanZones();

    // Bind mouse position
    document.addEventListener('mousemove', _this.handleMouseMove.bind(_this));

    // Detect mouse outside window
    document.body.addEventListener('mouseleave', _this.stopPanning.bind(_this));

    // Bind hover event on #header
    _this.bindHeaderMouseOver();

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


    if (_this.isInsidePanZone() && !_this.panning) {
      _this.triggerPanning(); // Trigger animation
    } else if (_this.panning && !_this.isInsidePanZone()) {
      _this.stopPanning(); // Stop animation
    }

  },

  stopPanning: function() {
    var _this =  this;

    _this.panning = false;

    clearTimeout(_this.delayTimeout);

    _this.stopPanEvent();

  },

  // (Bool) check if mouse is inside any pan zone
  isInsidePanZone: function() {
    var _this =  this;

    // Check if mouse is over header or it's childs
    if (_this.mouseOnHeader) {
      return false;
    }

    // Get mouse position
    var posX = _this.mouse.x;
    var posY = _this.mouse.y;

    // Check if mouse is inside panZones
    if ( (posX >= _this.panZones.left.min && posX <= _this.panZones.left.max) || // Left
      (posX >= _this.panZones.right.min && posX <= _this.panZones.right.max) || // Right
      (posY >= _this.panZones.up.min && posY <= _this.panZones.up.max) || // Up
      (posY >= _this.panZones.down.min && posY <= _this.panZones.down.max) ) //  Down
    {
      return true;
    }

    return false;

  },

  // Trigger panning animation
  triggerPanning: function() {
    var _this =  this;

    _this.panning = true;

    // We use a timeout to delay the triggering
    _this.delayTimeout = setTimeout( function() {
      _this.startPanEvent();
      window.requestAnimationFrame(_this.pan.bind(_this));
    }, _this.panDelay);

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
      _this.mapPosition = _this.getElemPosition(_this.map);
    }

    // Get new coordinates based on the angle and the translation value
    var newX = _this.mapPosition[4] + (translation * Math.cos(angle));
    var newY = _this.mapPosition[5] + (translation * Math.sin(angle));

    // Move the map
    _this.moveMap(newX,newY);

    // Animate recursevly
    window.requestAnimationFrame(_this.pan.bind(_this));

  },

  // Check if golocation is available and move the map to that equivalent location
  geolocation: function() {
    var _this =  this;

    if (!WP.clientGeolocation) {
      console.log('Geolocation not returned by the server');
    } else if (WP.clientGeolocation.latitude && WP.clientGeolocation.longitude) {

      // NOTES:
      //
      // # LONGITUDE
      //
      // Goes -180 to 180 deg. 0 is Greenwich. Negative is to the east,
      // positive is west. In the map context it goes from 0 to
      // _this.window.width * -2.
      // Equivalent to the X axis
      //
      // # LATITUDE
      //
      // Goes from -90 to 90 deg. 0 deg is the equator, +- 90 deg are the
      // poles. In the map context it goes from  0 to _this.window.height * -2
      // Equivalent to the Y axis
      //

      // Turn strings into numbers
      var longitude = Number(WP.clientGeolocation.longitude);
      var latitude = Number(WP.clientGeolocation.latitude);

      // Transport longitude to only positive values so it goes from 0 to 360
      var translatedLongitude = longitude + 180;

      // Transport latitude to only negative values so it goes from -180 to 0
      var translatedLatitude = latitude - 90;

      // Magic math, jk. It'ssic math.
      var newX = (translatedLongitude * (_this.window.width * -2)) / 360;
      var newY = (translatedLatitude * (_this.window.height * 2)) / 180;

      // Move the map
      _this.moveMap(newX,newY);
    }
  },


  // Move the map to given coordinates
  moveMap: function(x,y) {
    var _this =  this;

    // Check for left limit
    if (x >= 0) {
      x = 0;
    }

    // Check for right limit
    if (x <= _this.window.width * -2) {
      x = _this.window.width * -2;
    }

    // Check for upper limit
    if (y >= 0) {
      y = 0;
    }

    // Check for bottom limit
    if (y <= _this.window.height * -2) {
      y = _this.window.height * -2;
    }


    // If we don't know the map's current postion we get it
    if (!_this.mapPosition) {
      _this.mapPosition = _this.getElemPosition(_this.map);
    }

    // Set new coordinates
    _this.mapPosition[4] = x;
    _this.mapPosition[5] = y;

    // Apply new coordinates
    _this.map.style.transform = 'matrix(' + _this.mapPosition.toString() + ')';

    _this.triggerMoveEvent(x,y);
  },

  triggerMoveEvent: function(x,y) {
    var _this =  this;

    // Create custom event
    var movemapEvent = new CustomEvent('movemap', {
      detail: {
        map: {
          position: {
            x: x,
            y: y
          },
        },
      },
    });

    // Dispatch movemapEvent
    _this.map.dispatchEvent(movemapEvent);
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
  getElemPosition: function(elem) {
    var _this = this;

    // Get current element position (transform values)
    var transformMatrix = getComputedStyle(elem).transform; // Returns a string like "matrix(0,0,0,0,0,0)"

    // Get only the values as an array
    transformMatrix = transformMatrix.replace(/3d|matrix|\(|\)|\s|/g,'').split(','); // Returns an array like ["0","0","0","0","0","0"]

    // Parse string values into int values
    transformMatrix = transformMatrix.map( function(item) {
      return parseInt(item, 10);
    }); // Returns an array like [0,0,0,0,0,0]

    return transformMatrix;
  },

  bindHeaderMouseOver: function() {
    var _this =  this;

    // Detect mouse inside #header
    var headerChilds = document.querySelectorAll('#header > *');

    for (var i = 0; i < headerChilds.length; i++) {
      var child = headerChilds[i];

      child.addEventListener('mouseenter', _this.mouseEntersHeader.bind(_this));
      child.addEventListener('mouseleave', _this.mouseLeavesHeader.bind(_this));
    }

  },

  mouseEntersHeader: function() {
    var _this = this;

    _this.mouseOnHeader = true;
  },

  mouseLeavesHeader: function() {
    var _this = this;

    _this.mouseOnHeader = false;
  },

};

Site.Fades = {
  $textContent: $('#main-content'),
  $mapContent: $('.map-block-content'),
  isPanning: false,
  isHoveringText: false,
  init: function() {
    var _this = this;

    _this.handleMapPanning();
    _this.handleTextHover();
  },

  handleMapPanning: function() {
    var _this = this;

    var map = document.getElementById('map');

    map.addEventListener('startpan', function() {
      _this.isPanning = true;

      // Fadeout text content
      _this.$textContent.addClass('fade-element');

      // Fadein map content
      _this.$mapContent.removeClass('fade-element');
    });

    map.addEventListener('stoppan', function() {
      _this.isPanning = false;

      // Fadein text content
      _this.$textContent.removeClass('fade-element');

      if (_this.isHoveringText) {
        // If hovering text: fadeout map content
        _this.$mapContent.addClass('fade-element');
      }
    });
  },

  handleTextHover: function() {
    var _this = this;

    _this.$textContent.hover(
      function() {
        _this.isHoveringText = true;

        if (!_this.isPanning) {
          // Mouseenter text content
          // If not panning map: fadeout map content
          _this.$mapContent.addClass('fade-element');
        }
      },
      function() {
        _this.isHoveringText = false;

        // Mouseleave text content
        // Fadein map content
        _this.$mapContent.removeClass('fade-element');
      }
    );
  },
};


Site.Minimap = {
  minimapScale: 0.03,
  indicatorPosition: false,
  init: function() {
    var _this = this;

    // Set indicator element
    _this.minimapIndicator = document.getElementById('minimap-indicator');

    _this.bindClick();
    _this.bindMapMove();
  },

  bindClick: function() {
    var _this = this;

    // Bind click on minimap buttons
    $('.minimap-button').on('click', function() {
      // HANDLE IT
      _this.handleClick(this);
    });
  },

  bindMapMove: function() {
    var _this = this;

    var map = document.getElementById('map');

    map.addEventListener('movemap', _this.moveIndicator.bind(_this));

  },

  handleClick: function(elem) {
    var _this = this;

    // Get grid position from target elem data attrs
    var col = $(elem).attr('data-col');
    var row = $(elem).attr('data-row');

    // Multiply positions by window sizes to get new map coordinates
    var x = col * Site.Map.window.width * -1;
    var y = row * Site.Map.window.height * -1;

    // Move map to new coordinates
    Site.Map.moveMap(x,y);

  },

  moveIndicator: function(event) {
    var _this = this;

    var x = event.detail.map.position.x;
    var y = event.detail.map.position.y;

    // Multiply map position by minimap scale.
    // Map moves to negative coordinates,
    // Minimap indicator moves positive
    var minimapX = x * -(_this.minimapScale);
    var minimapY = y * -(_this.minimapScale);

    // If we don't know the indicator's current postion we get it
    if (!_this.indicatorPosition) {
      _this.indicatorPosition = Site.Map.getElemPosition(_this.minimapIndicator);
    }

    // Set new coordinates
    _this.indicatorPosition[4] = minimapX;
    _this.indicatorPosition[5] = minimapY;

    // Apply new coordinates
    _this.minimapIndicator.style.transform = 'matrix(' + _this.indicatorPosition.toString() + ')';
  },

};

Site.Coordinates = {
  secondsDecimalsSize: 3, // round seconds to this decimals
  init: function() {
    var _this = this;

    // Get coordinates element
    _this.coordinatesHolder = document.getElementById('lat-long');

    // Bind to mapmob
    _this.bindMapMove();
  },

  bindMapMove: function() {
    var _this = this;

    // Bind to mapmove
    var map = document.getElementById('map');

    map.addEventListener('movemap', _this.updateCoordinates.bind(_this));
  },

  updateCoordinates: function(event) {
    var _this = this;

    // Get map position
    var x = event.detail.map.position.x;
    var y = event.detail.map.position.y;

    // Convert position to lat, long
    var coordinates = _this.convertToCoordinates(x,y);

    // Update coordintaes in the markup
    _this.coordinatesHolder.innerHTML = coordinates.lat + ", " + coordinates.long;

  },

  convertToCoordinates: function(x,y) {
    var _this = this;

    // Get window size
    var windowWidth = Site.Map.window.width;
    var windowHeight = Site.Map.window.height;

    // Transport values to scales of (-180 - 180) for longitude and of (-90 - 90) for latitude
    var long = ((x / (windowWidth * -2)) * 360) - 180;
    var lat = ((y / (windowHeight * -2)) * 180 ) - 90;

    // Convert values to DMS
    long = _this.convertToDMS(long);
    lat = _this.convertToDMS(lat);

    // Make the coordinates object
    var convertedCoordinates = {
      lat: lat,
      long: long,
    };

    return convertedCoordinates;

  },

  // (Object) Convert given degrees to DMS (degrees, minutes, seconds)
  // Reference: http://www.rapidtables.com/convert/number/degrees-to-degrees-minutes-seconds.htm
  convertToDMS: function(deg) {
    var _this = this;

    // Get Degrees
    var d = Math.floor(deg);

    // Get Minutes
    var m = Math.floor((deg - d) * 60);

    // Get Seconds
    var s = (deg - d - m / 60) * 3600;

    // Round Seconds
    s = s.toFixed(_this.secondsDecimalsSize);

    return (d + '° ' + m + '\' ' + s + '"');
  }

};

Site.init();
