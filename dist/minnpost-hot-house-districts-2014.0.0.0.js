
/**
 * Helpers functions such as formatters or extensions
 * to libraries.
 */
define('helpers', ['jquery', 'underscore'],
  function($, _) {
  

  var helpers = {};

  /**
   * Override Backbone's ajax call to use JSONP by default as well
   * as force a specific callback to ensure that server side
   * caching is effective.
   */
  helpers.overrideBackboneAJAX = function() {
    Backbone.ajax = function() {
      var options = arguments;

      if (options[0].dataTypeForce !== true) {
        options[0].dataType = 'jsonp';
        options[0].jsonpCallback = 'mpServerSideCachingHelper' +
          _.hash(options[0].url);
      }
      return Backbone.$.ajax.apply(Backbone.$, options);
    };
  };

  /**
   * Returns version of MSIE.
   */
  helpers.isMSIE = function() {
    var match = /(msie) ([\w.]+)/i.exec(navigator.userAgent);
    return match ? parseInt(match[2], 10) : false;
  };

  /**
   * Wrapper for a JSONP request, the first set of options are for
   * the AJAX request, while the other are from the application.
   */
  helpers.jsonpRequest = function(requestOptions, appOptions) {
    options.dataType = 'jsonp';
    options.jsonpCallback = 'mpServerSideCachingHelper' +
      _.hash(options.url);

    if (appOptions.remoteProxy) {
      options.url = options.url + '&callback=mpServerSideCachingHelper';
      options.url = appOptions.remoteProxy + encodeURIComponent(options.url);
      options.cache = true;
    }

    return $.ajax.apply($, [options]);
  };

  /**
   * Data source handling.  For development, we can call
   * the data directly from the JSON file, but for production
   * we want to proxy for JSONP.
   *
   * `name` should be relative path to dataset
   * `options` are app options
   *
   * Returns jQuery's defferred object.
   */
  helpers.getLocalData = function(name, options) {
    var useJSONP = false;
    var defers = [];
    name = (_.isArray(name)) ? name : [ name ];

    // If the data path is not relative, then use JSONP
    if (options && options.paths && options.paths.data.indexOf('http') === 0) {
      useJSONP = true;
    }

    // Go through each file and add to defers
    _.each(name, function(d) {
      var defer;

      if (useJSONP) {
        defer = helpers.jsonpRequest({
          url: proxyPrefix + encodeURI(options.paths.data + d)
        }, options);
      }
      else {
        defer = $.getJSON(options.paths.data + d);
      }
      defers.push(defer);
    });

    return $.when.apply($, defers);
  };

  /**
   * Reads query string and turns into object.
   */
  helpers.parseQueryString = function() {
    var assoc  = {};
    var decode = function(s) {
      return decodeURIComponent(s.replace(/\+/g, " "));
    };
    var queryString = location.search.substring(1);
    var keyValues = queryString.split('&');

    _.each(keyValues, function(v, vi) {
      var key = v.split('=');
      if (key.length > 1) {
        assoc[decode(key[0])] = decode(key[1]);
      }
    });

    return assoc;
  };

  return helpers;
});


