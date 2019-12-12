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
      <BaseForm
        v-if="Object.keys(formFields).length"
        ref="baseForm"
        :form-field-json="formFields"
        :value-list="valueList"
        :prefetched-drop-down-lists="{
          texts_secondary: preFetchedData.texts_type,
          type: objectTypes,
          keywords: preFetchedData.keywords,
        }"
        @values-changed="handleInput($event)" />
      <transition-group
        name="slide-fade-form">
        <!-- FORM EXTENSION -->
        <div
          v-if="type && formDataPresent"
          key="extended-section">
          <div
            key="extended-title"
            class="subtitle">
            {{ $t('form-view.formExtended') }}
          </div>
          <BaseForm
            key="extended-form"
            ref="formExtension"
            :form-field-json="formFieldsExtension"
            :value-list="valueList.data"
            :prefetched-drop-down-lists="{
              contributors_secondary: prefetchedRoles,
              material: preFetchedData.material,
              format: preFetchedData.format,
              language: preFetchedData.language,
              open_source_license: preFetchedData.open_source_license,
            }"
            class="form"
            @values-changed="handleInput($event, 'data')" />
        </div>

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
          icon="sheet-empty" />
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
      v-if="valueList.date_created && valueList.date_changed"
      class="last-modified">
      {{
        `${$t('form-view.created')} ${createHumanReadableData(valueList.date_created)}` }} <br>
      {{ `${$t('form-view.lastModified')} ${createHumanReadableData(valueList.date_changed)}`
      }}
    </div>
  </div>
</template>

<script>
import {
  BaseMenuEntry, BaseLoader,
} from 'base-ui-components';
import axios from 'axios';
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
    preFetchedData() {
      return this.$store.state.data.prefetchedTypes;
    },
    objectTypes() {
      return this.$store.state.PortfolioAPI.schemas;
    },
    formDataPresent() {
      return !this.currentItemId || (!!Object.keys(this.formFields).length
        && !!Object.keys(this.valueList).length
        && !(this.type && !Object.keys(this.formFieldsExtension).length));
    },
    formFieldsExtension() {
      return this.$store.getters['data/getExtensionSchema'];
    },
    attachmentsCount() {
      return this.$store.getters['data/getCurrentMedia'].length;
    },
    unsavedChanges() {
      return JSON.stringify(this.valueList) !== JSON.stringify(this.valueListOriginal);
    },
  },
  watch: {
    async currentItemId(val) {
      window.scrollTo(0, 0);
      sessionStorage.removeItem('valueList');
      sessionStorage.removeItem('parent');
      if (val) {
        this.resetForm();
        await this.updateForm();
      } else {
        this.resetForm();
      }
      this.showOverlay = false;
    },
    async type(val) {
      if (val) {
        try {
          this.extensionIsLoading = true;
          const { properties } = await this.$store.dispatch('PortfolioAPI/get', {
            kind: 'jsonschema',
            id: encodeURIComponent(this.valueList.type[0].source),
          });
          this.$store.commit('data/setExtensionSchema', properties || {});
          await this.$store.dispatch('data/getStaticDropDowns', properties);

          // prepare roles by filtering all the roles that have separate fields
          const contributorFields = Object.keys(properties).reduce((prev, curr) => {
            const field = properties[curr];
            if (field['x-attrs'] && field['x-attrs'].equivalent === 'contributors') {
              prev.push(field['x-attrs'].default_role);
            }
            return prev;
          }, []);
          this.prefetchedRoles = this.$store.state.data.prefetchedTypes.contributors_role
            .filter(role => !contributorFields.includes(role.source));
        } catch (e) {
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
  },
  async created() {
    this.formIsLoading = true;
    // check if a parent was stored in session storage
    const storedParentString = sessionStorage.getItem('parent');
    if (storedParentString) {
      this.$store.commit('data/setParentItem', JSON.parse(storedParentString));
    }
    await this.fetchGeneralFormFields();
    // this.$store.dispatch('data/getStaticDropDowns');
    if (this.currentItemId) {
      await this.updateForm();
    } else {
      this.formIsLoading = false;
    }
    // check if previously unsaved changes were stored in session storage
    const storedValueList = JSON.parse(sessionStorage.getItem('valueList'));
    // if it matches the current entry id, merge it with db fetched data
    if (storedValueList && storedValueList.id === this.currentItemId) {
      this.valueList = Object.assign({}, this.valueList, storedValueList);
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
    window.addEventListener('beforeunload', () => {
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
    async fetchGeneralFormFields() {
      try {
        await this.$store.dispatch('data/fetchGeneralFields');
      } catch (e) {
        // only send error message if user is authenticated
        if (!e || !e.response || e.response.status !== 403) {
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
      }
    },
    resetForm() {
      this.valueList = {};
      this.valueList.data = {};
      this.valueListOriginal = { ...this.valueList };
      this.$refs.baseForm.initializeValueObject();
    },
    async updateForm() {
      this.formIsLoading = true;
      try {
        const data = await this.$store.dispatch('data/fetchEntryData', this.currentItemId);
        this.valueList = Object.assign({}, data);
        this.extensionIsLoading = !!this.type;
        this.$set(this.valueList, 'data', { ...data.data });
        // copy the original object to check for unsaved changes later
        this.valueListOriginal = { ...this.valueList };
      } catch (e) {
        if (e && e.response && e.response.status === 404) {
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
      this.formIsLoading = false;
    },
    handleInput(data, type) {
      // check if type is set (= this event is coming from a subform)
      if (type) {
        this.$set(this.valueList, type, Object.assign({}, this.valueList[type],
          JSON.parse(JSON.stringify(data))));
      } else {
        // check if type has changed - if yes - map data to new fields
        if (JSON.stringify(this.valueList.type) !== JSON.stringify(data.type)) {
          // TODO: map data between fields!!
        }
        this.valueList = Object.assign({}, this.valueList, JSON.parse(JSON.stringify(data)));
      }
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
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.saveSuccess'),
            text: this.$t('notify.saveSuccessSubtext', { title: validData.title }),
            type: 'success',
          });
          this.valueListOriginal = { ...this.valueList };
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
      return `${date.toLocaleDateString('de')} ${this.$t('form-view.at')} ${date.toLocaleTimeString('de')}`;
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
              await this.saveForm();
              followUpAction();
            } catch (e) {
              console.error(e);
            }
            this.$store.commit('data/hidePopUp');
          },
          actionLeft: followUpAction,
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
      z-index: 5;
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
        z-index: 2;
        background-color: rgba(255,255,255, 0.50);

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
