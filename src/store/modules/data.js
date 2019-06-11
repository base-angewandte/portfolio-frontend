/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
import Vue from 'vue';
import axios from 'axios';
import { i18n } from '../../plugins/i18n';

import { sorting, capitalizeString, setLangLabels } from '../../utils/commonUtils';

function transformTextData(data) {
  const textData = [];
  if (data && data.length) {
    data.forEach((textItem) => {
      const textObj = {
        type: textItem.type,
      };
      const text = Object.keys(textItem)
        .filter(props => !['type', 'text', 'data'].includes(props))
        .map(lang => Object.assign({}, {
          language: {
            source: `${process.env.LANG_URL}${lang}`,
          },
          text: textItem[lang],
        }));
      Vue.set(textObj, 'data', text);
      textData.push(textObj);
    });
  }
  return textData;
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
  // the object properties are named after the respective endpoint!
  prefetchedTypes: {
    texttypes: [],
    roles: [],
    languages: [],
    formats: [],
    medialicenses: [],
    softwarelicenses: [],
    keywords: [],
    materials: [],
  },
  // entry types displayed in sidebar
  entryTypes: [],
  generalSchema: {},
  extensionSchema: {},
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
  getPrefetchedTypes: state => field => state.prefetchedTypes[field],
  getEntryTypes(state) {
    return state.entryTypes;
  },
  getGeneralSchema(state) {
    return state.generalSchema;
  },
  getExtensionSchema(state) {
    return state.extensionSchema;
  },
  getObjectTypeLabel(state) {
    return (id) => {
      if (id) {
        return state.formObjectTypes.find(type => type.value === id);
      }
      return '';
    };
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
    state.linkedMedia = [];
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
    // add new list of entries and add a description (for type display)
    state.linkedEntries = [].concat(list.map(entry => Object.assign({}, entry, {
      description: entry.to && entry.to.type && entry.to.type.label
        ? capitalizeString(entry.to.type.label[i18n.locale]) : '',
    })), existingEntries);
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
  setPrefetchedTypes(state, { field, data }) {
    Vue.set(state.prefetchedTypes, field, data);
  },
  setGeneralSchema(state, schema) {
    state.generalSchema = Object.assign({}, schema);
  },
  setExtensionSchema(state, schema) {
    state.extensionSchema = Object.assign({}, schema);
  },
  setEntryTypes(state, data) {
    state.entryTypes = [].concat(data);
  },
};

const actions = {
  async fetchGeneralFields({ commit }) {
    return new Promise(async (resolve, reject) => {
      try {
        const jsonSchema = await axios.get(`${process.env.API}swagger.json`,
          {
            withCredentials: true,
            headers: {
              'Accept-Language': i18n.locale,
            },
          });
        const formFields = jsonSchema.data.definitions.Entry.properties;
        commit('setGeneralSchema', formFields);
        resolve(formFields);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  },
  getStaticDropDowns({ state, getters, commit }) {
    Object.keys(state.prefetchedTypes).forEach(async (field) => {
      if (!getters.getPrefetchedTypes(field).length) {
        const { data } = await axios
          .get(`${process.env.PORTFOLIO_HOST}${process.env.APP_PREFIX}/autosuggest/v1/${field}/`, {
            withCredentials: true,
            headers: {
              'Accept-Language': i18n.locale,
            },
          });
        commit('setPrefetchedTypes', { field, data });
      }
    });
  },
  async fetchEntryTypes({ commit }) {
    // TODO: replace with C. store module!
    try {
      const response = await axios.get(`${process.env.API}entry/types/`, {
        withCredentials: true,
        headers: {
          'Accept-Language': i18n.locale,
        },
      });
      const entryTypes = sorting(response.data, 'label', i18n.locale);
      // add 'all types' option
      entryTypes.unshift({
        label: setLangLabels('dropdown.allTypes', i18n.availableLocales),
        source: '',
      });
      commit('setEntryTypes', entryTypes);
    } catch (e) {
      console.error(e);
      // TODO: inform user?
    }
  },
  async fetchEntryData({ commit, dispatch }, id) {
    return new Promise(async (resolve, reject) => {
      let entryData = {};
      try {
        entryData = await this.dispatch('PortfolioAPI/get', { kind: 'entry', id });
        if (entryData) {
          // Modifications of data received from backend needed:
          // 1. type needs to be array in logic here!
          const objectType = entryData.type && entryData.type.source ? [entryData.type] : [];
          // 2. Text needs to look different
          const textData = entryData.texts && entryData.texts.length
            ? await Promise.all(entryData.texts
              .map(entry => new Promise(async (res) => {
                const textObj = {};
                const { type } = entry;
                // TODO: temporary hack - probably should fetch label for lang as well
                entry.data.forEach((language) => {
                  const langInternal = language.language.source.split('/').pop();
                  Vue.set(textObj, langInternal.toLowerCase(), language.text);
                });
                res(Object.assign({}, { type }, textObj));
              }))) : [];

          const adjustedEntry = Object.assign({}, entryData, {
            type: objectType,
            texts: textData,
          });
          commit('setCurrentItem', adjustedEntry);
          commit('setLinked', { list: entryData.relations || [], replace: true });
          try {
            await dispatch('fetchMediaData', entryData.id);
            resolve(adjustedEntry);
          } catch (e) {
            reject(e);
          }
        }
      } catch (e) {
        reject(e);
      }
      reject();
    });
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
  addOrUpdateEntry({ commit }, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const createdEntry = await this.dispatch('PortfolioAPI/post', { kind: 'entry', id: data.id, data });
        if (createdEntry) {
          commit('setCurrentItem', createdEntry);
        }
        resolve(createdEntry.id);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  },
  async deleteEntries({ state, commit }) {
    const successArr = [];
    const failArr = [];
    await Promise.all(state.selectedEntries
      .map(entry => new Promise(async (resolve) => {
        try {
          await this.dispatch('PortfolioAPI/delete', { kind: 'entry', id: entry.id });
          successArr.push(entry.id);
        } catch (e) {
          console.error(e);
          failArr.push(entry.title);
        } finally {
          resolve();
        }
      })));
    // check if any deleted items are currently displayed in form as linked
    const deletedLinked = state.linkedEntries
      .filter(entry => successArr.includes(entry.to.id));
    if (deletedLinked.length) {
      deletedLinked.forEach(deleted => commit('deleteLinked', deleted.id));
    }
    // check if deleted was a parent
    const deletedParents = state.parentItems
      .filter(entry => deletedLinked.includes(entry.id));
    if (deletedParents) {
      commit('deleteParentItems');
    }
    return [successArr, failArr];
  },
  async duplicateEntries({ commit, dispatch }, entryArr) {
    const errorArr = [];
    const addedArr = [];
    await Promise.all(entryArr.map(entry => new Promise(async (resolve) => {
      const entryTitle = entry.title;
      try {
        // fetch entry fresh from db in case props were not updated before
        // (currently only reloading after save when title or type or publish state change)
        const newEntry = await this.dispatch('PortfolioAPI/get', { kind: 'entry', id: entry.id });
        Vue.set(newEntry, 'title', `${newEntry.title} (Copy)`);
        Vue.set(newEntry, 'id', undefined);
        // new entries should not inherit the published state from the duplicate!
        // TODO: in future also not shared state!
        // Vue.set(newEntry, 'shared', false);
        Vue.set(newEntry, 'published', false);
        Vue.set(newEntry, 'linked', []);
        const createdEntryId = await dispatch('addOrUpdateEntry', newEntry);
        if (createdEntryId) {
          commit('deleteParentItems');
          addedArr.push(createdEntryId);
        }
      } catch (e) {
        errorArr.push(entryTitle);
      } finally {
        resolve();
      }
    })));
    commit('setOptions', false);
    return { routingIds: addedArr, failedTitles: errorArr };
  },
  async modifyEntries({ state, dispatch }, { prop, value }) {
    const successArr = [];
    const failArr = [];
    const noActionArr = [];
    await Promise.all(state.selectedEntries.map(entry => new Promise(async (resolve) => {
      // check if entry needs to be modified or already has requested value
      if (entry[prop] !== value) {
        try {
          await dispatch('addOrUpdateEntry', Object.assign({}, entry, { [prop]: value }));
          successArr.push(entry.id);
        } catch (e) {
          console.error(e);
          failArr.push(entry.title);
        }
      } else {
        noActionArr.push(entry.title);
      }
      resolve();
    })));
    return [successArr, failArr, noActionArr];
  },
  fetchInfoBoxData(context, entry) {
    console.log(entry);
    // TODO: fetch info data - from where???
    return { title: 'title' };
  },
  /**
   * for deleting files or updating metainformation such as license or published state
   * @param context: the store action context
   * @param list: a list of media id's to process
   * @param action: the action to carry out ('delete' | 'license' | 'publish')
   * @param value: value of license to be set (not needed for other actions)
   * @returns {Promise<Array>}
   */
  async actionFiles(context, { list, action, value }) {
    const axiosAction = action === 'delete' ? action : 'patch';
    const successArr = [];
    const errorArr = [];

    await Promise.all(list.map(mediaId => new Promise(async (resolve) => {
      const formData = new FormData();
      const id = mediaId.id || mediaId;
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
          if (action === 'publish') {
            formData.append('published', mediaId.selected);
          } else if (action === 'license') {
            formData.append('license', value.source ? JSON.stringify(value) : null);
          } else {
            console.error('file action unknown');
          }
          // TODO: replace with Portofolio_API
          await axios[axiosAction](`${process.env.API}media/${id}/`,
            formData,
            {
              withCredentials: true,
              xsrfCookieName: 'csrftoken_portfolio',
              xsrfHeaderName: 'X-CSRFToken',
            });
        }
        successArr.push(id);
      } catch (e) {
        console.error(e);
        errorArr.push(id);
      } finally {
        resolve();
      }
    })));
    return [successArr, errorArr];
  },
  async removeUnknownProps({ state, dispatch }, { data, fields }) {
    const newData = {};
    Object.keys(data).forEach(async (key) => {
      const field = fields[key];
      const values = data[key];
      // if the field does not exist in schema = this is not an allowed property - return
      if (!field) {
        return;
      }
      // special case data - which has separate schema - needs to be checked first since data prop
      // also has hidden prop
      if (key === 'data') {
        const extensionData = await dispatch('removeUnknownProps', { data: values, fields: state.extensionSchema });
        Vue.set(newData, key, extensionData);
        // ignore props that are hidden (except data - see above)
      } else if (field['x-attrs'] && field['x-attrs'].hidden) {
        Vue.set(newData, key, values);
        // handle special case texts - needs to be mapped to database schema
      } else if (key === 'texts') {
        const texts = values && values.length
        && (!values[0].data || !values[0].data.length)
          ? transformTextData(values) : [].concat(values);
        Vue.set(newData, key, texts);
        // special case single choice chips (saved as object in backend)
      } else if (field['x-attrs'] && field['x-attrs'].field_type && field['x-attrs'].field_type.includes('chips')
        && field.type === 'object') {
        Vue.set(newData, key, values[0] || {});
      } else if (field.type === 'integer') {
        const number = parseInt(values, 10);
        Vue.set(newData, key, !Number.isNaN(number) ? number : 0);
        // check if field is array
      } else if (field.type === 'array') {
        // check if values are already present and set those if yes
        if (values && values.length) {
          const arrayValues = await Promise.all(values
            .map(value => dispatch('removeUnknownProps', { data: value, fields: field.items.properties })));
          Vue.set(newData, key, arrayValues);
        } else {
          // else return empty array
          Vue.set(newData, key, []);
        }
        // check if field is object
      } else if (field.type === 'object') {
        const validProperties = {};
        // special case languages which is object because of languages but is
        // handled as string here (changed before save)
        if (i18n.locale in field.properties) {
          Vue.set(newData, key, values);
        } else {
          Object.keys(values).forEach(async (valueKey) => {
            if (field.properties[valueKey]) {
              if (field.properties[valueKey].type === 'object' || field.properties[valueKey].type === 'array') {
                const validatedObj = await dispatch('removeUnknownProps', {
                  data: values[valueKey],
                  fields: field.properties,
                });
                this.$set(validProperties, [valueKey], validatedObj);
              } else {
                this.$set(validProperties, [valueKey], values[valueKey]);
              }
            }
          });
          Vue.set(newData, key, validProperties);
        }
      } else {
        Vue.set(newData, key, values);
      }
    });
    return newData;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
