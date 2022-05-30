/**
 * This module contains functions used to map types
 * from the Primo API system (https://knowledge.exlibrisgroup.com/Primo/Product_Documentation/Primo)
 * to portfolio types.
*/

/**
 * This array is used to look up ISO language codes in 639-2 and 639-1 formats.
 * Note that for some languages there are two 639-2 code values for the same 639-1 code
 * (e.g. ro => rum,ron)
 */
const isoLangs = [
  { '639-1': 'aa', '639-2': 'aar' },
  { '639-1': 'ab', '639-2': 'abk' },
  { '639-1': 'af', '639-2': 'afr' },
  { '639-1': 'ak', '639-2': 'aka' },
  { '639-1': 'sq', '639-2': 'alb' },
  { '639-1': 'sq', '639-2': 'sqi' },
  { '639-1': 'am', '639-2': 'amh' },
  { '639-1': 'ar', '639-2': 'ara' },
  { '639-1': 'an', '639-2': 'arg' },
  { '639-1': 'hy', '639-2': 'hye' },
  { '639-1': 'hy', '639-2': 'arm' },
  { '639-1': 'as', '639-2': 'asm' },
  { '639-1': 'av', '639-2': 'ava' },
  { '639-1': 'ae', '639-2': 'ave' },
  { '639-1': 'ay', '639-2': 'aym' },
  { '639-1': 'az', '639-2': 'aze' },
  { '639-1': 'ba', '639-2': 'bak' },
  { '639-1': 'bm', '639-2': 'bam' },
  { '639-1': 'eu', '639-2': 'eus' },
  { '639-1': 'eu', '639-2': 'baq' },
  { '639-1': 'be', '639-2': 'bel' },
  { '639-1': 'bn', '639-2': 'ben' },
  { '639-1': 'bh', '639-2': 'bih' },
  { '639-1': 'bi', '639-2': 'bis' },
  { '639-1': 'bo', '639-2': 'tib' },
  { '639-1': 'bo', '639-2': 'bod' },
  { '639-1': 'bs', '639-2': 'bos' },
  { '639-1': 'br', '639-2': 'bre' },
  { '639-1': 'bg', '639-2': 'bul' },
  { '639-1': 'my', '639-2': 'mya' },
  { '639-1': 'my', '639-2': 'bur' },
  { '639-1': 'ca', '639-2': 'cat' },
  { '639-1': 'cs', '639-2': 'cze' },
  { '639-1': 'cs', '639-2': 'ces' },
  { '639-1': 'ch', '639-2': 'cha' },
  { '639-1': 'ce', '639-2': 'che' },
  { '639-1': 'zh', '639-2': 'zho' },
  { '639-1': 'zh', '639-2': 'chi' },
  { '639-1': 'cu', '639-2': 'chu' },
  { '639-1': 'cv', '639-2': 'chv' },
  { '639-1': 'kw', '639-2': 'cor' },
  { '639-1': 'co', '639-2': 'cos' },
  { '639-1': 'cr', '639-2': 'cre' },
  { '639-1': 'cy', '639-2': 'wel' },
  { '639-1': 'cy', '639-2': 'cym' },
  { '639-1': 'da', '639-2': 'dan' },
  { '639-1': 'de', '639-2': 'ger' },
  { '639-1': 'de', '639-2': 'deu' },
  { '639-1': 'dv', '639-2': 'div' },
  { '639-1': 'nl', '639-2': 'dut' },
  { '639-1': 'nl', '639-2': 'nld' },
  { '639-1': 'dz', '639-2': 'dzo' },
  { '639-1': 'el', '639-2': 'gre' },
  { '639-1': 'el', '639-2': 'ell' },
  { '639-1': 'en', '639-2': 'eng' },
  { '639-1': 'eo', '639-2': 'epo' },
  { '639-1': 'et', '639-2': 'est' },
  { '639-1': 'ee', '639-2': 'ewe' },
  { '639-1': 'fo', '639-2': 'fao' },
  { '639-1': 'fa', '639-2': 'per' },
  { '639-1': 'fa', '639-2': 'fas' },
  { '639-1': 'fj', '639-2': 'fij' },
  { '639-1': 'fi', '639-2': 'fin' },
  { '639-1': 'fr', '639-2': 'fra' },
  { '639-1': 'fr', '639-2': 'fre' },
  { '639-1': 'fy', '639-2': 'fry' },
  { '639-1': 'ff', '639-2': 'ful' },
  { '639-1': 'ka', '639-2': 'geo' },
  { '639-1': 'ka', '639-2': 'kat' },
  { '639-1': 'gd', '639-2': 'gla' },
  { '639-1': 'ga', '639-2': 'gle' },
  { '639-1': 'gl', '639-2': 'glg' },
  { '639-1': 'gv', '639-2': 'glv' },
  { '639-1': 'gn', '639-2': 'grn' },
  { '639-1': 'gu', '639-2': 'guj' },
  { '639-1': 'ht', '639-2': 'hat' },
  { '639-1': 'ha', '639-2': 'hau' },
  { '639-1': 'he', '639-2': 'heb' },
  { '639-1': 'hz', '639-2': 'her' },
  { '639-1': 'hi', '639-2': 'hin' },
  { '639-1': 'ho', '639-2': 'hmo' },
  { '639-1': 'hr', '639-2': 'hrv' },
  { '639-1': 'hu', '639-2': 'hun' },
  { '639-1': 'ig', '639-2': 'ibo' },
  { '639-1': 'is', '639-2': 'ice' },
  { '639-1': 'is', '639-2': 'isl' },
  { '639-1': 'io', '639-2': 'ido' },
  { '639-1': 'ii', '639-2': 'iii' },
  { '639-1': 'iu', '639-2': 'iku' },
  { '639-1': 'ie', '639-2': 'ile' },
  { '639-1': 'ia', '639-2': 'ina' },
  { '639-1': 'id', '639-2': 'ind' },
  { '639-1': 'ik', '639-2': 'ipk' },
  { '639-1': 'it', '639-2': 'ita' },
  { '639-1': 'jv', '639-2': 'jav' },
  { '639-1': 'ja', '639-2': 'jpn' },
  { '639-1': 'kl', '639-2': 'kal' },
  { '639-1': 'kn', '639-2': 'kan' },
  { '639-1': 'ks', '639-2': 'kas' },
  { '639-1': 'kr', '639-2': 'kau' },
  { '639-1': 'kk', '639-2': 'kaz' },
  { '639-1': 'km', '639-2': 'khm' },
  { '639-1': 'ki', '639-2': 'kik' },
  { '639-1': 'rw', '639-2': 'kin' },
  { '639-1': 'ky', '639-2': 'kir' },
  { '639-1': 'kv', '639-2': 'kom' },
  { '639-1': 'kg', '639-2': 'kon' },
  { '639-1': 'ko', '639-2': 'kor' },
  { '639-1': 'kj', '639-2': 'kua' },
  { '639-1': 'ku', '639-2': 'kur' },
  { '639-1': 'lo', '639-2': 'lao' },
  { '639-1': 'la', '639-2': 'lat' },
  { '639-1': 'lv', '639-2': 'lav' },
  { '639-1': 'li', '639-2': 'lim' },
  { '639-1': 'ln', '639-2': 'lin' },
  { '639-1': 'lt', '639-2': 'lit' },
  { '639-1': 'lb', '639-2': 'ltz' },
  { '639-1': 'lu', '639-2': 'lub' },
  { '639-1': 'lg', '639-2': 'lug' },
  { '639-1': 'mk', '639-2': 'mkd' },
  { '639-1': 'mk', '639-2': 'mac' },
  { '639-1': 'mh', '639-2': 'mah' },
  { '639-1': 'ml', '639-2': 'mal' },
  { '639-1': 'mi', '639-2': 'mri' },
  { '639-1': 'mi', '639-2': 'mao' },
  { '639-1': 'mr', '639-2': 'mar' },
  { '639-1': 'ms', '639-2': 'may' },
  { '639-1': 'ms', '639-2': 'msa' },
  { '639-1': 'mg', '639-2': 'mlg' },
  { '639-1': 'mt', '639-2': 'mlt' },
  { '639-1': 'mn', '639-2': 'mon' },
  { '639-1': 'na', '639-2': 'nau' },
  { '639-1': 'nv', '639-2': 'nav' },
  { '639-1': 'nr', '639-2': 'nbl' },
  { '639-1': 'nd', '639-2': 'nde' },
  { '639-1': 'ng', '639-2': 'ndo' },
  { '639-1': 'ne', '639-2': 'nep' },
  { '639-1': 'nn', '639-2': 'nno' },
  { '639-1': 'nb', '639-2': 'nob' },
  { '639-1': 'no', '639-2': 'nor' },
  { '639-1': 'ny', '639-2': 'nya' },
  { '639-1': 'oc', '639-2': 'oci' },
  { '639-1': 'oj', '639-2': 'oji' },
  { '639-1': 'or', '639-2': 'ori' },
  { '639-1': 'om', '639-2': 'orm' },
  { '639-1': 'os', '639-2': 'oss' },
  { '639-1': 'pa', '639-2': 'pan' },
  { '639-1': 'pi', '639-2': 'pli' },
  { '639-1': 'pl', '639-2': 'pol' },
  { '639-1': 'pt', '639-2': 'por' },
  { '639-1': 'ps', '639-2': 'pus' },
  { '639-1': 'qu', '639-2': 'que' },
  { '639-1': 'rm', '639-2': 'roh' },
  { '639-1': 'ro', '639-2': 'ron' },
  { '639-1': 'ro', '639-2': 'rum' },
  { '639-1': 'rn', '639-2': 'run' },
  { '639-1': 'ru', '639-2': 'rus' },
  { '639-1': 'sg', '639-2': 'sag' },
  { '639-1': 'sa', '639-2': 'san' },
  { '639-1': 'si', '639-2': 'sin' },
  { '639-1': 'sk', '639-2': 'slk' },
  { '639-1': 'sk', '639-2': 'slo' },
  { '639-1': 'sl', '639-2': 'slv' },
  { '639-1': 'se', '639-2': 'sme' },
  { '639-1': 'sm', '639-2': 'smo' },
  { '639-1': 'sn', '639-2': 'sna' },
  { '639-1': 'sd', '639-2': 'snd' },
  { '639-1': 'so', '639-2': 'som' },
  { '639-1': 'st', '639-2': 'sot' },
  { '639-1': 'es', '639-2': 'spa' },
  { '639-1': 'sc', '639-2': 'srd' },
  { '639-1': 'sr', '639-2': 'srp' },
  { '639-1': 'ss', '639-2': 'ssw' },
  { '639-1': 'su', '639-2': 'sun' },
  { '639-1': 'sw', '639-2': 'swa' },
  { '639-1': 'sv', '639-2': 'swe' },
  { '639-1': 'ty', '639-2': 'tah' },
  { '639-1': 'ta', '639-2': 'tam' },
  { '639-1': 'tt', '639-2': 'tat' },
  { '639-1': 'te', '639-2': 'tel' },
  { '639-1': 'tg', '639-2': 'tgk' },
  { '639-1': 'tl', '639-2': 'tgl' },
  { '639-1': 'th', '639-2': 'tha' },
  { '639-1': 'ti', '639-2': 'tir' },
  { '639-1': 'to', '639-2': 'ton' },
  { '639-1': 'tn', '639-2': 'tsn' },
  { '639-1': 'ts', '639-2': 'tso' },
  { '639-1': 'tk', '639-2': 'tuk' },
  { '639-1': 'tr', '639-2': 'tur' },
  { '639-1': 'tw', '639-2': 'twi' },
  { '639-1': 'ug', '639-2': 'uig' },
  { '639-1': 'uk', '639-2': 'ukr' },
  { '639-1': 'ur', '639-2': 'urd' },
  { '639-1': 'uz', '639-2': 'uzb' },
  { '639-1': 've', '639-2': 'ven' },
  { '639-1': 'vi', '639-2': 'vie' },
  { '639-1': 'vo', '639-2': 'vol' },
  { '639-1': 'wa', '639-2': 'wln' },
  { '639-1': 'wo', '639-2': 'wol' },
  { '639-1': 'xh', '639-2': 'xho' },
  { '639-1': 'yi', '639-2': 'yid' },
  { '639-1': 'yo', '639-2': 'yor' },
  { '639-1': 'za', '639-2': 'zha' },
  { '639-1': 'zu', '639-2': 'zul' },
];

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
      label: { de: 'Künstlerischer Ton-/Bild-/Datenträger', en: 'artistic sound/image/data medium' },
    };
  case 'dissertations':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/doctoral_dissertation',
      label: { de: 'Dissertation', en: 'doctoral dissertation' },
    };
  case 'ebook':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/monograph',
      label: { de: 'Monographie', en: 'Monograph' },
    };
  case 'ejournal':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/journal',
      label: { de: 'Zeitschrift', en: 'journal' },
    };
  case 'microform':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/artistic_sound_image_data_medium',
      label: { de: 'Künstlerischer Ton-/Bild-/Datenträger', en: 'artistic sound/image/data medium' },
    };
  case 'schriftenreihe':
    return {
      source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/series_monographic_series',
      label: { de: 'Schriftenreihe/Buchreihe', en: 'series/monographic series' },
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
 * Mapping function that returns the portfolio entry's primary language, or false.
 * @param {*} input The Primo value to process, e.g. ["eng;ger"]
 * @returns Boolean false if no language, otherwise the language string value in ISO 639-1 format
 */
function getPrimaryLang(input) {
  const retLangs = [];
  input
    .toString()
    .split(';')
    .forEach((lang) => {
      isoLangs.forEach((obj) => {
        if (obj['639-2'] === lang) retLangs.push(obj['639-1']);
      });
    });
  return retLangs.length > 0 ? retLangs[0] : false;
}

/**
 * Mapping function that returns the portfolio entry's description
 * @param {*} desc Maps to docs/{index}/pnx/search/description of the Primo API response body
 * @param {*} primoLangs Maps to docs/{index}/pnx/display/language of the Primo API response body
 * @returns Boolean false if no description, otherwise a string value
 */
function getPortfolioDescription(desc, primoLangs) {
  if (desc) {
    const lang = getPrimaryLang(primoLangs);
    if (lang === 'de' || lang === 'en') {
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
                source: `http://base.uni-ak.ac.at/portfolio/languages/${lang}`,
              },
              text: desc.toString(),
            },
          ],
        },
      ];
    }
  }
  return false;
}

