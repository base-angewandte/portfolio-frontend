<template>
  <div>
    <!-- TEXT FIELD -->
    <BaseInput
      v-if="fieldType === 'text'"
      :id="fieldKey"
      :key="fieldKey"
      v-model="fieldValueInt"
      :field-type="field.type === 'integer'
        ? 'number' : 'text'"
      :label="label"
      :placeholder="placeholderInt"
      :class="['base-form-field']"
      @keydown.enter.prevent="" />

    <!-- DATE FIELD -->
    <fieldset
      v-else-if="fieldType === 'date'"
      class="date-field-fieldset">
      <div class="date-field">
        <BaseDateInput
          :id="fieldKey"
          :key="fieldKey + 'date'"
          v-model="fieldValueInt"
          :label="label"
          :placeholder="placeholderInt"
          :range-separator="$t('form.until')"
          :format="field['x-attrs'].date_format"
          :type="dateType.includes('timerange') ? dateType.includes('daterange')
          ? 'daterange' : 'single' : dateType"
          :date-format-labels="{date: $t('form.date'), year: $t('form.year') }"
          :format-tabs-legend="$t('form.dateTabsLegend')"
          :language="language"
          :class="['base-form-field']" />
        <BaseDateInput
          v-if="dateType.includes('timerange')"
          :id="fieldKey"
          :key="fieldKey + 'time'"
          v-model="fieldValueInt"
          :label="field.properties.time_from.title"
          :show-label="false"
          :placeholder="placeholderInt"
          :range-separator="$t('form.until')"
          :type="'timerange'"
          :class="['base-form-field']" />
      </div>
    </fieldset>

    <!--MULTILINE TEXT FIELD -->
    <BaseMultilineTextInput
      v-else-if="fieldType === 'multiline'"
      :id="fieldKey"
      :key="fieldKey"
      :tabs="tabs"
      :tab-labels="tabs.map(tab => $t(tab))"
      :label="label"
      :placeholder="placeholderInt"
      :input="fieldValueInt"
      :tabs-legend="$t('form.textTabsLegend')"
      :active-tab="activeTab"
      class="base-form-field base-form-field-full"
      @text-input="setMultilineValue($event)">
      <template
        v-if="field.items && field.items.properties && field.items.properties.type">
        <BaseDropDown
          :id="fieldKey"
          :selected-option="fieldValueInt && fieldValueInt.type && fieldValueInt.type.source
            ? fieldValueInt.type : textTypeDefault"
          :options="textTypeOptions"
          :label="$t('form.texttype')"
          :language="language"
          value-prop="source"
          class="multiline-dropdown"
          @value-selected="setMultilineDropDown" />
      </template>
    </BaseMultilineTextInput>

    <!-- AUTOCOMPLETE -->
    <BaseAutocompleteInput
      v-else-if="fieldType === 'autocomplete'"
      :id="fieldKey"
      :key="fieldKey"
      v-model="fieldValueInt"
      :label="label"
      :placeholder="placeholderInt"
      :list="dropDownList"
      :object-prop="'label'"
      :is-loading="autocompleteLoading"
      :class="['base-form-field']"
      @autocomplete="$emit('fetch-autocomplete', {
        value: $event,
        name: field.name,
        source: field['x-attrs'].source
      })" />

    <!-- CHIPS INPUT -->
    <BaseChipsInput
      v-else-if="fieldType === 'chips'"
      :id="fieldKey"
      :key="fieldKey"
      v-model="fieldValueInt"
      :placeholder="placeholderInt"
      :label="label"
      :list="dropDownList"
      :allow-dynamic-drop-down-entries="field['x-attrs'] && field['x-attrs'].dynamic_autosuggest"
      :allow-multiple-entries="!isChipsSingleSelect"
      :allow-unknown-entries="field['x-attrs'] && field['x-attrs'].allow_unknown_entries"
      :class="['base-form-field']"
      :draggable="!isChipsSingleSelect"
      :hoverbox-content="hoverBoxData"
      :sortable="field.name === 'keywords' || (field['x-attrs'] && field['x-attrs'].sortable)"
      :is-loading="autocompleteLoading"
      :sort-text="sortText"
      :sort-name="isContributorOrEquivalent"
      :language="field['x-attrs'] && field['x-attrs'].set_label_language ? language : ''"
      identifier="source"
      object-prop="label"
      @fetch-dropdown-entries="fetchAutocomplete"
      @text-input="textInput = $event"
      @hoverbox-active="$emit('fetch-info-data')">
      <template
        slot="drop-down-entry"
        slot-scope="props">
        <span>
          {{ getLabel(props.item.label) }}
        </span>
        <span class="chips-dropdown-second">{{ props.item.additional }}</span>
        <span class="chips-dropdown-third">{{ props.item.source_name }}</span>
      </template>
      <template slot="no-options">
        <span v-if="field['x-attrs'] && field['x-attrs'].dynamic_autosuggest && !fieldInput">
          {{ $t('form.startTyping') }}
        </span>
        <span v-else-if="!(field['x-attrs'] && field['x-attrs'].dynamic_autosuggest) && textInput">
          {{ $t('form.noMatch') }}
        </span>
        <span v-else-if="fieldInput && !fetchingData && !autocompleteLoading">
          {{ $t('form.noResult') }}
        </span>
        <span v-else>
          {{ $t('form.fetchingResults') }}
        </span>
      </template>
    </BaseChipsInput>

    <!-- CHIPS-BELOW -->
    <BaseChipsBelow
      v-else-if="fieldType === 'chips-below'"
      :key="fieldKey"
      v-model="fieldValueInt"
      :label="label"
      :placeholder="placeholderInt"
      :list="dropDownList"
      :allow-unknown-entries="true"
      :allow-dynamic-drop-down-entries="true"
      :identifier="'source'"
      :hoverbox-content="hoverBoxData"
      :object-prop="'label'"
      :role-options="secondaryDropdown"
      :is-loading="autocompleteLoading"
      :sort-text="sortText"
      :sort-name="true"
      :chips-editable="true"
      :roles-placeholder="$t('form.selectRoles')"
      :language="language"
      class="base-form-field base-form-field-full"
      @fetch-dropdown-entries="fetchAutocomplete"
      @hoverbox-active="$emit('fetch-info-data')">
      <template
        slot="below-drop-down-entry"
        slot-scope="props">
        <span>{{ props.item.label }}</span>
        <span class="chips-dropdown-second">{{ props.item.additional }}</span>
        <span class="chips-dropdown-third">{{ props.item.source_name }}</span>
      </template>
      <template slot="no-options">
        <span v-if="!fieldInput">
          {{ $t('form.startTyping') }}
        </span>
        <span v-else-if="fieldInput && !fetchingData && !autocompleteLoading">
          {{ $t('form.noResult') }}
        </span>
        <span v-else>
          {{ $t('form.fetchingResults') }}
        </span>
      </template>
    </BaseChipsBelow>

    <!-- FIELD GROUPS -->
    <div
      v-else-if="fieldType === 'group'"
      :key="fieldKey"
      class="base-form-field base-form-field-array">
      <div
        v-if="field['x-attrs'] && field['x-attrs'].show_label"
        class="base-form-field-array-label">
        {{ $t('form.' + field.name) + ':' }}
      </div>
      <div
        :key="fieldKey"
        class="base-form-subform-wrapper">
        <BaseForm
          :form-field-json="groupFormFields"
          :value-list="fieldValueInt"
          :form-id="fieldKey + '_' + field.name"
          class="base-form-subform"
          @values-changed="$emit('subform-input', $event)" />
      </div>
    </div>
  </div>
