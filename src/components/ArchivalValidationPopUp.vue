<template>
  <!-- ARCHIVAL VALIDATION POP-UP -->
  <base-pop-up
    :show="isPopUpOpen"
    :title="$t('archival.fieldsMissingTitle')"
    @close="onCancel">
    <div class="popup-body">
      <archival-validation-form
        :key="formKey" />
    </div>
    <template v-slot:button-row>
      <base-button
        button-style="single"
        :text="$t('cancel')"
        icon="remove"
        icon-position="right"
        icon-size="small"
        class="base-archival-bar-button"
        @clicked="onCancel" />
      <base-button
        button-style="single"
        :text="$t('next')"
        :disabled="getIsValidatingForArchival || getIsFormSaving"
        :icon="getIsValidatingForArchival || getIsFormSaving ? '' : 'save-file'"
        icon-position="right"
        icon-size="small"
        class="base-archival-bar-button"
        @clicked="onNext">
        <template
          v-if="getIsValidatingForArchival || getIsFormSaving"
          slot="right-of-text">
          <span class="base-upload-bar-loader">
            <BaseLoader />
          </span>
        </template>
      </base-button>
    </template>
  </base-pop-up>
</template>

<script>
import { mapGetters } from 'vuex';
import ArchivalValidationForm from './ArchivalValidationForm';

export default {
  components: {
    ArchivalValidationForm,
  },
  props: {
    isPopUpOpen: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      // uniquely identifies each instance of the ArchivalValidationForm component
      formKey: 0,
    };
  },
  computed: {
    ...mapGetters('data', [
      'getIsValidatingForArchival',
      'getIsFormSaving',
    ]),
  },
  methods: {
    /**
     * Occurs when the user clicks "Next" on the pop-up.
     */
    onNext() {
      this.$emit('next-step');
    },
    /**
     * Occurs when the user clicks "Cancel" on the pop-up.
     */
    onCancel() {
      this.$emit('cancel-validation');
    },
    /**
     * Rerenders the popup's form component.
     * Used to reload the form each time after "Next" is clicked.
     */
    reloadForm() {
      this.formKey += 1;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/variables.scss";
.popup-body {
  max-height: 50vh;
  overflow-y:scroll;
}
.base-archival-bar-button {
  flex-basis: 100%;
    .base-upload-bar-loader {
      position: relative;
      transform: scale(0.5);
      margin-left: $spacing;
      padding-left: $spacing;
    }
}
.base-archival-bar-button + .base-archival-bar-button {
  margin-left: $spacing;
}
.error-list {
  margin: 1em 0 0 1em;
}
.error-list-indented {
  margin: 0 0 0 2em;
}
.error-list-icon {
  height: $icon-medium;
  width: $icon-medium;
  margin: 0 $spacing-small;
  color: $app-color;
}
@media screen and (max-width: $mobile) {
  .base-archival-bar-button + .base-archival-bar-button {
      margin-left: 0;
      margin-top: $spacing;
  }
}
</style>
