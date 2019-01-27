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
      :type="field.dateType"
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
        v-if="field.setType">
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
      :object-prop="field.name.toLowerCase()"
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
      :allow-dynamic-drop-down-entries="field.sourceType === 'dynamic'"
      :allow-multiple-entries="field.mode === 'multi'"
      :allow-unknown-entries="true"
      :always-linked="field.sourceType === 'static'"
      :identifier="field.sourceType === 'dynamic' ? 'uuid' : ''"
      :class="['base-form-field']"
      :draggable="true"
      :hoverbox-content="hoverBoxData"
      @selected="$emit('selected', { value: $event && $event.length
      ? $event[0][field.name] || $event[0] : null, field: field.name })"
      @fetch-dropdown-entries="$emit('fetch-autocomplete', {
        value: $event.value,
        name: element.name,
        source: element.source
      })"
      @hoverbox-active="$emit('fetch-info-data')">
      <template
        slot="drop-down-entry"
        slot-scope="props">
        <span>{{ props.item[field.name] }}</span>
        <span class="chips-dropdown-second">{{ props.item.born }}</span>
        <span class="chips-dropdown-third">{{ props.item.source }}</span>
      </template>
    </BaseChipsInput>

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
} from 'base-components';

export default {
  components: {
    BaseAutocompleteInput,
    BaseInput,
    BaseDateInput,
    BaseMultilineTextInput,
    BaseDropDown,
    BaseChipsInput,
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
  watch: {
    fieldValue(val) {
      this.fieldValueInt = val;
    },
    fieldValueInt(val) {
      // prevent event being fired when change comes from outside
      if (this.fieldValue !== val) {
        console.log('changed');
        this.$emit('field-value-changed', this.fieldValueInt);
      }
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
