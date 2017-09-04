import GridRefParser from 'GridRefParser/factory';
import GridRefParserCI from 'GridRefParser/CI';
import GridRefParserGB from 'GridRefParser/GB';
import GridRefParserIR from 'GridRefParser/IE';
import CILatLng from 'CILatLng';
import IELatLng from 'IELatLng';
import LatLng from 'LatLng';
import MappingUtils from 'MappingUtils';
import NationalGridCoords from 'NationalGridCoords';
import OSCIRef from 'OSCIRef';
import OSGB36LatLng from 'OSGB36LatLng';
import OSIRef from 'OSIRef';
import OSRef from 'OSRef';
import WGS84LatLng from 'WGS84LatLng';
import './polyfill';


var bigu = {
  scriptVersions: {},
  GridRefParser,
  GridRefParserCI,
  GridRefParserGB,
  GridRefParserIR,
  LatLng,
  CILatLng,
  IELatLng,
  MappingUtils,
  NationalGridCoords,
  OSCIRef,
  OSGB36LatLng,
  OSIRef,
  OSRef,
  WGS84LatLng,
};

bigu.scriptVersions.gridref = '001';

bigu.scriptVersions.grParser = '002';

/**
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {NationalGridCoords}
 */
bigu.latlng_to_grid_coords = function(lat, lng) {
  // test if GB
  if (lng >= -8.74 && lat > 49.88) {
    // lng extreme must accomodate St Kilda

    var os = (new bigu.WGS84LatLng(lat, lng)).to_OSGB1936_latlng().to_os_coords();
    if (os.x >= 0 && bigu.MappingUtils.is_gb_hectad(bigu.MappingUtils.gb_coords_to_hectad(os.x, os.y))) {
      return os;
    }
  }

  // test if Irish
  if (lng < -5.3 && lat > 51.34 && lng > -11 && lat < 55.73) {
    var osI = (new bigu.WGS84LatLng(lat, lng)).to_IE_latlng().to_os_coords();

    if (osI.x < 0 || osI.y < 0) {
      return null;
    } else {
      return osI;
    }
  } else {
    var osCi = (new bigu.WGS84LatLng(lat, lng)).to_CI_latlng().to_os_coords();

    if (osCi.x >= 500000 && osCi.x < 600000 && osCi.y >= 5400000 && osCi.y < 5600000) {
      return osCi;
    }
  }

  return null; //not a valid location
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = bigu;
}

export default bigu;