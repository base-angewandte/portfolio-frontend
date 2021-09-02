<template>
  <div class="form-component">
    <h2 class="hide">
      {{ `${$tc('notify.entry', 1)}: ${title}` }}
    </h2>

    <!-- FORM -->
    <form
      ref="formContainer"
      class="form-container">
      <!-- OPTIONS -->
      <BaseFormOptions
        :is-new-form="$store.state.data.isNewForm"
        :is-published="valueList.published"
        :default-expanded="false"
        class="base-form-options"
        @action-entry="actionEntry" />
      <div
        v-if="formIsLoading || extensionIsLoading"
        class="form-loading-area">
        <BaseLoader class="loader" />
      </div>
      <!-- Fallback: use formFields, if x-attr form_group is not provided from backend -->
      <BaseForm
        v-if="Object.keys(formFieldsGroup1).length || Object.keys(formFields).length"
        ref="baseForm"
        :form-id="'main'"
        :form-field-json="Object.keys(formFieldsGroup1).length ? formFieldsGroup1 : formFields"
        :value-list="valueList"
        :available-locales="locales"
        :language="$i18n.locale"
        :field-is-loading="fieldIsLoading"
        :drop-down-lists="dropDownListsInt"
        @values-changed="handleInput($event, '')"
        @fetch-autocomplete="fetchAutocomplete" />

      <transition-group
        name="fade-form">
        <!-- FORM EXTENSION -->
        <div
          v-if="type && formDataPresent"
          key="extended-section">
          <BaseForm
            key="extended-form"
            ref="formExtension"
            :form-id="'extended'"
            :form-field-json="formFieldsExtension"
            :value-list="valueList.data"
            :available-locales="locales"
            :language="$i18n.locale"
            :field-is-loading="fieldIsLoading"
            :drop-down-lists="dropDownListsInt"
            class="form base-form-spacing"
            @values-changed="handleInput($event, 'data')"
            @fetch-autocomplete="fetchAutocomplete" />
        </div>
      </transition-group>

      <BaseForm
        v-if="Object.keys(formFieldsGroup2).length"
        ref="baseForm"
        :form-id="'main2'"
        :form-field-json="formFieldsGroup2"
        :value-list="valueList"
        :available-locales="locales"
        :language="$i18n.locale"
        :field-is-loading="fieldIsLoading"
        :drop-down-lists="dropDownListsInt"
        :form-style="!type ? { 'padding-top': 0 } : {}"
        :class="[{ 'base-form-spacing': type }]"
        @values-changed="handleInput($event)"
        @fetch-autocomplete="fetchAutocomplete" />

      <transition-group
        name="slide-fade-form">
        <!-- SAVE ROW (only on mobile) -->
        <BaseRow
          v-if="!formIsLoading && formDataPresent"
          key="mobile-save-row"
          :unsaved-changes="unsavedChanges"
          :is-saving="dataSaving"
          :show-title="false"
          class="mobile-save-row"
          @save="saveForm"
          @return="returnFromForm" />

        <!-- ATTACHMENTS -->
        <AttachmentArea
          v-if="!formIsLoading && formDataPresent"
          key="attachments"
          @open-new-form="openNewForm"
          @show-preview="$emit('show-preview', $event)"
          @open-linked="goToLinked" />
      </transition-group>
      <transition name="slide-child-form">
        <BaseForm
          v-if="showOverlay"
          ref="overlay"
          :form-field-json="formFields"
          :available-locales="locales"
          :language="$i18n.locale"
          class="form slide-in-form" />
      </transition>
    </form>

    <div
      ref="formHead"
      :class="['form-head', { 'form-head-shadow': formBelow}]">
      <!-- PARENT HEADER -->
      <div
        v-if="parent"
        class="base-row-parent base-row-header"
        @click="returnFromForm">
        <BaseMenuEntry
          :title="parent.title"
          :title-bold="true"
          :subtext="parent.type && parent.type.label
            ? parent.type.label[$i18n.locale] : ''"
          :show-thumbnails="false"
          entry-id="parentheader"
          icon="file-object" />
      </div>

      <!-- HEADER ROW -->
      <BaseRow
        :title="title"
        :type="type"
        :show-back-button="!!parent"
        :unsaved-changes="unsavedChanges"
        :is-saving="dataSaving"
        @save="saveForm"
        @return="returnFromForm" />
    </div>

    <div
      v-if="valueList.date_created && valueList.date_changed && !formIsLoading && formDataPresent"
      class="last-modified">
      {{
        `${$t('form-view.created', {
          toTitleCase: false,
        })} ${createHumanReadableData(valueList.date_created)}`
      }}
      <br>
      {{
        `${$t('form-view.lastModified', {
          toTitleCase: false
        })} ${createHumanReadableData(valueList.date_changed)}`
      }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { attachmentHandlingMixin } from '@/mixins/attachmentHandling';
import { entryHandlingMixin } from '@/mixins/entryHandling';
import {
  getApiUrl,
  getLangLabel,
  hasFieldContent,
  toTitleString,
} from '@/utils/commonUtils';
import BaseRow from '../components/BaseRow';
import BaseFormOptions from '../components/BaseFormOptions';

import AttachmentArea from '../components/AttachmentArea';

const { CancelToken } = axios;
let cancel;

export default {
  name: 'FormView',
  components: {
    AttachmentArea,
    BaseFormOptions,
    BaseRow,
  },
  mixins: [
    attachmentHandlingMixin,
    entryHandlingMixin,
  ],
  data() {
    return {
      dataSaving: false,
      valueList: {},
      // original data object to compare (unsaved changes) or reset
      valueListOriginal: {},
      // variable for steering the overlay animation for linking
      // a new entry
      showOverlay: false,
      formIsLoading: false,
      extensionIsLoading: false,
      prefetchedRoles: [],
      // to have shadow effect when form is scrolled down
      formBelow: false,
      // set the name of a field that is currently loading
      fieldIsLoading: '',
      // the drop down lists necessary for form fields with drop downs
      dropDownListsInt: {},
      // object with all the default values from process env defaults + user default
      defaultDropDownValues: {},
      // object with all prefetched drop down options from all fields
      prefetchedDropDownLists: {},
      // store previous form fields in a variable in case type is deleted inbetween
      previousFormFields: {},
      // store previous contributor entries that did not have any roles assigned
      emptyMappingFields: {},
      /**
       * store if the currentItemId has changed (on switching between entries or page reload)
       * necessary because form fields extension information is not loaded yet when updateForm()
       * is called and form fields can not be transformed (e.g. software - open source license)
       * (--> need to watch formFieldsExtension instead and trigger transformValueList when
       * idChanged is true)
       */
      idChanged: false,
    };
  },
  computed: {
    currentItemId() {
      return this.$route.params.id;
    },
    title() {
      return this.showOverlay ? '' : this.valueList.title;
    },
    type() {
      const { type } = this.valueList;
      return type && type.length && !this.showOverlay ? type[0].label[this.$i18n.locale] : '';
    },
    parent() {
      return this.$store.getters['data/getLatestParentItem'];
    },
    formFields() {
      return this.$store.getters['data/getGeneralSchema'];
    },
    formFieldsGroup1() {
      return this.getFormFieldsByGroup(1);
    },
    formFieldsGroup2() {
      return this.getFormFieldsByGroup(2);
    },
    preFetchedData() {
      return this.$store.state.data.prefetchedTypes;
    },
    objectTypes() {
      // map fields to get the correct casing for en
      return this.$store.state.PortfolioAPI.schemas.map((schema) => ({
        ...schema,
        ...{
          label: {
            ...schema.label,
            ...{ en: toTitleString(schema.label.en) },
          },
        },
      }));
    },
    formDataPresent() {
      // return true if
      // a) there is no current item id or
      // b) formFields has content (swagger field information) and valueList has data
      // and IF there is a type - also formFieldsExtension has content (swagger form field info)
      return !this.currentItemId || (!!Object.keys(this.formFields).length
        && !!Object.keys(this.valueList).length
        && (!this.type || Object.keys(this.formFieldsExtension).length));
    },
    formFieldsExtension() {
      return this.$store.getters['data/getExtensionSchema'];
    },
    attachmentsCount() {
      return this.$store.getters['data/getCurrentMedia'].length;
    },
    unsavedChanges() {
      // to not have to check every single value every time do check first if
      // stringified form values are maybe equal already
      if (JSON.stringify(this.valueList) === JSON.stringify(this.valueListOriginal)) {
        return false;
      }
      // cover special cases that could lead to an unambigous result without recursive looping
      // e.g. the case that data field does not exist yet in one of the valueLists
      if ((this.valueList.type && this.valueList.type.length
        && this.valueListOriginal.type && this.valueListOriginal.type.length
        && this.valueList.type[0].source !== this.valueListOriginal.type[0].source)) {
        return true;
      }
      // every value of formFields is compared - with Array.every it will stop automatically
      // as soon as comparison returns false and therefore only traverse through object
      // until non-equal fields are found
      const mainFieldsHaveChanges = !Object.entries(this.formFields)
        .every(([key, value]) => this.compareDataValues(
          this.valueList[key],
          this.valueListOriginal[key],
          value,
        ));
      if (!this.type || mainFieldsHaveChanges) {
        return mainFieldsHaveChanges;
      }
      // if main fields dont have changes also iterate through data fields
      return !Object.entries(this.formFieldsExtension)
        .every(([key, value]) => this.compareDataValues(
          this.valueList.data[key],
          this.valueListOriginal.data[key],
          value,
        ));
    },
    locales() {
      return process.env.VUE_APP_LOCALES.split(',').map((langString) => langString.trim());
    },
    dropDownFieldsList() {
      return this.getDropDownFields(this.fieldsList);
    },
    fieldsList() {
      return { ...this.formFields, ...this.formFieldsExtension };
    },
  },
  watch: {
    formFields() {
      this.formIsLoading = false;
    },
    /**
     * watch form fields extension to transform value fields that need to be transformed
     * when an entry is fetched from the database (e.g. software - open source license from
     * object to array)
     */
    formFieldsExtension(val) {
      // intitalize valueList if
      // a) formFieldsExtension has information and
      // b) idChanged is true (= current page reload or entry switch)
      if (val && Object.keys(val).length && this.idChanged) {
        // transform the valueList (only extension since main fields are already
        // transformd in update() )
        this.transformValueList(this.formFieldsExtension, this.valueList.data);
        // assign the updated valueList to valueListOriginal as well to have correct
        // unsavedChanges behaviour
        this.valueListOriginal = JSON.parse(JSON.stringify(this.valueList));
        // reset idChanged variable so it is not triggered anymore as long as user stays
        // on same entry
        this.idChanged = false;
      }
    },
    preFetchedData() {
      this.setDropDownValues();
    },
    prefetchedRoles() {
      this.setDropDownValues();
    },
    async currentItemId(val) {
      window.scrollTo(0, 0);
      sessionStorage.removeItem('valueList');
      sessionStorage.removeItem('parent');
      if (val) {
        if (this.valueList.type && this.valueList.type.length) {
          this.idChanged = true;
        }
        this.resetForm();
        await this.updateForm();
      } else {
        this.resetForm();
      }
      this.showOverlay = false;
      this.formIsLoading = false;
    },
    async type(val) {
      // store previous formFieldsExtension in case type is deleted inbetween
      if (Object.keys(this.formFieldsExtension).length) {
        this.previousFormFields = JSON.parse(JSON.stringify(this.formFieldsExtension));
      }
      if (val) {
        // if type was set check if the data form field does already exist and if not
        // also set it for the form extension fields
        if (!this.valueList.data) {
          this.$set(this.valueList, 'data', {});
        }
        try {
          this.extensionIsLoading = true;
          let { properties } = await this.$store.dispatch('PortfolioAPI/get', {
            kind: 'jsonschema',
            id: encodeURIComponent(this.valueList.type[0].source),
          });
          // add english lang casing to title and placeholders
          properties = await this.$store.dispatch('data/addEnglishTitleCasing', properties);
          // set the retrieved extension schema to store
          this.$store.commit('data/setExtensionSchema', properties || {});
          // get the static drop down data for this extension
          await this.$store.dispatch('data/getStaticDropDowns', properties);

          // get the list of available roles for mapping and filtering out roles from contributors
          // field
          const roleFieldList = this.$store.state.data.prefetchedTypes.contributors_role;
          // map fields between each other
          if (Object.keys(this.previousFormFields).length) {
            this.mapFieldEquivalents({
              originalFormFields: this.previousFormFields,
              newFormFields: properties,
              commonFieldName: 'contributors',
              idProp: 'source',
              fieldProp: 'roles',
              defaultProp: 'default_role',
              fieldPropList: roleFieldList,
            });
          }

          // prepare roles by filtering all the roles that have separate fields
          const contributorFields = Object.keys(properties).reduce((prev, curr) => {
            const field = properties[curr];
            if (field['x-attrs'] && field['x-attrs'].equivalent === 'contributors') {
              prev.push(field['x-attrs'].default_role);
            }
            return prev;
          }, []);
          this.prefetchedRoles = roleFieldList
            .filter((role) => !contributorFields.includes(role.source));
        } catch (e) {
          console.error(e);
          // check if request was cancelled and ignore if yes - otherwise notify user
          if (!axios.isCancel(e)) {
            this.$notify({
              group: 'request-notifications',
              title: this.$t('notify.somethingWrong'),
              text: this.$t('notify.entryTypeNotFound', { type: val }),
              type: 'error',
            });
            // reset type
            this.valueList.type = [];
            // empty extension
            this.$store.commit('data/setExtensionSchema', {});
          }
        }
        this.extensionIsLoading = false;
      } else {
        this.$store.commit('data/setExtensionSchema', {});
      }
    },
    // if attachments in form were changed from 0 to >0 or from >0 to 0 --> update
    // sidebar to display icon
    attachmentsCount(curr, prev) {
      // formisloading as indicator if route was changed to reduce requests
      if (!this.formIsLoading && Boolean(curr) !== Boolean(prev)) {
        this.$emit('data-changed', true);
      }
    },
    dropDownFieldsList() {
      this.setDefaultDropDownLists();
      this.setDropDownValues();
    },
  },
  async beforeCreate() {
    // initializing stores before app instance is created
    await this.$store.dispatch('data/init', {
      baseURL: getApiUrl(),
      lang: this.$i18n.locale,
    }).catch((e) => {
      if ((e.response && e.response.status === '404') || e.message === 'Network Error') {
        this.$router.push('/error');
      } else if (!e || !e.response || e.response.status !== 403) {
        console.error(e);
        // TODO: if form fields can not be fetched this should probably
        //  abort all further entry data / extension loadings (redirect to dashboard?)
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.somethingWrong'),
          text: this.$t('notify.formDataNotFound'),
          type: 'error',
        });
      }
    });
  },
  async created() {
    this.formIsLoading = true;
    // check if a parent was stored in session storage
    const storedParentString = sessionStorage.getItem('parent');
    if (storedParentString) {
      this.$store.commit('data/setParentItem', JSON.parse(storedParentString));
    }
    // check if previously unsaved changes were stored in session storage
    const storedValueList = JSON.parse(sessionStorage.getItem('valueList'));
    if (this.currentItemId) {
      // only if there is no data in session storage also set the original data list
      // used for determining unsaved changes to the new values
      if ((!storedValueList || !storedValueList.id === this.currentItemId)
        && this.valueList.type && this.valueList.type.length) {
        this.idChanged = true;
      }
      await this.updateForm();
    }
    // if it matches the current entry id, merge it with db fetched data
    if (storedValueList && storedValueList.id === this.currentItemId) {
      this.valueList = { ...this.valueList, ...storedValueList };
    }
  },
  mounted() {
    // add event listener for back button to handle parent situation
    window.addEventListener('popstate', () => {
      if (this.parent && this.parent.id) {
        this.$store.commit('data/deleteLastParentItem');
      }
    });
    // add event listener triggered before unload
    // 'beforeunload' is not triggered on iOS Safari, therefore using 'pagehide'
    window.addEventListener('pagehide', () => {
      // if there are unsaved changes store them in session storage,
      // otherwise clear storage
      if (this.unsavedChanges && Object.keys(this.valueList).length) {
        sessionStorage.setItem('valueList', JSON.stringify(this.valueList));
      } else {
        sessionStorage.removeItem('valueList');
      }
      // check if there is a parent item, otherwise clear storage item
      if (this.parent) {
        sessionStorage.setItem('parent', JSON.stringify(this.parent));
      } else {
        sessionStorage.removeItem('parent');
      }
    });
    // to add below shadow to form
    window.addEventListener('scroll', () => {
      if (this.$refs.formHead) {
        this.formBelow = this.$refs.formHead.offsetTop > 0;
      }
    });
  },
  methods: {
    resetForm() {
      this.valueList = {};
      this.valueList.data = {};
      this.valueListOriginal = { ...JSON.parse(JSON.stringify(this.valueList)) };
      this.previousFormFields = {};
    },
    async updateForm() {
      this.formIsLoading = true;
      try {
        const data = await this.$store.dispatch('data/fetchEntryData', this.currentItemId);
        this.valueList = { ...data };
        this.extensionIsLoading = !!this.type;
        this.$set(this.valueList, 'data', { ...data.data });
        // update the set dat to currently necessary formats
        this.transformValueList(this.formFields, this.valueList);
        // copy the original object to check for unsaved changes later
        this.valueListOriginal = { ...JSON.parse(JSON.stringify(this.valueList)) };
      } catch (e) {
        if (axios.isCancel(e)) {
          console.warn(e.message);
        } else if (e && e.response && e.response.status === 404) {
          this.$router.push(`/not-found?id=${this.currentItemId}`);
          // only notify if user was already authenticated
        } else if (!e || !e.response || e.response.status !== 403) {
          console.error(e);
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.somethingWrong'),
            text: this.$t('notify.fetchSingleEntry'),
            type: 'error',
          });
          this.$router.push('/');
        }
      }
    },
    /**
     * a function to adapt data fields that need adapting - currently solely in there - single
     * chips input fields that come as object but need to be an array for BaseChipsInputField
     *
     * @param {Object} fields - the swagger format form fields
     * @param {Object} data - the entry data
     */
    transformValueList(fields, data) {
      Object.entries(fields).forEach(([key, value]) => {
        // 1. check for single chips inputs as they come from backend as an object
        // but need to be an array in front end
        if (value['x-attrs'] && (value['x-attrs'].field_type === 'chips'
          || value['x-attrs'].field_type === 'chips-below') && value.type === 'object') {
          this.$set(data, key, hasFieldContent(data[key]) ? [].concat(data[key]) : []);
        }
        // also loop through secondary fields (e.g. roles)
        if (hasFieldContent(data[key]) && value.items && value.items.properties) {
          // handle for every entry of array
          if (data[key] instanceof Array) {
            data[key].forEach((entry) => this.transformValueList(value.items.properties, entry));
            // or object (currently not present)
          } else {
            this.transformValueList(value.properties, data[key]);
          }
        }
      });
    },
    /**
     * function called on user form input
     *
     * @param {Object} data - the entry data provided by the respective form
     * @param {?string} type - if data are provided from a subform (and a certain attribute of
     * the entry data respectiviely)
     */
    handleInput(data, type) {
      if (cancel) {
        this.fieldIsLoading = '';
        cancel('value already selected');
      }
      // get the data in question - either complete entry data or if type is set
      // the specific data connected with that attribute
      const originalDataObject = type ? this.valueList[type] : this.valueList;
      // find changed data so only the data that truly changed go into valueList
      Object.keys(this.fieldsList).forEach((key) => {
        const value = data[key];
        const xAttrs = this.fieldsList[key]['x-attrs'];
        // check if specifiy property of data exists and changed values
        if ((xAttrs && !xAttrs.hidden)
          && value !== undefined && JSON.stringify(value) !== JSON.stringify(this.valueList[key])) {
          // store in variable if respective fields have data
          const newDataHasFieldContent = hasFieldContent(value);
          const originalDataHasFieldContent = originalDataObject && originalDataObject[key]
            && hasFieldContent(originalDataObject[key]);
          // then only update valueList when either new data has values or old data
          // has values and new data has not (= data was deleted), or if field type is group
          // (important if group was added or removed) - this is done to
          // prevent the empty fields initialized in BaseForm to pollute the valueList
          // with empty 'values'
          if (newDataHasFieldContent || (!newDataHasFieldContent && originalDataHasFieldContent)
            || (xAttrs.field_type === 'group')) {
            // if necessary update emptyFieldsList
            if (this.emptyMappingFields[key]) {
              // if a value in contributors was deleted also remove it from empty fields list
              if (originalDataObject[key].length > value.length) {
                this.$set(this.emptyMappingFields, key, this.emptyMappingFields[key]
                  .filter((id) => value.map((val) => val.source || val.label).includes(id)));
              }
              // take care if roles are not empty anymore
              value.forEach((val) => {
                if (val.roles && val.roles.length
                  && this.emptyMappingFields[key].includes(val.source || val.label)) {
                  this.$set(this.emptyMappingFields, key, this.emptyMappingFields[key]
                    .filter((id) => (val.source || val.label) !== id));
                }
              });
            }
            this.$set(originalDataObject, key, value);
          }
        }
      });
    },
    async saveForm(routeToNewEntry = true) {
      // check if there is a title (only requirement for saving)
      if (this.valueList.title) {
        this.dataSaving = true;
        const validData = await this.$store.dispatch('data/removeUnknownProps', { data: this.valueList, fields: this.formFields });
        try {
          // check if the route indicates an already saved entry or a new entry
          if (!this.currentItemId) {
            const newEntryId = await this.$store.dispatch('data/addOrUpdateEntry', validData);
            // also add linked entries if there are already any
            const list = this.$store.getters['data/getLinkedIds'];
            if (list.length) {
              this.actionLinked({ list, action: 'save' });
            }
            // link entry to parent if parent items are present
            const parent = this.$store.getters['data/getLatestParentItem'];
            if (parent) {
              // ok to just take first one ([0]) since only scenario for this is
              // "link new entry" functionality and there can only be one parent
              const relationData = {
                from_entry: parent.id,
                to_entry: newEntryId,
              };
              try {
                this.$store.dispatch('PortfolioAPI/post', {
                  kind: 'relation',
                  data: relationData,
                });
              } catch (e) {
                console.error(e);
                this.$notify({
                  group: 'request-notifications',
                  title: this.$t('notify.actionFailed', { action: this.$t('notify.link') }),
                  text: this.$t('notify.linkToParentFail', { title: parent[0].title }),
                  type: 'error',
                });
                // to also give user visual feedback that there is actually no link
                this.$store.commit('data/deleteParentItems');
              }
            }
            this.$emit('data-changed');
            if (routeToNewEntry) {
              await this.$router.push(`/entry/${this.$store.state.data.currentItemId}`);
            }
            // if id present just update the entry
          } else {
            await this.$store.dispatch('data/addOrUpdateEntry', validData);
            this.$emit('data-changed');
          }
          // fetch types anew in case entry types were newly created or modified
          this.$store.dispatch('data/fetchEntryTypes');
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.saveSuccess'),
            text: this.$t('notify.saveSuccessSubtext', { title: validData.title }),
            type: 'success',
          });
          this.valueListOriginal = { ...JSON.parse(JSON.stringify(this.valueList)) };
          this.dataSaving = false;
          return true;
        } catch (e) {
          console.error(e);
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.saveFail'),
            text: e.message,
            type: 'error',
          });
          this.dataSaving = false;
          return false;
        }
      } else {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.titleMissing'),
          text: this.$t('notify.addTitle'),
          type: 'error',
        });
        this.focusFirstInput();
        return false;
      }
    },
    returnFromForm() {
      const followUpAction = () => {
        if (this.parent) {
          this.returnToParent(this.parent.id);
        } else {
          this.$router.push('/');
        }
      };
      this.openUnsavedChangesPopUp(followUpAction);
    },
    async openNewForm() {
      // check if entry was already saved
      if (!this.currentItemId) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.linkingNotPossible'),
          text: this.$t('notify.saveBeforeLink'),
          type: 'error',
        });
      } else if (this.valueList.title) {
        if (this.unsavedChanges) {
          this.openUnsavedChangesPopUp(this.openNewForm);
        } else {
          this.showOverlay = true;
          this.$store.commit('data/setParentItem', this.valueList);
          this.$store.commit('data/setNewForm', true);

          window.scrollTo(0, 0);

          setTimeout(() => {
            this.$store.commit('data/deleteCurrentItem');
            this.resetForm();
            this.$router.push('/new');
            this.focusFirstInput();
          }, 700);
        }
      } else {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.actionFailed', { action: this.$t('notify.link') }),
          text: this.$t('notify.specifyTitleBeforeLinking'),
          type: 'error',
        });
      }
    },
    returnToParent(id) {
      this.$store.commit('data/deleteLastParentItem');
      this.$router.push(`/entry/${id}`);
    },
    async actionEntry(action) {
      if (!(action === 'publish' && this.unsavedChanges)) {
        this.confirmAction({ action, entries: [].concat(this.valueList) });
      } else {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.saveBeforePublish'),
          text: this.$t('notify.saveBeforePublishText'),
          type: 'error',
        });
      }
    },
    async action(action) {
      // mixin method actionEntries
      await this.actionEntries(action);
      if (action === 'delete') {
        try {
          // update user quota in case any of the deleted entries had files attached
          this.$store.dispatch('PortfolioAPI/fetchUser');
        } catch (e) {
          console.error(e);
        }
        this.$router.push('/');
      } else {
        this.valueList.published = action === 'publish';
        // also update original value list since this should not trigger unsaved changes
        this.valueListOriginal.published = action === 'publish';
      }
      this.$emit('data-changed', true);
    },
    createHumanReadableData(val) {
      const date = new Date(val);
      return `${date.toLocaleDateString('de')} ${this.$t('form-view.at', { toTitleCase: false })} ${date.toLocaleTimeString('de')}`;
    },
    openUnsavedChangesPopUp(followUpAction) {
      if (this.unsavedChanges) {
        this.$store.commit('data/setPopUp', {
          show: true,
          header: this.$t('notify.unsavedChangesTitle'),
          textTitle: this.$t('notify.unsavedChangesText'),
          textList: [],
          icon: 'save-file',
          buttonTextRight: this.$t('notify.saveChanges'),
          buttonTextLeft: this.$t('notify.dismissChanges'),
          actionRight: async () => {
            try {
              await this.saveForm(false);
              followUpAction();
            } catch (e) {
              console.error(e);
            }
            this.$store.commit('data/hidePopUp');
          },
          actionLeft: () => {
            // if changes are discarded reset to original value list
            this.valueList = { ...JSON.parse(JSON.stringify(this.valueList)) };
            followUpAction();
          },
        });
      } else {
        followUpAction();
      }
    },
    goToLinked(id) {
      const followUpAction = () => {
        this.$store.commit('data/setParentItem', this.valueList);
        this.$router.push(`/entry/${id}`);
      };
      this.openUnsavedChangesPopUp(followUpAction);
    },
    focusFirstInput() {
      if (this.$el.querySelector('input')) {
        this.$el.querySelector('input').focus();
      }
    },
    async fetchAutocomplete({
      value, name, source, equivalent,
    }) {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.timeout = setTimeout(async () => {
        if (value && value.length > 2) {
          this.fieldIsLoading = name;
          try {
            // TODO: use C. module
            // cancel previous request if there is any
            if (cancel) {
              cancel('new request started');
            }
            const result = await axios.get(`${getApiUrl(source)}${value ? `${value}/` : ''}`, {
              withCredentials: true,
              headers: {
                'Accept-Language': this.$i18n.locale,
              },
              /* eslint-disable-next-line */
              cancelToken: new CancelToken((c) => {
                cancel = c;
              }),
            });
            this.setDropDown(result.data || [], value, equivalent, name);
            // TODO: add additional properties if necessary: e.g.
            //  source name, separated name, dob, profession
            this.fieldIsLoading = '';
          } catch (e) {
            if (e instanceof DOMException) {
              console.error('If you see above error it is likely because the source is missing for a field!');
              this.fieldIsLoading = '';
            } else if (axios.isCancel(e)) {
              console.warn(e.message);
            } else {
              // TODO: inform user?? notification or just info in drop down??
            }
          }
        } else if (this.prefetchedDropDownLists[name]) {
          // check if there is a preset list for dynamic chips input fields (e.g. keywords)
          const prefetchedValues = this.prefetchedDropDownLists[name]
            .filter((option) => getLangLabel(option.label, this.$i18n.locale, true).toLowerCase()
              .includes(value.toLowerCase()));
          this.setDropDown(prefetchedValues || [], value, equivalent, name);
        } else {
          this.setDropDown([], value, equivalent, name);
        }
      }, 600);
    },
    setDropDown(data, value, equivalent, name) {
      if (data) {
        const modifiedData = data.map((entry) => {
          if (!['GND', 'VIAF'].includes(entry.source_name)) return entry;
          // regex to filter additional info from GND and VIAF
          const pattern = new RegExp([
            '^(',
            '([^(*)*?[^0-9,|(]*?,[^0-9,|(]*|[^0-9|,(]*)$|',
            '([^0-9|(]*|[^0-9,|]*?, [^0-9,(|]*|[^0-9|,(]*)',
            '(, | \\| | )',
            '(.*)$',
            ')',
          ].join(''));

          const match = pattern.exec(entry.label);
          if (match && match[1]) {
            return {
              ...entry,
              ...(match[3] && match[5]
                ? { label: match[3], additional: this.removeDoubleEntries(match[5]) } : { label: match[1], additional: '' }),
            };
          }
          return entry;
        });
        let dropDownList = [].concat(modifiedData);
        // if input does not trigger search (> 2 char) set defaults
        if (this.defaultDropDownValues && this.defaultDropDownValues[name]
          && (!value || value.length <= 2)) {
          dropDownList = this.setDropDownDefaults(
            this.defaultDropDownValues[name],
            value,
          ).concat(dropDownList);
        }
        this.$set(this.dropDownListsInt, name, dropDownList);
      } else {
        this.$set(this.dropDownListsInt, name, []);
      }
    },
    setDropDownDefaults(defaults, input) {
      if (defaults && defaults.length) {
        if (!input.length) {
          return defaults;
        }
        return defaults
          .filter((defaultOption) => getLangLabel(defaultOption.label, this.$i18n.locale, true)
            .toLowerCase().includes(input.toLowerCase()));
      }
      return [];
    },
    removeDoubleEntries(value) {
      const pattern = /\((.*?)\)(. | \| | )?(.*)/;
      const match = pattern.exec(value);

      if (match && match[3].includes(match[1])) {
        return match[3];
      }

      if (match && !match[3].length) {
        return match[1];
      }
      return value;
    },
    setDropDownValues() {
      // set prefetched drop down values
      this.prefetchedDropDownLists = {
        ...this.preFetchedData,
        type: this.objectTypes,
        contributors_secondary: this.prefetchedRoles,
        texts_secondary: this.preFetchedData.texts_type,
      };
      this.dropDownFieldsList.forEach((field) => {
        const prefetched = this.prefetchedDropDownLists[field.name];
        if (prefetched && prefetched.length) {
          this.setDropDown(prefetched, '', field.equivalent, field.name);
          // for all others just set to an empty array in the beginning
        } else {
          this.setDropDown([], '', field.equivalent, field.name);
        }
      });
    },
    setDefaultDropDownLists() {
      const defaultDropDownObject = {};
      const user = this.$store.getters['PortfolioAPI/user'];
      const defaultLists = JSON.parse(process.env.VUE_APP_DEFAULT_LISTS);
      this.dropDownFieldsList.forEach((field) => {
        // only get new if not already set
        if (!this.defaultDropDownValues[field.name]
          || !this.defaultDropDownValues[field.name].length) {
          const defaultsName = field.equivalent ? `${field.equivalent.toUpperCase()}_DEFAULTS`
            : `${field.name.toUpperCase()}_DEFAULTS`;
          const defaults = defaultLists[defaultsName];
          if (defaults && defaults.length) {
            const dropDownList = [...defaults];
            // special case contributors - add user
            // - but also check first if necessary user attributes exist
            if (user.name && user.uuid
              && ((field.equivalent === 'contributors') || field.name === 'contributors')) {
              // set user
              dropDownList.unshift({
                label: user.name,
                source: user.uuid,
                additional: this.$t('form.myself'),
              });
            }
            this.$set(defaultDropDownObject, field.name, dropDownList);
          }
        }
      });
      this.defaultDropDownValues = { ...this.defaultDropDownValues, ...defaultDropDownObject };
    },
    getDropDownFields(fieldObject) {
      let fieldNameList = [];
      Object.keys(fieldObject)
        .forEach((fieldName) => {
          const fieldXAttrs = fieldObject[fieldName]['x-attrs'];
          if (fieldXAttrs && fieldXAttrs.field_type === 'group') {
            fieldNameList = fieldNameList
              .concat(this.getDropDownFields(fieldObject[fieldName].items.properties));
          } else if (fieldXAttrs && !fieldXAttrs.hidden) {
            const sources = Object.keys(fieldXAttrs).filter((key) => !!key.includes('source'));
            if (sources.length) {
              sources.forEach((sourceAttr) => {
                fieldNameList.push({
                  name: sourceAttr.includes('_') ? `${fieldName}_secondary` : fieldName,
                  source: fieldXAttrs[sourceAttr],
                  equivalent: fieldXAttrs.equivalent,
                });
              });
            }
          }
        });
      return fieldNameList;
    },
    getFormFieldsByGroup(group = 1) {
      if (!Object.entries(this.formFields).length) {
        return false;
      }

      return Object.entries(this.formFields)
        .reduce((prev, [key, value]) => {
          if (this.formFields[key]['x-attrs']
            && this.formFields[key]['x-attrs'].form_group === group) {
            return {
              ...prev,
              [key]: value,
            };
          }
          return prev;
        }, {});
    },
    compareDataValues(newData, originalData, formFieldValues) {
      const xAttrs = formFieldValues['x-attrs'];
      // for hidden fields automatically return true
      if ((xAttrs && xAttrs.hidden) || !formFieldValues.type) return true;
      // check if the fields to compare acutally have content
      const data1ContainsValues = hasFieldContent(newData);
      const data2ContainsValues = hasFieldContent(originalData);
      // when none of the two fields contain values they are equal
      if (!data1ContainsValues && !data2ContainsValues) return true;
      // if one field contains data and one doesn't they are definitely not equal
      if ((!data1ContainsValues && data2ContainsValues)
        || (data1ContainsValues && !data2ContainsValues)) return false;
      // assign whichever field has a value to determine the type of the field
      // done this way since formFields information is not reliable here since in backend
      // partially different data type than in front end (e.g. type BE: object, FE: array)
      const hasValue = data1ContainsValues ? newData : originalData;
      // const xAttrs = formFieldValues['x-attrs'];
      // start comparing based on field type
      // for string simply compare the two values
      if (typeof hasValue === 'string') {
        return newData === originalData;
      }
      // for an array traverse through each position
      if (typeof hasValue === 'object' && hasValue.length) {
        // if the two arrays do not have the same length they are not equal
        // but dont trigger unsaved changes for subform group fields
        if ((!xAttrs || (xAttrs && xAttrs.field_type !== 'group'))
          && newData.length !== originalData.length) {
          return false;
        }
        // if they have the same length check if one of the array values is not
        // equal with its data2 equivalent and return the result of that
        return newData.every((value, index) => this
          .compareDataValues(
            value,
            originalData[index],
            formFieldValues.items || formFieldValues,
          ));
      }
      if (typeof hasValue === 'object') {
        const validProperties = Object.keys(formFieldValues.properties);
        // need to check for newData key because of props partially added later before saving
        // e.g. roles for specific contributor fields (e.g. authors)
        return Object.keys(newData)
          .every((key) => {
            // if prop is not in validProperties and original data field also does not have
            // values for this field (e.g. 'additional' prop it contributors fields) - ignore it
            // and return true
            // last part is a hack for texts field again since there the props are different
            // but should not be ignored
            if (!validProperties.includes(key) && originalData[key] === undefined
              && !validProperties.includes('data')) {
              return true;
            }
            // a special solution is needed for texts because the object contains other properties
            // than specified in the swagger information
            if (!validProperties.includes(key)) {
              // for these non swagger values make simple stringified comparison for now
              return JSON.stringify(newData[key]) === JSON.stringify(originalData[key]
                || (newData[key] && originalData[key] !== undefined));
            }
            return !newData[key] === undefined
            || this.compareDataValues(
              newData[key],
              originalData[key],
              formFieldValues.properties[key],
            );
          });
      }
      return true;
    },
    /**
     * function to do mapping between a general field and specialized fields - e.g. 'contributors'
     * and 'authors', 'architects', 'artists', ... changing with form type
     *
     * TODO: the aim is to make this as generalized as possible but it will definitely have to be
     * reevaluated with other fields (e.g. date_location)!!
     *
     * @param {Object} originalFormFields - the form fields information in OpenAPI format
     *  before the type change
     * @param {Object} newFormFields - the form fields information in OpenAPI format
     *  after the type change
     * @param {string} commonFieldName - the property name of the general field
     *  (e.g. 'contributors')
     * @param {string} [idProp='source'] - the unique identifier property name of entries (e.g. for
     *  contributor or specific role --> 'source')
     * @param {string} [labelProp='label'] - the property in which the displayed string for an entry
     * is specified (e.g. for contributor or specific role --> 'label')
     * @param {string} [fieldProp] - the property name that contains the relevant information
     *  for the specialized fields
     * @param {string} [defaultProp] - the property name of the x-attribute that
     *  contains the unique ID of the form field (e.g. 'default_role')
     * @param {Object[]} [fieldPropList] - a list of possible values for the fieldProp field (e.g.
     *  list of roles)
     */
    mapFieldEquivalents({
      originalFormFields,
      newFormFields,
      commonFieldName,
      idProp = 'source',
      labelProp = 'label',
      fieldProp,
      defaultProp,
      fieldPropList,
    }) {
      const originalFieldInformation = this.filterFormFieldsForEquivalent(
        originalFormFields, commonFieldName, defaultProp,
      );
      const newFieldInformation = this.filterFormFieldsForEquivalent(
        newFormFields, commonFieldName, defaultProp,
      );

      // if the common field does not exist yet - create and initialize it
      // TODO: what if this should not be an array
      if (!this.valueList.data[commonFieldName]) {
        this.$set(this.valueList.data, commonFieldName, []);
      }
      // store the general equivalent field in a variable
      // (needed for both sides of mapping)
      const commonFieldData = this.valueList.data[commonFieldName];

      // check if there are contributor fields that dont have roles assigned
      this.$set(this.emptyMappingFields, commonFieldName, [
        ...this.emptyMappingFields[commonFieldName] || [],
        ...commonFieldData
          .reduce((array, entry) => {
            const entryId = entry[idProp] || entry[labelProp];
            if ((!entry[fieldProp] || !entry[fieldProp].length)
              && (!this.emptyMappingFields[commonFieldName]
                || !this.emptyMappingFields[commonFieldName].includes(entryId))) {
              return array.concat([entry[idProp] || entry[labelProp]]);
            }
            return array;
          }, []),
      ]);

      // first map from equivalent fields (e.g. authors) to common field (e.g. contributors)
      // if this field does not exist in the new form
      if (originalFieldInformation && originalFieldInformation.length) {
        // loop through every of the specialized fields
        originalFieldInformation.forEach((equivalentField) => {
          // check if this field does NOT occur in the new form and if this
          // field has data
          if (!Object.prototype.hasOwnProperty.call(newFormFields, equivalentField.name)
            && this.valueList.data && this.valueList.data[equivalentField.name]) {
            // get a list of all the equivalent field entry ids
            const equivalentFieldDataIds = commonFieldData
              .map((cont) => cont[idProp] || cont[labelProp].toLowerCase());
            // loop through all the entries in the specialized field separately to be able
            // to either
            // a) add only the necessary additional prop value (e.g. a specific role)
            //    to an already existing entry or
            // b) add a new entry to the equivalent field
            this.valueList.data[equivalentField.name].forEach((entry) => {
              // get entry index in equivalent field
              const contIndex = equivalentFieldDataIds
                .indexOf(entry[idProp] || entry[labelProp].toLowerCase());
              // since the field necessary to fill specialized field might not always
              // be available check if it is and if not find it in provided list from
              // default value specified in specialized field
              const fieldPropValue = entry[fieldProp] && entry[fieldProp][0] && fieldPropList
                ? entry[fieldProp][0] : fieldPropList
                  .find((listItem) => listItem[idProp] === equivalentField.default);
              // check if entry is acutally identifyable by an unique id and
              // is already contained in the equivalent field
              // if yes - just add the relevant properties to the existing entry
              if (contIndex >= 0) {
                // then also check if the prop field does already exist in the general field
                // if yes push to it - if not create it by setting the value
                if (commonFieldData[contIndex][fieldProp]) {
                  commonFieldData[contIndex][fieldProp].push(fieldPropValue);
                } else {
                  this.$set(commonFieldData[contIndex], fieldProp, [fieldPropValue]);
                }
              } else {
                commonFieldData.push((entry[fieldProp]
                  ? entry : { ...entry, [fieldProp]: [fieldPropValue] }));
              }
            });
            // since it should not exist in the new form - delete the specialized field
            delete this.valueList.data[equivalentField.name];
          }
        });
      }
      // second map from common field to equivalents if this field appears in the form
      if (newFieldInformation && newFieldInformation.length) {
        // check if this field acutally has data (array is assumed for now)
        if (commonFieldData && commonFieldData.length) {
          // get a list of all field IDs before looping through all the entries
          const newEquivalentFieldIds = newFieldInformation.map((newField) => newField.default);
          // check each entry in the equivalent field if they should go to
          // a specialized field
          // looped through in reverse order so the splicing in the end does not affect
          // the array
          for (let commonFieldIndex = commonFieldData.length - 1;
            commonFieldIndex >= 0;
            commonFieldIndex -= 1) {
            const equivalentEntry = commonFieldData[commonFieldIndex];
            // check if the specific prop (e.g. roles) has entries
            // loop through in reverse so there are no problems with splicing entries from fieldProp
            // field
            if (equivalentEntry[fieldProp] && equivalentEntry[fieldProp].length) {
              // loop through all the entries for the specific prop
              // looped through in reverse order so the splicing in the end does not
              // affect the array
              for (let fieldPropIndex = equivalentEntry[fieldProp].length - 1;
                fieldPropIndex >= 0;
                fieldPropIndex -= 1) {
                const fieldPropEntry = equivalentEntry[fieldProp][fieldPropIndex];
                // and check for a match with the list of new fields
                if (newEquivalentFieldIds.includes(fieldPropEntry[idProp])) {
                  // if there is a match, create a new entry for that field
                  // with data from the equivalent field but with only the specific prop entry
                  // that was matching (e.g. role 'author' for 'authors' field)
                  const newFieldEntry = {
                    ...equivalentEntry,
                    [fieldProp]: [fieldPropEntry],
                  };
                  // to add this entry find the field where entry should be added
                  const field = newFieldInformation
                    .find((newField) => newField.default === fieldPropEntry[idProp]);
                  // if this field aready exists add the new entry by pushing to array
                  if (this.valueList.data[field.name]) {
                    this.valueList.data[field.name].push(newFieldEntry);
                  } else {
                    // else create a new property in valueList.data
                    this.$set(this.valueList.data, field.name, [newFieldEntry]);
                  }
                  // remove entry from equivalent list
                  equivalentEntry[fieldProp].splice(fieldPropIndex, 1);
                  // after that also check if there are actually any roles left - if not
                  // delete entry from common field
                  if (!equivalentEntry[fieldProp].length
                    && !this.emptyMappingFields[commonFieldName]
                      .includes(newFieldEntry.source || newFieldEntry.label)) {
                    commonFieldData.splice(commonFieldIndex, 1);
                  }
                }
              }
            }
          }
        }
      }
    },
    /**
     * extract the relevant information for mapping from the OpenAPI object
     *
     * @param {Object} formFields - the form field information in OpenAPI format
     * @param {string} commonFieldName - the property name of the common field (e.g. 'contributors')
     * @param {string} defaultProp - the property name of the x-attribute containing the specialized
     *  field unique id
     * @returns {{default: string, name: string}[]}
     */
    filterFormFieldsForEquivalent(formFields, commonFieldName, defaultProp) {
      return Object.keys(formFields)
        .filter((fieldName) => formFields[fieldName]['x-attrs'].equivalent === commonFieldName)
        .map((fieldName) => ({
          name: fieldName,
          default: formFields[fieldName]['x-attrs'][defaultProp],
        }));
    },
  },
};
</script>

