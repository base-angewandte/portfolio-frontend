
<template>
  <div class="form-component">
    <div class="form-head">

      <!-- PARENT HEADER -->
      <div
        v-if="parent"
        class="base-row-parent base-row-header"
        @click="returnToParent(parent.id)">
        <BaseMenuEntry
          :title="parent.title"
          :title-bold="true"
          :subtext="parent.type"
          entry-id="parentheader"
          icon="sheet-empty"/>
      </div>

      <!-- HEADER ROW -->
      <BaseRow
        :title="title"
        :type="type"
        :show-back-button="!!parent"
        :unsaved-changes="unsavedChanges"
        :is-saving="dataSaving"
        @save="saveForm"
        @return="returnFromForm"
      />
      <!-- OPTIONS -->
      <BaseFormOptions
        :is-new-form="$store.state.data.isNewForm"
        :is-published="valueList.published"
        @action-entry="actionEntry"/>
    </div>

    <!-- FORM -->
    <form
      class="form-container">
      <div
        v-if="formIsLoading"
        class="form-loading-area">
        <BaseLoader class="loader" />
      </div>
      <BaseForm
        v-if="Object.keys(formFields).length"
        ref="baseForm"
        :form-field-json="formFields"
        :value-list="valueList"
        :prefetched-drop-down-lists="{
          texts_secondary: textTypes,
        }"
        @values-changed="handleInput($event)"
      />
      <transition-group
        name="slide-fade-form">

        <!-- FORM EXTENSION -->
        <div
          v-if="type && !formIsLoading"
          key="extended-section">
          <div
            key="extended-title"
            class="subtitle">{{ $t('form-view.formExtended') }}
          </div>
          <BaseForm
            key="extended-form"
            ref="formExtension"
            :form-field-json="formFieldsExtension"
            :value-list="valueList.data"
            :prefetched-drop-down-lists="{
              contributors_secondary: roles,
            }"
            class="form"
            @values-changed="handleInput($event, 'data')"/>
        </div>

        <!-- ATTACHMENTS -->
        <AttachmentArea
          v-if="Object.keys(formFields).length"
          key="attachments"
          @open-new-form="openNewForm"
          @show-preview="$emit('show-preview', $event)"/>
      </transition-group>
      <transition name="slide-child-form">
        <BaseForm
          v-if="showOverlay"
          ref="overlay"
          :form-field-json="formFields"
          class="form slide-in-form"/>
      </transition>

    </form>
  </div>
</template>

<script>
import { BaseMenuEntry, BaseLoader } from 'base-components';
import BaseRow from '../components/BaseRow';
import BaseFormOptions from '../components/BaseFormOptions';
import BaseForm from '../components/BaseForm';

import AttachmentArea from '../components/AttachmentArea';
import { attachmentHandlingMixin } from '../mixins/attachmentHandling';
import { entryHandlingMixin } from '../mixins/entryHandling';

