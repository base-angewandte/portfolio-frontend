<template>
  <!-- ARCHIVAL VALIDATION FORM -->
  <div>
    <p class="popup-para">
      {{ $t('archival.fieldsMissingText') }}
    </p>
    <ul
      class="error-list">
      <li
        v-for="(value, name) in validationErrors"
        :key="name">
        <base-icon
          class="error-list-icon"
          name="attention"
          title="attention" />
        {{ name }}
        <ul
          class="error-list-indented">
          <li
            v-for="item in value"
            :key="item">
            &mdash; {{ item }}
          </li>
        </ul>
      </li>
    </ul>
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
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ArchivalValidationForm',
  /**
   * To populate drop-down lists and handle auto-completion,
   * inject properties and methods provided by FormView
   */
  inject: ['dropDownListsMain', 'fetchAutocompleteMain', 'handleInputMain', 'localesMain', 'reactive'],
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
      // All validation errors in a user-friendly format (key = localized field title).
      validationErrors: {},
    };
  },
  computed: {
    ...mapGetters('data', [
      'getArchivalErrors',
      'getGeneralSchema',
      'getExtensionSchema',
      'getCurrentItemData',
      'getIsValidatingForArchival',
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
            // Create a *deep* copy of the form data from the schema object
            formDataObj[key] = JSON.parse(JSON.stringify(schemaObj[key]));
            // Set the field placeholder to the validation error text.
            formDataObj[key]['x-attrs'].placeholder = value.join(' ');
            // If the field occupies only half of the available width,
            // set width to full, so as not to create empty space next to field
            if (formDataObj[key]['x-attrs'] && formDataObj[key]['x-attrs'].field_format) {
              if (formDataObj[key]['x-attrs'].field_format === 'half') {
                formDataObj[key]['x-attrs'].field_format = 'full';
              }
            }
            // Add the current error item to the component's validationErrors object
            this.validationErrors[formDataObj[key].title] = value;
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
.popup-para {
  margin: $spacing auto 0 auto;
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
</style>
