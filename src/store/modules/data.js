/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
import Vue from 'vue';
import axios from 'axios';
import { i18n } from '@/plugins/i18n';
import {
  sorting, capitalizeString, setLangLabels, getApiUrl, hasFieldContent, toTitleString,
} from '@/utils/commonUtils';

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
        .filter((props) => !['type', 'text', 'data'].includes(props))
        .map((lang) => {
          if (textItem[lang]) {
            return {
              language: {
                source: `${process.env.VUE_APP_LANG_URL}${lang}`,
              },
              text: textItem[lang],
            };
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

function checkForLabel(value) {
  let newValue = value;
  // check if value is array or object
  if (newValue && typeof value === 'object') {
    // check if value is array
    if (newValue.length) {
      newValue = newValue.map((entry) => checkForLabel(entry));
    } else if (Object.keys(newValue).length) {
      if (Object.keys(newValue).includes('label') && newValue.label.en) {
        Vue.set(newValue, 'label', { ...newValue.label, ...{ en: toTitleString(newValue.label.en) } });
      }
      newValue = Object.entries(newValue)
        .reduce((prev, [propKey, propValue]) => ({
          ...prev,
          ...{ [propKey]: checkForLabel(propValue) },
        }), {});
    }
  }
  return newValue;
}

function addEnglishTextStyling(object) {
  return Object.entries(object).reduce((prev, [key, value]) => {
    const { title } = value;
    const { placeholder } = value['x-attrs'] && value['x-attrs'].placeholder ? value['x-attrs'] : { placeholder: '' };
    if (value['x-attrs'] && value['x-attrs'].field_type === 'group') {
      const alteredGroupFields = addEnglishTextStyling(value.items.properties);
      Vue.set(value.items, 'properties', alteredGroupFields);
    }
    return {
      ...prev,
      ...{
        [key]: {
          ...value,
          ...{
            title: title ? toTitleString(title) : '',
            'x-attrs': {
              ...value['x-attrs'],
              ...{
                placeholder: typeof placeholder === 'string' ? toTitleString(placeholder)
                  : Object.entries(placeholder)
                    .reduce((placeholderPrev, [placeholderKey, placeholderVal]) => ({
                      ...placeholderPrev,
                      ...{ [placeholderKey]: toTitleString(placeholderVal) },
                    }), {}),
              },
            },
          },
        },
      },
    };
  }, {});
}

async function adjustEntry(entryData) {
  // Modifications of data received from backend needed:
  // 1. adapt english style casing
  const entryObj = Object.entries(entryData).reduce((prev, [key, value]) => {
    const newVal = checkForLabel(value);
    return { ...prev, ...{ [key]: newVal } };
  }, {});
    // 2. type needs to be array in logic here!
  const objectType = entryData.type && entryData.type.source ? [entryData.type] : [];
  // 3. Text needs to look different
  const textData = entryData.texts && entryData.texts.length
    ? await Promise.all(entryData.texts
      .map((entry) => {
        const textObj = {};
        const { type } = entry;
        // TODO: temporary hack - probably should fetch label for lang as well
        if (entry.data) {
          entry.data.forEach((language) => {
            const langInternal = language.language.source.split('/').pop();
            Vue.set(textObj, langInternal.toLowerCase(), language.text);
          });
        }
        return ({ type, ...textObj });
      })) : [];
  return {
    ...entryObj,
    type: objectType,
    texts: textData,
  };
}

const state = {
  currentItemId: null,
  // This is the most recently saved entry data in a format that BaseForm understands.
  // Be aware that this structure is slightly different from the "raw" one received from backend.
  currentItemData: null,
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
  linkedParents: [],
  linkedMedia: [],
  // the object properties are named after the respective endpoint!
  prefetchedTypes: {},
  mediaLicensesPath: '',
  // entry types displayed in sidebar
  entryTypes: [],
  generalSchema: {},
  extensionSchema: {},
  windowWidth: null,
  // the status code returned by the back-end API after attempt to validate archival data
  archivalValidationOutcome: null,
  // the status code returned by the back-end API after attempt to update archived data
  archivalUpdateOutcome: null,
  // stores archival errors received from backend,
  // this property is populated only when archivalValidationOutcome=400
  archivalErrors: {},
  // true if the user has accepted the archival licensing agreement, false otherwise
  archiveMediaConsent: false,
  // stores whether the currently loaded form is saved
  isFormSaved: true,
  // true if there is an in progress save operation on the main form
  isFormSaving: false,
  // true when the long-term archival operation is in progress
  isArchivalBusy: false,
  // true if the validation for archival operation is currently in progress
  isValidatingForArchival: false,
  // stores media asset IDs where an asynchronous archival operation is in progress
  archivingMedia: [],
  // true if the "Update Archive" button was clicked and the update has no outcome yet;
  // this becomes false if the update succeeds, or fails, or is cancelled by the user
  isArchiveUpdate: false,
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
    return state.linkedEntries.length ? state.linkedEntries.map((entry) => entry.to.id)
      : [];
  },
  getCurrentMedia(state) {
    return state.linkedMedia;
  },
  getLinkedParents(state) {
    return state.linkedParents;
  },
  getMediaIds(state) {
    return state.linkedMedia.map((entry) => entry.id);
  },
  getPrefetchedTypes: (state) => (field, source) => {
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
        return state.formObjectTypes.find((type) => type.value === id);
      }
      return '';
    };
  },
  getCurrentItemData(state) {
    return state.currentItemData;
  },
  getArchivalValidationOutcome(state) {
    return state.archivalValidationOutcome;
  },
  getArchivalUpdateOutcome(state) {
    return state.archivalUpdateOutcome;
  },
  getArchivalErrors(state) {
    return state.archivalErrors;
  },
  getIsFormSaved(state) {
    return state.isFormSaved;
  },
  getIsFormSaving(state) {
    return state.isFormSaving;
  },
  getArchiveMediaConsent(state) {
    return state.archiveMediaConsent;
  },
  getIsArchivalBusy(state) {
    return state.isArchivalBusy;
  },
  getIsValidatingForArchival(state) {
    return state.isValidatingForArchival;
  },
  getArchivingMedia(state) {
    return state.archivingMedia;
  },
  getIsArchiveUpdate(state) {
    return state.isArchiveUpdate;
  },
};

