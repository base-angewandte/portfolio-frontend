<template>
  <div>
    <!-- TEXT FIELD -->
    <BaseInput
      v-if="fieldType === 'text'"
      :key="fieldKey"
      :label="label"
      :placeholder="placeholder"
      :id="fieldKey"
      v-model="fieldValueInt"
      :class="['base-form-field']"/>

    <!-- DATE FIELD -->
    <div
      v-else-if="fieldType === 'date'"
      class="date-field">
      <BaseDateInput
        :key="fieldKey + 'date'"
        :label="label"
        :placeholder="placeholder"
        :range-separator="$t('form.until')"
        :id="fieldKey"
        :format="field['x-attrs'].date_format"
        :type="dateType.includes('timerange') ? dateType.includes('daterange')
        ? 'daterange' : 'single' : dateType"
        :date-format-labels="{date: $t('form.date'), year: $t('form.year') }"
        :format-tabs-legend="$t('form.dateTabsLegend')"
        :language="$i18n.locale"
        v-model="fieldValueInt"
        :class="['base-form-field']"/>
      <BaseDateInput
        v-if="dateType.includes('timerange')"
        :key="fieldKey + 'time'"
        :label="$t('form.time')"
        :placeholder="placeholder"
        :range-separator="$t('form.until')"
        :id="fieldKey"
        :type="'timerange'"
        v-model="fieldValueInt"
        :class="['base-form-field']"/>
    </div>

    <!--MULTILINE TEXT FIELD -->
    <BaseMultilineTextInput
      v-else-if="fieldType === 'multiline'"
      :key="fieldKey"
      :tabs="tabs"
      :tab-labels="tabs.map(tab => $t(tab))"
      :label="label"
      :placeholder="placeholder"
      :input="fieldValueInt"
      :tabs-legend="$t('form.textTabsLegend')"
      class="base-form-field base-form-field-full"
      @text-input="setMultilineValue($event)">
      <template
        v-if="field.items && field.items.properties && field.items.properties.type">
        <BaseDropDown
          :selected-option="fieldValueInt && fieldValueInt.type.source
          ? fieldValueInt.type : textTypeDefault"
          :options="textTypeOptions"
          :label="$t('form.texttype')"
          :language="$i18n.locale"
          value-prop="source"
          class="multiline-dropdown"
          @value-selected="$set(fieldValueInt, 'type', $event)"/>
      </template>
    </BaseMultilineTextInput>

    <!-- AUTOCOMPLETE -->
    <BaseAutocompleteInput
      v-else-if="fieldType === 'autocomplete'"
      :key="fieldKey"
      :label="label"
      :placeholder="placeholder"
      :list="dropDownList"
      :object-prop="'label'"
      :is-loading="autocompleteLoading"
      v-model="fieldValueInt"
      :class="['base-form-field']"
      @autocomplete="$emit('fetch-autocomplete', {
        value: $event,
        name: field.name,
        source: field['x-attrs'].source
    })"/>

    <!-- CHIPS INPUT -->
    <BaseChipsInput
      v-else-if="fieldType === 'chips'"
      :key="fieldKey"
      :placeholder="placeholder"
      :label="label"
      :list="dropDownList"
      v-model="fieldValueInt"
      :allow-dynamic-drop-down-entries="field['x-attrs'] && field['x-attrs'].dynamic_autosuggest"
      :allow-multiple-entries="!isChipsSingleSelect"
      :allow-unknown-entries="field['x-attrs'] && field['x-attrs'].allow_unkown_entries"
      :chips-editable="field['x-attrs'] && field['x-attrs'].allow_unkown_entries"
      :class="['base-form-field']"
      :draggable="true"
      :hoverbox-content="hoverBoxData"
      :sortable="field.name === 'keywords' || (field['x-attrs'] && field['x-attrs'].sortable)"
      :is-loading="autocompleteLoading"
      :sort-text="$t('form.sort')"
      :sort-name="isContributorOrEquivalent"
      :language="field['x-attrs'] && field['x-attrs'].set_label_language ? $i18n.locale : ''"
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
      :label="label"
      :placeholder="placeholder"
      :list="dropDownList"
      :allow-unknown-entries="true"
      :allow-dynamic-drop-down-entries="true"
      :identifier="'source'"
      :hoverbox-content="hoverBoxData"
      :object-prop="'label'"
      :role-options="secondaryDropdown"
      :is-loading="autocompleteLoading"
      :sort-text="$t('form.sort')"
      :sort-name="true"
      :chips-editable="true"
      :roles-placeholder="$t('form.selectRoles')"
      :language="$i18n.locale"
      v-model="fieldValueInt"
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
          class="base-form-subform"
          @values-changed="$emit('subform-input', $event)"/>
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
    fieldKey: {
      type: [Number, String],
      required: true,
    },
    field: {
      type: Object,
      required: true,
    },
    fieldValue: {
      type: [Object, String, Array, Date, Number],
      required: true,
    },
    fieldType: {
      type: String,
      default: 'text',
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: [String, Object],
      default: '',
    },
    tabs: {
      type: Array,
      default() {
        return [];
      },
    },
    dropDownList: {
      type: Array,
      default() {
        return [];
      },
    },
    secondaryDropdown: {
      type: Array,
      default() {
        return [];
      },
    },
    hoverBoxData: {
      type: Object,
      default() {
        return {};
      },
    },
    autocompleteLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      fieldValueInt: JSON.parse(JSON.stringify(this.fieldValue)),
      textInput: '',
      fetchingData: false,
    };
  },
  computed: {
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
        label: setLangLabels('form.noTextType', this.$i18n.availableLocales),
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
      return this.textInput && this.textInput.length > 3;
    },
    isChipsSingleSelect() {
      return (this.field['x-attrs'] && this.field['x-attrs'].field_type
        && this.field['x-attrs'].field_type.includes('chips')
        && this.field.type === 'object');
    },
  },
  watch: {
    fieldValue(val) {
      if (JSON.stringify(this.fieldValueInt) !== JSON.stringify(val)) {
        this.setFieldValue(val);
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
      if (typeof val === 'string') {
        this.fieldValueInt = val;
      } else {
        this.fieldValueInt = Object.assign({}, this.fieldValueInt, JSON.parse(JSON.stringify(val)));
      }
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
      return getLangLabel(value, this.$i18n.locale, true);
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
      margin-top: auto;
      white-space: nowrap;
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
