
/**
 *
 * @param {number} easting metres
 * @param {number} northing metres
 * @constructor
 * @extends NationalGridCoords
 * @returns {OSRef}
 */
let OSRef = function(easting, northing) {
  this.x = easting;
  this.y = northing;
};

OSRef.prototype = new NationalGridCoords();
OSRef.prototype.constructor = OSRef;
OSRef.prototype.country = 'GB';

/**
 *
 * @param {number} precision metres
 * @returns {String}
 */
OSRef.prototype.to_gridref = function (precision) {
  var hundredkmE = this.x / 100000 | 0; // Math.floor(this.x / 100000);
  var hundredkmN = this.y / 100000 | 0; // Math.floor(this.y / 100000);
  var firstLetter = '';
  if (hundredkmN < 5) {
    if (hundredkmE < 5) {
      firstLetter = "S";
    } else {
      firstLetter = "T";
    }
  } else if (hundredkmN < 10) {
    if (hundredkmE < 5) {
      firstLetter = "N";
    } else {
      firstLetter = "O";
    }
  } else {
    if (hundredkmE < 5) {
      firstLetter = "H";
    } else {
      firstLetter = "J";
    }
  }

  var secondLetter = '';
  var index = 65 + ((4 - (hundredkmN % 5)) * 5) + (hundredkmE % 5);

  if (index >= 73) {
    index++;
  }

  secondLetter = String.fromCharCode(index);

  return NationalGridCoords._e_n_to_gr(
    firstLetter + secondLetter,
    (this.x - (100000 * hundredkmE)),
    (this.y - (100000 * hundredkmN)),
    precision ? precision : 1
  );
};

OSRef.prototype.is_gb_hectad = function() {
  return MappingUtils.gbHectads.indexOf(MappingUtils.gb_coords_to_hectad(this.x, this.y)) !== -1;
};

/**
 * convert easting,northing to a WGS84 lat lng
 *
 * @returns {WGS84LatLng}
 */
OSRef.prototype.to_latLng = function() {
  //airy1830 = RefEll::airy1830(); //new RefEll(6377563.396, 6356256.909);
  //var OSGB_F0  = 0.9996012717;
  //var N0       = -100000.0;
  var E0       = 400000.0;
  var phi0     = 0.85521133347722; //deg2rad(49.0);
  var lambda0  = -0.034906585039887; //deg2rad(-2.0);
  var a        = 6377563.396; // airy1830->maj;
  //var b        = 6356256.909; // airy1830->min;
  var eSquared = 0.00667054007; // ((maj * maj) - (min * min)) / (maj * maj); // airy1830->ecc;
  var phi      = 0.0;
  var lambda   = 0.0;
  var E        = this.x;
  var N        = this.y;
  var n        = 0.0016732203289875; //(a - b) / (a + b);
  var M;
  var phiPrime = ((N + 100000) / (a * 0.9996012717)) + phi0;

  // 15 / 8 === 1.875
  // 5 / 4 === 1.25
  // 21 / 8 === 2.625

  do {
    M = N + 100000 - (
      6353722.489 // (b * OSGB_F0)
      * ((1.0016767257674 // * (((1 + n + (1.25 * n * n) + (1.25 * n * n * n))
      * (phiPrime - phi0))
      - (0.00502807228247412 // - (((3 * n) + (3 * n * n) + (2.625 * n * n * n))
      * Math.sin(phiPrime - phi0)
      * Math.cos(phiPrime + phi0))
      + (((1.875 * n * n) + (1.875 * n * n * n))
      * Math.sin(2.0 * (phiPrime - phi0))
      * Math.cos(2.0 * (phiPrime + phi0)))
      - (((35.0 / 24.0) * n * n * n)
      * Math.sin(3.0 * (phiPrime - phi0))
      * Math.cos(3.0 * (phiPrime + phi0)))));

    phiPrime += M / 6375020.48098897; // (N - N0 - M) / (a * OSGB_F0);
  } while (M >= 0.001);

  var sinphiPrime2 = Math.sin(phiPrime) * Math.sin(phiPrime);
  var tanphiPrime2 = Math.tan(phiPrime) * Math.tan(phiPrime);
  var secphiPrime = 1.0 / Math.cos(phiPrime);

  var v = a * 0.9996012717 * Math.pow(1.0 - eSquared * sinphiPrime2, -0.5);

  var rho =
        a
        * 0.9996012717
        * (1.0 - eSquared)
        * Math.pow(1.0 - eSquared * sinphiPrime2, -1.5);
  var etaSquared = (v / rho) - 1.0;
  var VII = Math.tan(phiPrime) / (2 * rho * v);
  var VIII =
        (Math.tan(phiPrime) / (24.0 * rho * Math.pow(v, 3.0)))
        * (5.0
        + (3.0 * tanphiPrime2)
        + etaSquared
        - (9.0 * tanphiPrime2 * etaSquared));
  var IX =
        (Math.tan(phiPrime) / (720.0 * rho * Math.pow(v, 5.0)))
        * (61.0
        + (90.0 * tanphiPrime2)
        + (45.0 * tanphiPrime2 * tanphiPrime2));
  var X = secphiPrime / v;
  var XI =
        (secphiPrime / (6.0 * v * v * v))
        * ((v / rho) + (2 * tanphiPrime2));
  var XII =
        (secphiPrime / (120.0 * Math.pow(v, 5.0)))
        * (5.0
        + (28.0 * tanphiPrime2)
        + (24.0 * tanphiPrime2 * tanphiPrime2));
  var XIIA =
        (secphiPrime / (5040.0 * Math.pow(v, 7.0)))
        * (61.0
        + (662.0 * tanphiPrime2)
        + (1320.0 * tanphiPrime2 * tanphiPrime2)
        + (720.0
        * tanphiPrime2
        * tanphiPrime2
        * tanphiPrime2));
  phi =
    phiPrime
    - (VII * Math.pow(E - E0, 2.0))
    + (VIII * Math.pow(E - E0, 4.0))
    - (IX * Math.pow(E - E0, 6.0));
  lambda =
    lambda0
    + (X * (E - E0))
    - (XI * Math.pow(E - E0, 3.0))
    + (XII * Math.pow(E - E0, 5.0))
    - (XIIA * Math.pow(E - E0, 7.0));

  //var ll = new OSGB36LatLng(rad2deg * phi, rad2deg * lambda); // airy 1830
  //ll.OSGB36_to_WGS84(); // google earth uses WGS84

  //return ll;
  return (new OSGB36LatLng(rad2deg * phi, rad2deg * lambda)).to_WGS84();
};

export default OSRef;
