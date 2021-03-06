goog.require('ol.Map');
goog.require('ol.RendererHint');
goog.require('ol.View2D');
goog.require('ol.expr');
goog.require('ol.layer.TileLayer');
goog.require('ol.layer.Vector');
goog.require('ol.parser.KML');
goog.require('ol.proj');
goog.require('ol.source.Stamen');
goog.require('ol.source.Vector');
goog.require('ol.style.Polygon');
goog.require('ol.style.Rule');
goog.require('ol.style.Style');


/**
 * Register a function to be used in a symbolizer.  Here we want the opacity
 * of polygons to be based on the offset from local noon.  For example, a
 * timezone where it is currently noon would have an opacity of 0.75.  And a
 * timezone where it is currently midnight would have an opacity of 0.  This
 * doesn't account for daylight savings, so don't use it to plan your vacation.
 */
ol.expr.register('getOpacity', function() {
  var feature = this;
  var offset = 0;
  var name = feature.get('name'); // e.g. GMT -08:30
  var match = name.match(/([-+]\d{2}):(\d{2})$/);
  if (match) {
    var hours = parseInt(match[1], 10);
    var minutes = parseInt(match[2], 10);
    offset = 60 * hours + minutes;
  }
  var date = new Date();
  var local = new Date(date.getTime() +
      (date.getTimezoneOffset() + offset) * 60000);
  // offset from local noon (in hours)
  var delta = Math.abs(12 - local.getHours() + (local.getMinutes() / 60));
  if (delta > 12) {
    delta = 24 - delta;
  }
  return 0.75 * (1 - delta / 12);
});

var style = new ol.style.Style({rules: [
  new ol.style.Rule({
    symbolizers: [
      new ol.style.Polygon({
        fillColor: '#ffff33',
        strokeColor: '#ffffff',
        opacity: ol.expr.parse('getOpacity()')
      })
    ]
  })
]});

var vector = new ol.layer.Vector({
  source: new ol.source.Vector({
    projection: ol.proj.get('EPSG:4326')
  }),
  style: style
});

var raster = new ol.layer.TileLayer({
  source: new ol.source.Stamen({
    layer: 'toner'
  })
});

var map = new ol.Map({
  layers: [raster, vector],
  renderer: ol.RendererHint.CANVAS,
  target: 'map',
  view: new ol.View2D({
    center: [0, 0],
    zoom: 2
  })
});

var info = $('#info');
info.tooltip({
  animation: false,
  trigger: 'manual'
});
map.on(['click', 'mousemove'], function(evt) {
  var pixel = evt.getPixel();
  info.css({
    left: pixel[0] + 'px',
    top: (pixel[1] - 15) + 'px'
  });
  map.getFeatures({
    pixel: pixel,
    layers: [vector],
    success: function(layerFeatures) {
      var feature = layerFeatures[0][0];
      if (feature) {
        info.tooltip('hide')
            .attr('data-original-title', feature.get('name'))
            .tooltip('fixTitle')
            .tooltip('show');
      } else {
        info.tooltip('hide');
      }
    }
  });
});

var kml = new ol.parser.KML({dimension: 2});

var url = 'data/kml/timezones.kml';
var xhr = new XMLHttpRequest();
xhr.open('GET', url, true);


/**
 * onload handler for the XHR request.
 */
xhr.onload = function() {
  if (xhr.status == 200) {
    var projection = map.getView().getProjection();
    vector.parseFeatures(xhr.responseText, kml, projection);
  }
};
xhr.send();
