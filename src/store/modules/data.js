/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
import Vue from 'vue';
import axios from 'axios';
import { i18n } from '../../plugins/i18n';

import { capitalizeString } from '../../utils/commonUtils';

function transformTextData(data) {
  const textData = [];
  if (data && data.length) {
    data.forEach((textItem) => {
      const textObj = {
        type: textItem.type && typeof textItem.type === 'object'
          ? textItem.type.source : textItem.type || '',
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

// TODO: this should go to form view component (before save) since this is not relevant
// for duplication!!
function transformKeywords(keywords) {
  return Promise.all(keywords
    .map(keywordEntry => new Promise(async (resolve) => {
      // check if it is a controlled voc keyword and if it is not object
      // already (for duplicates only!!)
      if (keywordEntry.source && typeof keywordEntry.keyword === 'string') {
        const langObj = {};
        const voc = keywordEntry.source.includes('disciplines') ? 'disciplines' : 'basekw';
        await Promise.all(i18n.availableLocales.map(async (locale) => {
          if (locale === i18n.locale) {
            Vue.set(langObj, locale, keywordEntry.keyword);
          } else {
            const { data } = await axios.get(`https://voc.uni-ak.ac.at/skosmos/rest/v1/${voc}/label?lang=${locale}&uri=${keywordEntry.source}`);
            Vue.set(langObj, locale, data.prefLabel);
          }
        }));
        resolve(Object.assign({}, keywordEntry, {
          keyword: langObj,
        }));
      } else if (!keywordEntry.source) {
        resolve(Object.assign({}, keywordEntry, {
          keyword: { [i18n.locale]: keywordEntry.keyword },
        }));
      } else {
        resolve(Object.assign({}, keywordEntry));
      }
    })));
}

async function prepareData(valueObj) {
  // make necessary modifications to the valueList object
  // 1. and 'description' property added for sidebar display needs to be removed before save
  // (needs to be done here since also relevant for duplicate)
  // eslint-disable-next-line
  delete valueObj.description;
  // 2. texts need different object structure and text type needs to be string (uri)
  const texts = transformTextData(valueObj.texts);
  const keywords = await transformKeywords(valueObj.keywords);
  return Object.assign({}, valueObj, { texts, keywords });
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
    licenses: [],
    keywords: [],
    materials: [],
  },
  validObjectTypes: [],
  formObjectTypes: [],
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
  getFormObjectTypes(state) {
    return state.formObjectTypes;
  },
  getValidObjectTypes(state) {
    return state.formObjectTypes;
  },
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
  setPrefetchedTypes(state, { field, data }) {
    Vue.set(state.prefetchedTypes, field, data);
  },
  setFormObjectTypes(state, types) {
    state.formObjectTypes = [].concat(types.filter(type => !!type.prefLabel)
      .map(type => ({
        label: capitalizeString(type.prefLabel.value || type.prefLabel
          .find(label => label.lang === i18n.locale).value),
        value: type.uri,
      })));
  },
  setValidObjectTypes(state, types) {
    state.validObjectTypes = [].concat(types);
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
  async fetchGeneralFields({ state, getters, commit }) {
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
        // if type is present as formfield fetch the available types here
        if (formFields.type) {
          // retrieve valid object types from swagger.json and set variable
          commit('setValidObjectTypes', formFields.type.enum);
          // if object types were not fetched previously do so
          if (!getters.getFormObjectTypes.length) {
            let { data } = await axios
              .get(`${process.env.SKOSMOS_API}potax/data?lang=${i18n.locale}&uri=http://base.uni-ak.ac.at/portfolio/taxonomy/portfolio_taxonomy&format=application/json`);
            // filter so only valid object types remain
            data = data.graph.filter(type => !!type.prefLabel
              && state.validObjectTypes.includes(type.uri));
            commit('setFormObjectTypes', data);
          }
        }
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
      const types = response.data;
      // get the labels for all fetched types
      const typeArr = await Promise.all(types.map(type => new Promise(async (resolve, reject) => {
        try {
          const labelData = await axios.get(`${process.env.SKOSMOS_API}potax/label`, {
            params: {
              uri: type,
              lang: i18n.locale,
              format: 'application/json',
            },
          });
          if (labelData && labelData.data) {
            const option = {
              label: capitalizeString(labelData.data.prefLabel),
              value: labelData.data.uri,
            };
            resolve(option);
          } else {
            resolve();
          }
        } catch (e) {
          console.error(e);
          reject(e);
        }
      })));
      // filter out empty type
      const entryTypes = typeArr.filter(type => !!type);
      // add 'all types' option
      entryTypes.unshift({
        label: i18n.t('dropdown.allTypes'),
        value: '',
      });
      commit('setEntryTypes', entryTypes);
    } catch (e) {
      console.error(e);
      // TODO: inform user?
    }
  },
  async fetchEntryData({ getters, commit, dispatch }, { id, lang }) {
    return new Promise(async (resolve, reject) => {
      let entryData = {};
      try {
        // TODO: check if entry data could be derived from sidebar data somehow
        entryData = await this.dispatch('PortfolioAPI/get', { kind: 'entry', id });
        if (entryData) {
          // Modifications of data received from backend needed:
          // 1. type needs to be array in logic here! and labels need to be translated
          // (for now only type, language still missing)
          // 2. Text needs to look different (and text type needs to be fetched)
          // 3. TODO: fetch role labels (currently only strings tho)
          // 4. keywords: choose right language to display
          let objectType = [];
          // if there is a type fetch the label for the saved uri
          if (entryData.type) {
            // check if object types are present in store and if data can be fetched locally
            if (getters.getFormObjectTypes.length) {
              objectType = [getters.getObjectTypeLabel(entryData.type)];
            } else {
              const { data } = await axios.get(`${process.env.SKOSMOS_API}potax/label`, {
                params: {
                  uri: entryData.type,
                  lang,
                  format: 'application/json',
                },
              });
              objectType = [{ label: capitalizeString(data.prefLabel), value: data.uri }];
            }
          }
          const textData = entryData.texts && entryData.texts.length
            ? await Promise.all(entryData.texts
              .map(entry => new Promise(async (res) => {
                const textObj = {};
                let type = null;
                if (entry.type) {
                  // TODO: fetch locally if possible
                  try {
                    const typeResponse = await axios.get(`${process.env.SKOSMOS_API}povoc/label`, {
                      params: {
                        uri: entry.type,
                        lang,
                        format: 'application/json',
                      },
                    });
                    if (typeResponse.data) {
                      type = {
                        label: capitalizeString(typeResponse.data.prefLabel),
                        value: entry.type,
                      };
                    }
                  } catch (e) {
                    console.error(e);
                    reject(e);
                  }
                }
                // TODO: temporary hack - probably should fetch label for lang as well
                entry.data.forEach((language) => {
                  const langInternal = language.language.split('/').pop();
                  Vue.set(textObj, langInternal.toLowerCase(), language.text);
                });
                res(Object.assign({}, { type }, textObj));
              }))) : [];

          const keywords = entryData.keywords
            .map((keywordEntry) => {
              const keyword = Object.assign({}, keywordEntry.keyword);
              // use current locale to get right label
              let keywordLocaleString = keyword[i18n.locale]
                || keyword[i18n.fallbackLocale];
              // if the label has not entry (e.g. non-cv keywords) try to find other languages
              if (!keywordLocaleString) {
                const locale = i18n.availableLocales
                  .find(availableLocale => !!keyword[availableLocale]);
                keywordLocaleString = keyword[locale];
              }
              return Object.assign({}, keywordEntry, {
                keyword: capitalizeString(keywordLocaleString || keywordEntry.keyword),
              });
            });

          let { contributors } = entryData.data;
          if (contributors) {
            contributors = await Promise.all(contributors
              .map(contributor => new Promise(async (contres) => {
                const tempRoles = await Promise.all(contributor.roles
                  .map(role => new Promise(async (res) => {
                    const labelResponse = await axios.get(`${process.env.SKOSMOS_API}povoc/label`, {
                      params: {
                        uri: role.source,
                        lang,
                        format: 'application/json',
                      },
                    });

                    if (labelResponse.data) {
                      res(Object.assign({}, role, {
                        label: capitalizeString(labelResponse.data.prefLabel),
                      }));
                    }
                    res(role);
                  })));

                contres(Object.assign({}, contributor, { roles: tempRoles }));
              })));
          }

          const adjustedEntry = Object.assign({}, entryData, {
            type: objectType,
            texts: textData,
            keywords,
            data: Object.assign({}, entryData.data, { contributors }),
          });
          commit('setCurrentItem', adjustedEntry);
          await dispatch('setLinkedEntries', { list: entryData.relations || [], replace: true });
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
  async fetchSidebarTypes({ getters }, list) {
    const newList = [];
    if (list.length) {
      if (getters.getFormObjectTypes.length) {
        list.forEach((entry) => {
          const type = entry.type || entry.to ? entry.type || entry.to.type : '';
          newList.push(Object.assign({}, entry, {
            description: getters.getObjectTypeLabel(type).label || '',
          }));
        });
      } else {
        try {
          await Promise.all(list.map(entry => new Promise(async (resolve) => {
            if (entry.type) {
              const { data } = await axios.get(`${process.env.SKOSMOS_API}potax/label`, {
                params: {
                  uri: entry.type || entry.to.type,
                  lang: i18n.locale,
                  format: 'application/json',
                },
              });
              newList.push(Object.assign({}, entry, {
                description: capitalizeString(data.prefLabel),
              }));
            } else {
              newList.push(Object.assign({}, entry));
            }
            resolve();
          })));
        } catch (e) {
          return [].concat(list);
        }
      }
    }
    return newList;
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
        const data = await prepareData(obj);
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
            formData.append('license', value);
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
  async setLinkedEntries({ commit, dispatch }, { list, replace }) {
    const modifiedList = await dispatch('fetchSidebarTypes', list);
    commit('setLinked', { list: modifiedList, replace });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
