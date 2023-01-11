#!/usr/bin/env node

'use strict';
const Parser = require('../.lib/parser.js');

/**
 * Recognizes the accesses to the platform Warc
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

  let match;

  if ((match = /^\/content\/article\/[a-z0-9-]+\/([a-z0-9-]+)\/([0-9]+)$/i.exec(path)) !== null) {
    // https://www.warc.com/content/article/bestprac/what-we-know-about-comparative-advertising/111994
    // https://www.warc.com/content/article/cannes/paramount-a-mountain-of-entertainment/138341
    result.rtype    = 'ARTICLE';
    result.mime     = 'HTML';
    result.unitid   = match[1];
  } else if (/^\/search$/i.test(path)) {
    // https://www.warc.com/search?q=entertainment
    result.rtype    = 'SEARCH';
    result.mime     = 'HTML';
  }

  return result;
});