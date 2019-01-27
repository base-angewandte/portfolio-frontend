<template>
  <div class="base-form">
    <template
      v-for="(element, index) in formFieldListInt">

      <!-- ALLOW FOR MULTIPLE VALUES PER FIELD -->
      <template
        v-if="allowMultiply(element)">
        <FormFieldCreator
          v-for="(value, valueIndex) in valueListInt[element.name]"
          :key="index + '-' + valueIndex"
          :field-key="index + '-' + valueIndex"
          :field="element"
          :field-value="value"
          :field-type="element['x-attrs'] ? element['x-attrs'].field_type : 'text'"
          :label="$te('form.' + element.name) ? $t('form.' + element.name) : element.name"
          :placeholder="$t('form.select') + ' '
          + ($te('form.' + element.name) ? $t('form.' + element.name) : element.name)"
          :tabs="['English', 'German']"
          :drop-down-list="dropdownLists[element.name]"
          class="base-form-field base-form-field-full"
          @field-value-changed="setFieldValue($event, element.name, valueIndex)"
          @fetch-autocomplete="fetchAutocomplete"
        />
      </template>
      <template v-else>
        <FormFieldCreator
          :key="index"
          :field-key="index"
          :field="element"
          :field-value="valueListInt[element.name]"
          :field-type="element['x-attrs'] ? element['x-attrs'].field_type : 'text'"
          :label="$te('form.' + element.name) ? $t('form.' + element.name) : element.name"
          :placeholder="$t('form.select') + ' '
          + ($te('form.' + element.name) ? $t('form.' + element.name) : element.name)"
          :drop-down-list="dropdownLists[element.name]"
          class="base-form-field"
          @field-value-changed="setFieldValue($event, element.name)"
          @fetch-autocomplete="fetchAutocomplete"
        />
      </template>
    </template>
  </div>
</template>

<script>
import {
  BaseInput,
  BaseDateInput,
  BaseMultilineTextInput,
  BaseDropDown,
} from 'base-components';
import axios from 'axios';
import FormFieldCreator from './FormFieldCreator';

export default {
  name: 'BaseFormNew',
  components: {
    FormFieldCreator,
    BaseDropDown,
    BaseMultilineTextInput,
    BaseDateInput,
    BaseInput,
  },
  props: {
    formFieldJson: {
      type: Object,
      required: true,
    },
    valueList: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      valueListInt: {},
      valueListIntCopy: {},
      formFieldListInt: [],
      fieldProperties: [],
      dropdownLists: {},
    };
  },
  watch: {
    valueListInt: {
      handler(val) {
        if (Object.keys(this.valueListIntCopy).length) {
          if (JSON.stringify(val) !== JSON.stringify(this.valueListIntCopy)) {
            console.log('Sending changes');
            this.$emit('values-changed', this.valueListInt);
          }
        }
      },
      deep: true,
    },
    valueList(val) {
      console.log('valllll');
      console.log(JSON.stringify(val));
      console.log(JSON.stringify(this.valueListInt));
      if (JSON.stringify(val) !== JSON.stringify(this.valueListInt)) {
        console.log('receiving changes');
        this.initializeValueObject();
      }
    },
    formFieldJson(val) {
      console.log('form fields changed');
      console.log(val);
      this.initializeValueObject();
    },
  },
  mounted() {
    this.initializeValueObject();
  },
  methods: {
    initializeValueObject() {
      this.formFieldListInt = [];
      console.log('initialize');
      Object.keys(this.formFieldJson)
        .forEach(key => this.formFieldListInt
          .push(Object.assign({}, { name: key }, this.formFieldJson[key])));
      this.formFieldListInt.sort((a, b) => {
        if (a['x-attrs'] && b['x-attrs']) {
          if (a['x-attrs'].order > b['x-attrs'].order) {
            return 1;
          }
          return -1;
        }
        return -1;
      }).forEach((field) => {
        this.$set(
          this.valueListInt,
          field.name,
          this.getInitialFieldValue(field),
        );
      });
      // JSON parse is necessary to destroy any references between the objects
      this.valueListIntCopy = Object.assign({}, JSON.parse(JSON.stringify(this.valueListInt)));
    },
    getInitialFieldValue(field) {
      // check if field is array
      if (field.type === 'array') {
        // check if field contains only strings or further array/object
        if (field.items && field.items.type === 'string') {
          // check if values are already present
          if (this.valueList[field.name] && this.valueList[field.name].length) {
            return [].concat(this.valueList[field.name]);
          }
          return [];
        }
        // if array or object also set initial values for those
        return [];
        // check if field is object
      } if (field.type === 'object') {
        const initObj = {};
        // for each property in the object also get initial values
        Object.keys(field.properties).forEach((key) => {
          this.$set(initObj, key, this.getInitialFieldValue(field.properties[key]));
        });
        return Object.assign({}, initObj);
      }
      // if it is not a array or object simply return value from list or empty string
      return this.valueList[field.name] || '';
    },
    allowMultiply(el) {
      return el.type === 'array' && el['x-attrs']
        && !['chips', 'chips-below'].includes(el['x-attrs'].field_type);
    },
    setFieldValue(value, fieldName, index) {
      if (index >= 0) {
        this.$set(this.valueListInt[fieldName], index, value);
      } else {
        this.$set(this.valueListInt, fieldName, value);
      }
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
        if (this.dropdownLists) {
          this.$set(this.dropdownLists, [name], result.data);
        }
      }
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

    .base-form-field:not(:last-of-type) {
      margin-bottom: $spacing;
    }

    .base-form-field {
      flex: 0 0 100%;
    }

    .base-form-field-full {
      flex: 0 0 100%;
    }
  }
</style>