/**
 * Mapping function that returns the portfolio entry's languages.
 * @param {*} entryLangs Maps to docs/{index}/pnx/display/language of the Primo API response body
 * @returns Boolean false if no language, otherwise an array value
 */
function getPortfolioLangs(entryLangs, portfolioLangs) {
  const retLangs = [];
  entryLangs.toString().split(';').forEach((lang) => {
    isoLangs.forEach((isoLang) => {
      if (lang === isoLang['639-2']) {
        const portfolioLang = portfolioLangs
          .find((l) => l.source.substring(l.source.length - 2, l.source.length) === isoLang['639-1']);
        retLangs.push(portfolioLang);
      }
    });
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
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/doctoral_dissertation':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/series_monographic_series':
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
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/doctoral_dissertation':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/series_monographic_series':
    return true;
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
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/doctoral_dissertation':
    return false;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/series_monographic_series':
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
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/doctoral_dissertation':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/series_monographic_series':
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
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/doctoral_dissertation':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/series_monographic_series':
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
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/doctoral_dissertation':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/series_monographic_series':
    return true;
  default:
    return false;
  }
}

/**
 * Return Boolean **true** if the portfolio type supplied as argument has the *Published In* fields
 * to which equivalent data from Primo can be mapped; false otherwise.
 * @param {*} portfolioType
 * @returns
 */
function typeHasPublishedIn(portfolioType) {
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
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/doctoral_dissertation':
    return true;
  case 'http://base.uni-ak.ac.at/portfolio/taxonomy/series_monographic_series':
    return true;
  default:
    return false;
  }
}

