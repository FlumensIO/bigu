import WGS84LatLng from 'WGS84LatLng';
import OSRef from 'OSRef';

/**
 * represents lat lng as OSGB1936 (Ordnance Survey projection)
 *
 * @param {number} lat
 * @param {number} lng
 * @constructor
 */
let OSGB36LatLng = function(lat, lng) {
  this.lat = lat;
  this.lng = lng;
};

/**
 *
 * @returns {WGS84LatLng}
 */
OSGB36LatLng.prototype.to_WGS84 = function () {
  //airy1830 = new RefEll(6377563.396, 6356256.909);
  var a        = 6377563.396; //airy1830.maj;
  //var b        = 6356256.909; //airy1830.min;
  var eSquared = 0.00667054007; // ((maj * maj) - (min * min)) / (maj * maj); // airy1830.ecc;
  var phi = this.lat * deg2rad; // (Math.PI / 180)(this.lat);
  var sinPhi = Math.sin(phi);
  var lambda = this.lng * deg2rad; // (Math.PI / 180)(this.lng);
  var v = a / (Math.sqrt(1 - eSquared * (sinPhi * sinPhi)));
  //H = 0; // height
  var x = v * Math.cos(phi) * Math.cos(lambda);
  var y = v * Math.cos(phi) * Math.sin(lambda);
  var z = ((1 - eSquared) * v) * sinPhi;

  var tx =        446.448;
  var ty =       -124.157;
  var tz =        542.060;
  var s  =         -0.0000204894;
  var rx = 0.000000728190110241429; // (Math.PI / 180)( 0.00004172222);
  var ry = 0.000001197489772948010; // (Math.PI / 180)( 0.00006861111);
  var rz = 0.000004082615892268120; // (Math.PI / 180)( 0.00023391666);

  var xB = tx + (x * (1 + s)) + (-rx * y)     + (ry * z);
  var yB = ty + (rz * x)      + (y * (1 + s)) + (-rx * z);
  var zB = tz + (-ry * x)     + (rx * y)      + (z * (1 + s));

  //wgs84 = new RefEll(6378137.000, 6356752.3141);
  a        = 6378137.000; // wgs84.maj;
  //var b        = 6356752.3141; // wgs84.min;
  eSquared = 0.00669438003;// ((maj * maj) - (min * min)) / (maj * maj); //wgs84.ecc;

  //lambdaB = (180 / Math.PI)(Math.atan(yB / xB));
  var p = Math.sqrt((xB * xB) + (yB * yB));
  var phiN = Math.atan(zB / (p * (1 - eSquared)));

  for (var i = 1; i < 10; ++i) {
    var sinPhiN = Math.sin(phiN); // this must be in the for loop as phiN is variable
    phiN = Math.atan((zB + (eSquared * (a / (Math.sqrt(1 - eSquared * (sinPhiN * sinPhiN)))) * sinPhiN)) / p);
  }

  //this.lat = rad2deg * phiN;
  //this.lng = rad2deg * (Math.atan(yB / xB)); // lambdaB;

  return new WGS84LatLng(rad2deg * phiN, rad2deg * (Math.atan(yB / xB)));
};


//helper
OSGB36LatLng._Marc = function (bf0, n, phi0, phi) {
  return bf0 * (((1 + n + ((5 / 4) * (n * n)) + ((5 / 4) * (n * n * n))) * (phi - phi0))
    - (((3 * n) + (3 * (n * n)) + ((21 / 8) * (n * n * n))) * (Math.sin(phi - phi0)) * (Math.cos(phi + phi0)))
    + ((((15 / 8) * (n * n)) + ((15 / 8) * (n * n * n))) * (Math.sin(2 * (phi - phi0))) * (Math.cos(2 * (phi + phi0))))
    - (((35 / 24) * (n * n * n)) * (Math.sin(3 * (phi - phi0))) * (Math.cos(3 * (phi + phi0)))));
};

