/**
 * This module contains functions used to map types
 * from the Primo API system (https://knowledge.exlibrisgroup.com/Primo/Product_Documentation/Primo)
 * to portfolio types.
*/

/**
 * Mapping function that returns the portfolio entry's type.
 * @param {string} primoType Maps to docs/{index}/pnx/display/type of the Primo API response body.
 * @returns An object that stands for entry's type in portfolio, or empty string if unmappable.
 */
function getPortfolioType(primoType) {
  switch (primoType) {
  case 'book':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/monograph',
      label: { de: 'Monographie', en: 'Monograph' },
    };
  case 'journal':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/journal',
      label: { de: 'Zeitschrift', en: 'journal' },
    };
  case 'article':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/article',
      label: { de: 'Artikel', en: 'Article' },
    };
  case 'image':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/image',
      label: { de: 'Bild', en: 'image' },
    };
  case 'video':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/video',
      label: { de: 'Video', en: 'video' },
    };
  case 'audio':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/audio_recording',
      label: { de: 'Tonaufnahme', en: 'audio recording' },
    };
  default:
    return null;
  }
}

/**
 * Mapping function that returns a single portfolio author object.
 * @param {*} authorLabel The author's label
 * @param {*} lad24 Maps to docs/{index}/pnx/addata/lad24 of the Primo API response body
 * @returns An author ojbect, with or without GND.
 */
function getAuthorObject(authorLabel, lad24 = 0) {
  const author = {
    label: authorLabel,
    roles: [{
      source: 'http://base.uni-ak.ac.at/portfolio/vocabulary/author',
      label: {
        de: 'Autor*in',
        en: 'Author',
      },
    }],
  };
  // add GND only for authors identifiable via lad24 code 100 (persons) or 110 (Körperschaftsname)
  if (lad24 && lad24.length) {
    // if the lad24 field contains spaces, split it in chunks
    // find the record where chunk[2] = 100, if found then chunk[1] is the gnd
    const gndRecord = lad24.find((el) => (el.indexOf(' ') === -1 ? false : el.split(' ')[2] === '100' || el.split(' ')[2] === '110'));
    if (gndRecord) author.source = `http://d-nb.info/gnd/${gndRecord.split(' ')[1]}`;
  }
  return author;
}

/**
 * Mapping function that returns the portfolio entry's authors.
 * @param {*} creator Maps to docs/{index}/pnx/display/creator of the Primo API response body
 * @param {*} lad24 Maps to docs/{index}/pnx/addata/lad24 of the Primo API response body
 * @returns
 */
function getPortfolioAuthors(creator, lad24) {
  const authors = [];
  // if there is only one creator, look up this creator's GND in lad24
  // and return the author with the GND included.
  // otherwise, return the list of authors found in creator without GND
  if (creator && creator.length) {
    if (creator.length === 1) {
      authors.push(getAuthorObject(creator[0], lad24));
    } else {
      creator.forEach((item) => {
        authors.push(getAuthorObject(item));
      });
    }
  }
  return authors;
}

/**
 * Mapping function that returns the portfolio entry's year, if one can be inferred.
 * @param {*} strDate Maps to docs/{index}/pnx/display/creationdate of the Primo API response body
 * @returns Boolean false if the date cannot be inferred, otherwise the 4-digit year value
 */
function getPortfolioYear(strDate) {
  if (strDate && !Number.isNaN(strDate) && strDate.length === 4) return strDate;
  return false;
}

/**
 * Converts a library search result record into an object that represents
 * a new entry in portfolio.
 */
function createPortfolioEntry(record) {
  const entry = {};
  entry.title = record.title;
  entry.subtitle = record.subtitle;
  entry.type = getPortfolioType(record.type);
  if (entry.type) {
    // assume data object is needed if type exists
    const data = {};
    // map authors, if any
    const authors = getPortfolioAuthors(record.authors, record.lad24);
    if (authors && authors.length) data.authors = authors;
    // map year, if applicable
    const year = getPortfolioYear(record.year);
    if (year) data.date = year;
    // finally, set the data attribute
    entry.data = data;
  }
  return entry;
}

export { createPortfolioEntry as default };
