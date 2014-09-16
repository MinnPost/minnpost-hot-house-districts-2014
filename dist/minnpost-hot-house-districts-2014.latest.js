
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


define('text!templates/application.mustache',[],function () { return '<div class="application-container">\n  <div class="message-container"></div>\n\n  <div class="content-container">\n    {{^districts}}\n      <div class="loading-container">\n        <i class="loading"></i> Loading...\n      </div> \n    {{/districts}}\n\n    <div class="districts-nav cf">\n      <ul class="cf">\n        {{#districts:gi}}\n          <li class="nav-group-label group-{{ gi }}">\n            {{ typeNames[gi] }}\n          </li>\n\n          {{#this:di}}\n            <li class="nav-item"><a href="#district/{{ district }}"\n              style=""\n              data-spy-on="{{ district }}"\n              on-tap="selectDistrict:{{ district }}">\n              {{ district }}\n            </a></li>\n          {{/this}}\n        {{/districts}}\n      </ul>\n    </div>\n\n    <div class="districts">\n      {{#districts:gi}}\n        <h2>{{ typeNames[gi] }}</h2>\n\n        {{#this:di}}\n          <div class="district" data-spy-me="{{ district }}" id="{{ district }}">\n            <h3>\n              District {{ district }}\n            </h3>\n\n            <div class="candidates">\n              <span class="{{#incumbentparty}}incumbent-candidate{{/incumbentparty}}">\n                {{ (incumbentparty === \'R\') ? candidater : candidated }}\n              </span>\n              <span class="label bg-color-political-{{ (incumbentparty === \'R\') ? \'r\' : \'dfl\' }}">{{ (incumbentparty === \'R\') ? \'R\' : \'DFL\' }}</span>\n              <span class="vs">vs.</span>\n              {{ (incumbentparty === \'R\') ? candidated : candidater }}\n              <span class="label bg-color-political-{{ (incumbentparty === \'R\') ? \'dfl\' : \'r\' }}">{{ (incumbentparty === \'R\') ? \'DFL\' : \'R\' }}</span>\n            </div>\n\n            <div class="row">\n              <div class="column-medium-50">\n                <div class="description-container">\n                  {{{ description }}}\n                </div>\n              </div>\n\n              <div class="column-medium-25 details">\n                <div class="details-container">\n\n                  <div class="chart-container">\n                    <div class="component-label">Average lean</div>\n                    <div class="chart-canvas">\n                      <div class="label-d">D</div>\n                      <div class="chart"\n                        title="PVI Lean: {{ pvi < 0 ? \'DFL\' : \'R\' }} {{ f.number(Math.abs(pvi), 2) }}">\n                        <div class="mid-tick"></div>\n                        <div class="tick"\n                          style="background-color: {{ pviColor.hex() }}; left: {{ pT(pvi, -10, 10) }}%;">\n                        </div>\n                      </div>\n                      <div class="label-r">R</div>\n                    </div>\n                  </div>\n\n                  <div class="chart-container">\n                    <div class="component-label">2012 House margin</div>\n                    <div class="chart-canvas">\n                      <div class="label-d">D</div>\n                      <div class="chart"\n                        title="2012 margin: {{ lean2012 < 0 ? \'DFL\' : \'R\' }} {{ f.number(Math.abs(lean2012), 2) }}">\n                        <div class="mid-tick"></div>\n                        <div class="tick"\n                          style="background-color: {{ cR(lean2012).hex() }}; left: {{ pT(lean2012, -10, 10) }}%;">\n                        </div>\n                      </div>\n                      <div class="label-r">R</div>\n                    </div>\n                  </div>\n\n                  <div class="chart-container">\n                    <div class="component-label">Presidential margin</div>\n                    <div class="chart-canvas">\n                      <div class="label-d">D</div>\n                      <div class="chart"\n                        title="2012 Presidential lean: {{ leanpres < 0 ? \'DFL\' : \'R\' }} {{ f.number(Math.abs(leanpres), 2) }}">\n                        <div class="mid-tick"></div>\n                        <div class="tick"\n                          style="background-color: {{ cR(leanpres).hex() }}; left: {{ pT(leanpres, -10, 10) }}%;">\n                        </div>\n                      </div>\n                      <div class="label-r">R</div>\n                    </div>\n                  </div>\n                </div>\n              </div>\n\n              <div class="column-medium-25">\n                <div class="map-container">\n                  {{^boundary.simple_shape}}\n                    <div class="district-map">\n                      <div class="loading-block"></div>\n                    </div>\n                  {{/boundary.simple_shape}}\n                  {{#boundary.simple_shape}}\n                    <div class="district-map"\n                      id="district-map-{{ district }}"\n                      decorator="map:{{ this }}">\n                    </div>\n                  {{/boundary.simple_shape}}\n                </div>\n              </div>\n          </div>\n        {{/this}}\n      {{/districts}}\n    </div>\n  </div>\n\n  <div class="footnote-container">\n    <div class="footnote">\n      <p>\n        Some icons from the Noun Project\n        including <a target="_blank" href="http://thenounproject.com/term/radar/793/">radar</a> by Paul te Kortschot,\n        <a target="_blank" href="http://thenounproject.com/term/eye/19791/">eye</a>\n        and <a target="_blank" href="http://thenounproject.com/term/blind/19790/">blind</a> by Michael Rowe.\n        Some code, techniques, and data on <a href="https://github.com/minnpost/minnpost-hot-house-districts-2014" target="_blank">Github</a>.\n      </p>\n\n      <p>Some map data © OpenStreetMap contributors; licensed under the <a href="http://www.openstreetmap.org/copyright" target="_blank">Open Data Commons Open Database License</a>.  Some map design © MapBox; licensed according to the <a href="http://mapbox.com/tos/" target="_blank">MapBox Terms of Service</a>.</p>\n    </div>\n  </div>\n</div>\n';});


