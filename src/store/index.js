import Vue from 'vue';
import Vuex from 'vuex';
import data from './modules/data';
import user from './modules/user';
import PortfolioAPI from './PortfolioAPI';
import SkosmosAPI from './SkosmosAPI';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    data,
    user,
    PortfolioAPI,
    SkosmosAPI
  },
  strict: debug,
});