define('text!templates/application.mustache',[],function () { return '<div class="application-container">\n  <div class="message-container"></div>\n\n  <div class="content-container">\n    <div class="districts-nav cf">\n      {{#districts:gi}}\n        <div class="type-group {{ gi }}-districts">\n          <span><img title="{{ typeNames[gi] }}" class="custom-icon" src="{{ paths.images }}{{ gi }}.png"></span>\n          <ul>\n            {{#this:di}}\n              <li><a href="#"\n                style="background-color: {{ pviColor.hex() }};"\n                data-spy-on="district-{{ district }}"\n                on-tap="selectDistrict:{{ district }}">\n                {{ district }}\n              </a></li>\n            {{/this}}\n          </ul>\n        </div>\n      {{/districts}}\n    </div>\n\n    <div class="districts">\n      {{#districts:gi}}\n        <h2>{{ typeNames[gi] }}</h2>\n\n        {{#this:di}}\n          <div class="district" data-spy-me="district-{{ district }}">\n            <h3>\n              District {{ district }}\n              <img class="custom-icon" src="{{ paths.images }}{{ type }}.png">\n            </h3>\n\n            <div class="row">\n              <div class="column-medium-50">\n                {{ description }}\n              </div>\n\n              <div class="column-medium-25 details">\n                <div class="candidates">\n                  <div>\n                    {{ (incumbentparty === \'R\') ? candidater : candidated }}\n                    <span class="label bg-color-political-{{ (incumbentparty === \'R\') ? \'r\' : \'dfl\' }}">{{ (incumbentparty === \'R\') ? \'R\' : \'DFL\' }}</span>\n                    {{#incumbentparty}}\n                      <span title="Incumbent" class="label">I</span>\n                    {{/incumbentparty}}\n                  </div>\n                  <div>vs.</div>\n                  <div>\n                    {{ (incumbentparty === \'R\') ? candidated : candidater }}\n                    <span class="label bg-color-political-{{ (incumbentparty === \'R\') ? \'dfl\' : \'r\' }}">{{ (incumbentparty === \'R\') ? \'DFL\' : \'R\' }}</span>\n                  </div>\n                </div>\n\n\n                <div class="chart-container">\n                  <div>PVI</div>\n                  <div class="chart"\n                    title="PVI: {{ pvi < 0 ? \'DFL\' : \'R\' }} {{ f.number(Math.abs(pvi), 2) }}">\n                    <div class="mid-tick"></div>\n                    <div class="tick"\n                      style="background-color: {{ pviColor.hex() }}; left: {{ pT(pvi, -10, 10) }}%;">\n                    </div>\n                  </div>\n                </div>\n\n                <div class="chart-container">\n                  <div>2012</div>\n                  <div class="chart"\n                    title="2012 margin: {{ pvi < 0 ? \'DFL\' : \'R\' }} {{ f.number(Math.abs(lean), 2) }}">\n                    <div class="mid-tick"></div>\n                    <div class="tick"\n                      style="background-color: {{ pviColor.hex() }}; left: {{ pT(lean, -10, 10) }}%;">\n                    </div>\n                  </div>\n                </div>\n\n                <div class="chart-container">\n                  <div>Presidential</div>\n                  <div class="chart"\n                    title="2012 Presidential lean: {{ pvi < 0 ? \'DFL\' : \'R\' }} {{ f.number(Math.abs(leanpres), 2) }}">\n                    <div class="mid-tick"></div>\n                    <div class="tick"\n                      style="background-color: {{ pviColor.hex() }}; left: {{ pT(leanpres, -10, 10) }}%;">\n                    </div>\n                  </div>\n                </div>\n              </div>\n\n              <div class="column-medium-25">\n                {{^boundary.simple_shape}}\n                  <div class="district-map">\n                    <div class="loading-block"></div>\n                  </div>\n                {{/boundary.simple_shape}}\n                {{#boundary.simple_shape}}\n                  <div class="district-map"\n                    id="district-map-{{ district }}"\n                    decorator="map:{{ this }}">\n                  </div>\n                {{/boundary.simple_shape}}\n              </div>\n          </div>\n        {{/this}}\n      {{/districts}}\n    </div>\n  </div>\n\n  <div class="footnote-container">\n    <div class="footnote">\n      <p>Some code, techniques, and data on <a href="https://github.com/minnpost/minnpost-hot-house-districts-2014" target="_blank">Github</a>.</p>\n\n      <p>Some map data © OpenStreetMap contributors; licensed under the <a href="http://www.openstreetmap.org/copyright" target="_blank">Open Data Commons Open Database License</a>.  Some map design © MapBox; licensed according to the <a href="http://mapbox.com/tos/" target="_blank">MapBox Terms of Service</a>.</p>\n\n      <p>\n        http://thenounproject.com/term/radar/793/\n        http://thenounproject.com/term/eye/19791/\n        http://thenounproject.com/term/blind/19790/\n    </div>\n  </div>\n</div>\n';});


