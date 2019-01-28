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
          @subform-input="setFieldValue($event, element.name, valueIndex)"
        />
        <div
          :key="'multiplyButton' + index"
          class="multiply-button"
          @click="multiplyField(element)">
          <span>{{ $t('form.addGroup', { fieldType: $t('form.' + element.name) }) }}</span>
          <span>
            <img
              :src="require('../static/remove.svg')"
              class="multiply-icon">
          </span>
        </div>
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
import axios from 'axios';
import FormFieldCreator from './FormFieldCreator';
import DATA from '../assets/data';

export default {
  name: 'BaseFormNew',
  components: {
    FormFieldCreator,
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
        if (!Object.keys(val).length) {
          this.initializeValueObject();
        }
        console.log('receiving changes');
        // this.initializeValueObject();
        this.valueListInt = Object.assign({}, this.valueListInt, val);
        // JSON parse is necessary to destroy any references between the objects
        this.valueListIntCopy = Object.assign({}, JSON.parse(JSON.stringify(this.valueListInt)));
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
      console.log(this.formFieldJson);
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
      if (field.name === 'published_in') {
      }
      // TODO: check if this can be resolved in a more generic way!
      if (field.format === 'date') {
        return Object.assign({}, { from: '', to: '' }, this.valueList[field.name]);
      }
      // check if field is array
      if (field.type === 'array') {
        // check if values are already present and set those if yes
        if (this.valueList[field.name] && this.valueList[field.name].length) {
          return [].concat(this.valueList[field.name]);
        }
        // else return empty array
        return [];
        // check if field is object
      } if (field.type === 'object') {
        const initObj = {};
        // for each property in the object also get initial values
        Object.keys(field.properties).forEach((key) => {
          this.$set(initObj, key, this.getInitialFieldValue(field.properties[key]));
        });
        return Object.assign({}, initObj, this.valueList[field.name]);
      }
      // if it is not a array or object simply return value from list or empty string
      return this.valueList[field.name] ? this.valueList[field.name] : '';
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
      console.log('Fetch');
      if (source) {
        // TODO: set timeout function to only fetch after user has finished typing
        if (value && value.length > 3) {
          try {
            const result = await axios.get(`${source}/${value}`, {
              withCredentials: true,
            });
            if (this.dropdownLists) {
              this.$set(this.dropdownLists, [name], result.data);
            }
          } catch (e) {
            console.error(e);
          }
        } else if (!value.length) {
          this.$set(this.dropdownLists, [name], []);
        }
        // TODO: remove this again as soon as everything has a source attribute
      } else {
        console.error('no source specified');
        if (name === 'type') {
          if (this.dropdownLists) {
            const types = Object.keys(DATA.TYPE_MAPPINGS)
              .reduce((prev, curr) => prev.concat(DATA.TYPE_MAPPINGS[curr]), []);
            console.log(types);
            this.$set(this.dropdownLists, [name], types);
          }
        }
      }
    },
    multiplyField(field) {
      this.valueListInt[field.name]
        .push(this.getInitialFieldValue(field.items));
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

    .multiply-button {
      color: $font-color-second;
      margin-bottom: $spacing;
      cursor: pointer;

      &:hover {
        color: $app-color;
      }

      .multiply-icon {
        margin-left: $spacing;
        height: $icon-small;
        width: $icon-small;
      }
    }
  }
</style>
