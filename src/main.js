// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import VueI18n from 'vue-i18n';
import Notifications from 'vue-notification';
import Vue from 'vue';
// import { Api } from 'base-components';
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

// store.registerModule('api', Api);

// TODO: this is throwing an error (.keys of undefined)
// store.registerModule('skosmos', Skosmos);

// TODO: need to add proper authentication check / mechanism here!
router.beforeEach((to, from, next) => {
  /* if (to.matched.some(record => record.meta.requiresAuth)) {
    if (sessionStorage.getItem('auth')) {
      store.commit('auth/setAuth');
    }
    if (!store.state.auth.isAuthenticated) {
      window.location.href = 'http://basedev.uni-ak.ac.at/portfolio/accounts/login';
      sessionStorage.setItem('auth', 'true');
    }
  } */
  next();
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  router,
  store,
  components: { App },
  template: '<App/>',
});