//converts lat and lon (OSGB36) to OS northings and eastings
OSGB36LatLng.prototype.to_os_coords = function() {
  var phi = this.lat * deg2rad; // convert latitude to radians
  var lam = this.lng * deg2rad; // convert longitude to radians
  var a = 6377563.396; // OSGB semi-major axis
  var b = 6356256.91; // OSGB semi-minor axis
  var e0 = 400000; // easting of false origin
  var n0 = -100000; // northing of false origin
  var f0 = 0.9996012717; // OSGB scale factor on central meridian
  var e2 = 0.0066705397616; // OSGB eccentricity squared
  var lam0 = -0.034906585039886591; // OSGB false east
  var phi0 = 0.85521133347722145; // OSGB false north
  var af0 = a * f0;
  var bf0 = b * f0;

  // easting
  var slat2 = Math.sin(phi) * Math.sin(phi);
  var nu = af0 / (Math.sqrt(1 - (e2 * (slat2))));
  var rho = (nu * (1 - e2)) / (1 - (e2 * slat2));
  var eta2 = (nu / rho) - 1;
  var p = lam - lam0;
  var IV = nu * Math.cos(phi);
  var clat3 = Math.pow(Math.cos(phi), 3);
  var tlat2 = Math.tan(phi) * Math.tan(phi);
  var V = (nu / 6) * clat3 * ((nu / rho) - tlat2);
  var clat5 = Math.pow(Math.cos(phi), 5);
  var tlat4 = Math.pow(Math.tan(phi), 4);
  var VI = (nu / 120) * clat5 * ((5 - (18 * tlat2)) + tlat4 + (14 * eta2) - (58 * tlat2 * eta2));
  var east = e0 + (p * IV) + (Math.pow(p, 3) * V) + (Math.pow(p, 5) * VI);

  // northing
  var n = (af0 - bf0) / (af0 + bf0);
  var M = OSGB36LatLng._Marc(bf0, n, phi0, phi);
  var I = M + (n0);
  var II = (nu / 2) * Math.sin(phi) * Math.cos(phi);
  var III = ((nu / 24) * Math.sin(phi) * Math.pow(Math.cos(phi), 3)) * (5 - Math.pow(Math.tan(phi), 2) + (9 * eta2));
  var IIIA = ((nu / 720) * Math.sin(phi) * clat5) * (61 - (58 * tlat2) + tlat4);
  var north = I + ((p * p) * II) + (Math.pow(p, 4) * III) + (Math.pow(p, 6) * IIIA);

  return new OSRef(Math.round(east), Math.round(north));
};



//helper
OSGB36LatLng._Marc = function (bf0, n, phi0, phi) {
  return bf0 * (((1 + n + ((5 / 4) * (n * n)) + ((5 / 4) * (n * n * n))) * (phi - phi0))
    - (((3 * n) + (3 * (n * n)) + ((21 / 8) * (n * n * n))) * (Math.sin(phi - phi0)) * (Math.cos(phi + phi0)))
    + ((((15 / 8) * (n * n)) + ((15 / 8) * (n * n * n))) * (Math.sin(2 * (phi - phi0))) * (Math.cos(2 * (phi + phi0))))
    - (((35 / 24) * (n * n * n)) * (Math.sin(3 * (phi - phi0))) * (Math.cos(3 * (phi + phi0)))));
};

//converts lat and lon (OSGB36) to OS northings and eastings
OSGB36LatLng.prototype.to_os_coords = function() {
  var phi = this.lat * deg2rad; // convert latitude to radians
  var lam = this.lng * deg2rad; // convert longitude to radians
  var a = 6377563.396; // OSGB semi-major axis
  var b = 6356256.91; // OSGB semi-minor axis
  var e0 = 400000; // easting of false origin
  var n0 = -100000; // northing of false origin
  var f0 = 0.9996012717; // OSGB scale factor on central meridian
  var e2 = 0.0066705397616; // OSGB eccentricity squared
  var lam0 = -0.034906585039886591; // OSGB false east
  var phi0 = 0.85521133347722145; // OSGB false north
  var af0 = a * f0;
  var bf0 = b * f0;

  // easting
  var slat2 = Math.sin(phi) * Math.sin(phi);
  var nu = af0 / (Math.sqrt(1 - (e2 * (slat2))));
  var rho = (nu * (1 - e2)) / (1 - (e2 * slat2));
  var eta2 = (nu / rho) - 1;
  var p = lam - lam0;
  var IV = nu * Math.cos(phi);
  var clat3 = Math.pow(Math.cos(phi), 3);
  var tlat2 = Math.tan(phi) * Math.tan(phi);
  var V = (nu / 6) * clat3 * ((nu / rho) - tlat2);
  var clat5 = Math.pow(Math.cos(phi), 5);
  var tlat4 = Math.pow(Math.tan(phi), 4);
  var VI = (nu / 120) * clat5 * ((5 - (18 * tlat2)) + tlat4 + (14 * eta2) - (58 * tlat2 * eta2));
  var east = e0 + (p * IV) + (Math.pow(p, 3) * V) + (Math.pow(p, 5) * VI);

  // northing
  var n = (af0 - bf0) / (af0 + bf0);
  var M = OSGB36LatLng._Marc(bf0, n, phi0, phi);
  var I = M + (n0);
  var II = (nu / 2) * Math.sin(phi) * Math.cos(phi);
  var III = ((nu / 24) * Math.sin(phi) * Math.pow(Math.cos(phi), 3)) * (5 - Math.pow(Math.tan(phi), 2) + (9 * eta2));
  var IIIA = ((nu / 720) * Math.sin(phi) * clat5) * (61 - (58 * tlat2) + tlat4);
  var north = I + ((p * p) * II) + (Math.pow(p, 4) * III) + (Math.pow(p, 6) * IIIA);

  return new OSRef(Math.round(east), Math.round(north));
};

export default OSGB36LatLng;
