import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const lang = sessionStorage.getItem('lang') || navigator.language.slice(0, 2);

// TODO: try to import only the one language determined above!
const en = require('../locales/en.json');
const de = require('../locales/de.json');

/* eslint-disable-next-line */
export const i18n = new VueI18n({
  locale: ['de', 'en'].includes(lang) ? lang : 'de',
  fallbackLocale: 'de',
  messages: { de, en },
});