const mutations = {
  setNewForm(state, val) {
    state.isNewForm = val;
  },
  setCurrentItemId(state, obj) {
    state.currentItemId = obj.id;
  },
  setCurrentItemData(state, obj) {
    state.currentItemData = JSON.parse(JSON.stringify(obj));
  },
  deleteCurrentItem(state) {
    state.currentItemId = null;
    state.currentItemData = null;
    state.linkedEntries = [];
    state.linkedMedia = [];
    state.linkedParents = [];
  },
  setOptions(state, val) {
    state.showOptions = val;
  },
  setPopUp(state, data) {
    state.popUp = { ...state.popUp, ...data };
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
    state.linkedEntries = [].concat(list.map((entry) => ({
      ...entry,
      description: entry.to && entry.to.type && entry.to.type.label
        ? capitalizeString(entry.to.type.label[i18n.locale]) : '',
    })), existingEntries);
  },
  setLinkedParents(state, { list }) {
    if (list.length) {
      // add new list of entries and add a description (for type display)
      state.linkedParents = [].concat(list.map((entry) => ({
        ...entry,
        description: entry.parent && entry.parent.type && entry.parent.type.label
          ? capitalizeString(entry.parent.type.label[i18n.locale]) : '',
      })));
    } else {
      state.linkedParents = [];
    }
  },
  deleteLinked(state, list) {
    state.linkedEntries = state.linkedEntries.filter((entry) => !list
      .map((deleted) => deleted.id).includes(entry.id));
  },
  deleteLinkedParent(state, list) {
    state.linkedParents = state.linkedParents.filter((entry) => !list
      .map((deleted) => deleted.id).includes(entry.id));
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
    state.generalSchema = { ...schema };
  },
  setExtensionSchema(state, schema) {
    state.extensionSchema = { ...schema };
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
  setWindowWidth(state, val) {
    state.windowWidth = val;
  },
  setIsFormSaved(state, val) {
    state.isFormSaved = val;
  },
  setIsFormSaving(state, val) {
    state.isFormSaving = val;
  },
  setArchiveMediaConsent(state, val) {
    state.archiveMediaConsent = val;
  },
  setArchivalValidationOutcome(state, val) {
    state.archivalValidationOutcome = val;
  },
  setArchivalUpdateOutcome(state, val) {
    state.archivalUpdateOutcome = val;
  },
  setArchivalErrors(state, obj) {
    state.archivalErrors = obj;
  },
  setIsArchivalBusy(state, val) {
    state.isArchivalBusy = val;
  },
  setIsValidatingForArchival(state, val) {
    state.isValidatingForArchival = val;
  },
  setArchivingMedia(state, list) {
    state.archivingMedia = list;
  },
  /**
   * This mutation updates the list of media asset IDs
   * submitted for archival but not yet archived (#1495).
  */
  updateArchivingMedia(state) {
    // get all currently archived media IDs
    const archivedMediaIDs = state.linkedMedia
      .filter((entry) => entry.archive_URI)
      .map((entry) => entry.id);
    // create a deep clone of the archivingMedia array
    const updatedIDs = JSON.parse(JSON.stringify(state.archivingMedia));
    // if *archived* IDs include any of the *archiving* IDs, remove the latter from the store
    state.archivingMedia.forEach((id) => {
      if (archivedMediaIDs.includes(id)) {
        updatedIDs.pop(id);
      }
    });
    state.archivingMedia = updatedIDs;
  },
  setIsArchiveUpdate(state, val) {
    state.isArchiveUpdate = val;
  },
};

const portfolioApiUrl = `${process.env.VUE_APP_BACKEND_BASE_URL}${process.env.VUE_APP_BACKEND_PREFIX}${process.env.VUE_APP_BACKEND_API_PATH}`;

const actions = {
  async init({ dispatch }) {
    dispatch('fetchGeneralFields');
  },
  /**
   * fetch the schema of the general fields (first form part) to be able to generate
   * a form. Fetched from actual swagger.json
   *
   * @param commit
   * @param dispatch
   * @returns {Promise<*>}
   */
  async fetchGeneralFields({ commit, dispatch }) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const jsonSchema = await axios.get(`${portfolioApiUrl}swagger.json`,
          {
            withCredentials: true,
            headers: {
              'Accept-Language': i18n.locale,
            },
          });
        const formFields = addEnglishTextStyling(jsonSchema.data.definitions.Entry.properties);
        // information for media license source is also contained in swagger.json --> extract!
        const mediaPath = jsonSchema.data.paths['/api/v1/media/'].post.parameters
          .find((param) => param.name === 'license')['x-attrs'].source;
        commit('setGeneralSchema', formFields);
        commit('setMediaLicensesPath', mediaPath);
        // get fields that should be prefetched
        dispatch('getStaticDropDowns', formFields);
        resolve(formFields);
      } catch (e) {
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
            [field]: attrs.prefetch.map((source) => ({
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
    // eslint-disable-next-line no-async-promise-executor
    await Promise.all(prefetchFields.map((field) => new Promise(async (resolve, reject) => {
      const [fieldName, sources] = Object.entries(field)[0];
      // eslint-disable-next-line no-async-promise-executor
      await Promise.all(sources.map((source) => new Promise(async () => {
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
            // transform the en text style
            const casedData = data.map((entry) => {
              const newEnLabel = entry.label && entry.label.en ? toTitleString(entry.label.en) : {};
              return ({
                ...entry,
                ...{
                  label: {
                    ...entry.label,
                    ...{ en: newEnLabel },
                  },
                },
              });
            });
            commit('setPrefetchedTypes', { field: fieldName, data: casedData, source: sourceAttribute });
            resolve();
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
      const { data } = await axios.get(`${portfolioApiUrl}entry/types/`, {
        withCredentials: true,
        headers: {
          'Accept-Language': i18n.locale,
        },
      });
      // remove duplicates (by source), sort the results and add title casing to
      // english label string
      const entryTypes = sorting(data
        // check if type actually contains any properties since case of empty
        // object being returned already happened and just safe guarding anyway
        .filter((type, index, self) => Object.keys(type).length && self.map((entry) => entry.source)
          .indexOf(type.source) === index), 'label', i18n.locale)
        .map((type) => ({
          ...type,
          ...{
            label: { ...type.label, ...{ en: toTitleString(type.label.en) } },
          },
        }));
      // add 'all types' option
      entryTypes.unshift({
        label: setLangLabels('dropdown.allTypes', i18n.availableLocales),
        source: '',
      });
      commit('setEntryTypes', entryTypes);
    } catch (e) {
      if (!e || !e.response || e.response.status !== 403) {
        console.error(e);
        // TODO: inform user?
      }
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
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      let entryData = {};
      try {
        entryData = await this.dispatch('PortfolioAPI/get', { kind: 'entry', id });
        if (entryData) {
          // this adjustment is necessary to be able to
          // populate a BaseForm with existing values like 'texts'
          const adjustedEntry = await adjustEntry(entryData);
          commit('setCurrentItemId', adjustedEntry);
          commit('setCurrentItemData', adjustedEntry);
          // use linked entry info already provided with response data
          commit('setLinked', { list: entryData.relations || [], replace: true });
          // and also fetch media data if flag set true
          if (entryData.has_media) {
            try {
              dispatch('fetchMediaData', entryData.id);
            } catch (e) {
              reject(e);
            }
          } else {
            commit('setMedia', { list: [], replace: true });
          }
          // also set parents if there are any
          commit('setLinkedParents', { list: entryData.parents });
          resolve(adjustedEntry);
        }
      } catch (e) {
        reject(e);
      }
      resolve();
    });
  },
  async fetchMediaData({ commit }, id) {
    // TODO: replace with Portofolio_API
    const { data } = await axios.get(`${portfolioApiUrl}entry/${id}/media/?detailed=true`,
      {
        withCredentials: true,
        xsrfCookieName: 'csrftoken_portfolio',
        xsrfHeaderName: 'X-CSRFToken',
      });
    if (data.length) {
      commit('setMedia', { list: data, replace: true });
    } else {
      commit('setMedia', { list: [], replace: true });
    }
    //  if there are media IDs submitted for archival but not confirmed as archived yet
    if (state.archivingMedia.length > 0) {
      commit('updateArchivingMedia');
    }
  },
  addOrUpdateEntry({ commit }, data) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const createdEntry = await this.dispatch('PortfolioAPI/post', { kind: 'entry', id: data.id, data });
        if (createdEntry) {
          commit('setCurrentItemId', createdEntry);
          // this adjustment is necessary to be able to
          // populate a BaseForm with existing values like 'texts'
          const adjustedEntry = await adjustEntry(createdEntry);
          commit('setCurrentItemData', adjustedEntry);
          commit('setIsFormSaved', true);
        }
        resolve(createdEntry.id);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  },
  async deleteEntries({ state, commit, dispatch }) {
    const successArr = [];
    const failArr = [];
    await Promise.all(state.selectedEntries
      // eslint-disable-next-line no-async-promise-executor
      .map((entry) => new Promise(async (resolve) => {
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
    // fetch types list anew in case no entries with contained types are
    // left after delete
    dispatch('fetchEntryTypes');
    // check if any deleted items are currently displayed in form as linked
    const deletedLinked = state.linkedEntries
      .filter((entry) => successArr.includes(entry.to.id));
    // check if any deleted entries are currenly displayed as parent entries
    const deletedLinkedParents = state.linkedParents
      .filter((entry) => successArr.includes(entry.parent.id));
    if (deletedLinked.length) {
      commit('deleteLinked', deletedLinked);
    }
    if (deletedLinkedParents.length) {
      commit('deleteLinkedParent', deletedLinkedParents);
    }
    // check if deleted was a parent (displayed in header row)
    const deletedParents = state.parentItems
      .filter((entry) => deletedLinked.includes(entry.id));
    if (deletedParents) {
      commit('deleteParentItems');
    }
    return [successArr, failArr];
  },
  async duplicateEntries({ commit, dispatch }, entryArr) {
    const errorArr = [];
    const addedArr = [];
    // eslint-disable-next-line no-async-promise-executor
    await Promise.all(entryArr.map((entry) => new Promise(async (resolve) => {
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
        if (axios.isCancel(e)) {
          console.warn(e.message);
        }
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
    // eslint-disable-next-line no-async-promise-executor
    await Promise.all(state.selectedEntries.map((entry) => new Promise(async (resolve) => {
      // check if entry needs to be modified or already has requested value
      if (entry[prop] !== value) {
        try {
          // fetch fresh because value list might also contain unsaved changes...
          const entryToUpdate = await this.dispatch('PortfolioAPI/get', { kind: 'entry', id: entry.id });
          await dispatch('addOrUpdateEntry', { ...entryToUpdate, [prop]: value });
          successArr.push(entry.id);
        } catch (e) {
          if (axios.isCancel(e)) {
            console.warn(e.message);
          } else {
            console.error(e);
          }
          failArr.push(entry.title);
        }
      } else {
        noActionArr.push(entry.title);
      }
      resolve();
    })));
    return [successArr, failArr, noActionArr];
  },
  fetchInfoBoxData() {
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
    if (action === 'archiveMedia') return context.dispatch('archiveFiles', list);
    // eslint-disable-next-line no-async-promise-executor
    await Promise.all(list.map((mediaId) => new Promise(async (resolve) => {
      const formData = new FormData();
      const id = mediaId.id || mediaId;
      try {
        if (axiosAction === 'delete') {
          // TODO: replace with Portofolio_API
          await axios[axiosAction](`${portfolioApiUrl}media/${id}/`,
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
          await axios[axiosAction](`${portfolioApiUrl}media/${id}/`,
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
  /**
   * Send request to backend to submit files for archival.
   * @param {Object} param0
   * @param {Array} list Media asset IDs to be submitted for archival.
   * @returns {Array} A result array containing two other arrays
   * (1) IDs of media assets successfully submitted for archival
   * (2) IDs of media assets that failed submission
   */
  async archiveFiles({ state, dispatch, commit }, list) {
    let successArr = [];
    let errorArr = [];
    const media = list.join(',');
    try {
      // start showing busy state
      commit('setIsArchivalBusy', true);
      await axios.get(`${portfolioApiUrl}archive_assets/media/${media}/`,
        {
          withCredentials: true,
          xsrfCookieName: 'csrftoken_portfolio',
          xsrfHeaderName: 'X-CSRFToken',
          headers: {
            'Accept-Language': i18n.locale,
          },
        });
      // update the state to indicate that media assets are submitted for archival
      commit('setArchivingMedia', list);
      // re-fetch entry data since it now contains the archive URI of the entry
      // (which we need to display the "View in Archive" button immediately)
      await dispatch('fetchEntryData', state.currentItemId);
      successArr = list;
    } catch (e) {
      console.error(e);
      errorArr = list;
    } finally {
      // Revoke archival consent after each archival attempt;
      // this ensures that the user cannot send repeated requests
      // without seeing the wizard with the licensing agreement first.
      commit('setArchiveMediaConsent', false);
      // stop showing busy state
      commit('setIsArchivalBusy', false);
    }
    return [successArr, errorArr];
  },
  /**
   * Validate archival data against the backend and update store with the outcome.
   * @param context
   * @param mediaIds Media asset IDs of the entry to be validated.
   */
  async validateArchivalData(context, mediaIds) {
    try {
      // change state to indicate a long in-progress task
      context.commit('setIsValidatingForArchival', true);
      // prepare the url param
      const param = mediaIds.join(',');
      // await the validation response from the api
      await axios.get(`${portfolioApiUrl}validate_assets/media/${param}/`,
        {
          withCredentials: true,
          xsrfCookieName: 'csrftoken_portfolio',
          xsrfHeaderName: 'X-CSRFToken',
          headers: {
            'Accept-Language': i18n.locale,
          },
        });
      // if status code is in range 200-299
      context.commit('setArchivalValidationOutcome', 200);
      context.commit('setArchivalErrors', {});
    } catch (e) {
      // on status code >= 300
      if (e.response && e.response.status) {
        switch (e.response.status) {
        case 400:
          // There are validation errors, update the store accordingly
          context.commit('setArchivalValidationOutcome', 400);
          context.commit('setArchivalErrors', e.response.data);
          break;
        case 500:
          // This status indicates data integrity errors on server
          context.commit('setArchivalValidationOutcome', 500);
          break;
        case 503:
          // Service is unavailable
          context.commit('setArchivalValidationOutcome', 503);
          break;
        default:
          // On any other unhandled status code
          console.error(e.response.status);
        }
      } else {
        console.error(e);
      }
    } finally {
      // update state to indicate the end of the long in-progress task
      context.commit('setIsValidatingForArchival', false);
    }
  },
  /**
   * Send request to backend to update an entry's metadata in remote archive.
   * @param {*} context
   * @param {*} entryId ID of the entry whose metadata is to be updated.
   */
  async updateArchive(context) {
    try {
      // change state to indicate a long in-progress task
      context.commit('setIsArchivalBusy', true);
      // await the response from the api
      await axios.put(`${portfolioApiUrl}archive/?entry=${state.currentItemId}/`,
        {
          withCredentials: true,
          xsrfCookieName: 'csrftoken_portfolio',
          xsrfHeaderName: 'X-CSRFToken',
          headers: {
            'Accept-Language': i18n.locale,
          },
        });
      // if status code is in range 200-299
      context.commit('setArchivalUpdateOutcome', 200);
      context.commit('setArchivalErrors', {});
    } catch (e) {
      // on status code >= 300
      if (e.response && e.response.status) {
        switch (e.response.status) {
        case 400:
          // There are validation errors, update the store accordingly
          context.commit('setArchivalUpdateOutcome', 400);
          context.commit('setArchivalErrors', e.response.data);
          break;
        case 500:
          // This status indicates data integrity errors on server
          context.commit('setArchivalUpdateOutcome', 500);
          break;
        case 503:
          // Service is unavailable
          context.commit('setArchivalUpdateOutcome', 503);
          break;
        default:
          // On any other unhandled status code
          context.commit('setArchivalUpdateOutcome', e.response.status);
          console.error(e.response.status);
        }
      } else {
        console.error(e);
      }
    } finally {
      // update state to indicate the end of the long in-progress task
      context.commit('setIsArchivalBusy', false);
    }
  },
  async removeUnknownProps({ state, dispatch }, { data, fields }) {
    const newData = {};
    await Promise.all(Object.keys(data).map(async (key) => {
      const field = fields[key];
      const xAttrs = field ? field['x-attrs'] : {};
      let values = JSON.parse(JSON.stringify(data[key]));
      // if the field does not exist in schema = this is not an allowed property -
      // or field (but only json fields not main schema ones!
      // (distinguishable by x-nullable property!)) does not contain any values return
      if (!field || (!field['x-nullable'] && !hasFieldContent(values))) {
        return;
      }
      // adding of roles is also done here... (probably more performant anyway
      // to only add ONCE before saving not whenever a value is changed)
      if (xAttrs && xAttrs.equivalent === 'contributors') {
        const fieldRole = state.prefetchedTypes.contributors_role
          .find((role) => role.source === xAttrs.default_role);
        values.forEach((contributor, index) => {
          if (typeof contributor === 'string') {
            Vue.set(values, index, { label: contributor, roles: [fieldRole] });
          } else {
            Vue.set(values, index, { ...contributor, ...{ roles: [fieldRole] } });
          }
        });
      }
      // special case data - which has separate schema - needs to be checked first since data prop
      // also has hidden prop
      if (key === 'data' && values) {
        const extensionData = await dispatch('removeUnknownProps', { data: values, fields: state.extensionSchema });
        Vue.set(newData, key, extensionData);
        // ignore props that are hidden (except data - see above)
      } else if (xAttrs && xAttrs.hidden) {
        Vue.set(newData, key, values);
        // handle special case texts - needs to be mapped to database schema
      } else if (key === 'texts') {
        // check that texts is not undefinded
        const tempValues = values || [];
        // check if transformation is still necessary by checking for data property (only there
        // if data from db (on clone entries)
        const texts = tempValues && tempValues.length
          && (!tempValues[0].data || !tempValues[0].data.length)
          ? transformTextData(tempValues) : [].concat(tempValues);
        Vue.set(newData, key, texts);
        // special case single choice chips (saved as object in backend)
      } else if (xAttrs && xAttrs.field_type && xAttrs.field_type.includes('chips')
        && field.type === 'object') {
        // check again if values provided are object or array
        const objectValue = values instanceof Array ? values[0] || {} : values;
        Vue.set(newData, key, objectValue);
      } else if (field.type === 'integer') {
        const number = parseInt(values, 10);
        Vue.set(newData, key, !Number.isNaN(number) ? number : 0);
        // check if field is array and values are array values
        // (was neccessary because of published_in)
      } else if (values && field.type === 'array' && typeof values === 'object') {
        // a check if a group field actually has content - otherwise it is removed
        if (xAttrs && xAttrs.field_type === 'group') {
          values = values.filter((value) => hasFieldContent(value));
        }
        // special case chips with unknown entries allowed - we want label set in all languages
        if (field.items.properties.label && field.items.properties.label.type === 'object'
          && xAttrs && xAttrs.allow_unknown_entries) {
          if (values) {
            // check for each chip if all languages are set
            values = values.map((value) => {
              const valueLocales = Object.keys(value.label);
              // for some weird reason i can not use env variable directly
              const languages = process.env.VUE_APP_LOCALES.split(',').map((langString) => langString.trim());
              if (!value.source && valueLocales !== languages) {
                const fieldValue = value.label[valueLocales.find((lang) => !!value.label[lang])];
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
        }
        const arrayValues = await Promise.all(values
          .map((value) => dispatch('removeUnknownProps', { data: value, fields: field.items.properties })));
        Vue.set(newData, key, arrayValues || []);
        // check if field is object
      } else if (field.type === 'object' && typeof values === 'object' && !values.length) {
        const validProperties = {};
        // special case languages which is object because of languages but is
        // handled as string here (changed before save)
        if (i18n.locale in field.properties) {
          Vue.set(newData, key, values);
        } else {
          await Promise.all(Object.keys(values).map(async (valueKey) => {
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
          }));
          Vue.set(newData, key, validProperties);
        }
        // check if field type is string and values are actually matching the type
        // (was necessary because of published_in)
      } else if (field.type === 'string' && typeof values === 'string') {
        Vue.set(newData, key, values);
      }
    }));
    return newData;
  },
  addEnglishTitleCasing(context, object) {
    return addEnglishTextStyling(object);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