define('text!../data/districts.json',[],function () { return '{"Hot House Districts 2014":[{"district":"1B","pvi":-3.842167034,"lean2012":3.95,"leanpres":5.8,"type":"watch","candidater":"Debra Kiel","candidated":"Eric Bergeson","candidatei":"","incumbentparty":"R","description":"Democrats are bullish about their chances to take back a couple of seats in northwestern Minnesota that they lost in the 2010 election. That includes House District 1B, currently held by two-term Republican Rep. Deb Kiel. The homemaker and farmer from Crookston won the 2012 election by less than 5 percent of the vote. Democrats have recruited Eric Bergeson, a 2011 Bush fellow, author and prolific motivational speaker on one of the big issues up in the district: caring for aging populations. But most pundits say it’s Kiel’s race to lose in a low-turnout midterm election.","rowNumber":1},{"district":"2A","pvi":-4.387150035,"lean2012":-9.31,"leanpres":2.01,"type":"watch","candidater":"Dave Hancock","candidated":"Roger Erickson","candidatei":"","incumbentparty":"D","description":"Like many races this cycle, the contest for House District 2A is a rematch. Freshman DFL Rep. Roger Erickson is defending his seat from Republican Dave Hancock, a retired small business owner from Bemidji who held the seat before Erickson did. Erickson is fighting the conservative leanings of his district and the fact that he took a risky vote in favor of legalizing gay marriage last year (his district voted nearly 60 percent in favor of a constitutional gay marriage ban in 2012). But Erickson is a popular retired schoolteacher and high school football coach from Baudette, and many think his local name recognition could help him stave off an upset this fall.","rowNumber":2},{"district":"2B","pvi":-0.116624542,"lean2012":2,"leanpres":13.85,"type":"watch","candidater":"Steve Green","candidated":"David Sobieski","candidatei":"","incumbentparty":"R","description":"Neither Republicans or Democrats know exactly how to read the 2012 election in House District 02B, where Republican Rep. Steve Green survived a challenge from former DFL Rep. Brita Sailer by just 2 points. The complicating factor: hundreds of thousands of dollars were spent on the race from outside groups on both sides. Democrats are targeting the race again this year, but they’ve fielded a newcomer candidate in David Sobieski, a small business owner and a U.S. Air Force veteran. Sobieski has labeled himself a “blue dog” Democrat — much like the area’s moderate congressman, Collin Peterson — to appeal to district’s swing voters.","rowNumber":3},{"district":"10B","pvi":-4.351757483,"lean2012":-1.47,"leanpres":9.05,"type":"watch","candidater":"Dale K. Lueck","candidated":"Joe Radinovich","candidatei":"","incumbentparty":"D","description":"DFL Rep. Joe Radinovich is constantly reminded of the number 323. That’s how many votes the freshman from Crosby eked out his first victory for the House in 2012, and it shows the challenge he faces this challenge this cycle. Republicans have gone after Radinovich for voting to legalizing gay marriage, despite the fact that his district voted more than 62 percent in favor of banning gay marriage in the constitution in 2012. Radinovich’s vote was subject to a short-lived but well-publicized recall effort, and it’s coming up on the campaign trail, too. Gay marriage or not, Radinovich was going to have a hard slog to retain his seat — it leans Republican and he won it in a strong year for Democrats. But operatives note that Radinovich is a dedicated campaigner, which means this race has toss up written all over it.","rowNumber":4},{"district":"11B","pvi":-0.512959063,"lean2012":-2.66,"leanpres":4.18,"type":"watch","candidater":"Tim Faust","candidated":"Jason Rarick","candidatei":"","incumbentparty":"D","description":"The Hinckley-area is as politically swingy as they come in greater Minnesota, and no one knows that better that DFL Rep. Tim Faust. He was first elected in the anti-Bush wave of 2006, but he was booted from his seat when the reverse happened in 2010. He was welcomed back into the Legislature after the 2012 election, but Democrats are still afraid of whiplash. Republicans have fielded first-time candidate Jason Rarick, an electrician by trade who is running as a straight-talking, common sense Minnesotan. This is another district where some operatives say gay marriage could matter — Faust, a Lutheran minister, supported legalizing gay marriage last year despite his district’s support for the 2012 failed constitutional referendum.","rowNumber":5},{"district":"17B","pvi":-0.257265384,"lean2012":-4.17,"leanpres":4.08,"type":"watch","candidater":"Dave Baker","candidated":"Mary Sawatzky","candidatei":"","incumbentparty":"D","description":"The Willmar area has swung back and forth between political parties for the last three election cycles, making it a target for both parties this year. Incumbent DFL Rep. Mary Sawatzky was one of only two Democrats in her caucus to vote against a bill to legalize gay marriage, after her district supported a constitutional gay marriage ban in 2012. The vote has protected her from attacks on that issue, but she’s already weathering other criticisms from Republican groups trying to tie her to $2 billion in tax increases over the last two years and the faulty state health insurance exchange. Her opponent, Republican David Baker, owns a handful of hotels and investment properties in the district.","rowNumber":6},{"district":"27A","pvi":-3.221256476,"lean2012":-3.2,"leanpres":-13.22,"type":"watch","candidater":"Peggy Bennett","candidated":"Shannon Savick","candidatei":"Thomas Keith Price","incumbentparty":"D","description":"The House seat that includes the city of Austin in southern Minnesota is known for it’s close contests, and this year will likely be no different. In 2010, former GOP Rep. Rich Murray snatched the seat from an incumbent Democrat by less than a half of a percentage point, which triggered an automatic recount. Two years later, DFLer Shannon Savick, a former mayor of Wells, won the seat from Murray by about 2 percent of the vote. The vote two years ago was complicated by fact that Independence Party candidate William Wagner received 7.7 percent of the vote. A similar dynamic is shaping up this year: Savick is defending her seat from Republican Peggy Bennett, a local schoolteacher, and the Independence Party has fielded candidate Thomas Prince, who has kept a low profile in the race so far.","rowNumber":7},{"district":"48A","pvi":-2.040107947,"lean2012":-0.82,"leanpres":-5.93,"type":"watch","candidater":"Kirk Stensrud","candidated":"Yvonne Selcer","candidatei":"","incumbentparty":"D","description":"DFL Rep. Yvonne Selcer won her Minnetonka-area House seat two years ago with a slim margin of less than 1 percent of the vote — and that was a good year for Democrats. Republicans are betting they can steal the seat back this year in a low-turnout election. Former Republican Rep. Kirk Stensrud, who held the seat before Selcer, is trying to return to the Legislature this cycle, and he’s getting help from groups like the Minnesota Chamber of Commerce. But the race could turn on education issues in the suburban district — Stensrud is pushing for more local control for districts, while Selcer, a former school teacher, is touting Democrats’ repayment of the state’s school shift and investments in all-day kindergarten.","rowNumber":8},{"district":"49A","pvi":-1.154977486,"lean2012":-11.72,"leanpres":-5.6,"type":"watch","candidater":"Dario Anselmo","candidated":"Ron Erhardt","candidatei":"","incumbentparty":"D","description":"DFL Rep. Ron Erhardt isn’t a easy target. He spent his first nine terms in the House as a popular moderate Republican before he was ousted in 2008 for supporting a gas tax increase. When he decided to run again in 2012, Erhardt opted for the Democratic Party. And over the last two years in the Legislature, he’s voted like someone who toes the line between both parties, a good fit for the politically volatile Edina House district he represents. But he has a strong challenger in Dario Anselmo, the former owner of the Fine Line Music Café and founder of the Minneapolis Warehouse District Business Association. It’s Anselmo’s first stab at public office, but he’s proven to be an adept fundraiser and campaigner, Republicans say, making this a race to watch this cycle.","rowNumber":9},{"district":"49B","pvi":3.211975607,"lean2012":-6.76,"leanpres":-6.25,"type":"watch","candidater":"Barb Sutter","candidated":"Paul Rosenthal","candidatei":"","incumbentparty":"D","description":"There’s good reason DFL Rep. Paul Rosenthal was one of a handful of legislators who was able to break from Democrats on tough votes to raise taxes in 2013. Rosenthal, a foreign currency trader from Edina, was first elected in 2008, but he lost his seat in the GOP wave of 2010. He made it back to the Legislature in 2012, and DFL leadership wants to keep him there. His Republican opponent, Barbara Sutter, is a former tax accountant who has been involved in local politics for years. She’s talking mostly about the state’s tax climate, jobs and opposition to the new health insurance exchange in the business-friendly suburban district.","rowNumber":10},{"district":"51A","pvi":-4.796473124,"lean2012":-11.21,"leanpres":-13.06,"type":"watch","candidater":"Andrea Todd-Harlin","candidated":"Sandra Masin","candidatei":"","incumbentparty":"D","description":"It’s a familiar tale in the Twin Cities suburbs &mdash; DFLers were swept into districts during the anti-Bush years of 2006 and 2008 and quickly swept back out in 2010 over the healthcare overhaul. Many, like DFL Rep. Sandra Masin in Eagan, successfully reclaimed their seat in the 2012 and hoping to keep it through this midterm election. Masin won with more than 10 percent of the vote last fall, but the district usually swings with the national political winds. As of the last campaign finance reporting deadline, her Republican opponent Andrea Todd-Harlin had kept pace with Masin on fundraising.","rowNumber":11},{"district":"51B","pvi":-0.709947338,"lean2012":-3.87,"leanpres":-4.64,"type":"watch","candidater":"Jen Wilson","candidated":"Laurie Halverson","candidatei":"","incumbentparty":"D","description":"Freshman DFL Rep. Laurie Halverson could be the Amy Klobuchar of local politics. Much like the state’s popular U.S. senator, Halverson won a tough election and put her head down in her first term to work on non-controversial issue like cutting back on homelessness and youth smoking. A former employee of Blue Cross, Halverson was also the lone DFL House member to vote against the bill to create a health insurance exchange over lack of health care industry representation on the exchange board, and she got the highest marks of any Democrat in the House from the Minnesota Chamber of Commerce. But the Eagan House district has swung back and forth over the last few elections, and her opponent, community activist Jen Wilson, will see funds flood into her race from outside groups this fall.","rowNumber":12},{"district":"12A","pvi":7.143330362,"lean2012":-1.2,"leanpres":5.39,"type":"watch","candidater":"Jeff Backer","candidated":"Jay McNamar","candidatei":"","incumbentparty":"D","description":"Former Elbow Lake Mayor Jay McNamar’s victory was one of the noteworthy pickups for Democrats in the 2012 election: He won by about 1 point in a west central Minnesota House district that most expected to swing Republican. But that year a strong Independence Party candidate, Dave Holman, earned more than 6 percent of the vote. There’s no IP candidate this year, and Republicans see the race as one of their most likely pick-ups in the battle to regain the House. They’ve recruited businessman and Browns Valley School Board member Jeff Backer, who also served as Browns Valley mayor and four years on the city council.","rowNumber":13},{"district":"56B","pvi":5.670417123,"lean2012":-0.8,"leanpres":-0.29,"type":"watch","candidater":"Roz Peterson","candidated":"Will Morgan","candidatei":"","incumbentparty":"D","description":"All eyes are on Burnsville. That’s where one of the most competitive races in the fight for the House is shaping up, and, depending on which way it goes, could spell doom or glory for Democrats. For starters, House District 56B is a classic swing district — it has flipped back and forth from Republican to Democratic control for the last three election cycles — and both candidates seeking to represent it have strong backgrounds. This year’s race is a rematch from 2012 between incumbent DFL Rep. Will Morgan, a high-school physics teacher, and Republican Roz Peterson, a Lakeville School Board member and former chair of the Dakota County Regional Chamber of Commerce. If the Democrats maintain control of this seat, expect them to hold on to other close swing seats across the state as well.","rowNumber":14},{"district":"14B","pvi":-12.61853235,"lean2012":-12.73,"leanpres":-9.66,"type":"watch","candidater":"Jim Knoblach","candidated":"Zachary Dorholt","candidatei":"","incumbentparty":"D","description":"The St. Cloud area House district represented by freshman DFL Rep. Zachary Dorholt may lean Democratic, but he’s facing a challenge this fall from a former six-term state representative with broader name recognition and a deeper campaign war chest. Republican Jim Knoblach, who has stayed active in local Republican politics since he left the House in 2006, has opted to forgo the public-subsidy agreement signed by most legislative candidates. That means he wont be restricted by any campaign spending limits, and he’s already raised considerably more than Dorholt in the race. The district was a key battleground in 2012, when Dorholt won the seat from St. Cloud State University economics professor King Banaian. Pundits expect Knoblach to make the race competitive again this cycle.","rowNumber":15},{"district":"5B","pvi":-4.249005146,"lean2012":-6.96,"leanpres":-0.89,"type":"radar","candidater":"Justin Eichorn","candidated":"Tom Anzelc","candidatei":"","incumbentparty":"D","description":"DFL Rep. Tom Anzelc, a fiery economic populist, has been in politics or state government in some form or another since Rudy Perpich was governor in the 1980s. He’s proven a tough candidate to beat over the years, but his district picked up new conservative territory after redistricting, and Republicans are targeting the area after Republican Mitt Romney performed better than President Barack Obama in 2012.","rowNumber":16},{"district":"10A","pvi":-14.12174276,"lean2012":-14.1,"leanpres":12.74,"type":"radar","candidater":"John Ward ","candidated":"Joshua Heintzeman","candidatei":"","incumbentparty":"D","description":"Incumbent Rep. John Ward enjoys fairly broad popularity in his conservative leaning district, despite the fact that he’s a Democrat. He was re-elected in his Crow Wing County district by about 7 percent of the vote in 2012, despite the fact that Romney trounced Obama in the district. But Republicans are trying to use the unpopular construction of the state Senate office building as a wedge in the district, claiming Ward was the deciding vote in favor of the project on the House Rules Committee last year. That’s put it on our radar to watch this cycle.","rowNumber":17},{"district":"36A","pvi":-6.1949472,"lean2012":2.17,"leanpres":0.89,"type":"radar","candidater":"Mark W. Uglem","candidated":"Jefferson Fietek","candidatei":"","incumbentparty":"R","description":"Republican Rep. Mark Uglem won his Champlin-area House seat with a razor-thin margin in 2012, making him one of Democrats’ top pick up seats this election cycle. He’s being challenged by DFL-endorsed candidate Jefferson Fietek, a teacher in the Anoka-Hennepin school district who was an outspoken advocate for gay students during the bullying controversy in 2010.","rowNumber":18},{"district":"42A","pvi":-5.212494668,"lean2012":-6.74,"leanpres":-4.96,"type":"radar","candidater":"Randy Jessup","candidated":"Barb Yarusso","candidatei":"","incumbentparty":"D","description":"Freshman DFL Rep. Barb Yarusso, a teacher from Shoreview, comfortably won her first term in the House in 2012, but the district still retains some of the conservative turf it held before redistricting, making it a target for some GOP groups this election cycle. Her opponent, Republican Randy Jessup, also lives in Shoreview and owns four UPS stores in the Twin Cities.","rowNumber":19},{"district":"44B","pvi":-5.691491551,"lean2012":-11.79,"leanpres":-10.06,"type":"radar","candidater":"Jon Applebaum","candidated":"Ryan Rutzick","candidatei":"","incumbentparty":"","description":"House District 44B, covering the wealthy western ‘burbs like Minnetonka and Plymouth, is a place where a moderate Democrat can thrive. Even-keeled DFL Rep. John Benson represented the area for eight years in the state House, but his retirement has put control of the district in doubt for some. DFLer Jon Applebaum, an attorney from Minnetonka, survived a three-way primary in August to be the nominee this cycle. Republicans are hoping to see Minnetonka resident and small-business owner Ryan Rutzick in the Legislature next year.","rowNumber":20},{"district":"60B","pvi":4.5,"lean2012":1.2,"leanpres":2.3,"type":"unwatch","candidater":"Tester Test","candidated":"Tester McTest","candidatei":"","incumbentparty":"D","description":"This is a test!!!!","rowNumber":21}]}';});

