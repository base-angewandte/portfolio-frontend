/* eslint no-shadow: ["error", { "allow": ["state"] }] */
// TODO: leave this for now as it might already be covered by store module in base components
import axios from 'axios';

const state = {
  isAuthenticated: false,
  profile: {
    name: 'Florian Bettel',
  },
};

const getters = {

};

const mutations = {
  setUser(state, userData) {
    state.profile = userData;
  },
  setAuth(state) {
    state.isAuthenticated = true;
  },
};

const actions = {
  async userLogin({ commit }) {
    try {
      const res = await axios.get(`${process.env.AUTH}/login`);
      commit('setUser', res.data);
    } catch (err) {
      console.log(err);
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
