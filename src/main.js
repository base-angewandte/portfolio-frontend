// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Notifications from 'vue-notification';
import Vue from 'vue';
import { PortfolioAPI, SkosmosAPI } from 'base-components';
import { i18n } from './plugins/i18n';
import App from './App';
import router from './router';
import store from './store';

import './styles/app.scss';
import './styles/main.scss';

Vue.config.productionTip = false;

Vue.use(Notifications);

PortfolioAPI(store, {
  baseURL: process.env.PORTFOLIO_API,
  lang: i18n.locale,
}, 'PortfolioAPI');

SkosmosAPI(store, {
  baseURL: process.env.SKOSMOS_API,
  lang: i18n.locale,
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