/**
 * Main application file for: minnpost-hot-house-districts-2014
 *
 * This pulls in all the parts
 * and creates the main object for the application.
 */

// Create main application
define('minnpost-hot-house-districts-2014', [
  'jquery', 'underscore', 'backbone', 'ractive', 'ractive-events-tap', 'leaflet', 'chroma',
  'mpConfig', 'mpFormatters', 'mpMaps', 'mpNav',
  'helpers',
  'text!templates/application.mustache',
  'text!../data/districts.json'
], function(
  $, _, Backbone, Ractive, RactiveEventsTap, L, chroma,
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

      // Create router and routes
      this.router = new Backbone.Router();
      this.router.route('district/:district', _.bind(this.routeDistrict, this));

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
        return ((d.type === 'watch') ?  -9999 : ((d.type === 'radar') ? 0 : 9999)) + parseInt(d.district, 10);
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

      // Observe has a dom deferal
      this.mainView.observe('districts', function(n, o) {
        if (!_.isUndefined(n)) {
          thisApp.domReady();
        }
      }, { defer: true });
    },

    // Dom is loaded (I think)
    domReady: function() {
      var thisApp = this;

      if (this.isDomReady === true) {
        return;
      }

      // Scroll spy
      this.spy = this.$el.mpScrollSpy({
        offset: this.$('.districts-nav').height() + ($(window).height() / 12),
        throttle: 50,
        gotoEvent: false,
        gotoPreventDefault: false,
        gotoSpeed: 1000
      });
      // Stick the navigation
      this.$('.districts-nav').mpStick({
        container: thisApp.$('.districts-nav').parent(),
        throttle: 50
      });

      // Start routing
      Backbone.history.start();

      this.isDomReady = true;
    },

    // Handle going to specific district
    routeDistrict: function(district) {
      this.spy.data('mpScrollSpy').goto(district);
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
      return Math.min(Math.max(p * 100, 0), 97);
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
        }, this), 1000);
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

