// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Notifications from 'vue-notification';
import Vue from 'vue';
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

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  router,
  store,
  components: { App },
  template: '<App/>',
});
