goog.require('ol.Map');
goog.require('ol.RendererHint');
goog.require('ol.View2D');
goog.require('ol.control.defaults');
goog.require('ol.expr');
goog.require('ol.layer.Vector');
goog.require('ol.parser.GeoJSON');
goog.require('ol.proj');
goog.require('ol.source.Vector');
goog.require('ol.style.Line');
goog.require('ol.style.Rule');
goog.require('ol.style.Shape');
goog.require('ol.style.Style');
goog.require('ol.style.Text');


var style = new ol.style.Style({rules: [
  new ol.style.Rule({
    filter: 'where == "outer"',
    symbolizers: [
      new ol.style.Line({
        strokeColor: ol.expr.parse('color'),
        strokeWidth: 4,
        opacity: 1
      })
    ]
  }),
  new ol.style.Rule({
    filter: 'where == "inner"',
    symbolizers: [
      new ol.style.Line({
        strokeColor: '#013',
        strokeWidth: 4,
        opacity: 1
      }),
      new ol.style.Line({
        strokeColor: ol.expr.parse('color'),
        strokeWidth: 2,
        opacity: 1
      })
    ]
  }),
  new ol.style.Rule({
    filter: 'geometryType("point")',
    symbolizers: [
      new ol.style.Shape({
        size: 40,
        fillColor: '#013'
      }),
      new ol.style.Text({
        color: '#bada55',
        text: ol.expr.parse('label'),
        fontFamily: 'Calibri,sans-serif',
        fontSize: 14
      })
    ]
  })
]});

var vector = new ol.layer.Vector({
  style: style,
  source: new ol.source.Vector({
    projection: ol.proj.get('EPSG:3857')
  })
});

vector.parseFeatures({
  'type': 'FeatureCollection',
  'features': [{
    'type': 'Feature',
    'properties': {
      'color': '#BADA55',
      'where': 'inner'
    },
    'geometry': {
      'type': 'LineString',
      'coordinates': [[-10000000, -10000000], [10000000, 10000000]]
    }
  }, {
    'type': 'Feature',
    'properties': {
      'color': '#BADA55',
      'where': 'inner'
    },
    'geometry': {
      'type': 'LineString',
      'coordinates': [[-10000000, 10000000], [10000000, -10000000]]
    }
  }, {
    'type': 'Feature',
    'properties': {
      'color': '#013',
      'where': 'outer'
    },
    'geometry': {
      'type': 'LineString',
      'coordinates': [[-10000000, -10000000], [-10000000, 10000000]]
    }
  }, {
    'type': 'Feature',
    'properties': {
      'color': '#013',
      'where': 'outer'
    },
    'geometry': {
      'type': 'LineString',
      'coordinates': [[-10000000, 10000000], [10000000, 10000000]]
    }
  }, {
    'type': 'Feature',
    'properties': {
      'color': '#013',
      'where': 'outer'
    },
    'geometry': {
      'type': 'LineString',
      'coordinates': [[10000000, 10000000], [10000000, -10000000]]
    }
  }, {
    'type': 'Feature',
    'properties': {
      'color': '#013',
      'where': 'outer'
    },
    'geometry': {
      'type': 'LineString',
      'coordinates': [[10000000, -10000000], [-10000000, -10000000]]
    }
  }, {
    'type': 'Feature',
    'properties': {
      'label': 'South'
    },
    'geometry': {
      'type': 'Point',
      'coordinates': [0, -6000000]
    }
  }, {
    'type': 'Feature',
    'properties': {
      'label': 'West'
    },
    'geometry': {
      'type': 'Point',
      'coordinates': [-6000000, 0]
    }
  }, {
    'type': 'Feature',
    'properties': {
      'label': 'North'
    },
    'geometry': {
      'type': 'Point',
      'coordinates': [0, 6000000]
    }
  }, {
    'type': 'Feature',
    'properties': {
      'label': 'East'
    },
    'geometry': {
      'type': 'Point',
      'coordinates': [6000000, 0]
    }
  }]
}, new ol.parser.GeoJSON(), ol.proj.get('EPSG:3857'));


var map = new ol.Map({
  layers: [vector],
  controls: ol.control.defaults({
    attribution: false
  }),
  renderer: ol.RendererHint.CANVAS,
  target: 'map',
  view: new ol.View2D({
    center: [0, 0],
    zoom: 1
  })
});
