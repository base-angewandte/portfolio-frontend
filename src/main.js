// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import VueI18n from 'vue-i18n';
import Notifications from 'vue-notification';
import Vue from 'vue';
import { PortfolioAPI, SkosmosAPI } from 'base-components';
import App from './App';
import router from './router';
import store from './store';

import './styles/app.scss';
import './styles/main.scss';

const en = require('./locales/en.json');
const de = require('./locales/de.json');

Vue.config.productionTip = false;

Vue.use(VueI18n);
Vue.use(Notifications);

const i18n = new VueI18n({
  locale: 'de',
  messages: {
    en,
    de,
  },
});

PortfolioAPI(store, {
  baseURL: process.env.PORTFOLIO_API,
  lang: 'en',
}, 'PortfolioAPI');

SkosmosAPI(store, {
  baseURL: process.env.SKOSMOS_API,
  lang: 'en',
}, 'SkosmosAPI');

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  router,
  store,
  components: { App },
  template: '<App/>',
});
