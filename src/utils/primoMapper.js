/**
 * This module contains functions used to map types
 * from the Primo API system (https://knowledge.exlibrisgroup.com/Primo/Product_Documentation/Primo)
 * to portfolio types.
*/

/**
 * Mapping object for converting ISO 639-1 to 639-2, or vice versa.
 */
const isoLangs = {
  aa: 'aar', ab: 'abk', af: 'afr', ak: 'aka', sq: 'alb', am: 'amh', ar: 'ara', an: 'arg', hy: 'hye', as: 'asm', av: 'ava', ae: 'ave', ay: 'aym', az: 'aze', ba: 'bak', bm: 'bam', eu: 'eus', be: 'bel', bn: 'ben', bh: 'bih', bi: 'bis', bo: 'tib', bs: 'bos', br: 'bre', bg: 'bul', my: 'mya', ca: 'cat', cs: 'cze', ch: 'cha', ce: 'che', zh: 'zho', cu: 'chu', cv: 'chv', kw: 'cor', co: 'cos', cr: 'cre', cy: 'wel', da: 'dan', de: 'ger', dv: 'div', nl: 'dut', dz: 'dzo', el: 'gre', en: 'eng', eo: 'epo', et: 'est', ee: 'ewe', fo: 'fao', fa: 'per', fj: 'fij', fi: 'fin', fr: 'fra', fy: 'fry', ff: 'ful', ka: 'geo', gd: 'gla', ga: 'gle', gl: 'glg', gv: 'glv', gn: 'grn', gu: 'guj', ht: 'hat', ha: 'hau', he: 'heb', hz: 'her', hi: 'hin', ho: 'hmo', hr: 'hrv', hu: 'hun', ig: 'ibo', is: 'ice', io: 'ido', ii: 'iii', iu: 'iku', ie: 'ile', ia: 'ina', id: 'ind', ik: 'ipk', it: 'ita', jv: 'jav', ja: 'jpn', kl: 'kal', kn: 'kan', ks: 'kas', kr: 'kau', kk: 'kaz', km: 'khm', ki: 'kik', rw: 'kin', ky: 'kir', kv: 'kom', kg: 'kon', ko: 'kor', kj: 'kua', ku: 'kur', lo: 'lao', la: 'lat', lv: 'lav', li: 'lim', ln: 'lin', lt: 'lit', lb: 'ltz', lu: 'lub', lg: 'lug', mk: 'mkd', mh: 'mah', ml: 'mal', mi: 'mri', mr: 'mar', ms: 'may', mg: 'mlg', mt: 'mlt', mn: 'mon', na: 'nau', nv: 'nav', nr: 'nbl', nd: 'nde', ng: 'ndo', ne: 'nep', nn: 'nno', nb: 'nob', no: 'nor', ny: 'nya', oc: 'oci', oj: 'oji', or: 'ori', om: 'orm', os: 'oss', pa: 'pan', pi: 'pli', pl: 'pol', pt: 'por', ps: 'pus', qu: 'que', rm: 'roh', ro: 'ron', rn: 'run', ru: 'rus', sg: 'sag', sa: 'san', si: 'sin', sk: 'slk', sl: 'slv', se: 'sme', sm: 'smo', sn: 'sna', sd: 'snd', so: 'som', st: 'sot', es: 'spa', sc: 'srd', sr: 'srp', ss: 'ssw', su: 'sun', sw: 'swa', sv: 'swe', ty: 'tah', ta: 'tam', tt: 'tat', te: 'tel', tg: 'tgk', tl: 'tgl', th: 'tha', ti: 'tir', to: 'ton', tn: 'tsn', ts: 'tso', tk: 'tuk', tr: 'tur', tw: 'twi', ug: 'uig', uk: 'ukr', ur: 'urd', uz: 'uzb', ve: 'ven', vi: 'vie', vo: 'vol', wa: 'wln', wo: 'wol', xh: 'xho', yi: 'yid', yo: 'yor', za: 'zha', zu: 'zul',
};

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
  case 'text_resource':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/online_newspaper_article',
      label: { de: 'Onlinebeitrag', en: 'online newspaper article' },
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
  case 'map':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/illustration',
      label: { de: 'Illustration', en: 'illustration' },
    };
  case 'score':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/illustration',
      label: { de: 'Illustration', en: 'illustration' },
    };
  case 'other':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/artistic_sound_image_data_medium',
      label: { de: 'Künstlerischer Ton-/Bild-/Datenträger ', en: 'artistic sound/image/data medium' },
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
 * @returns Boolean false if the year cannot be inferred, otherwise the year value
 */
function getPortfolioYear(strDate) {
  if (strDate && strDate.match('^[0-9]{1,4}$')) return strDate;
  return false;
}

/**
 * Mapping function that returns the portfolio entry's description.
 * @param {*} desc Maps to docs/{index}/pnx/search/description of the Primo API response body
 * @returns Boolean false if no description, otherwise a string value
 */
function getPortfolioDescription(desc) {
  if (desc) {
    return [
      {
        type: {
          label: {
            de: 'Beschreibung',
            en: 'Description',
          },
          source: 'http://base.uni-ak.ac.at/portfolio/vocabulary/description',
        },
        data: [
          {
            language: {
              source: 'http://base.uni-ak.ac.at/portfolio/languages/en',
            },
            text: desc.toString(),
          },
        ],
      },
    ];
  }
  return false;
}

