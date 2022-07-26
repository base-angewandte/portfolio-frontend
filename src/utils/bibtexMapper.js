/**
 * This module contains functions used to map types
 * from a Bibtex format file (.bib) to portfolio types.
*/

import { matchUsername } from './commonUtils';

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
  case 'misc':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/manuscript',
      label: { de: 'Manuskript', en: 'manuscript' },
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
  case 'techreport':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/review',
      label: { de: 'Rezension', en: 'review' },
    };
  case 'unpublished':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/working_paper',
      label: { de: 'Arbeitspapier', en: 'working paper' },
    };
  default:
    return null;
  }
}

/**
 * Maps the keywords of bibtex record to portfolio "keywords"
 * @param {*} value The comma-, or semicolon- separated value from the bibtex record
 * @returns The keywords array
 */
function getKeywords(value) {
  const retVal = [];
  if (value.includes(',')) {
    const arr = value.split(',');
    // remove duplicates
    const unique = [...new Set(arr)];
    unique.forEach((val) => {
      retVal.push({
        label: {
          de: val,
          en: val,
        },
      });
    });
  } else if (value.includes(';')) {
    const arr = value.split(';');
    // remove duplicates
    const unique = [...new Set(arr)];
    unique.forEach((val) => {
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

/**
 * Maps the author of bibtex record to portfolio "author"
 * @param {string} data - string of authors
 * @param {object} user - user object with at least first_name, last_name, source attributes
 * @returns {null|*[]} - authors array
 */
function getAuthor(data, user) {
  if (data) {
    const entries = [];
    const values = data.split(' and ');

    values.forEach((value, index) => {
      entries.push({
        label: value.trim(),
        roles: [
          {
            source: 'http://base.uni-ak.ac.at/portfolio/vocabulary/author',
            label: {
              de: 'Autor*in',
              en: 'Author',
            },
          },
        ],
      });

      if (matchUsername(value.trim(), user)) {
        entries[index].label = `${user.first_name} ${user.last_name}`;
        entries[index].source = user.uuid;
      }
    });
    return entries;
  }
  return null;
}

function getDescription(value) {
  return [{
    type: {
      source: 'http://base.uni-ak.ac.at/portfolio/vocabulary/abstract',
      label: {
        de: 'Abstract',
        en: 'Abstract',
      },
    },
    data: [
      {
        language: {
          source: 'http://base.uni-ak.ac.at/portfolio/languages/en',
        },
        text: value,
      },
    ],
  }];
}

/**
 * Mapping function that returns the portfolio's entry "Published in" field.
 * @param {*} journal Maps to 'journal' field in the bibtex record
 * @returns The array structure containing the "Published in" field
 */
function getPublishedIn(journal) {
  return journal ? [
    {
      title: journal,
    },
  ] : '';
}

/**
 * Maps volume and number from bibtex into a single portfolio field
 * @param {*} volume The 'volume' field in the bibtex record
 * @param {*} number The 'number' field in the bibtex record
 * @returns the value to be written to "Volume/issue" field
 */
function getVolumeIssue(volume, number) {
  if (volume && number) return `${volume } / ${ number}`;
  if (volume) return volume;
  if (number) return number;
  return '';
}

/**
 * Returns an object that represents a portfolio entry
 * (e.g. it is ready to be posted to the entry creation api in portfolio)
 */
function createEntryFromBibtex(record, user) {
  const entry = {};
  entry.title = record.title;
  const keywords = getKeywords(record.keywords);
  if (keywords) entry.keywords = keywords;
  entry.type = getPortfolioType(record.type);
  if (entry.type) {
    // data object is needed if type exists
    const data = {};
    // map authors, if any
    const authors = getAuthor(record.authors, user);
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
    // map the "published in" title
    const publishedIn = getPublishedIn(record.journal);
    if (publishedIn && entry.type.source !== 'http://base.uni-ak.ac.at/portfolio/taxonomy/conference') {
      data.published_in = publishedIn;
    }
    // map volume and number
    if (entry.type.source !== 'http://base.uni-ak.ac.at/portfolio/taxonomy/conference') {
      const volumeIssue = getVolumeIssue(record.volume, record.number);
      if (volumeIssue) data.volume = volumeIssue;
    }
    // finally, set the data attribute
    entry.data = data;
    // map description, if any
    const texts = getDescription(record.description);
    if (texts) entry.texts = texts;
    // map notes, if any
    if (record.note) entry.notes = record.note;
  }
  return entry;
}

export { createEntryFromBibtex as default };
