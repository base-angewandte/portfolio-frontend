/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
import Vue from 'vue';
import axios from 'axios';

function transformTextData(data) {
  const textData = [];
  if (data && data.length) {
    data.forEach((textItem) => {
      const textObj = {
        type: textItem.type && typeof textItem.type === 'object'
          ? textItem.type.value : textItem.type || '',
      };
      const text = Object.keys(textItem).filter(props => !['type', 'text', 'data'].includes(props))
        .map(lang => Object.assign({}, {
          language: `${process.env.LANG_URL}${lang}`,
          text: textItem[lang],
        }));
      Vue.set(textObj, 'data', text);
      textData.push(textObj);
    });
  }
  return textData;
}

function prepareData(valueObj) {
  // make necessary modifications to the valueList object
  // 1. type should be string not array
  let { type } = valueObj;
  if (typeof type === 'object') {
    type = type.length ? type[0].type || type[0] : '';
  }
  // 2. texts need different object structure and text type needs to be string (uri)
  const texts = transformTextData(valueObj.texts);
  return Object.assign({}, valueObj, { type, texts });
}

const state = {
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
  // saved here are all the data from linked entries (not just id as in currentItem)
  linkedEntries: [],
  linkedMedia: [],
  formFields: {},
};

const getters = {
  getCurrentItemId() {
    return state.currentItemId;
  },
  getLatestParentItem(state) {
    return state.parentItems[state.parentItems.length - 1];
  },
  getCurrentLinked(state) {
    return state.linkedEntries;
  },
  getLinkedIds(state) {
    return state.linkedEntries.length ? state.linkedEntries.map(entry => entry.to.id)
      : [];
  },
  getCurrentMedia(state) {
    return state.linkedMedia;
  },
  getMediaIds(state) {
    return state.linkedMedia.map(entry => entry.id);
  },
  getFormFields(state) {
    return state.formFields;
  },
};

const mutations = {
  setNewForm(state, val) {
    state.isNewForm = val;
  },
  setCurrentItem(state, obj) {
    state.currentItemId = obj.id;
  },
  deleteCurrentItem(state) {
    state.currentItemId = null;
    state.linkedEntries = [];
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
      buttonTextRight: '',
      buttonTextLeft: '',
      actionRight: undefined,
      actionLeft: undefined,
    };
  },
  setSelected(state, entryArr) {
    state.selectedEntries = [].concat(entryArr);
  },
  setParentItem(state, entry) {
    state.parentItems.push({
      id: entry.id,
      title: entry.title,
      type: entry.type && entry.type.length ? entry.type[0] : '',
    });
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
  setMedia(state, { list, replace }) {
    const existingMedia = replace ? [] : state.linkedMedia;
    state.linkedMedia = [].concat(list, existingMedia);
  },
  deleteMedia(state, list) {
    state.linkedMedia = state.linkedMedia.filter(entry => !list.includes(entry.id));
  },
  setFormFields(state, fields) {
    state.formFields = Object.assign({}, fields);
  },
};

