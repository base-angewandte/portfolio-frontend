/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
import Vue from 'vue';
import axios from 'axios';
import { i18n } from '../../plugins/i18n';

import {
  sorting, capitalizeString, setLangLabels, getApiUrl, hasFieldContent,
} from '../../utils/commonUtils';

function transformTextData(data) {
  const textData = [];
  if (data && data.length) {
    data.forEach((textItem) => {
      const textObj = {};
      // check if type is present
      if (textItem.type && textItem.type.source) {
        Vue.set(textObj, 'type', textItem.type);
      }
      const text = Object.keys(textItem)
        .filter(props => !['type', 'text', 'data'].includes(props))
        .map((lang) => {
          if (textItem[lang]) {
            return Object.assign({}, {
              language: {
                source: `${process.env.LANG_URL}${lang}`,
              },
              text: textItem[lang],
            });
          }
          return null;
        }).filter(Boolean);
      // check if there are texts in any language in the array
      if (text.length) {
        Vue.set(textObj, 'data', text);
      }
      // check if textObj has any content at all
      if (textObj.data
        || (textObj.type && textObj.type.source)) {
        textData.push(textObj);
      }
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
    textTitle: '',
    textList: [],
    icon: '',
    buttonText: '',
    action: null,
    isLoading: false,
  },
  selectedEntries: [],
  // saved here are all the data from linked entries (not just id as in currentItem)
  linkedEntries: [],
  linkedMedia: [],
  // the object properties are named after the respective endpoint!
  prefetchedTypes: {},
  mediaLicensesPath: '',
  // entry types displayed in sidebar
  entryTypes: [],
  generalSchema: {},
  extensionSchema: {},
  isMobile: null,
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
  getPrefetchedTypes: state => (field, source) => {
    if (source === 'source') {
      return state.prefetchedTypes[field];
    }
    const prop = source.replace('source_', '');
    return state.prefetchedTypes[`${field}_${prop}`];
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
    state.linkedMedia = [];
  },
  setOptions(state, val) {
    state.showOptions = val;
  },
  setPopUp(state, data) {
    state.popUp = Object.assign({}, state.popUp, data);
  },
  hidePopUp(state) {
    state.popUp = {
      show: false,
      header: '',
      textTitle: '',
      textList: [],
      icon: '',
      buttonTextRight: '',
      buttonTextLeft: '',
      isLoading: false,
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
  setPrefetchedTypes(state, { field, data, source }) {
    if (source === 'source') {
      Vue.set(state.prefetchedTypes, field, data);
    } else {
      const prop = source.replace('source_', '');
      Vue.set(state.prefetchedTypes, `${field}_${prop}`, data);
    }
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
  setMediaLicensesPath(state, url) {
    state.mediaLicensesPath = url;
  },
  setPopUpLoading(state, val) {
    Vue.set(state.popUp, 'isLoading', val);
  },
  setIsMobile(state, val) {
    state.isMobile = val;
  },
};

const actions = {
  /**
   * fetch the schema of the general fields (first form part) to be able to generate
   * a form. Fetched from actual swagger.json
   *
   * @param commit
   * @param dispatch
   * @returns {Promise<*>}
   */
  async fetchGeneralFields({ commit, dispatch }) {
    return new Promise(async (resolve, reject) => {
      try {
        const jsonSchema = await axios.get(`${process.env.DATABASE_API}swagger.json`,
          {
            withCredentials: true,
            headers: {
              'Accept-Language': i18n.locale,
            },
          });
        const formFields = jsonSchema.data.definitions.Entry.properties;
        // information for media license source is also contained in swagger.json --> extract!
        const mediaPath = jsonSchema.data.paths['/api/v1/media/'].post.parameters
          .find(param => param.name === 'license')['x-attrs'].source;
        commit('setGeneralSchema', formFields);
        commit('setMediaLicensesPath', mediaPath);
        // get fields that should be prefetched
        dispatch('getStaticDropDowns', formFields);
        resolve(formFields);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  },
  /**
   * prefetch dropdowns where there is static content (to only need to fetch once) or that
   * have a certain pre-selection (keywords)
   *
   * @param state
   * @param commit
   * @param getters
   * @param schema: provide the schema (form fields) to know for which fields to prefetch
   * @returns {Promise<void>}
   */
  async getStaticDropDowns({ state, commit, getters }, schema) {
    // get the necessary info for prefetching stored in a variable
    const prefetchFields = Object.keys(schema)
      .map((field) => {
        // store all the x-attrs in a variable
        const attrs = schema[field] ? schema[field]['x-attrs'] : null;
        // check if prefetch properties are set in the x-attrs
        if (attrs && attrs.prefetch && attrs.prefetch.length) {
          return {
            [field]: attrs.prefetch.map(source => ({
              path: attrs[source],
              sourceAttribute: source,
            })),
          };
        }
        return '';
      }).filter(Boolean);
    // special case media licenses (can not be retrieved from form field information)
    if (state.mediaLicensesPath) {
      prefetchFields.push({
        medialicenses: [{
          path: state.mediaLicensesPath,
          sourceAttribute: 'source',
        }],
      });
    }
    // now use the variable to acutally fetch the information
    await Promise.all(prefetchFields.map(field => new Promise(async (resolve, reject) => {
      const [fieldName, sources] = Object.entries(field)[0];
      await Promise.all(sources.map(source => new Promise(async () => {
        const { path, sourceAttribute } = source;
        // check if data are already there, if not fetch info
        if (!getters.getPrefetchedTypes(fieldName, sourceAttribute)) {
          const url = getApiUrl(path);
          try {
            const { data } = await axios
              .get(url, {
                withCredentials: true,
                headers: {
                  'Accept-Language': i18n.locale,
                },
              });
            commit('setPrefetchedTypes', { field: fieldName, data, source: sourceAttribute });
            resolve('x');
          } catch (e) {
            reject(e);
          }
        }
        resolve();
      })));
    })));
  },
  /**
   * function just for fetching the entry types needed for filtering the sidebar
   *
   * @param commit
   * @returns {Promise<void>}
   */
  async fetchEntryTypes({ commit }) {
    // TODO: replace with C. store module!
    try {
      const { data } = await axios.get(`${process.env.DATABASE_API}entry/types/`, {
        withCredentials: true,
        headers: {
          'Accept-Language': i18n.locale,
        },
      });
      const entryTypes = sorting(data, 'label', i18n.locale);
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
  /**
   * fetch all data (incl. linked entries) for a specific entry (by id)
   *
   * @param commit
   * @param dispatch
   * @param id: id of the entry
   * @returns {Promise<*>}
   */
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
                if (entry.data) {
                  entry.data.forEach((language) => {
                    const langInternal = language.language.source.split('/').pop();
                    Vue.set(textObj, langInternal.toLowerCase(), language.text);
                  });
                }
                res(Object.assign({}, { type }, textObj));
              }))) : [];

          const adjustedEntry = Object.assign({}, entryData, {
            type: objectType,
            texts: textData,
          });
          commit('setCurrentItem', adjustedEntry);
          // use linked entry info already provided with response data
          commit('setLinked', { list: entryData.relations || [], replace: true });
          // and also fetch media data
          try {
            dispatch('fetchMediaData', entryData.id);
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
    const res = await axios.get(`${process.env.DATABASE_API}entry/${id}/media/`,
      {
        withCredentials: true,
        xsrfCookieName: 'csrftoken_portfolio',
        xsrfHeaderName: 'X-CSRFToken',
      });
    if (res.data.length) {
      const imageData = await Promise.all(res.data
        .map(imageId => new Promise(async (resolve, reject) => {
          try {
            const result = await axios.get(`${process.env.DATABASE_API}media/${imageId}/`,
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
          // fetch fresh because value list might also contain unsaved changes...
          const entryToUpdate = await this.dispatch('PortfolioAPI/get', { kind: 'entry', id: entry.id });
          await dispatch('addOrUpdateEntry', Object.assign({}, entryToUpdate, { [prop]: value }));
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
          await axios[axiosAction](`${process.env.DATABASE_API}media/${id}/`,
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
          await axios[axiosAction](`${process.env.DATABASE_API}media/${id}/`,
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
      const xAttrs = field ? field['x-attrs'] : {};
      let values = data[key];
      // if the field does not exist in schema = this is not an allowed property -
      // or field (but only json fields not main schema ones!
      // (distinguishable by x-nullable property!)) does not contain any values return
      if (!field || (!field['x-nullable'] && !hasFieldContent(values))) {
        return;
      }
      // special case data - which has separate schema - needs to be checked first since data prop
      // also has hidden prop
      if (key === 'data') {
        const extensionData = await dispatch('removeUnknownProps', { data: values, fields: state.extensionSchema });
        Vue.set(newData, key, extensionData);
        // ignore props that are hidden (except data - see above)
      } else if (xAttrs && xAttrs.hidden) {
        Vue.set(newData, key, values);
        // handle special case texts - needs to be mapped to database schema
      } else if (key === 'texts') {
        // check if transformation is still necessary by checking for data property (only there
        // if data from db (on clone entries)
        const texts = values && values.length
        && (!values[0].data || !values[0].data.length)
          ? transformTextData(values) : [].concat(values);
        Vue.set(newData, key, texts);
        // special case single choice chips (saved as object in backend)
      } else if (xAttrs && xAttrs.field_type && xAttrs.field_type.includes('chips')
        && field.type === 'object') {
        Vue.set(newData, key, values[0] || null);
      } else if (field.type === 'integer') {
        const number = parseInt(values, 10);
        Vue.set(newData, key, !Number.isNaN(number) ? number : 0);
        // check if field is array and values are array values
        // (was neccessary because of published_in)
      } else if (field.type === 'array' && typeof values === 'object') {
        // a check if a group field actually has content - otherwise it is removed
        if (xAttrs && xAttrs.field_type === 'group') {
          values = values.filter(value => hasFieldContent(value));
        }
        // special case chips with unknown entries allowed - we want label set in all languages
        if (field.items.properties.label && field.items.properties.label.type === 'object'
          && xAttrs && xAttrs.allow_unknown_entries) {
          // check for each chip if all languages are set
          values = values.map((value) => {
            const valueLocales = Object.keys(value.label);
            // for some weird reason i can not use env variable directly
            const languages = process.env.LOCALES;
            if (!value.source && valueLocales !== languages) {
              const fieldValue = value.label[valueLocales.find(lang => !!value.label[lang])];
              const newLabelObject = {};

              // add language specific label for all languages if not set from external
              languages.forEach((lang) => {
                Vue.set(newLabelObject, lang, fieldValue);
              });
              Vue.set(value, 'label', newLabelObject);
            }
            return value;
          });
        }
        const arrayValues = await Promise.all(values
          .map(value => dispatch('removeUnknownProps', { data: value, fields: field.items.properties })));
        Vue.set(newData, key, arrayValues || []);
      // check if field is object
      } else if (field.type === 'object' && typeof values === 'object' && !values.length) {
        const validProperties = {};
        // special case languages which is object because of languages but is
        // handled as string here (changed before save)
        if (i18n.locale in field.properties) {
          Vue.set(newData, key, values);
        } else {
          Object.keys(values).forEach(async (valueKey) => {
            // this is needed for Date fields that need to be removed if no value present
            if (!hasFieldContent(values[valueKey])) {
              return;
            }
            const childProps = field.properties[valueKey];
            if (childProps) {
              if (childProps.type === 'object' || (childProps.type === 'array' && childProps.items.properties)) {
                const validatedObj = await dispatch('removeUnknownProps', {
                  data: values[valueKey],
                  fields: field.properties,
                });
                Vue.set(validProperties, valueKey, validatedObj);
              } else {
                Vue.set(validProperties, valueKey, values[valueKey]);
              }
            }
          });
          Vue.set(newData, key, validProperties);
        }
        // check if field type is string and values are actually matching the type
        // (was necessary because of published_in)
      } else if (field.type === 'string' && typeof values === 'string') {
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