</template>

<script>
import {
  BaseInput,
  BaseDateInput,
  BaseMultilineTextInput,
  BaseDropDown,
  BaseAutocompleteInput,
  BaseChipsInput,
  BaseChipsBelow,
} from 'base-ui-components';
import { setLangLabels, getLangLabel } from '../utils/commonUtils';

/**
 * A component for easy form creation
 */
export default {
  name: 'FormFieldCreator',
  components: {
    BaseChipsBelow,
    BaseAutocompleteInput,
    BaseInput,
    BaseDateInput,
    BaseMultilineTextInput,
    BaseDropDown,
    BaseChipsInput,
    BaseForm: () => import('./BaseForm'),
  },
  props: {
    /**
     * a key to uniquely identify the field
     */
    fieldKey: {
      type: [Number, String],
      required: true,
    },
    /**
     * field information as provided by swagger
     */
    field: {
      type: Object,
      required: true,
    },
    /**
     * the field value
     */
    fieldValue: {
      type: [Object, String, Array, Date, Number],
      required: true,
    },
    /**
     * a label for the field
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * a placeholder for the field if not provided in swagger x-attributes
     * (however if available x-attribute placeholder will be preferred)
     */
    placeholder: {
      type: [String, Object],
      default: '',
    },
    /**
     * provide tabs for multiline text field
     */
    tabs: {
      type: Array,
      default() {
        return [];
      },
    },
    /**
     * provide a options list for autocomplete, chips or chips-below fields
     */
    dropDownList: {
      type: Array,
      default() {
        return [];
      },
    },
    /**
     * provide a second options list (needed e.g. for texts field (text type) or
     * contributors field (roles)
     */
    secondaryDropdown: {
      type: Array,
      default() {
        return [];
      },
    },
    /**
     * provide data for elements that have a hover box (chips)
     */
    hoverBoxData: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * possibility to steer field loading (chips, autocomplete) from outside
     */
    autocompleteLoading: {
      type: Boolean,
      default: false,
    },
    /**
     * set the current language
     */
    language: {
      type: String,
      default: 'en',
    },
    /**
     * provide available locales
     */
    availableLocales: {
      type: Array,
      default: () => [],
    },
    /**
     * set a sorting text
     */
    sortText: {
      type: String,
      default: 'Sort A - Z',
    },
  },
  data() {
    return {
      // internal representation of field value
      fieldValueInt: JSON.parse(JSON.stringify(this.fieldValue)),
      // variable for current text input in chips fields
      textInput: '',
      // internal loading indicator
      fetchingData: false,
      // internal active tab for multiline text field
      activeTab: '',
    };
  },
  computed: {
    // check which date field type was provided and set type accordingly
    dateType() {
      // check if date is an Object with properties or just string (= single date)
      if (!this.field.properties) {
        return 'single';
      }
      const props = Object.keys(this.field.properties);

      if (props.includes('date_to') && props.includes('time_to')) {
        return 'daterangetimerange';
      }
      if (props.includes('date') && props.includes('time_to')) {
        return 'datetimerange';
      }
      if (props.includes('time')) {
        return 'datetime';
      }
      if (props.includes('date_to')) {
        return 'daterange';
      }
      return 'single';
    },
    // get field properties from swagger info
    groupFormFields() {
      // check if field group is a list (=multiplyable) or not
      if (this.field.type === 'array') {
        return this.field.items.properties;
      }
      return this.field.properties;
    },
    textTypeDefault() {
      return {
        // map the language specific labels for no value selected to the default
        label: setLangLabels('form.noTextType', this.availableLocales),
        source: '',
      };
    },
    textTypeOptions() {
      return [this.textTypeDefault].concat(this.secondaryDropdown);
    },
    isContributorOrEquivalent() {
      return this.field.name === 'contributors'
        || (this.field['x-attrs'] && this.field['x-attrs'].equivalent === 'contributors');
    },
    // to determine text display for chips input
    fieldInput() {
      return this.textInput && this.textInput.length > 2;
    },
    isChipsSingleSelect() {
      return (this.field['x-attrs'] && this.field['x-attrs'].field_type
        && this.field['x-attrs'].field_type.includes('chips')
        && this.field.type === 'object');
    },
    placeholderInt() {
      const xAttrs = this.field['x-attrs'];
      return xAttrs && xAttrs.placeholder ? xAttrs.placeholder : this.placeholder;
    },
    fieldType() {
      return this.field['x-attrs'] && this.field['x-attrs'].field_type ? this.field['x-attrs'].field_type : 'text';
    },
  },
  watch: {
    fieldValue(val) {
      if (JSON.stringify(this.fieldValueInt) !== JSON.stringify(val)) {
        this.setFieldValue(val);
        if (this.tabs && this.tabs.length) {
          this.activeTab = this.setActiveTab();
        }
      }
    },
    fieldValueInt: {
      handler(val) {
        // prevent event being fired when change comes from outside
        if (val !== undefined && JSON.stringify(this.fieldValue) !== JSON.stringify(val)) {
          this.$emit('field-value-changed', val);
        }
      },
      deep: true,
    },
    dropDownList() {
      this.fetchingData = false;
    },
  },
  mounted() {
    this.setFieldValue(this.fieldValue);
    if (this.tabs && this.tabs.length) {
      this.activeTab = this.setActiveTab();
    }
  },
  methods: {
    setFieldValue(val) {
      if (val && typeof val === 'object') {
        if (val.length >= 0) {
          this.fieldValueInt = [].concat(JSON.parse(JSON.stringify(val)));
        } else {
          this.fieldValueInt = Object.assign({}, JSON.parse(JSON.stringify(val)));
        }
      } else {
        this.fieldValueInt = val;
      }
    },
    setMultilineValue(val) {
      if (!val || typeof val === 'string') {
        this.fieldValueInt = val;
      } else {
        this.fieldValueInt = Object.assign({}, this.fieldValueInt, JSON.parse(JSON.stringify(val)));
      }
    },
    setMultilineDropDown(val) {
      // set texts type value if present - otherwise set empty
      this.$set(this.fieldValueInt, 'type', val.source ? val : null);
    },
    fetchAutocomplete(event) {
      this.fetchingData = true;
      this.textInput = event.value;
      this.$emit('fetch-autocomplete', {
        value: event.value,
        name: this.field.name,
        source: this.field['x-attrs'].source,
        equivalent: this.field['x-attrs'].equivalent,
      });
    },
    getLabel(value) {
      return getLangLabel(value, this.language, true);
    },
    setActiveTab() {
      // check which locales have content
      const localesWithContent = this.availableLocales.filter(lang => !!this.fieldValueInt[lang]);
      // if none of the locales has content or the current locale has content
      // - return current locale - else first alternative
      return !localesWithContent.length || this.fieldValueInt[this.language]
        ? this.language : localesWithContent[0];
    },
  },
};
</script>

