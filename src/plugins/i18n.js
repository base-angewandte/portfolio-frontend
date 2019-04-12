import Vue from 'vue';
import VueI18n from 'vue-i18n';
import prodEnv from '../../config/prod.env';

Vue.use(VueI18n);

const lang = sessionStorage.getItem('lang') || navigator.language.slice(0, 2);

// TODO: try to import only the one language determined above!
const en = require('../locales/en.json');
const de = require('../locales/de.json');

/* eslint-disable-next-line */
export const i18n = new VueI18n({
  locale: prodEnv.LOCALES.includes(lang) ? lang : prodEnv.DEFAULT_LOCALE,
  fallbackLocale: prodEnv.DEFAULT_LOCALE,
  messages: { de, en },
});