/**
 * Mapping function that returns the portfolio's entry "Published in" field.
 * This structure is common to all mapped types except audio_recording.
 * @param {*} isPartOf Maps to pnx/display/ispartof field in Primo
 * @returns The array structure containing the "Published in" field
 */
function getPublishedIn(isPartOf) {
  return isPartOf ? [
    {
      title: isPartOf,
    },
  ] : '';
}

/**
 * Mapping function that returns the portfolio entry's "Contributors" field
 * @param {*} list Maps to pnx/display/contributor in Primo
 * @returns The array structure corresponding to "Contributors" in portfolio
 */
function getContributors(list) {
  const retVal = [];
  if (list && list.length) {
    list.forEach((contributor) => {
      retVal.push(
        {
          label: contributor,
          roles: [
            {
              source: 'http://base.uni-ak.ac.at/portfolio/vocabulary/contribution',
              label: {
                en: 'Contribution',
                de: 'Beitrag',
              },
            },
          ],
        },
      );
    });
  }
  return retVal;
}

/**
 * Converts a library search result record into an object that represents
 * a new entry in portfolio.
 */
function createEntryFromPrimo(record, portfolioLangs) {
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
    // if type = image, video, or illustration,
    // then add author(s) as contributors with 'author' role
    if (authors && authors.length && (
      entry.type.source === 'http://base.uni-ak.ac.at/portfolio/taxonomy/image'
      || entry.type.source === 'http://base.uni-ak.ac.at/portfolio/taxonomy/video'
      || entry.type.source === 'http://base.uni-ak.ac.at/portfolio/taxonomy/illustration'
    )
    ) {
      data.contributors = authors;
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
    const texts = getPortfolioDescription(record.description, record.language);
    if (texts) entry.texts = texts;
    // map description to notes if language is not "de" or "en"
    if (record.description && record.language) {
      const primaryLang = getPrimaryLang(record.language);
      if (primaryLang && (primaryLang !== 'de' && primaryLang !== 'en')) {
        entry.notes = record.description.toString();
      }
    }
    // map language, if any
    const langList = getPortfolioLangs(record.language, portfolioLangs);
    // workaround: add lang only to compatible types in portfolio
    if (langList && typeHasLang(entry.type.source)) {
      data.language = langList;
    }
    // map isbn
    if (record.isbn && typeHasIsbn(entry.type.source)) data.isbn = record.isbn;
    // map pages info
    if (record.pages && typeHasPages(entry.type.source)) data.pages = record.pages;
    // map the "published in" title
    const publishedIn = getPublishedIn(record.isPartOf);
    if (publishedIn && typeHasPublishedIn(entry.type.source)) data.published_in = publishedIn;
    // workaround: the audio recording type has different structure for "published in"
    if (record.isPartOf && entry.type.source === 'http://base.uni-ak.ac.at/portfolio/taxonomy/audio_recording') {
      data.published_in = record.isPartOf;
    }
    // map the contributors
    const contributors = getContributors(record.contributors);
    // append to already existing contributors, if any
    if (data.contributors) {
      data.contributors.concat(contributors);
    } else {
      data.contributors = contributors;
    }
    // finally, set the data attribute
    entry.data = data;
  }
  return entry;
}

export { createEntryFromPrimo as default };