export default {
  components: {
    BaseMenuEntry,
    AttachmentArea,
    BaseFormOptions,
    BaseRow,
    BaseForm,
    BaseLoader,
  },
  mixins: [
    attachmentHandlingMixin,
    entryHandlingMixin,
  ],
  data() {
    return {
      unsavedChanges: false,
      dataSaving: false,
      formFieldsExtension: {},
      valueList: {},
      showOverlay: false,
      formIsLoading: false,
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
      return type && type.length && !this.showOverlay ? type[0] : '';
    },
    parent() {
      return this.$store.getters['data/getLatestParentItem'];
    },
    formFields() {
      return this.$store.getters['data/getFormFields'];
    },
    textTypes() {
      return this.$store.getters['data/getFormTextTypes'];
    },
    roles() {
      return this.$store.getters['data/getFormRoles'];
    },
    objectTypes() {
      return this.$store.getters['data/getFormObjectTypes'];
    },
  },
  watch: {
    async currentItemId(val) {
      window.scrollTo(0, 0);
      this.formIsLoading = true;
      if (val) {
        this.resetForm();
        await this.updateForm();
      } else {
        this.resetForm();
      }
      this.showOverlay = false;
      this.formIsLoading = false;
    },
    async type(val) {
      if (val) {
        try {
          const response = await this.$store.dispatch('PortfolioAPI/get', {
            kind: 'jsonschema',
            id: val,
          });
          this.formFieldsExtension = response.properties || {};
        } catch (e) {
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.somethingWrong'),
            text: this.$t('notify.entryTypeNotFound', { type: val }),
            type: 'error',
          });
          // reset type
          this.valueList.type = [];
          // empty extension
          this.formFieldsExtension = {};
        }
      } else {
        this.formFieldsExtension = {};
      }
    },
  },
  created() {
    this.fetchGeneralFormFields();
    this.$store.dispatch('data/getStaticDropDowns');
    if (this.currentItemId) {
      this.updateForm();
    }
  },
  methods: {
    async fetchGeneralFormFields() {
      this.formIsLoading = true;
      try {
        await this.$store.dispatch('data/fetchGeneralFields');
      } catch (e) {
        // TODO: if form fields can not be fetched this should probably
        //  abort all further entry data / extension loadings (redirect to dashboard?)
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.somethingWrong'),
          text: this.$t('notify.formDataNotFound'),
          type: 'error',
        });
      }
      this.formIsLoading = false;
    },
    resetForm() {
      this.unsavedChanges = false;
      this.valueList = {};
      this.$refs.baseForm.initializeValueObject();
    },
    async updateForm() {
      try {
        const data = await this.$store.dispatch('data/fetchEntryData', { id: this.currentItemId });
        this.valueList = Object.assign({}, data);
      } catch (e) {
        console.error(e);
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.somethingWrong'),
          text: this.$t('notify.fetchSingleEntry'),
          type: 'error',
        });
        this.$router.push('/');
      }
    },
    handleInput(data, type) {
      this.unsavedChanges = true;
      // check if type is set (= this event is coming from a subform)
      if (type) {
        this.$set(this.valueList, type, Object.assign({}, this.valueList[type],
          JSON.parse(JSON.stringify(data))));
      } else {
        // check if type has changed - if yes - delete old properties in data
        if (!this.valueList.type || this.valueList.type[0] !== data.type[0]) {
          // TODO: not only delete but map data between fields!!
          this.valueList.data = {};
        }
        this.valueList = Object.assign({}, this.valueList, JSON.parse(JSON.stringify(data)));
      }
    },
    async saveForm() {
      // check if there is a title (only requirement for saving)
      if (this.valueList.title) {
        this.dataSaving = true;
        // remove properties from contributor fields that can not be saved to the database
        // TODO: check if this can be even further consolidated
        const valueListToSave = {};
        Object.keys(this.formFields).forEach((key) => {
          this.$set(
            valueListToSave,
            key,
            this.removeProperties(key, this.formFields[key], this.valueList[key]),
          );
        });
        const data = {};
        Object.keys(this.valueList.data).forEach((key) => {
          this.$set(
            data,
            key,
            this.removeProperties(key, this.formFieldsExtension[key], this.valueList.data[key]),
          );
        });
        try {
          // check if the route indicates an already saved entry or a new entry
          if (!this.currentItemId) {
            const newEntryId = await this.$store.dispatch('data/addOrUpdateEntry', Object
              .assign({}, valueListToSave, { data }));
            // also add linked entries if there are already any
            const list = this.$store.getters['data/getLinkedIds'];
            if (list.length) {
              this.actionLinked({ list, action: 'save' });
              // TODO: also do this for attached media??
            }
            // link entry to parent if parent items are present
            const parent = this.$store.getters['data/getLatestParentItem'];
            if (parent) {
              const relationData = {
                from_entry: `${parent.id}`,
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
                  text: this.$t('notify.linkToParentFail', { title: parent.title }),
                  type: 'error',
                });
                // to also give user visual feedback that there is actually no link
                this.$store.commit('data/deleteParentItems');
              }
            }
            this.$router.push(`/entry/${this.$store.state.data.currentItemId}`);
            // if id present just update the entry
          } else {
            await this.$store.dispatch('data/addOrUpdateEntry', Object
              .assign({}, valueListToSave, { data }));
          }
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.saveSuccess'),
            text: this.$t('notify.saveSuccessSubtext', { title: this.valueList.title }),
            type: 'success',
          });
          this.$emit('data-changed');
          this.unsavedChanges = false;
        } catch (e) {
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.saveFail'),
            text: e.message,
            type: 'error',
          });
        }
        this.dataSaving = false;
      } else {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.titleMissing'),
          text: this.$t('notify.addTitle'),
          type: 'error',
        });
      }
    },
    returnFromForm() {
      if (this.parent) {
        this.returnToParent(this.parent.id);
      } else {
        this.$router.push('/');
      }
    },
    async openNewForm() {
      if (this.valueList.title) {
        if (!this.currentItemId) {
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.linkingNotPossible'),
            text: this.$t('notify.linkingNotPossible'),
            type: 'error',
          });
        }
        if (this.unsavedChanges) {
          this.$store.commit('data/setPopUp', {
            show: true,
            header: this.$t('notify.unsavedChangesTitle'),
            text: this.$t('notify.unsavedChangesText'),
            icon: 'save-file',
            buttonTextRight: this.$t('notify.saveChanges'),
            buttonTextLeft: this.$t('notify.dismissChanges'),
            actionRight: async () => {
              await this.saveForm();
              this.$store.commit('data/hidePopUp');
              this.openNewForm();
            },
            actionLeft: () => { this.unsavedChanges = false; this.openNewForm(); },
          });
        } else {
          this.showOverlay = true;
          this.$store.commit('data/setParentItem', this.valueList);
          this.$store.commit('data/setNewForm', true);

          window.scrollTo(0, 0);
          setTimeout(() => {
            this.$store.commit('data/deleteCurrentItem');
            this.resetForm();
            this.$router.push('/new');
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
      if (!this.isNewForm) {
        this.confirmAction({ action, entries: [].concat(this.valueList) });
      } else {
        this.$notify({
          group: 'request-notifications',
          title: 'Unsaved Changes',
          text: `Please save your ${this.isNewForm ? 'new Form' : 'Changes'} first!`,
          type: 'error',
        });
      }
    },
    async action(action) {
      await this.actionEntries(action);
      if (action === 'delete') {
        this.$router.push('/');
      }
      // TODO: check if published can be updated here!
      this.$emit('data-changed');
    },
    /**
     * removing all properties that can not be saved to the database by comparing to the
     * swagger provided information
     *
     * @param key: the key of the object property
     * @param field: the field properties (title, type, x-attrs etc)
     * @param values: the values from valueList for these property
     * @returns {Array|Object|String|Boolean}
     */
    removeProperties(key, field, values) {
      // special case texts - will be mapped to correct structure later
      // special case type - will be made string later
      // TODO: integrate mapping here
      if ((field['x-attrs'] && field['x-attrs'].hidden) || key === 'texts' || key === 'type') {
        return values;
      }
      // check if field is array
      if (field.type === 'array') {
        // check if values are already present and set those if yes
        if (values && values.length) {
          return values
            .map(value => this.removeProperties('', field.items, value));
        }
        // else return empty array
        return [];
        // check if field is object
      }
      if (field.type === 'object') {
        const validProperties = {};
        Object.keys(values).forEach((valueKey) => {
          if (field.properties[valueKey]) {
            if (field.properties[valueKey].type === 'object' || field.properties[valueKey].type === 'array') {
              const validatedObj = this.removeProperties(
                valueKey,
                field.properties[valueKey],
                values[valueKey],
              );
              this.$set(validProperties, [valueKey], validatedObj);
            } else {
              this.$set(validProperties, [valueKey], values[valueKey]);
            }
          }
        });
        return validProperties;
      }
      if (field.type === 'string' && values && typeof values === 'object') {
        return values.label;
      }
      return values;
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables";

  .form-component {
    position: relative;
    min-height: 100vh;

    .form-head {
      background-color: $background-color;
      position: sticky;
      top: $header-height;
      z-index: 5;
      padding-top: $spacing;
      padding-bottom: $spacing-small;

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
          z-index: 10;
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
      min-height: 100vh;
      position: relative;

      .form-loading-area {
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 6;
        background-color: rgba(255,255,255, 0.50);

        .loader {
          position: fixed;
          top: 50%;
          left: 66%;
        }
      }

      .slide-in-form {
        top: 0;
        position: absolute;
      }
    }

    .subtitle {
      color: $font-color-second;
      padding: $spacing;
    }
  }

  .slide-fade-form-enter-active, .slide-fade-form-move {
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

  @media screen and (max-width: $mobile) {
    .form-component {
      .form-head {
        padding-top: $spacing-small;
      }
    }
  }
</style>
