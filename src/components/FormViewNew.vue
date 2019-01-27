<template>
  <div class="form-component">
    <div class="form-head">
      <!-- TODO: parent header -->
      <BaseRow
        :title="title"
        :type="type"
        :unsaved-changes="unsavedChanges"
        @save="saveForm"
        @return="returnFromForm"
      />
      <BaseFormOptions />
    </div>

    <div class="form-container">
      <BaseFormNew
        :form-field-json="formFields"
        :value-list="valueList"
        @values-changed="handleInput($event)"
      />
      <transition-group
        name="slide-fade2">
        <div
          v-if="type"
          key="extended-section"
          class="subsection">
          <div
            key="extended-title"
            class="subtitle">{{ $t('form-view.formExtended') }}</div>

          <!-- FORM EXTENSION -->
          <BaseFormNew
            key="extended-form"
            :form-field-json="formFieldsExtension"
            :value-list="valueList.data"
            class="form"
            @values-changed="handleInput($event, 'data')"/>

          <!-- ATTACHMENTS -->
          <AttachmentAreaNew />
        </div>
      </transition-group>

    </div>
  </div>
</template>

<script>
import BaseRow from './BaseRow';
import BaseFormOptions from './BaseFormOptions';
import BaseFormNew from './BaseFormNew';

import { FORM_MAPPINGS } from '../assets/data';
import AttachmentAreaNew from './AttachmentAreaNew';

export default {
  components: {
    AttachmentAreaNew,
    BaseFormOptions,
    BaseRow,
    BaseFormNew,
  },
  data() {
    return {
      unsavedChanges: false,
      formFields: FORM_MAPPINGS.common.properties,
      formFieldsExtension: {},
      valueList: {},
    };
  },
  computed: {
    currentItemId() {
      return this.$route.params.id;
    },
    title() {
      return this.valueList.title;
    },
    type() {
      console.log('get type');
      console.log(this.valueList);
      const { type } = this.valueList;
      return type && type.length ? type[0] : '';
    },
  },
  watch: {
    currentItemId(val) {
      if (val) {
        this.updateForm();
      } else {
        // TODO: remove values
      }
      window.scrollTo(0, 0);
    },
  },
  created() {
    if (this.currentItemId) {
      this.updateForm();
    }
  },
  methods: {
    async updateForm() {
      const data = await this.$store.dispatch('data/fetchEntryData', this.currentItemId);
      this.valueList = Object.assign({}, data);
      if (this.valueList.type) {
        this.formFieldsExtension = await this.$store.dispatch('data/fetchFormExtension', this.valueList.type[0]);
      }
    },
    handleInput(data, type) {
      console.log('handle input');
      this.unsavedChanges = true;
      if (type === 'data') {
        this.$set(this.valueList, 'data', Object.assign({}, JSON.parse(JSON.stringify(data))));
      } else {
        this.valueList = Object.assign({}, JSON.parse(JSON.stringify(data)));
      }
    },
    saveForm() {
      console.log('Save');
    },
    returnFromForm() {
      console.log('return');
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
    }

    .form-container {
      position: relative;
    }

    .subtitle {
      color: $font-color-second;
      padding: $spacing;
    }
  }

  .slide-fade2-enter-active, .slide-fade2-move {
    transition: all 0.5s ease;
  }
  .slide-fade2-enter, .slide-fade2-leave-to {
    opacity: 0;
    transform: translateY(-#{$spacing});
  }

  .slide-fade2-leave-active {
    position: absolute;
    transition: all 0.3s ease;
  }
</style>
