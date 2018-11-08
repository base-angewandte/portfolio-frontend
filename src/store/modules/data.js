/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
import Vue from 'vue';
import DATA from '../../assets/data';

const state = {
  sidebarData: JSON.parse(sessionStorage.getItem('sidebarItems')) || DATA.EXISTING_ENTRIES,
  sidebarDataFiltered: JSON.parse(sessionStorage.getItem('sidebarItems')) || DATA.EXISTING_ENTRIES,
  currentItem: {},
  currentItemId: null,
  parentItems: [],
  isNewForm: false,
  showOptions: false,
  popUp: {
    show: false,
    header: '',
    text: '',
    icon: '',
    buttonText: '',
  },
  deletableEntries: [],
  filtered: false,
  sortBy: '',
};

const getters = {
  getSidebarData(state) {
    return state.filtered ? state.sidebarDataFiltered : state.sidebarData;
  },
  getCurrentItemIndex(state) {
    const data = state.filtered ? state.sidebarDataFiltered : state.sidebarData;
    return data.indexOf(data
      .find(item => item.id === state.currentItemId));
  },
  getCurrentItem(state) {
    return state.sidebarData.find(item => item.id === state.currentItemId);
  },
  getEntryById(state) {
    return id => state.sidebarData.find(item => item.id === id);
  },
  getLastId(state) {
    return state.sidebarData.reduce((prev, curr) => {
      const prevNum = parseInt(prev, 10);
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
  getLatestParentItem(state) {
    const id = state.parentItems[state.parentItems.length - 1];
    return state.sidebarData.find(item => item.id === id);
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
  addSidebarItem(state, item) {
    // TODO: consider sorting!!
    state.sidebarData.push(item);
  },
  updateEntry(state, obj) {
    // state.currentItem = Object.assign({}, state.currentItem, obj);
    const index = this.getters['data/getCurrentItemIndex'];
    const type = obj.type && obj.type.length ? obj.type[0].type || obj.type[0] : '';
    // TODO: consider sorting!!
    Vue.set(
      state.sidebarData,
      index,
      Object.assign({}, state.currentItem, obj, {
        type,
      }),
    );
    state.currentItem = Object.assign({}, state.sidebarData[index]);
    sessionStorage.setItem('sidebarItems', JSON.stringify(state.sidebarData));
  },
  deleteSidebarItems(state) {
    state.sidebarData = state.sidebarData.filter(item => !state.deletableEntries.includes(item.id));
    sessionStorage.setItem('sidebarItems', JSON.stringify(state.sidebarData));
  },
  sortEntries(state, sortVal) {
    if (sortVal === 'Nach Typ') {
      this.getters['data/getSidebarData'].sort((a, b) => {
        if (a.type > b.type) {
          return 1;
        }
        return -1;
      });
    } else if (sortVal === 'A-Z') {
      this.getters['data/getSidebarData'].sort((a, b) => {
        if (a.title.toLowerCase() > b.title.toLowerCase()) {
          return 1;
        }
        return -1;
      });
    } else if (sortVal === 'Z-A') {
      this.getters['data/getSidebarData'].sort((a, b) => {
        if (a.title.toLowerCase() > b.title.toLowerCase()) {
          return -1;
        }
        return 1;
      });
    }
  },
  filterEntries(state, val) {
    if ((val.prop === 'type' && val.value === 'Alle Typen')
      || (val.prop === 'title' && !val.value)) {
      state.filtered = false;
      state.sidebarDataFiltered = state.sidebarData;
    } else {
      const filteredEntries = state.sidebarData
        .filter(entry => entry[val.prop].toLowerCase().includes(val.value.toLowerCase()));
      state.filtered = true;
      state.sidebarDataFiltered = filteredEntries;
    }
  },
  setOptions(state, val) {
    state.showOptions = val;
  },
  setPopUp(state, data) {
    state.popUp = data;
  },
  hidePopUp(state) {
    state.popUp = {
      show: false,
      header: '',
      text: '',
      icon: '',
      buttonText: '',
    };
  },
  setDeletable(state, entryArr) {
    state.deletableEntries = entryArr;
  },
  duplicateEntries(state, entryArr) {
    entryArr.forEach((id) => {
      const newEntry = state.sidebarData.find(entry => entry.id === id);
      this.dispatch('data/addSidebarItem', newEntry);
    });
    state.showOptions = false;
  },
  setParentItem(state, id) {
    state.parentItems.push(id);
  },
  deleteLastParentItem(state) {
    state.parentItems.pop();
  },
  deleteParentItems(state) {
    state.parentItems = [];
  },
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
  addSidebarItem({ commit }, obj) {
    const type = obj.type || '';
    const newItem = Object.assign({}, obj, {
      type: typeof type === 'object' && type ? type[0].type : type,
      id: (parseInt(this.getters['data/getLastId'], 10) + 1).toString(),
    });
    // TODO: consider sorting!!
    commit('addSidebarItem', newItem);
    commit('setCurrentItem', newItem);
    sessionStorage.setItem('sidebarItems', JSON.stringify(state.sidebarData));
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
