import Vue from 'vue';
import { i18n } from '../plugins/i18n';

export const capitalizeString = (string) => {
  const newString = string.split('/')
    .map(partialString => partialString.slice(0, 1).toUpperCase() + partialString.slice(1)).join('/');
  return newString.split(' ')
    .map(partialString => partialString.slice(0, 1).toUpperCase() + partialString.slice(1)).join(' ');
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
