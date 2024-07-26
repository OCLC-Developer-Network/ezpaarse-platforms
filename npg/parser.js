#!/usr/bin/env node

'use strict';

const Parser = require('../.lib/parser.js');
const doiPrefix = '10.1038';

module.exports = new Parser(function analyseEC(parsedUrl) {
  let result = {};
  let path = parsedUrl.pathname;
  var params = parsedUrl.query || {};
  let match;

  if ((match = /^\/([a-zA-Z0-9]+)\/journal\/v([a-z0-9]+)\/n([0-9]+|current)\/(pdf|full|abs|extref)\/([a-zA-Z0-9.\-_]+)\.[a-z]{2,4}$/.exec(path)) !== null) {
    // http://www.nature.com/nrm/journal/vaop/ncurrent/full/nrm3940.html
    result.title_id = match[1];
    result.vol = match[2];
    result.issue = match[3];
    result.unitid = result.doi = `${doiPrefix}/${match[5]}`;

    let dashIndex = match[5].search('-');
    if (dashIndex >= 0) {
      result.doi = `${doiPrefix}/${match[5].substr(0, dashIndex)}`;
    }

    if (match[1] !== 'nature' && match[5].startsWith(match[1])) {
      let journal    = match[1];
      let identifier = match[5].substr(journal.length);

      if (identifier.endsWith('a')) {
        identifier = identifier.substr(0, identifier.length - 1);
      }

      if (identifier.match(/^20[0-9]{2}/)) {
        result.publication_date = identifier.substr(0, 4);
        result.doi = `${doiPrefix}/${journal}.${result.publication_date}.${identifier.substr(4)}`;
      }
    }

    switch (match[4].toUpperCase()) {
    case 'ABS':
      result.rtype = 'ABS';
      result.mime  = 'HTML';
      break;
    case 'FULL':
      // http://www.nature.com/nature/journal/v493/n7431/full/493166a.html
      // http://www.nature.com/nrm/journal/vaop/ncurrent/full/nrm3940.html
      result.rtype = 'ARTICLE';
      result.mime  = 'HTML';
      break;
    case 'PDF':
    case 'EXTREF':
      // http://www.nature.com/nature/journal/v493/n7431/pdf/493166a.pdf
      // http://www.nature.com/cdd/journal/vaop/ncurrent/pdf/cdd2014195a.pdf
      // http://www.nature.com/nature/journal/v445/n7125/extref/nature05382-s1.pdf
      result.rtype = 'ARTICLE';
      result.mime  = 'PDF';
      break;
    }
  } else if ((match = /^\/([a-zA-Z0-9]+)\/(?:knowledgeenvironment\/)?([0-9]+)\/[0-9]+\/(?:[a-zA-Z0-9]+\/)?(pdf|full)\/([a-zA-Z0-9\-_]+)\.[a-z]{2,4}$/.exec(path)) !== null) {
    // http://www.nature.com/bonekey/knowledgeenvironment/2012/120613/bonekey2012109/full/bonekey2012109.html
    // http://www.nature.com/ncomms/2013/130829/ncomms3380/pdf/ncomms3380.pdf
    // http://www.nature.com/news/2007/070919/pdf/449268a.pdf
    // http://www.nature.com/news/2005/050131/full/news050131-3.html

    result.title_id         = match[1] === 'news' ? 'nature' : match[1];
    result.publication_date = match[2];
    result.unitid           = result.doi = `${doiPrefix}/${match[4]}`;

    if (result.title_id !== 'nature' && match[4].startsWith(result.title_id)) {
      let identifier = match[4].substr(result.title_id.length);

      if (identifier.endsWith('a')) {
        identifier = identifier.substr(0, identifier.length - 1);
      }

      if (identifier.match(/^20[0-9]{2}/)) {
        result.publication_date = identifier.substr(0, 4);
        result.doi = `${doiPrefix}/${result.title_id}.${result.publication_date}.${identifier.substr(4)}`;
      }
    }

    switch (match[3].toUpperCase()) {
    case 'FULL':
      result.rtype = 'ARTICLE';
      result.mime  = 'HTML';
      break;
    case 'PDF':
      result.rtype = 'ARTICLE';
      result.mime  = 'PDF';
      break;
    }
  } else if ((match = /^\/([a-zA-Z0-9]+)\/journal\/v([0-9]*)\/n([a-zA-Z0-9]*)\/index\.html$/.exec(path)) !== null) {
    // http://www.nature.com/nature/journal/v493/n7431/index.html
    result.title_id = match[1];
    result.vol      = match[2];
    result.issue    = match[3];
    result.unitid   = `${match[1]}/v${match[2]}/n${match[3]}`;
    result.rtype    = 'TOC';
    result.mime     = 'MISC';

  } else if ((match = /^\/magazine-assets\/[a-z0-9-]+\/([a-z0-9-]+)\.pdf$/i.exec(path)) !== null) {
    // /magazine-assets/d41586-018-06997-8/d41586-018-06997-8.pdf
    result.rtype  = 'ARTICLE';
    result.mime   = 'PDF';
    result.unitid = match[1];
    result.doi    = `${doiPrefix}/${match[1]}`;

  } else if ((match = /^\/articles\/(?:doi:([0-9]+\.[0-9]+)\/)?([a-z0-9.\-_]+?)(\.[a-z]{2,})?$/i.exec(path)) !== null) {
    // /articles/doi:10.1038/nature16976.epdf?parent_url=http%3A%2F%2Fwww.readcube.com%2Farticles%2F10.1038%252Fnature16976&pdf_url=http%3A%2F%2Fwww.nature.com%2Fnature%2Fjournal%2Fv531%2Fn7592%2Fpdf%2Fnature16976.pdf
    // /articles/nature16976.epdf?parent_url=http%3A%2F%2Fwww.readcube.com%2Farticles%2F10.1038%252Fnature16976&pdf_url=http%3A%2F%2Fwww.nature.com%2Fnature%2Fjournal%2Fv531%2Fn7592%2Fpdf%2Fnature16976.pdf
    // /articles/nmat5046.pdf
    // /articles/nplants201718
    // /articles/nmat5046
    // /articles/s41598-018-21122-5
    // /articles/s41598-018-21122-5.pdf

    let doiSuffix = match[2];
    const m = /^([a-z]+)(20[0-9]{2})([0-9]+)$/.exec(doiSuffix);

    if (m) {
      doiSuffix = `${m[1]}.${m[2]}.${m[3]}`;
      result.title_id = m[1];
    }

    result.doi    = `${match[1] || doiPrefix}/${doiSuffix}`;
    result.unitid = doiSuffix;

    const extension = match[3] || '.full';

    switch (extension) {
    case '.pdf':
      result.rtype = 'ARTICLE';
      result.mime  = 'PDF';
      break;
    case '.epdf':
      if (params.pdf_url) {
        result = this.execute({ url: params.pdf_url });
      }
      result.mime = 'READCUBE';
      break;
    case '.full':
      result.rtype = 'ARTICLE';
      result.mime  = 'HTML';
      break;
    default:
      return {};
    }

  } else if ((match = /^\/([a-zA-Z0-9]+)\/(?:(?:archive\/)?(?:index|current_issue)\.html)?$/i.exec(path)) !== null) {
    // http://www.nature.com/nature/index.html
    // https://www.nature.com/nature/
    // http://www.nature.com/clpt/archive/index.html?showyears=2013-2011-#y2011
    // http://www.nature.com/nature/current_issue.html
    result.unitid   = match[1];
    result.title_id = match[1];
    result.rtype    = 'TOC';
    result.mime     = 'MISC';

  } else if ((match = /^\/news\/([^/]+)/.exec(path)) !== null) {
    // http://www.nature.com/news/work-resumes-on-lethal-flu-strains-1.12266
    result.unitid   = match[1];
    result.title_id = 'nature';
    result.rtype    = 'ARTICLE';
    result.mime     = 'HTML';

  } else if ((match = /^\/polopoly_fs\/.+\/([a-zA-Z0-9]+)\.pdf/.exec(path)) !== null) {
    // http://www.nature.com/polopoly_fs/1.12266
    result.unitid   = match[1];
    result.doi      = `${doiPrefix}/${match[1]}`;
    result.title_id = 'nature';
    result.rtype    = 'ARTICLE';
    result.mime     = 'PDF';

  } else if ((match = /^\/articles\/([0-9a-z-]+)\/figures\/[0-9]+$/i.exec(path)) !== null) {
    // https://www.nature.com/articles/s41467-023-41754-0/figures/1
    result.rtype  = 'FIGURE';
    result.mime   = 'HTML';
    result.unitid = match[1];
  } else if (/^\/[a-z-]+\/volumes$/i.test(path)) {
    // https://www.nature.com/nature/volumes
    result.rtype = 'TOC';
    result.mime  = 'HTML';

  } else if ((match = /^\/nature\/volumes\/(([0-9]+)\/issues\/([0-9]+))$/i.exec(path)) !== null) {
    // https://www.nature.com/nature/volumes/617/issues/7962
    // https://www.nature.com/nature/volumes/596/issues/7873
    result.rtype  = 'TOC';
    result.mime   = 'HTML';
    result.unitid = match[1];
    result.vol    = match[2];
    result.issue  = match[3];

  } else if (path === '/siteindex/index.html') {
    // http://www.nature.com/siteindex/index.html
    result.rtype = 'TOC';
    result.mime  = 'MISC';

  } else if ((match = /^\/(search|facet-search)/.exec(path)) !== null) {
    // http://nano.nature.com.insb.bib.cnrs.fr/search?q=nanoparticules&workflow=article&term=concept%3A%22nanoparticles%22&new-search=true
    result.mime  = 'HTML';
    result.rtype = 'SEARCH';

  } else if ((match = /^\/nano\/([a-z0-9-]+)/i.exec(path)) !== null) {
    // http://nano.nature.com.insb.bib.cnrs.fr/nano/GR-M21079
    result.mime   = 'HTML';
    result.rtype  = 'RECORD_VIEW';
    result.unitid = match[1];

  } else if ((match = /^\/related-nanoobject-summary/i.exec(path)) !== null) {
    // http://nano.nature.com/related-nanoobject-summary?doi=10.2147/IJN.S59290
    if (params.doi) {
      result.mime   = 'MISC';
      result.rtype  = 'RECORD_VIEW';
      result.doi    = params.doi;
      result.unitid = result.doi.split('/')[1];
    }
  }

  return result;
});
