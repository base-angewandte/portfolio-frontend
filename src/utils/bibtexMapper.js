/**
 * This module contains functions used to map types
 * from a Bibtex format file (.bib) to portfolio types.
*/

/**
 * Mapping function that returns the portfolio entry's type.
 * @param {string} bibtexType The type of the Bibtex record.
 * @returns An object that stands for entry's type in portfolio, or empty string if unmappable.
 */
function getPortfolioType(bibtexType) {
  switch (bibtexType) {
  case 'article':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/article',
      label: { de: 'Artikel', en: 'Article' },
    };
  case 'book':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/monograph',
      label: { de: 'Monographie', en: 'Monograph' },
    };
  case 'booklet':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/catalogue',
      label: { de: 'Katalog', en: 'catalogue' },
    };
  case 'conference':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/conference',
      label: { de: 'Konferenz', en: 'conference' },
    };
  case 'inproceedings':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/conference_proceedings',
      label: { de: 'Tagungsband', en: 'conference proceedings' },
    };
  case 'inbook':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/chapter',
      label: { de: 'Beitrag in Sammelband', en: 'chapter' },
    };
  case 'incollection':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/series_monographic_series',
      label: { de: 'Schriftenreihe/Buchreihe', en: 'series/monographic series' },
    };
  case 'manual':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/scientific_publication',
      label: { de: 'Wissenschaftliche Veröffentlichung', en: 'scientific publication' },
    };
  case 'mastersthesis':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/master_thesis',
      label: { de: 'Masterarbeit', en: 'master thesis' },
    };
  case 'phdthesis':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/doctoral_dissertation',
      label: { de: 'Dissertation', en: 'doctoral dissertation' },
    };
  case 'proceedings':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/conference_proceedings',
      label: { de: 'Tagungsband', en: 'conference proceedings' },
    };
  default:
    return null;
  }
}

function getKeywords(value) {
  const retVal = [];
  if (value.includes(',')) {
    const arr = value.split(',');
    arr.forEach((val) => {
      retVal.push({
        label: {
          de: val,
          en: val,
        },
      });
    });
  } else if (value.length) {
    retVal.push({
      label: {
        de: value,
        en: value,
      },
    });
  }
  return retVal;
}

function getAuthor(value) {
  if (value) {
    return [{
      label: value,
      roles: [
        {
          source: 'http://base.uni-ak.ac.at/portfolio/vocabulary/author',
          label: {
            de: 'Autor*in',
            en: 'Author',
          },
        },
      ],
    }];
  }
  return null;
}

/**
 * Returns an object that represents a portfolio entry
 * (e.g. it is ready to be posted to the entry creation api in portfolio)
 */
function createEntryFromBibtex(record) {
  const entry = {};
  entry.title = record.title;
  const keywords = getKeywords(record.keywords);
  if (keywords) entry.keywords = keywords;
  entry.type = getPortfolioType(record.type);
  if (entry.type) {
    // data object is needed if type exists
    const data = {};
    // map authors, if any
    const authors = getAuthor(record.authors);
    // conference type does not have authors
    if (authors && entry.type.source !== 'http://base.uni-ak.ac.at/portfolio/taxonomy/conference') {
      data.authors = authors;
    }
    // map year
    if (record.year && entry.type.source !== 'http://base.uni-ak.ac.at/portfolio/taxonomy/conference') {
      data.date = record.year;
    }
    // map isbn
    if (record.isbn && entry.type.source !== 'http://base.uni-ak.ac.at/portfolio/taxonomy/conference') {
      data.isbn = record.isbn;
    }
    // map doi
    if (record.doi && entry.type.source !== 'http://base.uni-ak.ac.at/portfolio/taxonomy/conference') {
      data.doi = record.doi;
    }
    // map pages
    if (record.pages && entry.type.source !== 'http://base.uni-ak.ac.at/portfolio/taxonomy/conference') {
      data.pages = record.pages;
    }
    // finally, set the data attribute
    entry.data = data;
  }
  return entry;
}

export { createEntryFromBibtex as default };
