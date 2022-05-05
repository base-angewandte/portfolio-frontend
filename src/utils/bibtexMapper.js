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
  case 'chapter':
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

/**
 * Returns an object that represents a portfolio entry
 * (e.g. it is ready to be posted to the entry creation api in portfolio)
 */
function createEntryFromBibtex(record) {
  const entry = {};
  entry.title = record.title;
  entry.subtitle = record.keywords;
  entry.type = getPortfolioType(record.type);
  return entry;
}

export { createEntryFromBibtex as default };
