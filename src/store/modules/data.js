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
    action: '',
  },
  selectedEntries: [],
  filtered: false,
  sortBy: '',
  filterType: '',
  filterExpr: '',
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
    state.sidebarData.push(item);
    // consider filtered entries!
  },
  updateEntry(state, { obj, index, type }) {
    Vue.set(
      state.sidebarData,
      index,
      Object.assign({}, state.currentItem, obj, {
        type,
      }),
    );
  },
  deleteSidebarItems(state) {
    state.sidebarData = state.sidebarData.filter(item => !state.selectedEntries.includes(item.id));
    sessionStorage.setItem('sidebarItems', JSON.stringify(state.sidebarData));
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
      action: '',
    };
  },
  setFiltered(state, val) {
    state.filtered = val;
  },
  setSort(state, val) {
    state.sortBy = val;
  },
  setFilterType(state, val) {
    if (val) {
      state.filterType = val;
    } else {
      state.filterType = '';
    }
  },
  setFilterExpression(state, val) {
    state.filterExpr = val;
  },
  sort(state) {
    const data = state.filtered ? state.sidebarDataFiltered : state.sidebarData;
    if (data.length) {
      if (state.sortBy === 'Nach Typ') {
        data.sort((a, b) => {
          if (a.type > b.type) {
            return 1;
          }
          return -1;
        });
      } else if (state.sortBy === 'A-Z') {
        data.sort((a, b) => {
          if (a.title.toLowerCase() > b.title.toLowerCase()) {
            return 1;
          }
          return -1;
        });
      } else if (state.sortBy === 'Z-A') {
        data.sort((a, b) => {
          if (a.title.toLowerCase() > b.title.toLowerCase()) {
            return -1;
          }
          return 1;
        });
      }
    }
  },
  setFilteredSidebarData(state, val) {
    state.sidebarDataFiltered = val || [];
  },
  setSelected(state, entryArr) {
    state.selectedEntries = entryArr;
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
    return DATA.FORM_MAPPINGS[commonType] || [];
  },
  setCurrentItemById({ commit }, id) {
    const entry = this.getters['data/getEntryById'](id);
    if (entry) {
      commit('setCurrentItem', entry);
    }
    return !!entry;
  },
  addSidebarItem({ commit, dispatch }, obj) {
    const type = obj.type && obj.type.length ? obj.type : '';
    const newItem = Object.assign({}, obj, {
      type: typeof type === 'object' ? type[0].type : type,
      id: (parseInt(this.getters['data/getLastId'], 10) + 1).toString(),
    });
    commit('addSidebarItem', newItem);
    dispatch('applyFilters');
    commit('setCurrentItem', newItem);
    sessionStorage.setItem('sidebarItems', JSON.stringify(state.sidebarData));
  },
  updateEntry({ state, commit, dispatch }, obj) {
    // state.currentItem = Object.assign({}, state.currentItem, obj);
    const index = this.getters['data/getCurrentItemIndex'];
    const type = obj.type && obj.type.length ? obj.type[0].type || obj.type[0] : '';
    commit('updateEntry', { obj, index, type });
    commit('sort');
    dispatch('setCurrentItemById', obj.id);
    sessionStorage.setItem('sidebarItems', JSON.stringify(state.sidebarData));
  },
  duplicateEntries({ state, commit }, entryArr) {
    entryArr.forEach((id) => {
      const newEntry = state.sidebarData.find(entry => entry.id === id);
      this.dispatch('data/addSidebarItem', newEntry);
    });
    commit('setOptions', false);
  },
  modifyEntries({ state, commit, dispatch }, { prop, value }) {
    state.selectedEntries.forEach((e) => {
      const obj = state.sidebarData.find(o => o.id === e);
      const index = state.sidebarData.indexOf(obj);
      if (index >= 0) {
        commit('updateEntry', { obj: Object.assign({}, state.sidebarData[index], { [prop]: value }), index, type: obj.type });
      }
      if (obj.id === state.currentItemId) {
        dispatch('setCurrentItemById', obj.id);
      }
    });
  },
  sortEntries({ commit }, sortVal) {
    if (sortVal) {
      commit('setSort', sortVal);
    }
    commit('sort');
  },
  filterEntries({ commit, dispatch }, { type, val }) {
    if (type === 'type') {
      if (val === 'Alle Typen') {
        commit('setFilterType');
      } else {
        commit('setFilterType', val);
      }
    } else if (type === 'title') {
      commit('setFilterExpression', val);
    }
    dispatch('applyFilters');
  },
  applyFilters({ state, commit, dispatch }) {
    let filteredEntries = [].concat(state.sidebarData);
    if (filteredEntries.length) {
      if (state.filterExpr) {
        filteredEntries = filteredEntries
          .filter(entry => entry.title.toLowerCase()
            .includes(state.filterExpr.toLowerCase()));
      }
      if (state.filterType) {
        filteredEntries = filteredEntries
          .filter(entry => entry.type === state.filterType);
      }
    }
    commit('setFiltered', !!(state.filterExpr || state.filterType));
    commit('setFilteredSidebarData', filteredEntries);
    dispatch('sortEntries');
  },
  actionEntries({ commit }, { action, entries }) {
    let actionText = 'löschen';
    if (action === 'publish') {
      actionText = 'veröffentlichen';
    } else if (action === 'offline') {
      actionText = 'entfernen';
    }
    commit('setSelected', entries);
    const titles = [];
    entries.forEach((entryId) => {
      const entry = this.getters['data/getEntryById'](entryId);
      if (entry && entry.title) {
        titles.push(entry.title);
      }
    });
    commit('setPopUp', {
      show: true,
      header: `${titles.length > 1 ? 'Einträge' : 'Eintrag'} ${actionText}?`,
      text: `Wollen Sie ${titles.length > 1 ? 'diese Einträge' : 'diesen Eintrag'} wirklich
          ${action === 'offline' ? 'aus Showroom' : ''} ${actionText}:<br>${titles.join(',<br>')}`,
      icon: action === 'delete' ? 'waste-bin' : 'eye',
      buttonText: `${titles.length > 1 ? 'Einträge' : 'Eintrag'} ${actionText}`,
      action,
    });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
