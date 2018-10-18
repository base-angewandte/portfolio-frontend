/* eslint no-shadow: ["error", { "allow": ["state"] }] */
import DATA from '../../assets/data';

const state = {
  sidebarData: DATA.EXISTING_ENTRIES,
  currentItem: {},
  currentItemId: null,
};

const getters = {
  getSidebarData(state) {
    return state.sidebarData;
  },
  getCurrentItem(state) {
    state.sidebarData.filter(item => item.id === state.currentItemId);
  },
  getLastId(state) {
    state.sidebarData.reduce((prev, curr) => {
      if (prev.id > curr.id) {
        return prev.id;
      }
      return curr.id;
    });
  },
};

const mutations = {
  setCurrentItem(state, obj) {
    state.currentItem = Object.assign({}, obj);
    state.currentItemId = obj.id > 0 ? obj.id : null;
  },
  deleteCurrentItem(state) {
    state.currentItemId = null;
    state.currentItem = {};
  },
  addSidebarItem(state, obj) {
    const newItem = Object.assign({}, obj, { id: getters.getLastId + 1 });
    state.sidebarData.push(newItem);
    state.currentItemId = newItem.id;
  },
  deleteSidebarItems(state, delArr) {
    state.sidebarData.forEach((item, index) => {
      if (delArr.includes(item.id)) {
        state.sidebarData.splice(index, 1);
      }
    });
  },
};

const actions = {
  fetchItem({ state, commit }, id) {
    const obj = state.sidebarData.filter(item => item.id === id);
    commit('setCurrentItem', obj);
  },
  async fetchFormExtension(context, type) {
    const commonType = await Object.keys(DATA.TYPE_MAPPINGS).find((key) => {
      return DATA.TYPE_MAPPINGS[key].includes(type);
    });
    return DATA.FORM_MAPPINGS[commonType];
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
