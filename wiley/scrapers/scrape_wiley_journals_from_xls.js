#!/usr/bin/env node
// Write a kbart file with the Wiley Blackwell journals PKB
// Write on stderr the progression
// Usage : ./scrape_wiley_journals_from_xsl.js

/*jslint maxlen: 180*/

'use strict';


var request = require('request');
var XLS     = require('xlsjs');

var PkbRows = require('../../.lib/pkbrows.js');
var pkb     = new PkbRows('wiley');

// setKbartName() is required to fix the kbart output file name
//   pkb.consortiumName = '';       // default empty
//   pkb.packageName = 'AllTitles'; // default AllTitles
pkb.packageName = 'Journals'; // default AllTitles
pkb.setKbartName();

// download the XLS from Internet
var journalUrl = 'http://wileyonlinelibrary.com/journals-list';
// The URL of journals list is find on the http://olabout.wiley.com/WileyCDA/Section/id-404513.html page
// The journalURL link deliver a excel file with many steelsheet
// only 'All Current Journals for 2014' contains the data, starting line 7
var sheetName = 'All Current Journals for 2014';
var sheetFirstLine = 7;
var sheetColJournalCode = 'A';
var sheetColPrintISSN = 'B';
var sheetColOnlineISSN = 'C';
var sheetColTitle = 'E';
var sheetColTitleURL = 'G';

// parse XLS and create a PKB from it
function parseXLS(xls) {
  var xlsJsonObject = {};

  var rowArray = XLS.utils.sheet_to_row_object_array(xls.Sheets[sheetName]);
  if (rowArray.length > 0) {
    xlsJsonObject[sheetName] = rowArray;
  }

  var rowJournal = xlsJsonObject[sheetName];

  for (var i = sheetFirstLine; i < rowJournal.length; i++) {

    // extract data
    var journalInfo = {};
    // initialize a kbart record
    journalInfo = pkb.initRow(journalInfo);

    if (xls.Sheets[sheetName][sheetColJournalCode+i] !== undefined) {
      journalInfo.title_id = xls.Sheets[sheetName][sheetColJournalCode+i].v.toString();
      if (xls.Sheets[sheetName][sheetColTitle+i]) { journalInfo.publication_title  = xls.Sheets[sheetName][sheetColTitle+i].v; }
      if (xls.Sheets[sheetName][sheetColPrintISSN+i]) { journalInfo.print_identifier  = xls.Sheets[sheetName][sheetColPrintISSN+i].v; }
      if (xls.Sheets[sheetName][sheetColOnlineISSN+i]) { journalInfo.online_identifier  = xls.Sheets[sheetName][sheetColOnlineISSN+i].v; }
      if (xls.Sheets[sheetName][sheetColTitleURL+i]) { journalInfo.title_url     = xls.Sheets[sheetName][sheetColTitleURL+i].v; }
      pkb.addRow(journalInfo);
    }
  }

  console.error('Writing KBart file.');
  // Loop on rows is finished, we can write the result.
  pkb.writeKbart(function () {
    console.error('KBart written in : ' + pkb.kbartFileName);
    console.error('Wiley scraping finished.');
  });
}

console.error('Wiley scraper requesting file ' + journalUrl + ' on server');

request({ url: journalUrl, encoding: null /* so body is a binary buffer */ }, function (err, res, body) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  if (res.statusCode != 200) {
    console.error(journalUrl + ' cannot be downloaded (status = ' + res.statusCode + ')');
    process.exit(1);
  }

  console.error('%s downloaded', journalUrl);
  parseXLS(XLS.read(body));
});