const actions = {
  async fetchGeneralFields({ commit }) {
    return new Promise(async (resolve, reject) => {
      try {
        const jsonSchema = await axios.get(`${process.env.API}swagger.json`,
          {
            withCredentials: true,
          });
        const formFields = jsonSchema.data.definitions.Entry.properties;
        commit('setFormFields', formFields);
        resolve(formFields);
      } catch (e) {
        reject(e);
      }
    });
  },
  async fetchEntryData({ commit, dispatch }, { id }) {
    // TODO: check if entry data could be derived from sidebar data somehow
    const entryData = await this.dispatch('PortfolioAPI/get', { kind: 'entry', id });
    if (entryData) {
      // Modifications of data received from backend needed:
      // 1. type needs to be array in logic here!
      // 2. Text needs to look different (and text type needs to be fetched)
      const textData = entryData.texts && entryData.texts.length
        ? await Promise.all(entryData.texts
          .map(entry => new Promise(async (resolve, reject) => {
            const textObj = {};
            let type = null;
            if (entry.type) {
              try {
                const typeResponse = await axios.get(`${process.env.SKOSMOS_API}portfolio/label`, {
                  params: {
                    uri: entry.type,
                    lang: 'de',
                    format: 'application/json',
                  },
                });
                if (typeResponse.data) {
                  type = { label: typeResponse.data.prefLabel, value: entry.type };
                }
              } catch (e) {
                // TODO: inform user
                console.error(e);
                reject(e);
              }
            }
            // TODO: temporary hack - probably should fetch label for lang as well
            entry.data.forEach((lang) => {
              const langInternal = lang.language.split('/').pop();
              Vue.set(textObj, langInternal.toLowerCase(), lang.text);
            });
            resolve(Object.assign({}, { type }, textObj));
          }))) : [];

      const adjustedEntry = Object.assign({}, entryData, {
        type: entryData.type ? [entryData.type] : [],
        texts: textData,
      });
      commit('setCurrentItem', adjustedEntry);
      commit('setLinked', { list: entryData.relations || [], replace: true });
      await dispatch('fetchMediaData', entryData.id);
      return adjustedEntry;
    }
    return {};
  },
  async fetchMediaData({ commit }, id) {
    // TODO: replace with Portofolio_API
    const res = await axios.get(`${process.env.API}entry/${id}/media/`,
      {
        withCredentials: true,
        xsrfCookieName: 'csrftoken_portfolio',
        xsrfHeaderName: 'X-CSRFToken',
      });
    if (res.data.length) {
      const imageData = await Promise.all(res.data
        .map(imageId => new Promise(async (resolve, reject) => {
          try {
            const result = await axios.get(`${process.env.API}media/${imageId}`,
              {
                withCredentials: true,
                xsrfCookieName: 'csrftoken_portfolio',
                xsrfHeaderName: 'X-CSRFToken',
              });
            resolve(result.data);
          } catch (e) {
            reject();
          }
        })));
      commit('setMedia', { list: imageData, replace: true });
    } else {
      commit('setMedia', { list: [], replace: true });
    }
  },
  addOrUpdateEntry({ commit }, obj) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = prepareData(obj);
        const createdEntry = await this.dispatch('PortfolioAPI/post', { kind: 'entry', id: data.id, data });
        if (createdEntry) {
          commit('setCurrentItem', createdEntry);
        }
        resolve(createdEntry.id);
      } catch (e) {
        reject(e);
      }
    });
  },
  async deleteEntries({ state, commit }) {
    // TODO: user information!!
    const deletedEntries = await Promise.all(state.selectedEntries
      .map(entry => new Promise(async (resolve, reject) => {
        try {
          await this.dispatch('PortfolioAPI/delete', { kind: 'entry', id: entry.id });
          resolve(entry.id);
        } catch (e) {
          console.error(e);
          reject(e);
        }
      })));
    // check if any deleted items are currently displayed in form as linked
    const deletedLinked = state.linkedEntries
      .filter(entry => deletedEntries.includes(entry.to.id));
    if (deletedLinked.length) {
      deletedLinked.forEach(deleted => commit('deleteLinked', deleted.id));
    }
    // TODO: check if deleted was a parent!
    const deletedParents = state.parentItems
      .filter(entry => deletedLinked.includes(entry.id));
    if (deletedParents) {
      commit('deleteParentItems');
    }
  },
  async duplicateEntries({ commit, dispatch }, entryArr) {
    const errorArr = [];
    const addedArr = [];
    await Promise.all(entryArr.map(entry => new Promise(async (resolve) => {
      const newEntry = Object.assign({}, entry);
      const entryTitle = newEntry.title;
      Vue.set(newEntry, 'title', `${newEntry.title} (Copy)`);
      Vue.set(newEntry, 'id', undefined);
      // new entries should not inherit the published state from the duplicate!
      // TODO: in future also not shared state!
      // Vue.set(newEntry, 'shared', false);
      Vue.set(newEntry, 'published', false);
      Vue.set(newEntry, 'linked', []);
      try {
        const createdEntryId = await dispatch('addOrUpdateEntry', newEntry);
        if (createdEntryId) {
          commit('deleteParentItems');
          addedArr.push(createdEntryId);
        }
      } catch (e) {
        errorArr.push(entryTitle);
      }
      resolve();
    })));
    commit('setOptions', false);
    return { routingIds: addedArr, failedTitles: errorArr };
  },
  async modifyEntries({ state, dispatch }, { prop, value }) {
    await Promise.all(state.selectedEntries.map(entry => new Promise(async (resolve, reject) => {
      try {
        const newEntry = await dispatch('addOrUpdateEntry', Object.assign({}, entry, { [prop]: value }));
        resolve(newEntry);
      } catch (e) {
        console.error(e);
        // TODO: error handling! (user info)
        reject();
      }
    })));
  },
  async actionEntries({ commit, dispatch }, action) {
    if (action === 'delete') {
      await dispatch('deleteEntries');
    } else if (action === 'publish') {
      await dispatch('modifyEntries', { prop: 'published', value: true });
    } else if (action === 'offline') {
      await dispatch('modifyEntries', { prop: 'published', value: false });
    }
    commit('setSelected', []);
    commit('hidePopUp');
  },
  fetchInfoBoxData(context, entry) {
    console.log(entry);
    // TODO: fetch info data - from where???
    return { title: 'title' };
  },
  async actionFiles({ state, dispatch }, { list, action, value }) {
    const axiosAction = action === 'delete' ? action : 'patch';

    await Promise.all(list.map(mediaId => new Promise(async (resolve, reject) => {
      const formData = new FormData();
      const id = mediaId.id || mediaId;
      if (action === 'publish' || action === 'offline') {
        formData.append('published', mediaId.selected);
      } else if (action === 'license') {
        formData.append('license', value);
      }
      try {
        if (axiosAction === 'delete') {
          // TODO: replace with Portofolio_API
          await axios[axiosAction](`${process.env.API}media/${id}/`,
            {
              withCredentials: true,
              xsrfCookieName: 'csrftoken_portfolio',
              xsrfHeaderName: 'X-CSRFToken',
            });
        } else {
          // TODO: replace with Portofolio_API
          await axios[axiosAction](`${process.env.API}media/${id}/`,
            formData,
            {
              withCredentials: true,
              xsrfCookieName: 'csrftoken_portfolio',
              xsrfHeaderName: 'X-CSRFToken',
            });
        }

        resolve(id);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    })));
    await dispatch('fetchMediaData', state.currentItemId);
    // TODO: inform user of sucessfully changed items
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
