
/**
 * represents lat lng
 *
 * @param {number} lat
 * @param {number} lng
 * @constructor
 */
let LatLng = function (lat, lng) {
  this.lat = lat;
  this.lng = lng;
};

LatLng.transform = function(lat, lon, a, e, h, a2, e2, xp, yp, zp, xr, yr, zr, s) {
  // convert to cartesian; lat, lon are radians
  var sf = s * 0.000001;
  var v = a / (Math.sqrt(1 - (e *(Math.sin(lat) * Math.sin(lat)))));
  var x = (v + h) * Math.cos(lat) * Math.cos(lon);
  var y = (v + h) * Math.cos(lat) * Math.sin(lon);
  var z = ((1 - e) * v + h) * Math.sin(lat);
  // transform cartesian
  var xrot = (xr / 3600) * deg2rad;
  var yrot = (yr / 3600) * deg2rad;
  var zrot = (zr / 3600) * deg2rad;
  var hx = x + (x * sf) - (y * zrot) + (z * yrot) + xp;
  var hy = (x * zrot) + y + (y * sf) - (z * xrot) + yp;
  var hz = (-1 * x * yrot) + (y * xrot) + z + (z * sf) + zp;
  // Convert back to lat, lon
  lon = Math.atan(hy / hx);
  var p = Math.sqrt((hx * hx) + (hy * hy));
  lat = Math.atan(hz / (p * (1 - e2)));
  v = a2 / (Math.sqrt(1 - e2 * (Math.sin(lat) * Math.sin(lat))));
  var errvalue = 1.0;
  var lat0 = 0;
  while (errvalue > 0.001) {
    lat0 = Math.atan((hz + e2 * v * Math.sin(lat)) / p);
    errvalue = Math.abs(lat0 - lat);
    lat = lat0;
  }
  //h = p / Math.cos(lat) - v;
  //var geo = { latitude: lat, longitude: lon, height: h };  // object to hold lat and lon
  return(new LatLng(lat, lon));
};

export default LatLng;
