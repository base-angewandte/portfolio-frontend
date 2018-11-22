<template>
  <div
    ref="baseForm"
    class="base-form">
    <template
      v-for="(element, index) in list">
      <base-autocomplete-input
        v-if="element.type === 'autocomplete'"
        :key="index"
        :label="$te('form.' + element.name) ? $t('form.' + element.name) : element.name"
        :placeholder="$t('form.select') + ' '
        + ($te('form.' + element.name) ? $t('form.' + element.name) : element.name)"
        :list="dropdownLists[element.name]"
        :object-prop="element.name.toLowerCase()"
        v-model="formValuesInt[element.name]"
        :class="[
          'base-form-field',
          'base-form-field-' + getSizeClass(element.size),
          { 'base-form-field-spacing': element.size === 'half' && getClassIndex(element) }
        ]"
        @autocomplete="fetchAutocomplete({
          value: $event,
          name: element.name,
          source: element.source
      })"/>
      <base-multiline-text-input
        v-else-if="element.type === 'multiline'"
        :key="index"
        :tabs="element.lang"
        :label="$te('form.' + element.name) ? $t('form.' + element.name) : element.name"
        :placeholder="$t('form.write') + ' '
        + ($te('form.' + element.name) ? $t('form.' + element.name) : element.name)"
        :input="formValuesInt[element.name]"
        class="base-form-field base-form-field-full"
        @textInput="addType(element, $event)">
        <template
          v-if="element.setType">
          <!-- TODO: replace hardcoded types!  -->
          <base-drop-down
            :selected="formValuesInt[element.name] && formValuesInt[element.name].type
            ? formValuesInt[element.name].type : 'Wähle Textart'"
            :selection-list="[
              'Beschreibung',
              'Ausstellungseinladung',
              'Zeitungsartikel',
              'Ausstellungsankündigung']"
            @selected="addType(element, { type: $event })"/>
        </template>
      </base-multiline-text-input>
      <base-chips-input
        v-else-if="element.type === 'chips'"
        :key="index"
        :placeholder="$t('form.select') + ' '
        + ($te('form.' + element.name) ? $t('form.' + element.name) : element.name)"
        :label="$te('form.' + element.name) ? $t('form.' + element.name) : element.name"
        :object-prop="element.name"
        :list="dropdownLists[element.name]"
        v-model="formValuesInt[element.name]"
        :allow-dynamic-drop-down-entries="element.sourceType === 'dynamic'"
        :allow-multiple-entries="element.mode === 'multi'"
        :allow-unknown-entries="element.unknown"
        :class="[
          'base-form-field',
          'base-form-field-' + getSizeClass(element.size),
          { 'base-form-field-spacing': element.size === 'half' && getClassIndex(element) }
        ]"
        :draggable="true"
        @selected="$emit('selected', { value: $event && $event.length
        ? $event[0][element.name] : null, field: element.name })"
        @fetchDropDownEntries="fetchAutocomplete({
          value: $event.value,
          name: element.name,
          source: element.source
      })"/>
      <base-input
        v-else-if="element.type === 'text'"
        :key="index"
        :label="$te('form.' + element.name) ? $t('form.' + element.name) : element.name"
        :placeholder="$t('form.select') + ' '
        + ($te('form.' + element.name) ? $t('form.' + element.name) : element.name)"
        :id="index"
        v-model="formValuesInt[element.name]"
        :class="[
          'base-form-field',
          'base-form-field-' + getSizeClass(element.size),
          { 'base-form-field-spacing': element.size === 'half' && getClassIndex(element) }
      ]"/>
      <base-date-input
        v-else-if="element.type === 'date'"
        :key="index"
        :label="$te('form.' + element.name) ? $t('form.' + element.name) : element.name"
        :placeholder="$t('form.select') + ' '
        + ($te('form.' + element.name) ? $t('form.' + element.name) : element.name)"
        :id="index"
        :type="element.dateType"
        v-model="formValuesInt[element.name]"
        :class="[
          'base-form-field',
          'base-form-field-' + getSizeClass(element.size),
          { 'base-form-field-spacing': element.size === 'half' && getClassIndex(element) }]"/>
      <base-chips-below
        v-else-if="element.type === 'chips-below'"
        :key="index"
        :label="$te('form.' + element.name) ? $t('form.' + element.name) : element.name"
        :placeholder="$t('form.select') + ' '
        + ($te('form.' + element.name) ? $t('form.' + element.name) : element.name)"
        :list="dropdownLists[element.name]"
        v-model="formValuesInt[element.name]"
        class="base-form-field base-form-field-full"/>
    </template>
  </div>
