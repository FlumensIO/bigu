import GridRefParser from './GridRefParser';
import GridRefParserCI from './CI';
import GridRefParserGB from './GB';
import GridRefParserIE from './IE';

/**
 * returns a GridRefParser (GB, IE or CI-specific parser) or false
 * crudely tries to determine the country by trying each country in turn
 *
 * @param {string} rawGridRef
 * @return GridRefParser|FALSE
 */
GridRefParser.factory = function (rawGridRef) {
  var parser;
  var cleanRef = rawGridRef.replace(/\s+/g, '').toUpperCase();

  if (!cleanRef) {
    return false;
  }

  // if canonical ref form then be more efficient
  if (/^[A-Z]{1,2}\d{2}(?:[A-Z]|[NS][EW]|(?:\d{2}){0,4})?$/.test(cleanRef)) {
    // have simple well-formed grid ref

    if (/^.\d/.test(cleanRef)) {
      parser = new GridRefParserIE();
    } else {
      if (cleanRef.charAt(0) === 'W') {
        parser = new GridRefParserCI();
      } else {
        parser = new GridRefParserGB();
      }
    }

    parser.parse_well_formed(cleanRef);

    return (parser.length && !parser.error) ? parser : false;
  } else {
    parser = new GridRefParserGB();
    parser.parse(cleanRef);

    if (parser.length && !parser.error) {
      return parser;
    }

    if (cleanRef.charAt(0) === 'W') {
      parser = new GridRefParserCI();
      parser.parse(cleanRef);

      if (parser.length && !parser.error) {
        return parser;
      }
    } else {
      parser = new GridRefParserIE();
      parser.parse(cleanRef);

      if (parser.length && !parser.error) {
        return parser;
      }
    }
  }
  return false;
};

export default GridRefParser;
