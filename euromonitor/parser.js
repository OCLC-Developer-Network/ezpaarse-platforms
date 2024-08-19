#!/usr/bin/env node

'use strict';
const Parser = require('../.lib/parser.js');

/**
 * Recognizes the accesses to the platform Euromonitor International
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

  if (/^\/portal\/policy\/accepttermsandconditions$/i.test(path)) {
    // http://www.portal.euromonitor.com:80/portal/policy/accepttermsandconditions?ControllerName=Default&ActionName=Index
    result.rtype    = 'CONNECTION';
    result.mime     = 'MISC';
  } else if (/^\/([A-z]+)\/main.js$/i.test(path)) {
    // http://www.portal.euromonitor.com:80/searchui/main.js?version=20180704_1
    result.rtype    = 'SEARCH';
    result.mime     = 'HTML';
  } else if (/^\/resultslist\/index$/i.test(path)) {
    // https://www.portal.euromonitor.com/resultslist/index
    result.rtype    = 'SEARCH';
    result.mime     = 'HTML';
  } else if (/^\/portal\/dashboard\/analysisrelateddashboards$/i.test(path)) {
    // http://www.portal.euromonitor.com:80/portal/dashboard/analysisrelateddashboards?analysisId=437029&analysisTypeId=1&_=1556038899215
    result.rtype    = 'REPORT';
    result.mime     = 'HTML';
    result.title_id = param.analysisId;
    result.unitid   = param._;
  } else if (/^\/portal\/analysis\/downloadpdf$/i.test(path)) {
    // http://www.portal.euromonitor.com:80/portal/analysis/downloadpdf?analysisId=462055&analysisTypeId=1&itemTypeId=48&elementId=0&elementTypeId=0&checksum=014264A2BDEE0CCDE0F27E9FBC42BAFD&searchString=TesT
    result.rtype    = 'REPORT';
    result.mime     = 'PDF';
    result.title_id = param.analysisId;
    result.unitid   = param.analysisId;
  } else if (/^\/portal\/statisticsevolution\/exporttoolsasync$/i.test(path)) {
    // http://www.portal.euromonitor.com:80/portal/statisticsevolution/exporttoolsasync?measureTypeId=119&_=1556039200418
    result.rtype    = 'DATASET';
    result.mime     = 'HTML';
    result.unitid   = param._;
  } else if (/^\/StatisticsEvolution\/index$/i.test(path)) {
    // https://www.portal.euromonitor.com/StatisticsEvolution/index
    result.rtype    = 'DATASET';
    result.mime     = 'HTML';
  } else if (/^\/analysis\/tab$/i.test(path)) {
    // https://www.portal.euromonitor.com/analysis/tab
    result.rtype    = 'ANALYSIS';
    result.mime     = 'HTML';
  } else if (/^\/CountryReportsApi\/download-report$/i.test(path) && param.documentId !== undefined) {
    // https://api.passport.euromonitor.com/CountryReportsApi/download-report?documentId=21003
    // https://api.passport.euromonitor.com/CountryReportsApi/download-report?documentId=2100395
    result.rtype    = 'ANALYSIS';
    result.mime     = 'PDF';
    result.unitid   = param.documentId;
  } else if (/^\/dashboard\/dashboarddetails$/i.test(path) && param.id !== undefined) {
    // https://www.portal.euromonitor.com/dashboard/dashboarddetails?id=766edb3d-2fe1-4af9-8f65-e4d88fd2e762
    // https://www.portal.euromonitor.com/dashboard/dashboarddetails?id=e41c23bc-20d4-4442-99d0-87df52e25c35
    result.rtype    = 'MAP';
    result.mime     = 'HTML';
    result.unitid   = param.id;
  } else if ((match = /^\/documents\/([a-zA-Z0-9%-/]+).ppt$/i.exec(path)) !== null) {
    // https://download.portal.euromonitor.com/documents/67/ppt/f-1970309-39143267.ppt?sv=2019-02-02&sr=b&sig=zW0XRGYbYieXfjjyD9qWokohhdL0AKLdXWDlvH3l594%3D&se=2024-08-06T18%3A38%3A56Z&sp=r&rscd=attachment%3B%20filename%20%3D%20Analysis.ppt
    result.rtype    = 'ANALYSIS';
    result.mime     = 'MISC';
    result.unitid   = match[1];
  }
  return result;
});
