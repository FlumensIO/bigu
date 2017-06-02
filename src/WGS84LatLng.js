
/**
 * represents lat lng as WGS84 (google map form)
 *
 * @param {number} lat
 * @param {number} lng
 * @constructor
 */
BIGU.WGS84LatLng = function(lat, lng) {
  this.lat = lat;
  this.lng = lng;
};

BIGU.WGS84LatLng.prototype.to_OSGB1936_latlng = function () {
  //var deg2rad = Math.PI / 180;
  //var rad2deg = 180.0 / Math.PI;

  //first off convert to radians
  var radWGlat = this.lat * deg2rad;
  var radWGlon = this.lng * deg2rad;
  //these are the values for WGS84(GRS80) to OSGB36(Airy)
  var a = 6378137; // WGS84_AXIS
  var e = 0.00669438037928458; // WGS84_ECCENTRIC
  //var h = height; // height above datum (from GPGGA sentence)
  var h = 0;
  var a2 = 6377563.396; // OSGB_AXIS
  var e2 = 0.0066705397616; // OSGB_ECCENTRIC
  var xp = -446.448;
  var yp = 125.157;
  var zp = -542.06;
  var xr = -0.1502;
  var yr = -0.247;
  var zr = -0.8421;
  var s = 20.4894;

  // convert to cartesian; lat, lon are in radians
  var sf = s * 0.000001;
  var v = a / (Math.sqrt(1 - (e * Math.sin(radWGlat) * Math.sin(radWGlat))));
  var x = (v + h) * Math.cos(radWGlat) * Math.cos(radWGlon);
  var y = (v + h) * Math.cos(radWGlat) * Math.sin(radWGlon);
  var z = ((1 - e) * v + h) * Math.sin(radWGlat);

  // transform cartesian
  var xrot = (xr / 3600) * deg2rad;
  var yrot = (yr / 3600) * deg2rad;
  var zrot = (zr / 3600) * deg2rad;
  var hx = x + (x * sf) - (y * zrot) + (z * yrot) + xp;
  var hy = (x * zrot) + y + (y * sf) - (z * xrot) + yp;
  var hz = (-1 * x * yrot) + (y * xrot) + z + (z * sf) + zp;

  // Convert back to lat, lon
  var newLon = Math.atan(hy / hx);
  var p = Math.sqrt((hx * hx) + (hy * hy));
  var newLat = Math.atan(hz / (p * (1 - e2)));
  v = a2 / (Math.sqrt(1 - e2 * (Math.sin(newLat) * Math.sin(newLat))));
  var errvalue = 1.0;
  var lat0 = 0;
  while (errvalue > 0.001) {
    lat0 = Math.atan((hz + e2 * v * Math.sin(newLat)) / p);
    errvalue = Math.abs(lat0 - newLat);
    newLat = lat0;
  }

  //convert back to degrees
  newLat = newLat * rad2deg;
  newLon = newLon * rad2deg;

  return new BIGU.OSGB36LatLng(newLat, newLon);
};

BIGU.WGS84LatLng.prototype.to_IE_latlng = function () {
  var phip = this.lat * deg2rad;
  var lambdap = this.lng * deg2rad;

  var IRISH_AXIS = 6377340.189;
  var IRISH_ECCENTRIC = 0.00667054015;

  var WGS84_AXIS = 6378137;
  var WGS84_ECCENTRIC = 0.00669438037928458;


  /*
   * IE
   a = 6377340.189;      // OSI semi-major
   b = 6356034.447;      // OSI semi-minor
   e0 = 200000;          // OSI easting of false origin
   n0 = 250000;          // OSI northing of false origin
   f0 = 1.000035;        // OSI scale factor on central meridian
   e2 = 0.00667054015;   // OSI eccentricity squared
   lam0 = -0.13962634015954636615389526147909;   // OSI false east
   phi0 = 0.93375114981696632365417456114141;    // OSI false north
   */

  var height = 0;
  var latlng =  BIGU.LatLng.transform(phip, lambdap, WGS84_AXIS, WGS84_ECCENTRIC, height, IRISH_AXIS, IRISH_ECCENTRIC,
    -482.53, 130.596, -564.557, 1.042, 0.214, 0.631, 8.15);

  return new BIGU.IELatLng(latlng.lat * rad2deg, latlng.lng * rad2deg);
};

BIGU.WGS84LatLng.prototype.to_CI_latlng = function () {
  var phip = this.lat * deg2rad;
  var lambdap = this.lng * deg2rad;

  var CI_AXIS = 6378388.000;
  var CI_ECCENTRIC = 0.0067226700223333;

  var WGS84_AXIS = 6378137;
  var WGS84_ECCENTRIC = 0.00669438037928458;


  /*
   * CI
   a = 6378388.000;       // INT24 ED50 semi-major
   b = 6356911.946;       // INT24 ED50 semi-minor
   e0 = 500000;           // CI easting of false origin
   n0 = 0;                // CI northing of false origin
   f0 = 0.9996;           // INT24 ED50 scale factor on central meridian
   e2 = 0.0067226700223333;  // INT24 ED50 eccentricity squared
   lam0 = -0.0523598775598;  // CI false east
   phi0 = 0 * deg2rad;       // CI false north
   */

  var height = 0;
  var latlng =  BIGU.LatLng.transform(phip, lambdap, WGS84_AXIS, WGS84_ECCENTRIC, height, CI_AXIS, CI_ECCENTRIC,
    83.901, 98.127, 118.635, 0, 0, 0, 0);

  return new BIGU.CILatLng(latlng.lat * rad2deg, latlng.lng * rad2deg);
};
