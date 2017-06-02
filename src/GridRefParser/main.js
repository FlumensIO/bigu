import './CI';
import './GB';
import './IE';
/**
 * @constructor
 */
BIGU.GridRefParser = function() {};

/**
 * x,y offsets (in metres) for tetrad letter codes
 * @type {Object.<string,Array.<number>>}
 */
BIGU.GridRefParser.tetradOffsets = {
  E: [0,8000], J: [2000,8000], P: [4000,8000], U: [6000,8000], Z: [8000,8000],
  D: [0,6000], I: [2000,6000], N: [4000,6000], T: [6000,6000], Y: [8000,6000],
  C: [0,4000], H: [2000,4000], M: [4000,4000], S: [6000,4000], X: [8000,4000],
  B: [0,2000], G: [2000,2000], L: [4000,2000], R: [6000,2000], W: [8000,2000],
  A: [0,0], F: [2000,0], K: [4000,0], Q: [6000,0], V: [8000,0]
};

/**
 * x,y offsets (in metres) for quadrant codes
 * @var array
 */
BIGU.GridRefParser.quadrantOffsets = {
  NW: [0,5000],
  NE: [5000,5000],
  SW: [0,0],
  SE: [5000,0]
};

/**
 * numerical mapping of letters to numbers
 * 'I' is omitted
 * @var array
 */
BIGU.GridRefParser.letterMapping = {
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, J: 8, K: 9,
  L: 10, M: 11, N: 12, O: 13, P: 14, Q: 15, R: 16, S: 17, T: 18,
  U: 19, V: 20, W: 21, X: 22, Y: 23, Z: 24
};

/**
 * tetrad letters ordered by easting then northing (steps of 2000m)
 * i.e. (x*4) + y
 *
 * where x and y are integer of (10km remainder / 2)
 *
 * @var string
 */
BIGU.GridRefParser.tetradLetters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';

/**
 *
 * @var string
 */
BIGU.GridRefParser.prototype.preciseGridRef = '';

/**
 * Easting in m
 * @deprecated
 * @var real
 */
//BIGU.GridRefParser.prototype.easting;

/**
 * Northing in m
 * @deprecated
 * @var real
 */
//BIGU.GridRefParser.prototype.northing;

/**
 * length in m (0 marks an invalid value)
 *
 * @var number
 */
BIGU.GridRefParser.prototype.length = 0;

/**
 * @var string
 */
BIGU.GridRefParser.prototype.hectad = '';

/**
 * 10km ref with tetrad suffix or ''
 * e.g. SD59A
 * @var string
 */
BIGU.GridRefParser.prototype.tetrad = '';

/**
 *
 * @var string
 */
BIGU.GridRefParser.prototype.tetradLetter = '';

/**
 * quadrant gridref(e.g. NZ34NW)
 * only set if gridref is defined at 5km or <=1km precision
 * undefined by default so need to use getter
 *
 * read using GridRefParser::get_quadrant
 *
 * @var string
 */
BIGU.GridRefParser.prototype.quadrant = '';

/**
 * quadrant code suffix(e.g. NW, NE, SW, SE)
 *
 * @var string
 */
BIGU.GridRefParser.prototype.quadrantCode = '';

/**
 * returns a GridRefParser (GB, IE or CI-specific parser) or false
 * crudely tries to determine the country by trying each country in turn
 *
 * @param {string} rawGridRef
 * @return BIGU.GridRefParser|FALSE
 */
BIGU.GridRefParser.factory = function(rawGridRef) {
  var parser;
  var cleanRef = rawGridRef.replace(/\s+/g, '').toUpperCase();

  if (!cleanRef) {
    return false;
  }

  // if canonical ref form then be more efficient
  if (/^[A-Z]{1,2}\d{2}(?:[A-Z]|[NS][EW]|(?:\d{2}){0,4})?$/.test(cleanRef)) {
    // have simple well-formed grid ref

    if (/^.\d/.test(cleanRef)) {
      parser = new BIGU.GridRefParserIE();
    } else {
      if (cleanRef.charAt(0) === 'W') {
        parser = new BIGU.GridRefParserCI();
      } else {
        parser = new BIGU.GridRefParserGB();
      }
    }

    parser.parse_well_formed(cleanRef);

    return (parser.length && !parser.error) ? parser : false;
  } else {
    parser = new BIGU.GridRefParserGB();
    parser.parse(cleanRef);

    if (parser.length && !parser.error) {
      return parser;
    }

    if (cleanRef.charAt(0) === 'W') {
      parser = new BIGU.GridRefParserCI();
      parser.parse(cleanRef);

      if (parser.length && !parser.error) {
        return parser;
      }
    } else {
      parser = new BIGU.GridRefParserIE();
      parser.parse(cleanRef);

      if (parser.length && !parser.error) {
        return parser;
      }
    }
  }
  return false;
};

BIGU.GridRefParser.get_normalized_precision = function(rawPrecision, minPrecision) {
  return rawPrecision > 2000 ? 10000 :
    (rawPrecision > 1000 ? 2000 :
        (rawPrecision > 100 ? 1000 :
            (rawPrecision > 10 ? 100 :
                (rawPrecision > 1 ? 10 :
                    minPrecision ? minPrecision : 1
                )
            )
        )
    );
};

/**
 * update tetrad using Easting/Northing values (metres)
 * hectad should have been set prior to call
 */
BIGU.GridRefParser.prototype.set_tetrad = function() {
  this.tetradLetter = BIGU.GridRefParser.tetradLetters.substr(
    ((Math.floor((this.osRef.x % 10000) / 1000) >> 1) * 5) + (Math.floor((this.osRef.y % 10000) / 1000) >> 1)
    , 1);

  if (!this.tetradLetter) {
    throw new Error("Failed to get tetrad letter when processing '" + this.preciseGridRef + "', easting=" + this.osRef.x + " northing=" + this.osRef.y);
  }
  this.tetrad = this.hectad + this.tetradLetter;
};
