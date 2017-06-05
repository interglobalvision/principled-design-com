/* jshint browser: true, devel: true, indent: 2, curly: true, eqeqeq: true, futurehostile: true, latedef: true, undef: true, unused: true */
/* global $, jQuery, document, Site, Modernizr, WP */

Site = {
  mobileThreshold: 1024,
  scrollSpeed: 300,
  init: function() {
    var _this = this;

    _this.mapElement = document.getElementById('map');

    _this.$window = $(window);

    // Set windowSize
    _this.getWindowSize();

    _this.setIsMobileWidth();

    Site.Router.init();

    _this.$window.resize(function(){
      _this.onResize();
      Site.Nav.onResize();
    });

    $(document).ready(function () {
      Site.Shapes.init();
      Site.Minimap.init();
      Site.Coordinates.init();
      Site.Map.init();
      Site.Fades.init();
      Site.Nav.init();
      Site.Orientation.init();
    });

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

  onResize: function() {
    var _this = this;

    // Set windowSize
    _this.getWindowSize();

    _this.setIsMobileWidth();

    Site.Map.onResize();
  },

  setIsMobileWidth: function() {
    var _this = this;

    if (_this.window.width >= _this.mobileThreshold) {
      _this.isMobileWidth = false;
    } else {
      _this.isMobileWidth = true;
    }
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
    var _this = this;

    _this.$header = $('#header');

    _this.setScrollOffset();

    _this.bind();
  },

  bind: function() {
    var _this = this;

    $('#header-name').on('click', function() {
      if (Site.isMobileWidth) {
        $('#main-content').toggleClass('mobile-menu-active');
      } else {
        _this.reset();
      }
    });

    $('.mobile-menu-item').on('click', function() {
      var target = $(this).data('slug');
      var $target = $('.page-content[data-slug=' + target + ']');

      $('#main-content').removeClass('mobile-menu-active');

      $('body').stop().animate({scrollTop: ($target.offset().top - _this.scrollOffset)}, Site.scrollSpeed, 'swing');
    });
  },

  onResize: function() {
    var _this = this;

    _this.setScrollOffset();
  },

  setScrollOffset: function() {
    var _this = this;

    _this.scrollOffset = ((_this.$header.outerHeight() - _this.$header.height()) / 2) + _this.$header.height();
  },

  reset: function() {
    Site.Map.moveMap(Site.window.width * -1, Site.window.height * -1);
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

    Site.$window.on('hashchange', function() {
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
  interval: 500,
  mobileInterval: 3000,
  animating: false,
  atCorner: false, // is the map at a corner?

  init: function() {
    var _this = this;

    // If we are on mobile, we slow down the animation interval
    if (Site.isMobileWidth) {
      _this.interval = _this.mobileInterval;
    }

    _this.showPattern();

    Site.mapElement.addEventListener('startpan', _this.startAnimation.bind(_this));

    Site.mapElement.addEventListener('stoppan', _this.stopAnimation.bind(_this));

    Site.mapElement.addEventListener('movemap', _this.checkMapPosition.bind(_this));

  },

  // Check if the map position is at a corner
  checkMapPosition: function(event) {
    var _this = this;

    var x = event.detail.map.position.x;
    var y = event.detail.map.position.y;

    var reachedLimits = 0;

    // Check for left limit
    if (x >= 0) {
      reachedLimits++;
    }

    // Check for right limit
    if (x <= Site.window.width * -2) {
      reachedLimits++;
    }

    // Check for upper limit
    if (y >= 0) {
      reachedLimits++;
    }

    // Check for bottom limit
    if (y <= Site.window.height * -2) {
      reachedLimits++;
    }

    // Reaching 2 limits means we are at a corner
    if (reachedLimits >= 2) {
      _this.atCorner = true;
    } else {
      _this.atCorner = false;
    }

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

    // Check is animating has been stopped or is at limit; we do this here to fail faster
    if (!_this.animating) {
      return false;
    }

    var currentTime = new Date().getTime();
    var delta = currentTime - _this.startTime;

    // If interval has passed since start time and we are not in a corner
    if (delta >= _this.interval  && !_this.atCorner) {

      // Change the background pattern
      _this.changePattern();

      // Reset start time
      _this.startTime = new Date().getTime();
    }

    // Play loop recursively
    _this.timer = window.requestAnimationFrame(_this.playAnimation.bind(_this));
  },

  startAnimation: function(event) {
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

    _this.atCorner = false;

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

  onResize: function() {
    var _this =  this;

    // re init pan zones
    _this.setPanZones();
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
        min: Site.window.height - _this.panZoneSize,
        max: Site.window.height,
      },
      left: {
        min: 0,
        max: _this.panZoneSize,
      },
      right: {
        min: Site.window.width - _this.panZoneSize,
        max: Site.window.width,
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

    Site.mapElement.dispatchEvent(startPanEvent);

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

    Site.mapElement.dispatchEvent(stopPanEvent);

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
      _this.mapPosition = _this.getElemPosition(Site.mapElement);
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

      // Magic math, jk. It's basic math.
      var newX = (translatedLongitude * (Site.window.width * -2)) / 360;
      var newY = (translatedLatitude * (Site.window.height * 2)) / 180;

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
    if (x <= Site.window.width * -2) {
      x = Site.window.width * -2;
    }

    // Check for upper limit
    if (y >= 0) {
      y = 0;
    }

    // Check for bottom limit
    if (y <= Site.window.height * -2) {
      y = Site.window.height * -2;
    }

    // If we don't know the map's current postion we get it
    if (!_this.mapPosition) {
      _this.mapPosition = _this.getElemPosition(Site.mapElement);
    }

    // Set new coordinates
    _this.mapPosition[4] = x;
    _this.mapPosition[5] = y;

    // Apply new coordinates
    Site.mapElement.style.transform = 'matrix(' + _this.mapPosition.toString() + ')';

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
    Site.mapElement.dispatchEvent(movemapEvent);
  },

  // Return distance between center and mouse positon in pixels
  distanceFromCenter: function() {
    var _this = this;

    var xs = Math.pow(Site.window.center.x - _this.mouse.x, 2);
    var ys = Math.pow(Site.window.center.y - _this.mouse.y, 2);
    var distance = Math.sqrt(xs + ys);

    return distance;
  },

  // Return angle in rad from center of the window and mouse position relative to X-axis
  angleFromCenter: function() {
    var _this = this;

    var dy = Site.window.center.y - this.mouse.y;
    var dx = Site.window.center.x - this.mouse.x;

    var theta = Math.atan2(dy, dx); // range (-PI, PI]

    return theta;
  },

  // Return current map postion
  getElemPosition: function(elem) {
    var _this = this;

    // Get current element position (transform values)
    var transformMatrix = getComputedStyle(elem).transform; // Returns a string like "matrix(0,0,0,0,0,0)"

    // If no transform styles applied yet, return the default array values
    if (transform = 'none') {
      return [1,0,0,1,0,0];
    }

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
  $textContent: $('#header-name, #header-menu li, #main-content'),
  $mapContent: $('.map-block-content'),
  isPanning: false,
  isHoveringText: false,
  init: function() {
    var _this = this;

    // Fades are not used on mobile
    if (!Site.isMobileWidth) {
      _this.handleMapPanning();
      _this.handleTextHover();
    }

  },

  handleMapPanning: function() {
    var _this = this;

    Site.mapElement.addEventListener('startpan', function() {
      _this.isPanning = true;

      // Fadeout text content
      _this.$textContent.addClass('fade-element');

      // Fadein map content
      _this.$mapContent.removeClass('fade-element');
    });

    Site.mapElement.addEventListener('stoppan', function() {
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

    Site.mapElement.addEventListener('movemap', _this.moveIndicator.bind(_this));

  },

  handleClick: function(elem) {
    var _this = this;

    // Get grid position from target elem data attrs
    var col = $(elem).attr('data-col');
    var row = $(elem).attr('data-row');

    // Multiply positions by window sizes to get new map coordinates
    var x = col * Site.window.width * -1;
    var y = row * Site.window.height * -1;

    var $map = $('#map');

    // Add slow pan class
    $map.addClass('slow-pan');

    // Set timeout to remove slow-pan class
    setTimeout( function() {
      $map.removeClass('slow-pan');
    }, 300);


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

    Site.mapElement.addEventListener('movemap', _this.updateCoordinates.bind(_this));
  },

  updateCoordinates: function(event) {
    var _this = this;

    // Get map position
    var x = event.detail.map.position.x;
    var y = event.detail.map.position.y;

    // Convert position to lat, lon
    var coordinates = _this.convertToCoordinates(x,y);

    // Update coordintaes in the markup
    _this.coordinatesHolder.innerHTML = coordinates.lat + ", " + coordinates.lon;

  },

  convertToCoordinates: function(x,y) {
    var _this = this;

    // Get window size
    var windowWidth = Site.window.width;
    var windowHeight = Site.window.height;

    // Transport values to scales of (-180 - 180) for longitude and of (-90 - 90) for latitude
    var lon = ((x / (windowWidth * -2)) * 360) - 180;
    var lat = ((y / (windowHeight * -2)) * 180 ) - 90;

    // Convert values to DMS
    lon = _this.convertToDMS(lon);
    lat = _this.convertToDMS(lat);

    // Make the coordinates object
    var convertedCoordinates = {
      lat: lat,
      lon: lon,
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

// Handles Panning thru device orientation
Site.Orientation = {
  init: function() {
    var _this = this;

    // We only get this working if we are on mobile
    if (Site.isMobileWidth) {

      // Bind handle orintation function scope; a la react
      _this.handleOrientation = _this.handleOrientation.bind(_this);

      // Bind events
      _this.bind();

      // We need to trigger this event in order to get the patterns changing
      Site.Map.startPanEvent();
    }

  },

  bind: function() {
    var _this = this;

    // Listen for deviceorientation
    window.addEventListener("deviceorientation", _this.handleOrientation, true);

  },

  // Moves map with orientation change
  handleOrientation: function(event) {

    // Get orientation values from the event
    var x = event.gamma; // In degree in the range [-90,90]
    var y = event.beta;  // In degree in the range [-180,180]

    // Magic math, jk. It's basic math.
    var newX = (x + 90) * (Site.window.width * -2) / 180;
    var newY = (y + 180) * (Site.window.height * -2) / 360;

    // Move the map
    Site.Map.moveMap(newX,newY);

  },
};

Site.init();
