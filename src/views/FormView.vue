
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
    <div
      class="form-container">
      <div
        v-if="formIsLoading"
        class="form-loading-area">
        <BaseLoader />
      </div>
      <BaseForm
        v-if="Object.keys(formFields).length"
        ref="baseForm"
        :form-field-json="formFields"
        :value-list="valueList"
        @values-changed="handleInput($event)"
      />
      <transition-group
        name="slide-fade-form">

        <!-- FORM EXTENSION -->
        <div
          v-if="type"
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

    </div>
  </div>
</template>

<script>
import { BaseMenuEntry, BaseLoader } from 'base-components';
import BaseRow from '../components/BaseRow';
import BaseFormOptions from '../components/BaseFormOptions';
import BaseForm from '../components/BaseForm';

import AttachmentArea from '../components/AttachmentArea';

export default {
  components: {
    BaseMenuEntry,
    AttachmentArea,
    BaseFormOptions,
    BaseRow,
    BaseForm,
    BaseLoader,
  },
  data() {
    return {
      unsavedChanges: false,
      formFields: {},
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
  },
  watch: {
    async currentItemId(val) {
      this.formIsLoading = true;
      if (val) {
        this.resetForm();
        await this.updateForm();
      } else {
        this.resetForm();
      }
      window.scrollTo(0, 0);
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
            type: 'warn',
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
  async created() {
    this.formIsLoading = true;
    this.formFields = await this.$store.dispatch('data/fetchGeneralFields');
    if (this.currentItemId) {
      await this.updateForm();
    }
    this.formIsLoading = false;
  },
  methods: {
    resetForm() {
      this.unsavedChanges = false;
      this.valueList = {};
      this.$refs.baseForm.initializeValueObject();
    },
    async updateForm() {
      const data = await this.$store.dispatch('data/fetchEntryData', { id: this.currentItemId });
      this.valueList = Object.assign({}, data);
    },
    handleInput(data, type) {
      this.unsavedChanges = true;
      // check if type is set (=this event is coming from a subform)
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
        // remove properties from contributor fields that can not be saved to the database
        const data = Object.assign({}, this.valueList.data);
        // TODO: use more general way of removing unknown properties by checking
        // with formfields(extension)
        Object.keys(this.formFieldsExtension).forEach((key) => {
          if (key === 'contributors' || this.formFieldsExtension[key]['x-attrs'].equivalent === 'contributors') {
            if (data[key] && data[key].length) {
              /* eslint-disable-next-line */
              data[key].forEach(entry => delete entry.additional);
              /* eslint-disable-next-line */
              data[key].forEach(entry => delete entry.source_name);
            }
          }
        });
        try {
          // check if the route indicates an already saved entry or a new entry
          if (!this.currentItemId) {
            const newEntryId = await this.$store.dispatch('data/addSidebarItem', Object.assign({}, this.valueList, { data }));
            // also add linked entries if there are already any
            const list = this.$store.getters['data/getLinkedIds'];
            if (list.length) {
              await this.$store.dispatch('data/actionLinked', { list, action: 'save' });
              // TODO: also do this for attached media??
            }
            // link entry to parent if parent items are present
            const parent = this.$store.getters['data/getLatestParentItem'];
            if (parent) {
              const relationData = {
                from_entry: parent.id,
                to_entry: newEntryId,
              };
              await this.$store.dispatch('PortfolioAPI/post', {
                kind: 'relation',
                data: relationData,
              });
              // TODO: inform user of successful entry (what if only linking fails?)
            }
            this.$router.push(`/entry/${this.$store.state.data.currentItemId}`);
            // if id present just update the entry
          } else {
            await this.$store.dispatch('data/updateEntry', Object.assign({}, this.valueList, { data }));
          }
          this.$emit('data-changed');
          this.unsavedChanges = false;
        } catch (e) {
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.saveFail'),
            text: e.message,
            type: 'warn',
          });
        }
      } else {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.titleMissing'),
          text: this.$t('notify.addTitle'),
          type: 'warn',
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
    openNewForm() {
      if (this.valueList.title) {
        this.showOverlay = true;
        this.$store.commit('data/setParentItem', this.valueList);
        this.$store.commit('data/setNewForm', true);

        window.scrollTo(0, 0);
        setTimeout(() => {
          this.saveForm();
          // TODO: if saving of entry fails below should not happen!
          this.resetForm();
          this.$store.commit('data/deleteCurrentItem');
          this.$router.push('/new');
        }, 700);
      } else {
        this.$notify({
          group: 'request-notifications',
          title: 'Linking not possible',
          text: 'Please specify a title for this entry first',
          type: 'warn',
        });
      }
    },
    returnToParent(id) {
      this.$store.commit('data/deleteLastParentItem');
      this.$router.push(`/entry/${id}`);
    },
    async actionEntry(action) {
      if (!this.isNewForm && !this.unsavedChanges) {
        await this.$store.dispatch('data/actionEntries', {
          action,
          entries: [].concat(this.valueList),
        });
      } else {
        this.$notify({
          group: 'request-notifications',
          title: 'Unsaved Changes',
          text: `Please save your ${this.isNewForm ? 'new Form' : 'Changes'} first!`,
          type: 'warn',
        });
      }
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
