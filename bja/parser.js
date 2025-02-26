#!/usr/bin/env node

'use strict';
const Parser = require('../.lib/parser.js');

/**
 * Recognizes the accesses to the platform British Journal of Anaesthesia
 * @param  {Object} parsedUrl an object representing the URL to analyze
 *                            main attributes: pathname, query, hostname
 * @param  {Object} ec        an object representing the EC whose URL is being analyzed
 * @return {Object} the result
 */
module.exports = new Parser(function analyseEC(parsedUrl, ec) {
  let result = {};
  let path   = parsedUrl.pathname;
  // uncomment this line if you need parameters
  let param = parsedUrl.query || {};

  // use console.error for debuging
  // console.error(parsedUrl);

  let match;

  if (/^\/action\/showPdf$/i.test(path)) {
    // https://www.bjanaesthesia.org/action/showPdf?pii=S0007-0912(21)00871-0
    result.rtype    = 'ARTICLE';
    result.mime     = 'PDF';
    result.unitid = param.pii;
    result.pii = param.pii;

  } else if ((match = /^\/article\/([a-z0-9-()]+)\/fulltext$/i.exec(path)) !== null) {
    // https://www.bjanaesthesia.org/article/S0007-0912(21)00871-0/fulltext
    result.rtype    = 'ARTICLE';
    result.mime     = 'HTML';
    result.unitid   = match[1];
    result.pii   = match[1];
  } else if (/^\/action\/doSearch$/i.test(path)) {
    // https://www.bjanaesthesia.org/action/doSearch?text1=toxic&field1=AllField
    result.rtype    = 'SEARCH';
    result.mime     = 'HTML';
  }

  return result;
});