<style lang="scss" scoped>
  .form-component {
    position: relative;
    min-height: 80vh;
    display: flex;
    flex-direction: column;

    .form-head {
      background-color: $background-color;
      position: sticky;
      top: $header-height;
      z-index: map-get($zindex, form-header-row);
      padding: $spacing 0 $spacing-small;
      order: 0;

      &.form-head-shadow {
        box-shadow: 0 8px 8px -8px rgba(0,0,0,0.25);
      }

      .base-row-parent {
        border-bottom: $separation-line;
        position: relative;
        cursor: pointer;

        &:hover {
          color: $app-color;
        }

        &::after {
          content: '';
          position:absolute;
          height: 100%;
          width: 100%;
          z-index: map-get($zindex, form-header-row) + 100;
          top: 0;
          left: 0;
          background-color: rgb(240, 240, 240);
          opacity: 0.5;
        }

        &:hover::after {
          opacity: 0;
        }
      }
    }

    .form-container {
      position: relative;
      margin-top: -$spacing-small;
      order: 1;
      .base-form-options {
        margin-bottom: $spacing-small;
      }

      .form-loading-area {
        position: absolute;
        width: 100%;
        height: 100%;
        min-height: 100vh;
        z-index: map-get($zindex, loader);
        background-color: $loading-background;

        .loader {
          position: fixed;
          top:33%;
          left: calc((#{$page-max-width}/3*2) + ((100% - 1440px)/2));
          transform: translateX(-50%);
        }
      }

      .slide-in-form {
        top: $spacing-small + $row-height-small;
        position: absolute;
      }
    }

    .subtitle {
      color: $font-color-second;
      padding: $spacing;
    }
  }

  .base-form-spacing {
    margin-top: $spacing;
  }

  .last-modified {
    margin: $spacing 0;
    color: $font-color-second;
    font-size: $font-size-small;
    line-height: $line-height;
    order: 2;
  }

  .mobile-save-row {
    margin-top: $spacing;
    display: none;
    transition: none;
  }

  .fade-form-enter-active,
  .fade-form-leave-active {
    transition: all 0.5s ease-in-out;
    opacity: 0;
  }

  .fade-form-enter-to,
  .fade-form-leave {
    opacity: 1;
  }

  .fade-form-enter,
  .fade-form-leave-to {
    opacity: 0;
  }

  .slide-fade-form-enter-active,
  .slide-fade-form-move {
    transition: all 0.5s ease;
  }

  .slide-fade-form-enter, .slide-fade-form-leave-to {
    opacity: 0;
    transform: translateY(-#{$spacing});
  }

  .slide-fade-form-leave-active {
    position: absolute;
    transition: all 0.3s ease;
  }

  .slide-child-form-enter-active {
    box-shadow: $pop-up-shadow;
    transition: opacity 0.4s ease-in, transform 0.5s ease-in, box-shadow 0.7s ease-in;
  }

  .slide-child-form-enter-to {
    box-shadow: none;
  }

  .slide-child-form-enter {
    transform: translateY(400px);
    opacity: 0;
    box-shadow: $pop-up-shadow;
  }

  @media screen and (max-width: $page-max-width) {
    .form-component {
      .form-container {
        .form-loading-area {
          .loader {
            left: 66%;
            transform: translateX(-50%);
          }
        }
      }
    }
  }

  @media screen and (max-width: $mobile) {
    .form-component {
      .form-head {
        padding-top: $spacing-small;
        position: relative;
        top: 0;
      }

      .form-container {
        .form-loading-area {
          .loader {
            left: 50%;
            transform: translateX(-50%);
          }
        }
      }
    }

    .mobile-save-row {
      display: flex;
    }
  }
</style>
