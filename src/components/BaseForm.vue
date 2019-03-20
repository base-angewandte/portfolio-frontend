<template>
  <div class="base-form">
    <template
      v-for="(element, index) in formFieldListInt">

      <!-- ALLOW FOR MULTIPLE VALUES PER FIELD -->
      <template
        v-if="allowMultiply(element)">
        <div
          v-for="(value, valueIndex) in valueListInt[element.name]"
          :key="index + '-' + valueIndex"
          :class="[
            'base-form-field',
            element['x-attrs'] && element['x-attrs'].field_format === 'half'
              ? 'base-form-field-half' : 'base-form-field-full',
            { 'base-form-field-left-margin': isHalfField(element) }
        ]">
          <FormFieldCreator
            :key="index + '-' + valueIndex"
            :field-key="index + '-' + valueIndex"
            :field="element"
            :field-value="value"
            :field-type="element['x-attrs'] ? element['x-attrs'].field_type : 'text'"
            :label="getFieldName(element)"
            :placeholder="element['x-attrs'] && element['x-attrs'].placeholder
              ? element['x-attrs'].placeholder : $t('form.select') + ' '
            + getFieldName(element)"
            :tabs="['en', 'de']"
            :drop-down-list="dropdownLists[element.name]"
            :secondary-dropdown="dropdownLists[element.name + '_secondary']"
            @field-value-changed="setFieldValue($event, element.name, valueIndex)"
            @fetch-autocomplete="fetchAutocomplete"
            @subform-input="setFieldValue($event, element.name, valueIndex)" />
          <div
            v-if="valueListInt[element.name].length > 1"
            :key="index + '-button' + valueIndex"
            class="group-add">
            <div
              class="field-group-button "
              @click="removeField(element, valueIndex)">
              <span>{{ $t('form.removeField', { fieldType: getFieldName(element) }) }}</span>
              <span>
                <img
                  :src="require('../static/remove.svg')"
                  class="field-group-icon">
              </span>
            </div>

          </div>
        </div>
        <div
          :key="'multiplyButton' + index"
          class="group-multiply">
          <div
            class="field-group-button "
            @click="multiplyField(element)">
            <span>{{ $t('form.addGroup', { fieldType: getFieldName(element) }) }}</span>
            <span>
              <img
                :src="require('../static/remove.svg')"
                class="field-group-icon">
            </span>
          </div>

        </div>
      </template>
      <template v-else>
        <FormFieldCreator
          :key="index"
          :field-key="index"
          :field="element"
          :field-value="valueListInt[element.name]"
          :field-type="element['x-attrs'] ? element['x-attrs'].field_type : 'text'"
          :label="getFieldName(element)"
          :placeholder="element['x-attrs'] && element['x-attrs'].placeholder
            ? element['x-attrs'].placeholder : $t('form.select') + ' '
          + getFieldName(element)"
          :drop-down-list="dropdownLists[element.name]"
          :secondary-dropdown="dropdownLists[element.name + '_secondary']"
          :class="[
            'base-form-field',
            element['x-attrs'] && element['x-attrs'].field_format === 'half'
              ? 'base-form-field-half' : 'base-form-field-full',
            { 'base-form-field-left-margin': isHalfField(element) }
          ]"
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
      timeout: null,
    };
  },
  computed: {
    formFieldsHalf() {
      return this.formFieldListInt.filter(field => field['x-attrs'] && field['x-attrs'].field_format === 'half');
    },
  },
  watch: {
    valueList(val) {
      if (JSON.stringify(val) !== JSON.stringify(this.valueListInt)) {
        this.initializeValueObject();
        // this.initializeDropDownLists();
        // JSON parse is necessary to destroy any references between the objects
        this.valueListIntCopy = Object.assign({}, JSON.parse(JSON.stringify(this.valueListInt)));
      }
    },
    formFieldJson() {
      this.initializeValueObject();
      this.initializeDropDownLists();
    },
  },
  mounted() {
    this.initializeValueObject();
    this.initializeDropDownLists();
  },
  methods: {
    initializeValueObject() {
      this.formFieldListInt = Object.keys(this.formFieldJson)
        .filter(key => !this.formFieldJson[key].$ref
          && !(this.formFieldJson[key]['x-attrs'] && this.formFieldJson[key]['x-attrs'].hidden))
        .map(key => Object.assign({}, { name: key }, this.formFieldJson[key]));
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
      if (field.type === 'array' || field.name === 'type') {
        // check if values are already present and set those if yes
        if (this.valueList[field.name] && this.valueList[field.name].length) {
          return [].concat(this.valueList[field.name]);
        }
        if (field['x-attrs'] && !field['x-attrs'].field_type.includes('chips')
          && field.items.type === 'object') {
          return [].concat(this.getInitialFieldValue(field.items));
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
    initializeDropDownLists() {
      this.formFieldListInt.forEach((field) => {
        // check if a source is specified in the 'x-attrs'
        const sources = field['x-attrs']
          ? Object.keys(field['x-attrs']).filter(key => !!key.includes('source')) : [];
        if (sources.length) {
          sources.forEach(async (source) => {
            if (field.name === 'type') {
              try {
                const response = await axios.get(`${process.env.PORTFOLIO_API}${field['x-attrs'][source]}`,
                  {
                    withCredentials: true,
                  });
                // set the drop down with the retrieved data
                this.setDropDown(response.data, '', field['x-attrs'].equivalent, field.name);
              } catch (e) {
                console.error(e);
              }
              // TODO: adjust to new Portfolio API!!
            } else if (source === 'source') {
              this.setDropDown([], '', field['x-attrs'].equivalent, field.name);
              // if there is another source type specififed (currently e.g. type_source,
              // but maybe should be renamed
              // to "secondary" in backend as well?) add it as secondary source
            } else {
              // TODO: adjust to new Portfolio API!!
              try {
                const response = await axios.get(`${field['x-attrs'][source]}`);
                // map data needed on front end out of response data
                const data = response.data.results.map(voc => ({
                  label: voc.prefLabel,
                  value: voc.uri,
                }));
                // set the drop down with the retrieved data
                this.setDropDown(data, '', field['x-attrs'].equivalent, `${field.name}_secondary`);
              } catch (e) {
                console.error(e);
              }
            }
          });
        }
      });
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
      this.$emit('values-changed', this.valueListInt);
    },
    async fetchAutocomplete({
      value, name, source, equivalent,
    }) {
      if (name !== 'type' && source) {
        if (this.timeout) {
          clearTimeout(this.timeout);
          this.timeout = null;
        }
        this.timeout = setTimeout(async () => {
          if (value && value.length > 3) {
            try {
              const result = await axios.get(`${process.env.PORTFOLIO_API}${source}${value ? `${value}/` : ''}`, {
                withCredentials: true,
              });
              this.setDropDown(result.data, value, equivalent, name);
              // TODO: add additional properties if necessary: e.g.
              //  source name, separated name, dob, profession
            } catch (e) {
              console.error(e);
            }
          } else {
            this.setDropDown([], value, equivalent, name);
          }
        }, 600);
      } else {
        console.error('no source specified');
      }
    },
    multiplyField(field) {
      this.valueListInt[field.name]
        .push(this.getInitialFieldValue(field.items));
    },
    removeField(field, index) {
      this.valueListInt[field.name].splice(index, index + 1);
    },
    isHalfField(field) {
      const index = this.formFieldsHalf.indexOf(field);
      return index > 0 && !!(index % 2);
    },
    setDropDown(data, value, equivalent, name) {
      const dropDownList = [].concat(data);
      const user = this.$store.getters['PortfolioAPI/user'];
      if (((equivalent && equivalent === 'contributors') || name === 'contributors')
        && (value.length <= 3 || user.name.toLowerCase().includes(value.toLowerCase()))) {
        // TODO: replace this with the real values
        dropDownList.unshift({ label: user.name, source: 'this will be the id', additional: 'This is myself!' });
        // TODO: filter entry from list to prevent double display!
      }
      this.$set(this.dropdownLists, name, dropDownList);
    },
    getFieldName(val) {
      return val.title || (this.$te(`form.${val.name}`) ? this.$t(`form.${val.name}`) : val.name);
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
    padding: $spacing $spacing 0;

    .base-form-field {
      margin-bottom: $spacing;
    }

    .base-form-field-full, .group-multiply {
      flex: 0 0 100%;
    }

    .base-form-field-half {
      flex: 0 0 calc(50% - 8px);
    }

    .base-form-field-left-margin {
      margin-left: $spacing;
    }

    .group-multiply {
      margin-bottom: $spacing + $spacing-small;
    }

    .group-add {
      margin-top: $spacing;
    }

    .field-group-button {
      color: $font-color-second;
      cursor: pointer;
      display: inline;

      &:hover {
        color: $app-color;
      }

      .field-group-icon {
        margin-left: $spacing;
        height: $icon-small;
        width: $icon-small;
      }
    }
  }

  @media screen and (max-width: $mobile) {
    .base-form {
      padding: $spacing $spacing-small $spacing-small;

      .base-form-field {
        margin-bottom: $spacing-small;
      }

      .base-form-field-half {
        flex: 0 0 100%;
      }

      .base-form-field-left-margin {
        margin-left: 0;
      }

      .group-multiply {
        margin-bottom: $spacing-small + ($spacing-small/2);
      }
    }
  }
</style>