/**
 * Mapping function that returns the portfolio entry's language.
 * @param {*} entryLangs Maps to docs/{index}/pnx/display/language of the Primo API response body
 * @returns Boolean false if no language, otherwise a string value
 */
function getPortfolioLang(entryLangs, portfolioLangs) {
  const retLangs = [];
  entryLangs.toString().split(';').forEach((lang) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(isoLangs)) {
      if (lang === value) {
        const portfolioLang = portfolioLangs
          .find((l) => l.source.substring(l.source.length - 2, l.source.length) === key);
        retLangs.push(portfolioLang);
      }
    }
  });
  return retLangs;
}

/**
 * Return Boolean **true** if the portfolio type supplied as argument
 * has an *authors* field to which equivalent data from Primo can be mapped; false otherwise.
 * @param {*} portfolioType
 * @returns
 */
function typeHasAuthor(portfolioType) {
  switch (portfolioType) {
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/monograph':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/journal':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/article':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/online_newspaper_article':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/image':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/video':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/audio_recording':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/illustration':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/artistic_sound_image_data_medium':
    return true;
  default:
    return false;
  }
}

/**
 * Return Boolean **true** if the portfolio type supplied as argument has a *date* field
 * to which equivalent data from Primo can be mapped; false otherwise.
 * @param {*} portfolioType
 * @returns
 */
function typeHasYear(portfolioType) {
  switch (portfolioType) {
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/monograph':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/journal':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/article':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/online_newspaper_article':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/image':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/video':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/audio_recording':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/illustration':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/artistic_sound_image_data_medium':
    return false;
  default:
    return false;
  }
}

/**
 * Return Boolean **true** if the portfolio type supplied as argument has a *date_location* field
 * to which equivalent data from Primo can be mapped; false otherwise.
 * @param {*} portfolioType
 * @returns
 */
function typeHasDateLocation(portfolioType) {
  switch (portfolioType) {
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/monograph':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/journal':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/article':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/online_newspaper_article':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/image':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/video':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/audio_recording':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/illustration':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/artistic_sound_image_data_medium':
    return false;
  default:
    return false;
  }
}

/**
 * Return Boolean **true** if the portfolio type supplied as argument has a *language* field
 * to which equivalent data from Primo can be mapped; false otherwise.
 * @param {*} portfolioType
 * @returns
 */
function typeHasLang(portfolioType) {
  switch (portfolioType) {
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/monograph':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/journal':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/article':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/online_newspaper_article':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/image':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/video':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/audio_recording':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/illustration':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/artistic_sound_image_data_medium':
    return true;
  default:
    return false;
  }
}

/**
 * Return Boolean **true** if the portfolio type supplied as argument has the *ISBN* field
 * to which equivalent data from Primo can be mapped; false otherwise.
 * @param {*} portfolioType
 * @returns
 */
function typeHasIsbn(portfolioType) {
  switch (portfolioType) {
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/monograph':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/journal':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/article':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/online_newspaper_article':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/image':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/video':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/audio_recording':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/illustration':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/artistic_sound_image_data_medium':
    return true;
  default:
    return false;
  }
}

/**
 * Return Boolean **true** if the portfolio type supplied as argument has the *Pages* field
 * to which equivalent data from Primo can be mapped; false otherwise.
 * @param {*} portfolioType
 * @returns
 */
function typeHasPages(portfolioType) {
  switch (portfolioType) {
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/monograph':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/journal':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/article':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/online_newspaper_article':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/image':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/video':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/audio_recording':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/illustration':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/artistic_sound_image_data_medium':
    return true;
  default:
    return false;
  }
}

/**
 * Converts a library search result record into an object that represents
 * a new entry in portfolio.
 */
function createPortfolioEntry(record, portfolioLangs) {
  const entry = {};
  entry.title = record.title;
  entry.subtitle = record.subtitle;
  entry.type = getPortfolioType(record.type);
  if (entry.type) {
    // assume data object is needed if type exists
    const data = {};
    // map authors, if any
    const authors = getPortfolioAuthors(record.authors, record.lad24);
    // workaround: add authors only to compabitble types in portfolio
    if (authors && authors.length && typeHasAuthor(entry.type.source)) {
      data.authors = authors;
    }
    // map year, if applicable
    const year = getPortfolioYear(record.year);
    // workaround: add year only to compatible types in portfolio
    if (year && typeHasYear(entry.type.source)) {
      data.date = year;
    }
    // some portfolio types store date as part of a 'date_location' structure
    if (year && typeHasDateLocation(entry.type.source)) {
      const dateLocationArr = [];
      dateLocationArr.push({ date: year });
      data.date_location = dateLocationArr;
    }
    // map description, if any
    const texts = getPortfolioDescription(record.description);
    if (texts) entry.texts = texts;
    // map language, if any
    const langList = getPortfolioLang(record.language, portfolioLangs);
    // workaround: add lang only to compatible types in portfolio
    if (langList && typeHasLang(entry.type.source)) {
      data.language = langList;
    }
    // map isbn
    if (record.isbn && typeHasIsbn(entry.type.source)) data.isbn = record.isbn;
    // map pages info
    if (record.pages && typeHasPages(entry.type.source)) data.pages = record.pages;
    // finally, set the data attribute
    entry.data = data;
  }
  return entry;
}

export { createPortfolioEntry as default };
