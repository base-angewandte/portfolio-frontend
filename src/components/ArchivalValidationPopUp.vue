<template>
  <!-- ARCHIVAL VALIDATION POP-UP -->
  <base-pop-up
    :show="isPopUpOpen"
    :title="$t('archival.fieldsMissingTitle')"
    :button-right-text="$t('next')"
    button-right-icon="archive-arrow"
    @close="onCancel"
    @button-left="onCancel"
    @button-right="onNext">
    <div
      class="popup-body">
      <p class="popup-para">
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
        :field-is-loading="reactive.fieldIsLoading"
        @values-changed="handleInputMain($event, '')"
        @fetch-autocomplete="fetchAutocompleteMain" />
      <!-- THIS FORM CONTAINS EXTENSION ENTRY FIELDS (SPECIFIC TO A TYPE)-->
      <base-form
        key="archival-validation-form2"
        ref="archivalValidationForm2"
        form-id="archivalValidationForm2"
        style="margin-bottom: 1em;"
        :form-field-json="formData2"
        :value-list="valueList2"
        :available-locales="localesMain"
        :drop-down-lists="dropDownListsMain"
        :language="$i18n.locale"
        :field-is-loading="reactive.fieldIsLoading"
        @values-changed="handleInputMain($event, 'data')"
        @fetch-autocomplete="fetchAutocompleteMain" />
    </div>
  </base-pop-up>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  /**
   * To populate drop-down lists and handle auto-completion,
   * inject properties and methods provided by FormView
   */
  inject: ['dropDownListsMain', 'fetchAutocompleteMain', 'handleInputMain', 'localesMain', 'reactive'],
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
      // Values used to populate the first form on the pop-up
      valueList1: {},
      // Values used to populate the second form on the pop-up
      valueList2: {},
      // OpenAPI data for the first form -- the one which stores only general fields
      formData1: {},
      // OpenAPI data for the second form -- the one which stores extension fields
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
    // Create open API data (field structure) for both forms
    this.formData1 = this.createFormData(this.getArchivalErrors, this.getGeneralSchema);
    this.formData2 = this.createFormData(this.getArchivalErrors.data, this.getExtensionSchema);
    // Populate both forms with values from the store
    // Values for the extension form are to be found inside a 'data' key
    this.valueList1 = this.getCurrentItemData;
    this.valueList2 = this.getCurrentItemData.data;
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
        Object.entries(validationObj).forEach(([key, value]) => {
          if (schemaObj[key] && key !== 'data') {
            // Create a copy of the form data from the schema object
            formDataObj[key] = { ...schemaObj[key] };
            // Alter form data so as to set the field title to the validation error text.
            // Not using placeholder for that purpose because the field "Text" may already
            // be filled by the user at this point but still have an associated error
            // (e.g. Abstract is not set)
            const [errorText] = value;
            formDataObj[key].title = errorText;
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
.popup-body {
  max-height: 50vh;
  overflow-y:scroll;
}
.popup-para {
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
