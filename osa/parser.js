#!/usr/bin/env node

'use strict';
const Parser = require('../.lib/parser.js');

/**
 * Recognizes the accesses to the platform OpticsInfoBase
 * @param  {Object} parsedUrl an object representing the URL to analyze
 *                            main attributes: pathname, query, hostname
 * @param  {Object} ec        an object representing the EC whose URL is being analyzed
 * @return {Object} the result
 */

function parseURIParam(uri, result) {
  let uriParts = uri.split('-');
  return {
    vol: uriParts[1],
    issue: uriParts[2],
    first_page: uriParts[3]
  };
}
module.exports = new Parser(function analyseEC(parsedUrl, ec) {
  let result = {};
  let path = parsedUrl.pathname;
  // uncomment this line if you need parameters
  let param = parsedUrl.query || {};

  // use console.error for debuging
  // console.error(parsedUrl);
  let match;

  if ((match = /^\/([a-z]+)\/issue.cfm?$/i.exec(path)) !== null) {
    // https://www-osapublishing-org.gaelnomade.ujf-grenoble.fr/jot/issue.cfm?volume=83&issue=2
    result.rtype = 'TOC';
    result.mime = 'HTML';
    result.title_id = match[1];
    result.vol = param.volume;
    result.issue = param.issue;

  } else if ((match = /^\/([a-z]+)\/abstract.cfm$/i.exec(path)) !== null) {
    // https://www-osapublishing-org.gaelnomade.ujf-grenoble.fr/jot/abstract.cfm?uri=jot-83-2-81
    // https://www-osapublishing-org.gaelnomade.ujf-grenoble.fr/jot/abstract.cfm?uri=jot-83-2-81#articleReferences
    if (parsedUrl.hash === null) {
      result.rtype = 'ABS';
    } else {
      result.rtype = 'RECORD_VIEW';
    }
    result.unitid = param.uri;
    result.mime = 'HTML';
    result.title_id = match[1];
    const { vol, issue, first_page } = parseURIParam(param.uri, result);
    result.vol = vol;
    result.issue = issue;
    result.first_page = first_page;

  } else if ((match = /^\/([a-z]+)\/viewmedia.cfm$/i.exec(path)) !== null) {
    // https://www-osapublishing-org.gaelnomade.ujf-grenoble.fr/jot/viewmedia.cfm?uri=jot-83-2-81&seq=0
    result.rtype = 'ARTICLE';
    result.mime = 'PDF';
    result.title_id = match[1];
    result.unitid = param.uri;
    const { vol, issue, first_page } = parseURIParam(param.uri, result);
    result.vol = vol;
    result.issue = issue;
    result.first_page = first_page;

  } else if ((match = /^\/([a-z]+)\/fulltext.cfm$/i.exec(path)) !== null) {
    // https://www.osapublishing.org/boe/fulltext.cfm?uri=boe-8-5-2599&id=363221
    result.rtype = 'ARTICLE';
    result.mime = 'HTML';
    result.title_id = match[1];
    result.unitid = param.uri;
    const { vol, issue, first_page } = parseURIParam(param.uri, result);
    result.vol = vol;
    result.issue = issue;
    result.first_page = first_page;

  } else if ((match = /^\/DirectPDFAccess\/([a-z0-9-]+)_([0-9]+)\/([a-z0-9-]+).pdf$/i.exec(path)) !== null) {
    // /DirectPDFAccess/AED94277-FE5A-EAC1-DFC3539001173AD4_399103/ol-43-20-5130.pdf
    result.title_id = match[2];
    result.unitid = match[3];
    result.rtype = 'ARTICLE';
    result.mime = 'PDF';

  } else if (/^\/view_article.cfm$/i.test(path)) {
    //https://opg.optica.org/view_article.cfm?pdfKey=70101b1f-0ef5-4fd6-b09df5b0ead3a7d0_298534
    result.unitid = param.pdfKey;
    result.rtype = 'ARTICLE';
    result.mime = 'PDF';

  } else if (/^\/search.cfm$/i.test(path)) {
    //https://opg.optica.org/search.cfm?q=Glasses&meta=1&cj=1&cc=1&cr=1
    result.rtype = 'SEARCH';
    result.mime = 'HTML';
  }
  return result;
});
