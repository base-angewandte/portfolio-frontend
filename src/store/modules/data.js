/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
import Vue from 'vue';
import DATA from '../../assets/data';

const state = {
  sidebarData: DATA.EXISTING_ENTRIES,
  currentItem: {},
  currentItemId: null,
  isNewForm: false,
};

const getters = {
  getSidebarData(state) {
    return state.sidebarData;
  },
  getCurrentItemIndex(state) {
    return state.sidebarData.indexOf(state.sidebarData
      .find(item => item.id === state.currentItemId));
  },
  getCurrentItem(state) {
    state.sidebarData.filter(item => item.id === state.currentItemId);
  },
  getEntryById(state) {
    return id => state.sidebarData.find(item => item.id === id);
  },
  getLastId(state) {
    return state.sidebarData.reduce((prev, curr) => {
      const prevNum = parseInt(prev.id, 10);
      const currNum = parseInt(curr.id, 10);
      if (prevNum > currNum) {
        return prevNum;
      }
      return currNum;
    }, 0);
  },
  getEntryTypes(state) {
    return [...new Set(state.sidebarData.map(entry => entry.type))];
  },
};

const mutations = {
  setNewForm(state, val) {
    state.isNewForm = val;
  },
  setCurrentItem(state, obj) {
    state.currentItem = Object.assign({}, obj);
    state.currentItemId = obj.id;
  },
  deleteCurrentItem(state) {
    state.currentItemId = null;
    state.currentItem = {};
  },
  addSidebarItem(state, obj) {
    const newItem = Object.assign({}, obj, {
      type: obj.type && obj.type.length ? obj.type[0].type : '',
      id: (parseInt(this.getters['data/getLastId'], 10) + 1).toString(),
    });
    // TODO: consider sorting!!
    state.sidebarData.push(newItem);
    state.currentItemId = newItem.id;
    state.currentItem = newItem;
  },
  updateEntry(state, obj) {
    // state.currentItem = Object.assign({}, state.currentItem, obj);
    const index = this.getters['data/getCurrentItemIndex'];
    // TODO: consider sorting!!
    Vue.set(
      state.sidebarData,
      index,
      Object.assign({}, state.currentItem, obj, {
        type: obj.type && obj.type.length ? obj.type[0] : '',
      }),
    );
    state.currentItem = Object.assign({}, state.sidebarData[index]);
  },
  deleteSidebarItems(state, delArr) {
    state.sidebarData = state.sidebarData.filter(item => !delArr.includes(item.id));
  },
  sortEntries(state, sortVal) {
    if (sortVal === 'Nach Typ') {
      state.sidebarData.sort((a, b) => {
        if (a.type > b.type) {
          return 1;
        }
        return -1;
      });
    } else if (sortVal === 'A-Z') {
      state.sidebarData.sort((a, b) => {
        if (a.title.toLowerCase() > b.title.toLowerCase()) {
          return 1;
        }
        return -1;
      });
    } else if (sortVal === 'Z-A') {
      state.sidebarData.sort((a, b) => {
        if (a.title.toLowerCase() > b.title.toLowerCase()) {
          return -1;
        }
        return 1;
      });
    }
  }
};

const actions = {
  fetchItem({ state, commit }, id) {
    const obj = state.sidebarData.filter(item => item.id === id);
    commit('setCurrentItem', obj);
  },
  async fetchFormExtension(context, type) {
    const commonType = await Object.keys(DATA.TYPE_MAPPINGS)
      .find(key => DATA.TYPE_MAPPINGS[key].includes(type));
    return DATA.FORM_MAPPINGS[commonType];
  },
  setCurrentItemById({ commit }, id) {
    const entry = this.getters['data/getEntryById'](id);
    if (entry) {
      commit('setCurrentItem', entry);
    }
    return !!entry;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
