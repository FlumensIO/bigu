import GridRefParser from './GridRefParser';
import OSCIRef from '../OSCIRef';

/**
 * @constructor
 */
let GridRefParserCI = function() {};

GridRefParserCI.prototype = new GridRefParser();
GridRefParserCI.prototype.constructor = GridRefParserCI;
GridRefParserCI.prototype.country = 'CI';
GridRefParserCI.prototype.NationalRef = OSCIRef;

/**
 *
 * @param {string} rawGridRef
 * @throws Error
 */
GridRefParserCI.prototype.parse = function(rawGridRef) {
  var trimmedLocality = rawGridRef.replace(/[\[\]\s\t\.\/-]+/g, '').toUpperCase();
  var tetradCode = '';
  var enl;

  if (/[ABCDEFGHIJKLMNPQRSTUVWXYZ]$/.test(trimmedLocality)) {
    // tetrad or quadrant

    if (GridRefParser.quadrantOffsets.hasOwnProperty(trimmedLocality.substr(trimmedLocality.length - 2))) {
      this.quadrantCode = trimmedLocality.substr(trimmedLocality.length - 2);
      trimmedLocality = trimmedLocality.substr(0, trimmedLocality.length - 2);
    } else {
      tetradCode = trimmedLocality.substr(trimmedLocality.length - 1);
      trimmedLocality = trimmedLocality.substr(0, trimmedLocality.length - 1);
    }
  }

  if (/^(W[AV](?:\d\d){1,5})$/.test(trimmedLocality)) {
    if ((enl = GridRefParserCI.gridref_string_to_e_n_l(trimmedLocality))) {
      this.length = enl.length;

      this.osRef = new OSCIRef(enl.e, enl.n);
      this.hectad = this.osRef.to_gridref(10000);

      if (this.length === 10000 && (tetradCode || this.quadrantCode)) {
        if (tetradCode) {
          this.preciseGridRef = trimmedLocality + tetradCode;
          this.tetrad = this.hectad + tetradCode;
          this.tetradLetter = tetradCode;
          this.length = 2000; // 2km square
          this.osRef.x += GridRefParser.tetradOffsets[tetradCode][0];
          this.osRef.y += GridRefParser.tetradOffsets[tetradCode][1];
        } else {
          // quadrant
          this.preciseGridRef = trimmedLocality + this.quadrantCode;
          this.tetradLetter = '';
          this.tetrad = '';
          this.quadrant = this.preciseGridRef;
          this.length = 5000; // 5km square
          this.osRef.x += GridRefParser.quadrantOffsets[this.quadrantCode][0];
          this.osRef.y += GridRefParser.quadrantOffsets[this.quadrantCode][1];
        }
      } else {
        this.preciseGridRef = trimmedLocality;

        if (this.length <= 1000) {
          // calculate tetrad for precise gridref
          this.set_tetrad();
        }
      }
    } else {
      this.error = true;
      this.errorMessage = 'Grid reference format not understood (odd length).';
    }
  } else {
    // no match
    this.error = true;
    this.errorMessage = "Channel Island grid reference format not understood. ('" + rawGridRef + "')";
  }
};

GridRefParserCI.prototype.parse_well_formed = GridRefParserCI.prototype.parse;

/**
 *
 *
 * @param {string} gridRef plain string without tetrad or quadrant suffix
 * @return false|{'eKm' : easting, 'nKm' : northing, 'lengthKm' : length}
 */
GridRefParserCI.gridref_string_to_e_n_l = function(gridRef) {
  var northOffset, x, y, length;

  // assume modern alphabetical sheet ref
  var chars = gridRef.substr(0,2);

  if (chars === 'WA') {
    northOffset = 5500000;
  } else if (chars === 'WV') {
    northOffset = 5400000;
  } else {
    Logger("Bad Channel Island grid letters: '" + chars + "'");
    return false;
  }

  var ref = gridRef.substr(2);
  switch (ref.length) {
    case 2:
      x = ref.charAt(0) * 10000;
      y = ref.charAt(1) * 10000;
      length = 10000; //10 km square
      break;

    case 4:
      x = ref.substr(0, 2) * 1000;
      y = ref.substr(2) * 1000;
      length = 1000; //1 km square
      break;

    case 6:
      x = ref.substr(0, 3) * 100;
      y = ref.substr(3) * 100;
      length = 100; //100m square
      break;

    case 8:
      x = ref.substr(0, 4) * 10;
      y = ref.substr(4) * 10;
      length = 10; //10m square
      break;

    case 10:
      x = parseInt(ref.substr(0, 5), 10);
      y = parseInt(ref.substr(5), 10);
      length = 1; //1m square
      break;

    default:
      Logger("Bad length for Channel Island grid ref '" + gridRef + "'");
      return false;
  }

  return {
    e : (x + 500000),
    n : (y + northOffset),
    length : length
  };
};

export default GridRefParserCI;
