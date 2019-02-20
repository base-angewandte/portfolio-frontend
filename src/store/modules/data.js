/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
import Vue from 'vue';
import axios from 'axios';

function transformTextData(data) {
  const textData = [];
  if (data && data.length) {
    data.forEach((textItem) => {
      const textObj = { type: textItem.type };
      const text = Object.keys(textItem).filter(props => props !== 'type' && props !== 'text')
        .map(lang => Object.assign({}, {
          language: lang,
          text: textItem[lang],
        }));
      Vue.set(textObj, 'data', text);
      textData.push(textObj);
    });
  }
  return textData;
}


const state = {
  sidebarData: [],
  sidebarDataFiltered: [],
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
  // saved here are all the data from linked entries (not just id as in currentItem)
  linkedEntries: [],
  entriesPerRequest: 50,
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
    return state.sidebarData && state.sidebarData.length
      ? [...new Set(state.sidebarData.map(entry => entry.type))] : [];
  },
  getLatestParentItem(state) {
    const id = state.parentItems[state.parentItems.length - 1];
    return state.sidebarData.find(item => item.id === id);
  },
  getCurrentLinked(state) {
    return state.linkedEntries;
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
  setSidebarData(state, data) {
    state.sidebarData = data;
  },
  deleteCurrentItem(state) {
    state.currentItemId = null;
    state.currentItem = {};
    state.linkedEntries = [];
  },
  // TODO: all sidebar mutations will be uneccesarry since fetch
  // from db will need to be made
  addSidebarItem(state, item) {
    state.sidebarData.push(item);
    // consider filtered entries!
  },
  updateEntry(state, { obj, index }) {
    Vue.set(
      state.sidebarData,
      index,
      Object.assign({}, obj),
    );
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
    // TODO: this will be replaced by request!
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
      } else if (state.sortBy === 'Neueste') {
        data.sort((a, b) => {
          // TODO: consider format!!
          if (new Date(a.date_created) > new Date(b.date_created)) {
            return -1;
          }
          return 1;
        });
      }
      else if (state.sortBy === 'Älteste') {
        data.sort((a, b) => {
          // TODO: consider format!!
          if (new Date(a.date_created) > new Date(b.date_created)) {
            return 1;
          }
          return -1;
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
  setLinked(state, { list, replace }) {
    const existingEntries = replace ? [] : state.linkedEntries;
    state.linkedEntries = [].concat(list, existingEntries);
  },
  deleteLinked(state, list) {
    state.linkedEntries = state.linkedEntries.filter(entry => !list.includes(entry.id));
  },
  setEntriesPerRequest(state, number) {
    state.entriesPerRequest = number;
  },
};

const actions = {
  async fetchSidebarData({ state, commit }, { offset }) {
    const response = await this.dispatch('PortfolioAPI/get', { kind: 'entity', offset, limit: state.entriesPerRequest });
    commit('setSidebarData', response.results);
  },
  async fetchFormExtension(context, type) {
    let formData = {};
    try {
      const extension = await axios.get(`${process.env.API}jsonschema/${type}/`,
        {
          withCredentials: true,
        });
      formData = extension.data.properties;
    } catch (e) {
      console.error(e);
    }
    return formData || [];
  },
  setCurrentItemById({ commit }, id) {
    const entry = this.getters['data/getEntryById'](id);
    if (entry) {
      commit('setCurrentItem', entry);
    }
    commit('setLinked', { list: entry.relations, replace: true });
    return !!entry;
  },
  async fetchEntryData({ commit, state }, id) {
    // update: this causes a delay - better just use existing ones in sidebar
    // when sidebardata are present (not on first load)
    let entryData = {};
    if (!(state.sidebarData && state.sidebarData.length)) {
      entryData = await this.dispatch('PortfolioAPI/get', { kind: 'entity', id });
    } else {
      entryData = this.getters['data/getEntryById'](id);
    }
    if (entryData) {
      // Modifications of data received from backend needed:
      // 1. type needs to be array in logic here!
      // 2. Text needs to look different
      const textData = entryData.texts && entryData.texts.length ? entryData.texts.map((entry) => {
        const textObj = {};
        entry.data.forEach(lang => Vue.set(textObj, lang.language.toLowerCase(), lang.text));
        return Object.assign({}, { type: entry.type }, textObj);
      }) : [];

      commit('setCurrentItem', Object.assign({}, entryData, { type: entryData.type ? [entryData.type] : [], texts: textData }));
      commit('setLinked', { list: entryData.relations, replace: true });
      return state.currentItem;
    }
    return {};
  },
  addSidebarItem({ commit, dispatch }, obj) {
    return new Promise(async (resolve, reject) => {
      try {
        // Modify object back here before saving to database
        // 1. type not array but string
        // 2. text object
        const type = obj.type && obj.type.length ? obj.type : '';
        const data = Object.assign({}, obj, {
          type: typeof type === 'object' ? type[0] : type,
          // check if texts already has the correct form (necessary for duplicated items
          // (transform only needed for form data)
          // TODO: should this be done somewhere else?
          texts: obj.texts && obj.texts.length && obj.texts[0].data
            ? obj.texts : transformTextData(obj.texts),
        });
        const createdEntry = await this.dispatch('PortfolioAPI/post', { kind: 'entity', data });
        if (createdEntry) {
          commit('addSidebarItem', createdEntry);
          dispatch('applyFilters');
          commit('setCurrentItem', createdEntry);
        }
        // also save linked if entries were added
        if (state.linkedEntries.length) {
          const list = state.linkedEntries.map(entry => entry.id);
          await dispatch('actionLinked', { list, action: 'save' });
        }
        resolve(createdEntry.id);
      } catch (e) {
        reject(e);
      }
    });
  },
  updateEntry({ commit }, obj) {
    return new Promise(async (resolve, reject) => {
      try {
        const index = this.getters['data/getCurrentItemIndex'];
        const type = obj.type && obj.type.length ? obj.type[0].type || obj.type[0] : '';
        const modifiedProps = { type, texts: transformTextData(obj.texts) };
        const data = Object.assign({}, obj, modifiedProps);
        const updatedEntry = await this.dispatch('PortfolioAPI/post', { kind: 'entity', id: data.id, data });
        commit('updateEntry', {
          obj: updatedEntry,
          index,
        });
        commit('sort');
        commit('setCurrentItem', updatedEntry);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
  async deleteEntries({ state, dispatch }) {
    await Promise.all(state.selectedEntries.map(id => new Promise(async (resolve, reject) => {
      try {
        const { type } = this.getters['data/getEntryById'](id);
        await this.dispatch('PortfolioAPI/delete', { kind: 'entity', type, id });
        await dispatch('fetchSidebarData', { offset: 0 });
        resolve();
      } catch (e) {
        reject(e);
      }
    })));
  },
  async duplicateEntries({ state, commit, dispatch }, entryArr) {
    const addedArr = await Promise.all(entryArr.map(id => new Promise(async (resolve) => {
      const newEntry = Object.assign({}, state.sidebarData.find(entry => entry.id === id));
      const entryTitle = newEntry.title;
      Vue.set(newEntry, 'title', `${newEntry.title} (Copy)`);
      try {
        const createdEntryId = await dispatch('addSidebarItem', newEntry);
        Vue.notify({
          group: 'request-notifications',
          title: 'Entry duplicated',
          text: `Entry ${entryTitle} was successfully duplicated`,
          type: 'warn',
        });
        resolve(createdEntryId);
      } catch (e) {
        Vue.notify({
          group: 'request-notifications',
          title: 'Entry duplication failed',
          text: `Entry ${entryTitle} could not be duplicated`,
          type: 'warn',
        });
        resolve();
      }
    })));
    commit('setOptions', false);
    return addedArr.length ? addedArr.filter(id => !!id) : [];
  },
  modifyEntries({ state, commit, dispatch }, { prop, value }) {
    try {
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
    } catch (e) {
      // TODO: error handling! (user info)
    }
  },
  sortEntries({ commit }, sortVal) {
    // TODO: replace with db request
    if (sortVal) {
      commit('setSort', sortVal);
    }
    commit('sort');
  },
  filterEntries({ commit, dispatch }, { type, val }) {
    // TODO: replace with db request
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
    // TODO: replace with db request!!
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
  fetchInfoBoxData(context, entry) {
    console.log(entry);
    // TODO: fetch info data - from where???
    return { title: 'title' };
  },
  async actionLinked({ state, commit }, { list, action }) {
    const fromId = state.currentItem.id;
    await Promise.all(list.map(relationId => new Promise(async (resolve, reject) => {
      try {
        if (action === 'save') {
          const data = { from_entity: fromId, to_entity: relationId };
          await this.dispatch('PortfolioAPI/post', { kind: 'relation', data });
        } else if (action === 'delete') {
          await this.dispatch('PortfolioAPI/delete', { kind: 'relation', id: relationId });
        }
        // TODO: notify user? (title would be nice...)
        resolve();
      } catch (e) {
        Vue.notify({
          group: 'request-notifications',
          title: `${action}ing of Entry failed`,
          text: `The Link could not be ${action}: ${e}`,
          type: 'warn',
        });
        reject(e);
      }
    })));
    // fetch entry new to update relations
    try {
      const entry = await this.dispatch('PortfolioAPI/get', { kind: 'entity', id: fromId });
      const index = this.getters['data/getCurrentItemIndex'];
      commit('updateEntry', { obj: entry, index });
      commit('setLinked', { list: entry.relations, replace: true });
    } catch (e) {
      console.error(e);
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
