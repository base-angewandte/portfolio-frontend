import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/authentication';
import data from './modules/data';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    auth,
    data,
  },
  strict: debug,
});
