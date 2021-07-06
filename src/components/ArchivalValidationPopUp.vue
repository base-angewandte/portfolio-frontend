<template>
  <!-- ARCHIVAL VALIDATION POP-UP -->
  <base-pop-up
    :show="showMe"
    :title="$t('archival.fieldsMissingTitle')"
    :button-right-text="$t('next')"
    button-right-icon="archive-arrow"
    @close="onCancel"
    @button-left="onCancel"
    @button-right="onNext">
    <div
      class="validation-popup-body"
      style="max-height: 50vh; overflow-y:scroll;">
      <p class="archival-popup-para">
        {{ $t('archival.fieldsMissingText') }}
      </p>
      <!-- THIS FORM CONTAINS GENERAL FIELDS (NOT SPECIFIC TO A TYPE)-->
      <base-form
        key="archival-validation-form1"
        ref="archivalValidationForm1"
        form-id="archivalValidationForm1"
        :form-field-json="formData1"
        :value-list="valueList1"
        :available-locales="localesMain"
        :drop-down-lists="dropDownListsMain"
        :language="$i18n.locale"
        @values-changed="handleInputMain($event, '')"
        @fetch-autocomplete="fetchAutocompleteMain" />
      <!-- THIS FORM CONTAINS EXTENSION ENTRY FIELDS (SPECIFIC TO A TYPE)-->
      <base-form
        key="archival-validation-form2"
        ref="archivalValidationForm2"
        form-id="archivalValidationForm2"
        :form-field-json="formData2"
        :value-list="valueList2"
        :available-locales="localesMain"
        :drop-down-lists="dropDownListsMain"
        :language="$i18n.locale"
        @values-changed="handleInputMain($event, 'data')"
        @fetch-autocomplete="fetchAutocompleteMain" />
    </div>
  </base-pop-up>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  /**
   * To populate drop-down lists and handle saving + auto-completion,
   * inject properties and methods provided by FormView
   */
  inject: ['dropDownListsMain', 'fetchAutocompleteMain', 'handleInputMain', 'localesMain'],
  props: {
    openMe: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      showMe: false,
      valueList1: {},
      valueList2: {},
      formData1: {},
      formData2: {},
    };
  },
  computed: {
    ...mapGetters('data', [
      'getArchivalErrors',
      'getGeneralSchema',
      'getExtensionSchema',
      'getCurrentItemData',
    ]),
  },
  mounted() {
    // Open the validation pop-up if such advice was received through the openMe prop
    this.showMe = this.openMe;
    // Create open API data for the first form -- the one which stores only general fields.
    this.formData1 = this.createFormData(this.getArchivalErrors, this.getGeneralSchema);
    // Create open API data for the second form -- the one which stores extension fields.
    // These are to be found inside a 'data' key.
    this.formData2 = this.createFormData(this.getArchivalErrors.data, this.getExtensionSchema);
    // If the user has already filled in some values in fields that failed validation,
    // populate such values on the first form.
    this.valueList1 = this.getCurrentItemData;
    // Same as above for the second form
    this.valueList2 = this.getCurrentItemData.data;
  },
  methods: {
    /**
     * Occurs when the user clicks "Next" on the pop-up.
     */
    async onNext() {
      this.$emit('next-step');
    },
    /**
     * Occurs when the user clicks "Cancel" on the pop-up.
     */
    onCancel() {
      this.$emit('cancel-validation');
    },
    /**
     * Returns form data that will be used to populate a BaseForm
     * with fields that failed validation in the backend.
     * Takes as parameter the validation results object received from
     * the backend and the schema object from where to extract the required form data.
     */
    createFormData(validationObj, schemaObj) {
      // the formData object is initially empty
      const formDataObj = {};
      // if validation object actually exists and has any keys
      if (validationObj && Object.keys(validationObj).length) {
        // iterate through each key
        Object.keys(validationObj).forEach((key) => {
          // Add a new key-value pair only if it exists in the schema object.
          if (schemaObj[key]) {
            formDataObj[key] = schemaObj[key];
          }
        });
      }
      return formDataObj;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/variables.scss";
.archival-popup-title {
  margin: $spacing auto 0 auto;
  font-size: $font-size-large;
}
.archival-popup-para {
  margin: $spacing auto 0 auto;
}
.base-archival-bar-button {
  flex-basis: 100%;
}
.base-archival-bar-button + .base-archival-bar-button {
    margin-left: $spacing;
 }
@media screen and (max-width: $tablet) {
  .attachment-area {
    .base-archival-bar-button + .base-archival-bar-button {
      margin-left: 0;
      margin-top: $spacing;
    }
  }
}
</style>
