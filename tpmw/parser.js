#!/usr/bin/env node

'use strict';
const Parser = require('../.lib/parser.js');

/**
 * Recognizes the accesses to the platform The Practising Midwife
 * @param  {Object} parsedUrl an object representing the URL to analyze
 *                            main attributes: pathname, query, hostname
 * @param  {Object} ec        an object representing the EC whose URL is being analyzed
 * @return {Object} the result
 */
module.exports = new Parser(function analyseEC(parsedUrl, ec) {
  let result = {};
  let path = parsedUrl.pathname;
  // uncomment this line if you need parameters
  let param = parsedUrl.query || {};

  // use console.error for debuging
  // console.error(parsedUrl);

  let match;

  if ((match = /^\/([a-z-]+)\/$/i.exec(path)) !== null) {
    // https://www.all4maternity.com/zero-separation/
    // https://www.all4maternity.com/newborn-weight-loss-and-supplementation-of-the-breastfed-infant-exploring-the-evidence/
    // https://www.all4maternity.com/newborn-weight-loss-and-supplementation-of-the-breastfed-infant-exploring-the-evidence/?print=pdf
    result.rtype = 'ARTICLE';
    result.mime = param.print === 'pdf' ? 'PDF' : 'HTML';
    result.unitid = match[1];
  } else if ((match = /^\/$/i.exec(path)) !== null) {
    // https://www.all4maternity.com/?s=babies
    result.rtype = 'SEARCH';
    result.mime = 'HTML';
  }

  return result;
});