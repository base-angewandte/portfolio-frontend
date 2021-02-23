import Vue from 'vue';
// eslint-disable-next-line import/no-cycle
import { i18n } from '@/plugins/i18n';

export const capitalizeString = (string) => {
  const newString = string.split('/')
    .map((partialString) => partialString.slice(0, 1).toUpperCase() + partialString.slice(1)).join('/');
  return newString.split(' ')
    .map((partialString) => partialString.slice(0, 1).toUpperCase() + partialString.slice(1)).join(' ');
};

export const toTitleString = (string, language = 'en') => {
  const functionLang = i18n.locale || language;
  const sentenceIndicators = /[.!?:]$/;
  if (process.env.VUE_APP_EN_TITLE_CASING && functionLang === 'en' && string.search(sentenceIndicators) < 0) {
    /* this function was taken from:
    To Title Case © 2018 David Gouch | https://github.com/gouch/to-title-case
    */
    const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
    const alphanumericPattern = /([A-Za-z0-9\u00C0-\u00FF])/;
    const wordSeparators = /([ :–—-])/;

    return string.split(wordSeparators)
      .map((current, index, array) => {
        const isSmallWord = current.search(smallWords) > -1;
        if (
          /* Check for small words */
          isSmallWord
          /* Skip first and last word */
          && index !== 0 && index !== array.length - 1
          /* Ignore title end and subtitle start */
          && array[index - 3] !== ':' && array[index + 1] !== ':'
          /* Ignore small words that start a hyphenated phrase */
          && (array[index + 1] !== '-' || (array[index - 1] === '-' && array[index + 1] === '-'))
        ) {
          // ignore single letters so they remain capitalized if they already were
          // (e.g. 'A' from 'A - Z')
          if (current.length !== 1) {
            return current.toLowerCase();
          }
          return current;
        }

        /* Ignore intentional capitalization */
        if (current.substr(1)
          .search(/[A-Z]|\../) > -1) {
          return current;
        }

        /* Ignore URLs */
        if (array[index + 1] === ':' && array[index + 2] !== '') {
          return current;
        }

        /* Capitalize the first letter */
        return current.replace(alphanumericPattern, (match) => match.toUpperCase());
      })
      .join('');
  }
  return string;
};

export const sorting = (list, property, lang) => list.sort((a, b) => {
  let compA = property ? a[property] : a;
  let compB = property ? b[property] : b;
  if (lang) {
    compA = compA ? compA[lang] : '';
    compB = compB ? compB[lang] : '';
  }
  if (compA.toLowerCase() > compB.toLowerCase()) {
    return 1;
  }
  return -1;
});

export const setLangLabels = (key, locales) => locales
  .reduce((prev, curr) => {
    Vue.set(prev, curr, i18n.t(key, curr));
    return prev;
  }, {});

export const getLangLabel = (value, locale = i18n.locale, useAny = false) => {
  if (typeof value === 'string') return value;
  if (value && locale && value[locale]) {
    return toTitleString(value[locale]);
  }
  if (value && locale && useAny) {
    const lang = Object.keys(value).find((key) => !!value[key]);
    // return the first one that has content
    return toTitleString(value[lang] || value[locale]);
  }
  return toTitleString(value);
};

export const convertSpace = (bytes, si) => {
  let newBytes = bytes;
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }
  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  do {
    newBytes /= thresh;
    u += 1;
  } while (Math.abs(newBytes) >= thresh && u < units.length - 1);
  return `${newBytes.toFixed(1)} ${units[u]}`;
};

export const getApiUrl = (requestUrl = '') => {
  if (!requestUrl.includes(process.env.VUE_APP_BACKEND_PREFIX)) {
    return `${process.env.VUE_APP_BACKEND_BASE_URL}${process.env.VUE_APP_BACKEND_PREFIX}${requestUrl}`;
  }
  return `${process.env.VUE_APP_BACKEND_BASE_URL}${requestUrl}`;
};

/**
 * this function can be used for any variable (any data type) to check if it has content
 *
 * @param fieldValues
 * @returns {boolean}
 */
export const hasFieldContent = (fieldValues) => {
  let hasContent = false;
  if (fieldValues && typeof fieldValues === 'object') {
    if (fieldValues.length >= 0) {
      fieldValues.forEach((values) => { hasContent = hasFieldContent(values) || hasContent; });
    } else {
      const objectKeys = Object.keys(fieldValues);
      objectKeys
        .forEach((key) => { hasContent = hasFieldContent(fieldValues[key]) || hasContent; });
    }
  } else {
    hasContent = fieldValues === 0 || !!fieldValues || hasContent;
  }
  return hasContent;
};
