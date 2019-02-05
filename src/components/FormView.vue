
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
        :is-published="valueList.published"/>
    </div>

    <!-- FORM -->
    <div class="form-container">
      <BaseForm
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
        <AttachmentAreaNew
          key="attachments"
          :file-list="valueList.files"
          @open-new-form="openNewForm"/>
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
import { BaseMenuEntry } from 'base-components';
import BaseRow from './BaseRow';
import BaseFormOptions from './BaseFormOptions';
import BaseForm from './BaseForm';

import { FORM_MAPPINGS } from '../assets/data';
import AttachmentAreaNew from './AttachmentArea';
import AttachmentArea from './Attachments';

export default {
  components: {
    BaseMenuEntry,
    AttachmentArea,
    AttachmentAreaNew,
    BaseFormOptions,
    BaseRow,
    BaseForm,
  },
  data() {
    return {
      unsavedChanges: false,
      formFields: Object.assign({}, FORM_MAPPINGS.common.properties, { type: Object.assign({}, FORM_MAPPINGS.common.properties.type, { type: 'array' }) }),
      formFieldsExtension: {},
      valueList: {},
      showOverlay: false,
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
    currentItemId(val) {
      if (val) {
        this.resetForm();
        this.updateForm();
      } else {
        this.resetForm();
      }
      window.scrollTo(0, 0);
      this.showOverlay = false;
    },
    async type(val) {
      if (val) {
        this.formFieldsExtension = await this.$store.dispatch('data/fetchFormExtension', val);
      } else {
        this.formFieldsExtension = {};
      }
    },
  },
  created() {
    if (this.currentItemId) {
      this.updateForm();
    }
  },
  methods: {
    resetForm() {
      this.unsavedChanges = false;
      this.valueList = {};
    },
    async updateForm() {
      const data = await this.$store.dispatch('data/fetchEntryData', this.currentItemId);
      this.valueList = Object.assign({}, data);
    },
    handleInput(data, type) {
      debugger;
      this.unsavedChanges = true;
      if (type) {
        this.$set(this.valueList, type, Object.assign({}, this.valueList[type],
          JSON.parse(JSON.stringify(data))));
      } else {
        this.valueList = Object.assign({}, this.valueList, JSON.parse(JSON.stringify(data)));
      }
    },
    async saveForm() {
      if (this.valueList.title) {
        const data = Object.assign({}, this.valueList.data);
        try {
          if (!this.$route.params.id) {
            // TODO: check somewhere if the entry should be linked to a parent and
            // a) link to parent entry b) save to database
            // --> do this.linkEntries(this.$store.data.currentItemId)
            await this.$store.dispatch('data/addSidebarItem', Object.assign({}, this.valueList, { data }));
            this.$router.push(`/entry/${this.$store.state.data.currentItemId}`);
          } else {
            await this.$store.dispatch('data/updateEntry', Object.assign({}, this.valueList, { data }));
          }
          this.unsavedChanges = false;
          this.$emit('save-form');
        } catch (e) {
          this.$notify({
            group: 'request-notifications',
            title: 'Saving to database failed',
            text: e.message,
            type: 'warn',
          });
        }
      } else {
        this.$notify({
          group: 'request-notifications',
          title: 'Title missing',
          text: 'In order to save please specify a title!',
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
        this.$store.commit('data/setParentItem', this.valueList.id);
        this.$store.commit('data/setNewForm', true);

        window.scrollTo(0, 0);
        setTimeout(() => {
          this.saveForm();
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
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .form-component {

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
      position: relative;

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
</style>