</template>

<script>
import axios from 'axios';
import {
  BaseInput,
  BaseDateInput,
  BaseChipsInput,
  BaseAutocompleteInput,
  BaseMultilineTextInput,
  BaseDropDown,
  BaseChipsBelow,
} from 'base-components';

export default {
  components: {
    BaseChipsBelow,
    BaseMultilineTextInput,
    BaseChipsInput,
    BaseInput,
    BaseDateInput,
    BaseAutocompleteInput,
    BaseDropDown,
  },
  props: {
    list: {
      type: Array,
      required: true,
    },
    formValues: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      dropdownLists: {},
      formValuesInt: {},
    };
  },
  computed: {
    halfElements() {
      return this.list.filter(elem => elem.size === 'half');
    },
  },
  watch: {
    $route() {
      this.setFormValues(this.formValues);
    },
    formValuesInt: {
      handler(val) {
        if (JSON.stringify(this.formValues) !== JSON.stringify(val)) {
          this.$emit('valuesChanged', this.formValuesInt);
        }
      },
      deep: true,
    },
    formValues(val) {
      if (JSON.stringify(this.formValuesInt) !== JSON.stringify(val)) {
        this.setFormValues(val);
      }
    },
  },
  created() {
    if (this.list) {
      const obj = {};
      this.list.filter(element => element.type === 'autocomplete' || element.type === 'chips' || element.type === 'chips-below')
        .forEach((autoField) => {
          if (autoField.name === 'keywords') {
            this.$set(obj, autoField.name, [
              'Art',
              'Collage',
              'Photography',
              'Drawing',
              'Painting',
              'Concert',
              'Classic',
              'Fashion',
            ]);
          } else if (autoField.name === 'type') {
            this.$set(obj, autoField.name, [
              'Publikation',
              'Text',
              'Bild',
              'Konzert',
              'Ausstellung',
              'Collage',
              'Skulptur',
              'Werk',
            ]);
          } else {
            this.$set(obj, autoField.name, []);
          }
        });
      this.dropdownLists = obj;
    }
  },
  methods: {
    getSizeClass(val) {
      return val && ['half', 'full'].includes(val) ? val : 'full';
    },
    getClassIndex(val) {
      return this.halfElements.indexOf(val) % 2;
    },
    async fetchAutocomplete({ value, name, source }) {
      // TODO: this is currently giving a error for certain types (axios library buildURL.js)
      // but not sure if worth fixing hopefully will disappear with the real thing
      // UPDATE: for the artist field e.g.
      // TODO: use time out function (in base component or here?)
      if (!value || value.length > 3) {
        const result = await axios.get(source, {
          params:
            {
              string: value,
              resource: 'viaf',
            },
        });
        if (this.dropdownLists && this.dropdownLists[name]) {
          this.$set(this.dropdownLists, [name], result.data);
        }
      }
    },
    addType(val, text) {
      if (val.setType) {
        this.$set(this.formValuesInt, val.name, Object.assign({}, { type: '' }, this.formValues[val.name], text));
      } else {
        this.$set(this.formValuesInt, val.name, text);
      }
    },
    setFormValues(val) {
      const obj = {};
      if (this.list.length) {
        this.list.forEach((field) => {
          if (val[field.name]) {
            this.$set(obj, field.name, val[field.name]);
          } else if (field.setType) {
            this.$set(obj, field.name, {
              type: null,
            });
          } else {
            let initial = '';
            if (['chips-below', 'chips'].includes(field.type)) {
              initial = [];
            } else if (['date'].includes(field.type)) {
              initial = {};
            }
            this.$set(obj, field.name, initial);
          }
        });
      }
      this.formValuesInt = Object.assign({}, val, obj);
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .base-form {
    background-color: white;
    display: flex;
    flex-wrap: wrap;
    padding: 16px;
  }

  .base-form-field:not(:last-of-type) {
    margin-bottom: $spacing;
  }

  .base-form-field-full {
    flex: 0 0 100%;
  }

  .base-form-field-half {
    flex: 0 0 calc(50% - 8px);
  }

  .base-form-field-spacing {
    margin-left: 16px;
  }

  @media screen and (max-width: $mobile) {
    .base-form-field-half {
      flex: 0 0 100%;
    }

    .base-form-field-spacing {
      margin-left: 0;
    }

    .multiline-dropdown {
      order: 0;
    }
  }
</style>
