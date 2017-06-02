

/**
 * abstract representation of a gridref co-ordinate pair
 * (*not a gridref string*)
 *
 * @constructor
 * @returns {NationalGridCoords}
 */
let NationalGridCoords = function () {};

/**
 *
 * @param {string} letters
 * @param {number} e metres
 * @param {number} n metres
 * @param {number} precision metres
 * @returns {String}
 */
NationalGridCoords._e_n_to_gr = function(letters, e, n, precision) {
  var eString = ('00000' + Math.floor(e));
  var nString = ('00000' + Math.floor(n));

  if (precision === 2000) {
    return letters +
      eString.charAt(eString.length-5) + nString.charAt(nString.length-5) +
      MappingUtils.calculate_tetrad(e, n);
  } else if (precision === 100000) {
    return letters;
  } else {
    if (precision === 5000) {
      // ignore quadrant and treat as hectad
      precision = 10000;
    }

    var logPrecision = Math.round(Math.log10(precision));
    return letters +
      (logPrecision ?
          (eString.slice(-5,  -logPrecision) + nString.slice(-5,  -logPrecision))
          :
          (eString.slice(-5) + nString.slice(-5))
      );
  }
};

NationalGridCoords.prototype.toString = function() {
  return this.x + ',' + this.y;
};

export default NationalGridCoords;
