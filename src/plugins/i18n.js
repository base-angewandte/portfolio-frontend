/* eslint-disable no-underscore-dangle */
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import MessageFormat from 'messageformat';
// eslint-disable-next-line import/no-cycle
import { toTitleString } from '@/utils/commonUtils';

Vue.use(VueI18n);

// custom formatter for including text styling (upper lower case)

class CustomFormatter {
  constructor(options = {}) {
    this._locale = options.locale || 'en';
    this._formatter = new MessageFormat(this._locale);
    this._caches = Object.create(null);
  }

  interpolate(message, values) {
    let fn = this._caches[message];
    if (!fn) {
      fn = this._formatter.compile(message, this._locale);
      this._caches[message] = fn;
    }
    return [values && values.toTitleCase === false
      ? fn(values) : toTitleString(fn(values), this._locale)];
  }
}

// get language settings either from local storage (if user changed settings previously)
// or from browser settings
const lang = localStorage.getItem('lang') || navigator.language.slice(0, 2);
localStorage.setItem('lang', lang);

let langJson = {};

try {
  // eslint-disable-next-line import/no-dynamic-require,global-require
  langJson = require(`../locales/${lang}.json`);
} catch (e) {
  console.error(`The locale json for language: ${lang} was not found! Please add it to the locale folder`);
}

let defaultJson = {};
if (lang !== process.env.VUE_APP_DEFAULT_LOCALE) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  defaultJson = require(`../locales/${process.env.VUE_APP_DEFAULT_LOCALE}.json`);
}

const locale = process.env.VUE_APP_LOCALES.split(',').map((langString) => langString.trim())
  .includes(lang) ? lang : process.env.VUE_APP_DEFAULT_LOCALE;

/* eslint-disable-next-line no-extra-boolean-cast */
const customFormaterObject = JSON.parse(process.env.VUE_APP_EN_TITLE_CASING)
  ? { formatter: new CustomFormatter({ locale }) } : {};

/* eslint-disable-next-line */
export const i18n = new VueI18n({
  locale,
  ...customFormaterObject,
  fallbackLocale: process.env.VUE_APP_DEFAULT_LOCALE,
  messages: { ...{ [process.env.VUE_APP_DEFAULT_LOCALE]: defaultJson }, ...{ [lang]: langJson } },
});