define('text!../data/districts.json',[],function () { return '{"Hot House Districts 2014":[{"district":"1B","pvi":-3.842167034,"lean":-1,"preslean":-4,"type":"watch","candidater":"Debra Kiel","candidated":"ERIC BERGESON","candidatei":"","incumbentparty":"R","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":1},{"district":"2A","pvi":-4.387150035,"lean":-1,"preslean":-4,"type":"watch","candidater":"DAVE HANCOCK","candidated":"Roger Erickson","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":2},{"district":"2B","pvi":-0.116624542,"lean":-1,"preslean":-4,"type":"watch","candidater":"Steve Green","candidated":"DAVID SOBIESKI","candidatei":"","incumbentparty":"R","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":3},{"district":"10B","pvi":-4.351757483,"lean":-1,"preslean":-4,"type":"watch","candidater":"DALE K LUECK","candidated":"Joe Radinovich","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":4},{"district":"11B","pvi":-0.512959063,"lean":-1,"preslean":-4,"type":"watch","candidater":"Tim Faust","candidated":"JASON RARICK","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":5},{"district":"17B","pvi":-0.257265384,"lean":-1,"preslean":-4,"type":"watch","candidater":"DAVE BAKER","candidated":"Mary Sawatzky","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":6},{"district":"27A","pvi":-3.221256476,"lean":-1,"preslean":-4,"type":"watch","candidater":"PEGGY BENNETT","candidated":"Shannon Savick","candidatei":"THOMAS KEITH PRICE","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":7},{"district":"48A","pvi":-2.040107947,"lean":-1,"preslean":-4,"type":"watch","candidater":"KIRK STENSRUD","candidated":"Yvonne Selcer","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":8},{"district":"49A","pvi":-1.154977486,"lean":-1,"preslean":-4,"type":"watch","candidater":"DARIO ANSELMO","candidated":"Ron Erhardt","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":9},{"district":"49B","pvi":3.211975607,"lean":-1,"preslean":-4,"type":"watch","candidater":"BARB SUTTER","candidated":"Paul Rosenthal","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":10},{"district":"51A","pvi":-4.796473124,"lean":-1,"preslean":-4,"type":"watch","candidater":"ANDREA TODD-HARLIN","candidated":"Sandra Masin","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":11},{"district":"51B","pvi":-0.709947338,"lean":-1,"preslean":-4,"type":"watch","candidater":"JEN WILSON","candidated":"Laurie Halverson","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":12},{"district":"12A","pvi":7.143330362,"lean":-1,"preslean":-4,"type":"watch","candidater":"JEFF BACKER","candidated":"Jay McNamar","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":13},{"district":"56B","pvi":5.670417123,"lean":-1,"preslean":-4,"type":"watch","candidater":"ROZ PETERSON","candidated":"Will Morgan","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":14},{"district":"14B","pvi":-12.61853235,"lean":-1,"preslean":-4,"type":"watch","candidater":"JIM KNOBLACH","candidated":"Zachary Dorholt","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":15},{"district":"5B","pvi":-4.249005146,"lean":-1,"preslean":-4,"type":"radar","candidater":"JUSTIN EICHORN","candidated":"Tom Anzelc","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":16},{"district":"10A","pvi":-14.12174276,"lean":-1,"preslean":-4,"type":"radar","candidater":"John Ward ","candidated":"JOSHUA HEINTZEMAN","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":17},{"district":"36A","pvi":-6.1949472,"lean":-1,"preslean":-4,"type":"radar","candidater":"Mark W. Uglem","candidated":"JEFFERSON FIETEK","candidatei":"","incumbentparty":"R","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":18},{"district":"42A","pvi":-5.212494668,"lean":-1,"preslean":-4,"type":"radar","candidater":"RANDY JESSUP","candidated":"Barb Yarusso","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":19},{"district":"44B","pvi":-5.691491551,"lean":-1,"preslean":-4,"type":"radar","candidater":"JON APPLEBAUM","candidated":"RYAN RUTZICK","candidatei":"","incumbentparty":"","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":20},{"district":"60B","pvi":4.5,"lean":-1,"preslean":-4,"type":"unwatch","candidater":"Tester Test","candidated":"Tester McTest","candidatei":"","incumbentparty":"D","description":"Kitten Ipsum prrrrr spot, her jump lay down in your way basket feline home loves first sucked picture snickers leap. Leo pillow cat down fuzzy life saved loves cats happy shed everywhere he home kittens, cat cat sit birdwatch oh neighbors siamese tiny waffles years trust. Front, cat scottish fold family smokey hot oscar feline cat. Kitten, kitty kittens ham sleep new kitties smile box cute she spoon french friendly meowlly peaceful fostering mom little loves 9th new kitty. Cake day tux kitty size spot girlfriend home Baxter happy cramped sleep around purses wonderful her. Meowschwitz cat norwegian forest cat sleep on your keyboard cat snuggliest, caught kittens he cat cat judging you royal cat. Birdwatching ever long cute kitten awesomeness cats kitten sunbathe petting looks, friends claw tongue petting fabulous years psycho cat belly fostering making biscuits family.","rowNumber":21}]}';});

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
      ]).mode('hsl').domain([-15, 15], 18);

      // Transform our data.  The data comes in with a keyed object with
      // the title of the spreadsheet and we don't want to maintain it.
      // Also note that Google Spreadsheets alters column names and removes
      // things like spaces, _, and numbers
      this.districts = JSON.parse(dDistricts);
      _.each(this.districts, function(d, di) {
        prop = di;
      });
      this.districts = this.districts[prop];
      this.districts = _.map(this.districts, function(d, di) {
        d.pvi = (d.pvi) ? parseFloat(d.pvi) : 0;
        d.pviColor = thisApp.cRange(d.pvi);
        d.pviFGColor = (chroma(d.pviColor).luminance() < 0.5) ? '#FFFFFF' : '#282828';
        return d;
      });
      this.districts = _.sortBy(this.districts, function(d, di) {
        return ((d.type === 'watch') ?  -9999 : ((d.type === 'radar') ? 0 : 9999)) + d.pvi;
      });
      this.districts = _.groupBy(this.districts, 'type');

      // Create main application view
      this.mainView = new Ractive({
        el: this.$el,
        template: tApplication,
        data: {
          districts: this.districts,
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
          throttle: 100
        });
        // Stick the navigation
        thisApp.$('.districts-nav').mpStick({
          container: thisApp.$('.districts-nav').parent()
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
        this.start();
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

