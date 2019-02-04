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
    <BaseDateInput
      v-else-if="fieldType === 'date'"
      :key="fieldKey"
      :label="label"
      :placeholder="placeholder"
      :id="fieldKey"
      :type="dateType"
      v-model="fieldValueInt"
      :class="['base-form-field']"/>

    <!--MULTILINE TEXT FIELD -->
    <BaseMultilineTextInput
      v-else-if="fieldType === 'multiline'"
      :key="fieldKey"
      :tabs="tabs"
      :label="label"
      :placeholder="placeholder"
      v-model="fieldValueInt"
      class="base-form-field base-form-field-full">
      <template
        v-if="field.items && field.items.properties && field.items.properties.type">
        <!-- TODO: replace hardcoded types!  -->
        <BaseDropDown
          :selected="fieldValueInt && fieldValueInt.type
          ? fieldValueInt.type : 'Wähle Textart'"
          :selection-list="[
            'Beschreibung',
            'Ausstellungseinladung',
            'Zeitungsartikel',
            'Ausstellungsankündigung']"
          @selected="addType(element, { type: $event })"/>
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
      :object-prop="'commonname'"
      :list="dropDownList"
      v-model="fieldValueInt"
      :allow-dynamic-drop-down-entries="!['type', 'keywords'].includes(field.name)"
      :allow-multiple-entries="field.name !== 'type'"
      :allow-unknown-entries="true"
      :always-linked="field.name === 'type'"
      :identifier="field.sourceType === 'dynamic' ? 'uuid' : ''"
      :class="['base-form-field']"
      :draggable="true"
      :hoverbox-content="hoverBoxData"
      @selected="$emit('selected', { value: $event && $event.length
      ? $event[0][field.name] || $event[0] : null, field: field.name })"
      @fetch-dropdown-entries="$emit('fetch-autocomplete', {
        value: $event.value,
        name: field.name,
        source: field['x-attrs'].source
      })"
      @hoverbox-active="$emit('fetch-info-data')">
      <template
        slot="drop-down-entry"
        slot-scope="props">
        <span>{{ props.item.commonname }}</span>
        <span class="chips-dropdown-second">{{ props.item.born }}</span>
        <span class="chips-dropdown-third">{{ props.item.source }}</span>
      </template>
    </BaseChipsInput>

    <!-- CHIPS-BELOW -->
    <BaseChipsBelow
      v-else-if="fieldType === 'chips-below'"
      :key="fieldKey"
      :label="label"
      :placeholder="placeholder"
      :list="fieldValueInt"
      :allow-unknown-entries="true"
      :allow-dynamic-drop-down-entries="true"
      :identifier="'uuid'"
      :hoverbox-content="hoverBoxData"
      :object-prop="'commonname'"
      v-model="fieldValueInt"
      class="base-form-field base-form-field-full"
      @fetch-dropdown-entries="$emit('fetch-autocomplete',{
        value: $event.value,
        name: field.name,
        source: field['x-attrs'].source })"
      @hoverbox-active="$emit('fetch-info-data')">
      <template
        slot="drop-down-entry"
        slot-scope="props">
        <span>{{ props.item.commonname }}</span>
        <span class="chips-dropdown-second">{{ props.item.born }}</span>
        <span class="chips-dropdown-third">{{ props.item.source }}</span>
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
        <BaseFormNew
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
} from 'base-components';

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
    BaseFormNew: () => import('./BaseFormNew'),
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
      type: [Object, String, Array],
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
      type: String,
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
    hoverBoxData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      fieldValueInt: this.fieldValue,
    };
  },
  computed: {
    dateType() {
      const props = Object.keys(this.field.properties);

      if (props.includes('time')) {
        return 'datetime';
      }
      if (props.includes('date')) {
        return 'single';
      }
      if (props.includes('date_to')) {
        return 'range';
      }
      return '';
    },
    groupFormFields() {
      // check if field group is a list (=multiplyable) or not
      if (this.field.type === 'array') {
        return this.field.items.properties;
      }
      return this.field.properties;
    },
  },
  watch: {
    fieldValue(val) {
      if (JSON.stringify(this.fieldValueInt) !== JSON.stringify(val)) {
        this.setFieldValue(val);
      }
    },
    fieldValueInt(val) {
      // prevent event being fired when change comes from outside
      if (JSON.stringify(this.fieldValue) !== JSON.stringify(val)) {
        this.$emit('field-value-changed', val);
      }
    },
  },
  mounted() {
    this.setFieldValue(this.fieldValue);
  },
  methods: {
    setFieldValue(val) {
      if (typeof val === 'object') {
        if (val.length >= 0) {
          this.fieldValueInt = [].concat(val);
        } else {
          this.fieldValueInt = Object.assign({}, val);
        }
      } else {
        this.fieldValueInt = val;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .base-form-field-array {
    margin-top: $spacing-small;
    display: flex;
    flex-direction: column;

    .base-form-field-array-label {
      color: $font-color-second;
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
</style>
