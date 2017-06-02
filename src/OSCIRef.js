
/**
 *
 * @param {number} easting metres
 * @param {number} northing metres
 * @constructor
 * @returns {OSCIRef}
 */
OSCIRef = function(easting, northing) {
  this.x = easting;
  this.y = northing;
};

OSCIRef.prototype = new NationalGridCoords();
OSCIRef.prototype.constructor = OSCIRef;
OSCIRef.prototype.country = 'CI';

/**
 * convert easting,northing to a WGS84 lat lng
 *
 * @returns {WGS84LatLng}
 */
OSCIRef.prototype.to_latLng = function() {
  //nX = north;
  //ex = east;

  var a = 6378388.000;       // INT24 ED50 semi-major
  var b = 6356911.946;       // INT24 ED50 semi-minor
  var e0 = 500000;           // easting of false origin
  var n0 = 0;                // northing of false origin
  var f0 = 0.9996;           // INT24 ED50 scale factor on central meridian
  var e2 = 0.0067226700223333;  // INT24 ED50 eccentricity squared
  var lam0 = -0.0523598775598;  // INT24 ED50 false east
  var phi0 = 0 * deg2rad;    // INT24 ED50 false north

  var af0 = a * f0;
  var bf0 = b * f0;
  var n = (af0 - bf0) / (af0 + bf0);
  var Et = this.x - e0;
  var phid = OSCIRef.initialLat(this.y, n0, af0, phi0, n, bf0);
  var nu = af0 / (Math.sqrt(1 - (e2 * (Math.sin(phid) * Math.sin(phid)))));
  var rho = (nu * (1 - e2)) / (1 - (e2 * (Math.sin(phid)) * (Math.sin(phid))));
  var eta2 = (nu / rho) - 1;
  var tlat2 = Math.tan(phid) * Math.tan(phid);
  var tlat4 = Math.pow(Math.tan(phid), 4);
  var tlat6 = Math.pow(Math.tan(phid), 6);
  var clatm1 = Math.pow(Math.cos(phid), -1);
  var VII = Math.tan(phid) / (2 * rho * nu);
  var VIII = (Math.tan(phid) / (24 * rho * (nu * nu * nu))) * (5 + (3 * tlat2) + eta2 - (9 * eta2 * tlat2));
  var IX = ((Math.tan(phid)) / (720 * rho * Math.pow(nu, 5))) * (61 + (90 * tlat2) + (45 * tlat4));
  var phip = (phid - ((Et * Et) * VII) + (Math.pow(Et, 4) * VIII) - (Math.pow(Et, 6) * IX));
  var X = Math.pow(Math.cos(phid), -1) / nu;
  var XI = (clatm1 / (6 * (nu * nu * nu))) * ((nu / rho) + (2 * (tlat2)));
  var XII = (clatm1 / (120 * Math.pow(nu, 5))) * (5 + (28 * tlat2) + (24 * tlat4));
  var XIIA = clatm1 / (5040 * Math.pow(nu, 7)) * (61 + (662 * tlat2) + (1320 * tlat4) + (720 * tlat6));
  var lambdap = (lam0 + (Et * X) - ((Et * Et * Et) * XI) + (Math.pow(Et, 5) * XII) - (Math.pow(Et, 7) * XIIA));

  var latLngRadians = OSCIRef.convert_to_wgs(phip, lambdap);

  return new WGS84LatLng(latLngRadians.lat * rad2deg, latLngRadians.lng * rad2deg);
};

OSCIRef.convert_to_wgs = function(phip, lambdap) {
  var WGS84_AXIS = 6378137;
  var WGS84_ECCENTRIC = 0.00669438037928458;
  //OSGB_AXIS = 6377563.396;
  //OSGB_ECCENTRIC = 0.0066705397616;
  //IRISH_AXIS = 6377340.189;
  //IRISH_ECCENTRIC = 0.00667054015;
  var INT24_AXIS = 6378388.000;
  var INT24_ECCENTRIC = 0.0067226700223333;
  var height = 10;  // dummy height
  return LatLng.transform(phip, lambdap, INT24_AXIS, INT24_ECCENTRIC, height, WGS84_AXIS, WGS84_ECCENTRIC, -83.901, -98.127, -118.635, 0, 0, 0, 0);
};

OSCIRef.initialLat = function(north, n0, af0, phi0, n, bf0) {
  var phi1 = ((north - n0) / af0) + phi0;
  var M = OSCIRef.marc(bf0, n, phi0, phi1);
  var phi2 = ((north - n0 - M) / af0) + phi1;
  var ind = 0;
  while ((Math.abs(north - n0 - M) > 0.00001) && (ind < 20))  // max 20 iterations in case of error
  {
    ind += 1;
    phi2 = ((north - n0 - M) / af0) + phi1;
    M = OSCIRef.marc(bf0, n, phi0, phi2);
    phi1 = phi2;
  }
  return phi2;
};

OSCIRef.marc = function(bf0, n, phi0, phi) {
  return bf0 * (((1 + n + ((5 / 4) * (n * n)) + ((5 / 4) * (n * n * n))) * (phi - phi0)) -
    (((3 * n) + (3 * (n * n)) + ((21 / 8) * (n * n * n))) * (Math.sin(phi - phi0)) * (Math.cos(phi + phi0))) +
    ((((15 / 8) * (n * n)) + ((15 / 8) * (n * n * n))) * (Math.sin(2 * (phi - phi0))) * (Math.cos(2 * (phi + phi0)))) -
    (((35 / 24) * (n * n * n)) * (Math.sin(3 * (phi - phi0))) * (Math.cos(3 * (phi + phi0)))));
};

OSCIRef.prototype.to_gridref = function(precision) {
  if (this.y >= 5500000) {
    return NationalGridCoords._e_n_to_gr('WA', this.x - 500000, this.y - 5500000, precision ? precision : 1);
  } else if (this.y < 5500000) {
    return NationalGridCoords._e_n_to_gr('WV', this.x - 500000, this.y - 5400000, precision ? precision : 1);
  }
  return null;
};


export default OSCIRef;
