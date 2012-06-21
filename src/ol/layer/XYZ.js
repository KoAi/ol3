goog.provide('ol.layer.XYZ');

goog.require('ol.layer.TileLayer');
goog.require('ol.Projection');
goog.require('ol.Tile');
goog.require('ol.TileSet');

/**
 * Class for XYZ layers.
 *
 * @export
 * @constructor
 * @extends {ol.layer.TileLayer}
 * @param {string} url URL template. E.g.
 *     http://a.tile.openstreetmap.org/{z}/{x}/{y}.png.
 */
ol.layer.XYZ = function(url) {

    /**
     * @private
     * @type {string}
     */
    this.url_ = url;

    goog.base(this);

    this.setMaxResolution(156543.03390625);
};

goog.inherits(ol.layer.XYZ, ol.layer.TileLayer);

/**
 * Get data from the layer. This is the layer's main API function.
 * @param {ol.Bounds} bounds
 * @param {number} resolution
 */
ol.layer.XYZ.prototype.getData = function(bounds, resolution) {
    var me = this,
        zoomAndRes = me.getZoomAndRes(resolution),
        zoom = zoomAndRes[0];
    resolution = zoomAndRes[1];

    // define some values used for the actual tiling
    var boundsMinX = bounds.getMinX(),
        boundsMaxX = bounds.getMaxX(),
        boundsMinY = bounds.getMinY(),
        boundsMaxY = bounds.getMaxY(),

        tileWidth = me.tileWidth_,
        tileHeight = me.tileHeight_,

        tileOrigin = me.getTileOrigin(),
        tileOriginX = tileOrigin[0],
        tileOriginY = tileOrigin[1],

        tileWidthGeo = tileWidth * resolution,
        tileHeightGeo = tileHeight * resolution,

        offsetX = Math.floor(
                      (boundsMinX - tileOriginX) / tileWidthGeo),
        offsetY = Math.floor(
                      (tileOriginY - boundsMaxY) / tileHeightGeo),

        gridLeft = tileOriginX + tileWidthGeo * offsetX,
        gridTop = tileOriginY - tileHeightGeo * offsetY;

    // now tile
    var tiles = [],
        tile,
        url,
        tileBottom, tileRight, tileBounds;
    for (var y=0, tileTop=gridTop; tileTop > boundsMinY;
             ++y, tileTop-=tileHeightGeo) {
        tiles[y] = [];
        tileBottom = tileTop - tileHeightGeo;
        for (var x=0, tileLeft=gridLeft; tileLeft < boundsMaxX;
                 ++x, tileLeft+=tileWidthGeo) {
            tileRight = tileLeft + tileWidthGeo;
            tileBounds = new ol.Bounds(tileLeft, tileBottom,
                                       tileRight, tileTop, this.projection_);
            url = me.url_.replace('{x}', offsetX + x + '')
                         .replace('{y}', offsetY + y + '')
                         .replace('{z}', zoom + '');
            tile = new ol.Tile(url, tileBounds);
            tiles[y][x] = tile;
        }
    }

    return new ol.TileSet(tiles, tileWidth, tileHeight, resolution);
};

/**
 * Get the zoom level (z) and layer resolution for the given resolution.
 * @param {number} resolution
 * @return {Array.<number>}
 */
ol.layer.XYZ.prototype.getZoomAndRes = function(resolution) {
    var delta = Number.POSITIVE_INFINITY,
        currentDelta,
        resolutions = this.getResolutions(),
        zoom;
    for (var i=resolutions.length-1; i>=0; --i) {
        currentDelta = Math.abs(resolutions[i] - resolution);
        if (currentDelta > delta) {
            break;
        }
        delta = currentDelta;
    }
    zoom = i + 1;
    return [zoom, resolutions[zoom]];
};