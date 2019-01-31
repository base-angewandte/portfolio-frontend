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
            ref="formExtension"
            :form-field-json="formFieldsExtension"
            :value-list="valueList.data"
            class="form"
            @values-changed="handleInput($event, 'data')"/>

          <!-- ATTACHMENTS -->
          <AttachmentAreaNew
            :file-list="valueList.files"/>

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
import AttachmentArea from './Attachments';

export default {
  components: {
    AttachmentArea,
    AttachmentAreaNew,
    BaseFormOptions,
    BaseRow,
    BaseFormNew,
  },
  data() {
    return {
      unsavedChanges: false,
      formFields: Object.assign({}, FORM_MAPPINGS.common.properties, { type: Object.assign({}, FORM_MAPPINGS.common.properties.type, { type: 'array' }) }),
      formFieldsExtension: {},
      valueList: {},
    };
  },
  computed: {
    currentItemId() {
      console.log(this.$route.params.id);
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
        this.resetForm();
        this.updateForm();
      } else {
        this.resetForm();
      }
      window.scrollTo(0, 0);
    },
    async type(val) {
      if (val) {
        console.log('from type');
        this.formFieldsExtension = await this.$store.dispatch('data/fetchFormExtension', val);
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
      console.log('handle input');
      this.unsavedChanges = true;
      if (type) {
        this.$set(this.valueList, type, Object.assign({}, JSON.parse(JSON.stringify(data))));
      } else {
        this.valueList = Object.assign({}, JSON.parse(JSON.stringify(data)));
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
