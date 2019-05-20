// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Notifications from 'vue-notification';
import Vue from 'vue';
import axios from 'axios';
import { i18n } from './plugins/i18n';
import App from './App';
import router from './router';
import store from './store';

import 'normalize.css';
import './styles/app.scss';
import './styles/main.scss';
import 'base-ui-components/dist/lib/base-ui-components.min.css';

Vue.config.productionTip = false;

Vue.use(Notifications);

router.beforeEach(async (to, from, next) => {
  // TODO: this was the best solution i could come up with now...
  // improvement suggestions???
  // to only do request on page load/reload
  if (!store.getters['PortfolioAPI/isAuthenticated']) {
    try {
      await axios.get(`${process.env.API}user/`, {
        withCredentials: true,
      });
      next();
    } catch (e) {
      // only redirect if authentication is missing
      if (e.message.includes('403')) {
        window.location.href = `${process.env.PORTFOLIO_HOST}${process.env.APP_PREFIX}/accounts/login/`;
      } else {
        next();
      }
    }
  } else {
    next();
  }
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