<style lang="scss" scoped>
  .base-form-field-array {
    margin-top: $spacing-small;
    display: flex;
    flex-direction: column;

    .base-form-field-array-label {
      color: $font-color-second;
      margin-bottom: $spacing-small;
      z-index: 1;
    }

    .base-form-subform-wrapper {
      border-right: 3px solid rgb(240, 240, 240);
      border-left: 3px solid rgb(240, 240, 240);

      .base-form-subform {
        margin: -16px auto;
        width: calc(100% - 6px);
      }
    }
  }

  .date-field-fieldset-legend {
    color: $font-color-second;
    margin-bottom: $spacing-small;
  }

  .date-field {
    display: flex;
    .base-form-field + .base-form-field {
      margin-left: $spacing;
    }
  }

  .multiline-dropdown {
    text-transform: capitalize;
  }

  .base-form-field {
    .chips-dropdown-second {
      margin-left: $spacing;
      color: $font-color-second;
      font-size: $font-size-small;
      margin-top: 1px;
      flex-grow: 2;
    }

    .chips-dropdown-third {
      color: $font-color-third;
      font-size: $font-size-small;
      margin-top: auto;
      white-space: nowrap;
    }
  }

  @media screen and (max-width: 1260px) {
    .date-field {
      display: block;
      .base-form-field + .base-form-field {
        margin-top: $spacing;
        margin-left: 0;
      }
    }
  }
</style>
