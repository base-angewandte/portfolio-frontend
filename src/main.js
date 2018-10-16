// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import VueI18n from 'vue-i18n';
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';

import './styles/app.scss';
import './styles/main.scss';

const en = require('./locales/en.json');
const de = require('./locales/de.json');

Vue.config.productionTip = false;

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'en',
  messages: {
    en,
    de,
  },
});

console.log(store);
store.registerModule('store', {

});

/* router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (false) {
      next({
        path: '/login',
        params: { nextUrl: to.fullPath },
      });
    }
  }
  next();
}) */

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  router,
  store,
  components: { App },
  template: '<App/>',
});
