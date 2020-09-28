import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

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
console.log(process.env.VUE_APP_LOCALES.split(','));
/* eslint-disable-next-line */
export const i18n = new VueI18n({
  availableLocales: process.env.VUE_APP_LOCALES.split(','),
  locale: process.env.VUE_APP_LOCALES.split(', ')
    .includes(lang) ? lang : process.env.VUE_APP_DEFAULT_LOCALE,
  fallbackLocale: process.env.VUE_APP_DEFAULT_LOCALE,
  messages: { [process.env.VUE_APP_DEFAULT_LOCALE]: defaultJson, [lang]: langJson },
});
