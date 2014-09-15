/**
 * Main application file for: minnpost-hot-house-districts-2014
 *
 * This pulls in all the parts
 * and creates the main object for the application.
 */

// Create main application
define('minnpost-hot-house-districts-2014', [
  'jquery', 'underscore', 'ractive', 'ractive-events-tap', 'leaflet', 'chroma',
  'mpConfig', 'mpFormatters', 'mpMaps', 'mpNav',
  'helpers',
  'text!templates/application.mustache',
  'text!../data/districts.json'
], function(
  $, _, Ractive, RactiveEventsTap, L, chroma,
  mpConfig, mpFormatters, mpMaps, mpNav,
  helpers,
  tApplication,
  dDistricts
  ) {
  'use strict';

  // Constructor for app
  var App = function(options) {
    this.options = _.extend(this.defaultOptions, options);
    this.el = this.options.el;
    this.$el = $(this.el);
    this.$ = function(selector) { return this.$el.find(selector); };
    this.loadApp();
  };

  // Extend with custom methods
  _.extend(App.prototype, {
    // Start function
    start: function() {
      var thisApp = this;
      var prop;

      // Color range
      this.cRange = chroma.scale([
        mpConfig['colors-political'].d,
        '#FFFFFF',
        mpConfig['colors-political'].r
      ]).mode('hsl').domain([-10, 10]);

      // Transform our data.  The data comes in with a keyed object with
      // the title of the spreadsheet and we don't want to maintain it.
      // Also note that Google Spreadsheets alters column names and removes
      // things like spaces and _
      this.districts = JSON.parse(dDistricts);
      _.each(this.districts, function(d, di) {
        prop = di;
      });
      this.districts = this.districts[prop];
      this.districts = _.map(this.districts, function(d, di) {
        d.pvi = (d.pvi) ? parseFloat(d.pvi) : 0;
        d.lean = (d.lean2012) ? parseFloat(d.lean2012) : 0;
        d.lean = (d.leanpres) ? parseFloat(d.leanpres) : 0;
        d.pviColor = thisApp.cRange(d.pvi);
        d.pviFGColor = (chroma(d.pviColor).luminance() < 0.5) ? '#FFFFFF' : '#282828';
        return d;
      });
      // Sort
      this.districts = _.sortBy(this.districts, function(d, di) {
        return ((d.type === 'watch') ?  -9999 : ((d.type === 'radar') ? 0 : 9999)) + d.pvi;
      });
      // Group
      this.districts = _.groupBy(this.districts, 'type');

      // Create main application view
      this.mainView = new Ractive({
        el: this.$el,
        template: tApplication,
        data: {
          districts: this.districts,
          cR: this.cRange,
          f: mpFormatters,
          pT: this.percentTowards,
          paths: this.options.paths,
          typeNames: {
            watch: 'Watching',
            radar: 'On the radar',
            unwatch: 'No longer watching'
          }
        },
        partials: {
        },
        decorators: {
          map: this.mapDecorator
        }
      });

      // Delay to ensure that the DOM from the view is totally loaded
      _.delay(function() {
        // Scroll spy
        thisApp.$el.mpScrollSpy({
          offset: thisApp.$('.districts-nav').height() + 30,
          throttle: 50
        });
        // Stick the navigation
        thisApp.$('.districts-nav').mpStick({
          container: thisApp.$('.districts-nav').parent(),
          throttle: 50
        });
      }, 1000);

      // Events
      this.mainView.on('selectDistrict', function(e) {
        e.original.preventDefault();
      });

      // Attach boundary outline to each district
      this.mainView.observe('districts.*.*', function(n, o, keypath) {
        var thisView = this;
        var current = this.get(keypath + '.boundary');

        if (_.isObject(n) && n.district && !_.isObject(current)) {
          $.getJSON(thisApp.options.boundaryAPI.replace('[[[ID]]]', n.district.toLowerCase()))
            .done(function(data) {
              if (_.isObject(data)) {
                thisView.set(keypath + '.boundary', data);
              }
            });
        }
      });
    },

    // Ractive decorator for making a map
    mapDecorator: function(node, shape) {
      var map, layer;

      // Add map
      map = mpMaps.makeLeafletMap(node);
      map.removeControl(map.zoomControl);
      map.addControl(new L.Control.Zoom({ position: 'topright' }));
      layer = L.geoJson(shape, {
        style: mpMaps.mapStyle
      }).addTo(map);
      map.fitBounds(layer.getBounds(), {
        padding: [25, 25]
      });
      map.invalidateSize();

      return {
        teardown: function () {
          if (_.isObject(map)) {
            map.remove();
          }
        }
      };
    },

    // Percentage towards
    percentTowards: function(v, start, end) {
      var p = (v - start) / (end - start);
      return Math.min(Math.max(p * 100, 0), 100);
    },


    // Default options
    defaultOptions: {
      projectName: 'minnpost-hot-house-districts-2014',
      remoteProxy: null,
      el: '.minnpost-hot-house-districts-2014-container',
      boundaryAPI: '//boundaries.minnpost.com/1.0/boundary/[[[ID]]]-state-house-district-2012?callback=?',
      availablePaths: {
        local: {
          css: ['.tmp/css/main.css'],
          images: 'images/',
          data: 'data/'
        },
        build: {
          css: [
            '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css',
            'dist/minnpost-hot-house-districts-2014.libs.min.css',
            'dist/minnpost-hot-house-districts-2014.latest.min.css'
          ],
          ie: [
            'dist/minnpost-hot-house-districts-2014.libs.min.ie.css',
            'dist/minnpost-hot-house-districts-2014.latest.min.ie.css'
          ],
          images: 'dist/images/',
          data: 'dist/data/'
        },
        deploy: {
          css: [
            '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css',  '//s3.amazonaws.com/data.minnpost/projects/minnpost-hot-house-districts-2014/minnpost-hot-house-districts-2014.libs.min.css',  '//s3.amazonaws.com/data.minnpost/projects/minnpost-hot-house-districts-2014/minnpost-hot-house-districts-2014.latest.min.css'
          ],
          ie: [  '//s3.amazonaws.com/data.minnpost/projects/minnpost-hot-house-districts-2014/minnpost-hot-house-districts-2014.libs.min.ie.css',  '//s3.amazonaws.com/data.minnpost/projects/minnpost-hot-house-districts-2014/minnpost-hot-house-districts-2014.latest.min.ie.css'
          ],
          images: '//s3.amazonaws.com/data.minnpost/projects/minnpost-hot-house-districts-2014/images/',
          data: '//s3.amazonaws.com/data.minnpost/projects/minnpost-hot-house-districts-2014/data/'
        }
      }
    },

    // Load up app
    loadApp: function() {
      this.determinePaths();
      this.getLocalAssests(function(map) {
        this.renderAssests(map);
        // A slight delay/hack so that the CSS can be loaded.  There is an onload
        // event, but that is just when the DOM element is created, not when
        // the CSS has been applied
        _.delay(_.bind(function() {
          this.start();
        }, this), 500);
      });
    },

    // Determine paths.  A bit hacky.
    determinePaths: function() {
      var query;
      this.options.deployment = 'deploy';

      if (window.location.host.indexOf('localhost') !== -1) {
        this.options.deployment = 'local';

        // Check if a query string forces something
        query = helpers.parseQueryString();
        if (_.isObject(query) && _.isString(query.mpDeployment)) {
          this.options.deployment = query.mpDeployment;
        }
      }

      this.options.paths = this.options.availablePaths[this.options.deployment];
    },

    // Get local assests, if needed
    getLocalAssests: function(callback) {
      var thisApp = this;

      // If local read in the bower map
      if (this.options.deployment === 'local') {
        $.getJSON('bower.json', function(data) {
          callback.apply(thisApp, [data.dependencyMap]);
        });
      }
      else {
        callback.apply(this, []);
      }
    },

    // Rendering tasks
    renderAssests: function(map) {
      var isIE = (helpers.isMSIE() && helpers.isMSIE() <= 8);

      // Add CSS from bower map
      if (_.isObject(map)) {
        _.each(map, function(c, ci) {
          if (c.css) {
            _.each(c.css, function(s, si) {
              s = (s.match(/^(http|\/\/)/)) ? s : 'bower_components/' + s + '.css';
              $('head').append('<link rel="stylesheet" href="' + s + '" type="text/css" />');
            });
          }
          if (c.ie && isIE) {
            _.each(c.ie, function(s, si) {
              s = (s.match(/^(http|\/\/)/)) ? s : 'bower_components/' + s + '.css';
              $('head').append('<link rel="stylesheet" href="' + s + '" type="text/css" />');
            });
          }
        });
      }

      // Get main CSS
      _.each(this.options.paths.css, function(c, ci) {
        $('head').append('<link rel="stylesheet" href="' + c + '" type="text/css" />');
      });
      if (isIE) {
        _.each(this.options.paths.ie, function(c, ci) {
          $('head').append('<link rel="stylesheet" href="' + c + '" type="text/css" />');
        });
      }

      // Add a processed class
      this.$el.addClass('processed');
    }
  });

  return App;
});


/**
 * Run application
 */
require(['jquery', 'minnpost-hot-house-districts-2014'], function($, App) {
  $(document).ready(function() {
    var app = new App();
  });
});
