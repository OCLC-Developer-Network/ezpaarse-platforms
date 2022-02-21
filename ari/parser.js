#!/usr/bin/env node

'use strict';
const Parser = require('../.lib/parser.js');

/**
 * Recognizes the accesses to the platform Arret Sur Images
 * @param  {Object} parsedUrl an object representing the URL to analyze
 *                            main attributes: pathname, query, hostname
 * @param  {Object} ec        an object representing the EC whose URL is being analyzed
 * @return {Object} the result
 */
module.exports = new Parser(function analyseEC(parsedUrl, ec) {
  let result = {};
  let path   = parsedUrl.pathname;
  // uncomment this line if you need parameters
  // let param = parsedUrl.query || {};

  // use console.error for debuging
  // console.error(parsedUrl);

  if (/^\/articles\/([a-z-]+)$/i.test(path)) {
    // https://www.arretsurimages.net/articles/houellebecq-et-le-monde-la-possibilite-dune-idylle
    result.rtype    = 'ARTICLE';
    result.mime     = 'HTML';

  } else if (/^\/chroniques\/([a-z-]+)\/([a-z0-9-]+)$/i.test(path)) {
    // https://www.arretsurimages.net/chroniques/plateau-tele/la-bataille-de-lelysee-tf1-dans-les-coulisses-du-neant
    result.rtype    = 'ISSUE';
    result.mime     = 'HTML';
  }

  return result;
});
