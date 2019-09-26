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
            :label="getFieldName(element)"
            :placeholder="$t('form.select') + ' ' + getFieldName(element)"
            :tabs="['en', 'de']"
            :drop-down-list="dropdownLists[element.name]"
            :secondary-dropdown="dropdownLists[element.name + '_secondary']"
            :language="$i18n.locale"
            :available-locales="$i18n.availableLocales"
            :sort-text="$t('form.sort')"
            @field-value-changed="setFieldValue(
              $event,
              element.name,
              valueIndex,
              (element['x-attrs'] ? element['x-attrs'].equivalent : ''))"
            @fetch-autocomplete="fetchAutocomplete"
            @subform-input="setFieldValue($event, element.name, valueIndex)" />
          <div
            v-if="checkFieldContent(valueList[element.name])
              || valueListInt[element.name].length > 1"
            :key="index + '-button' + valueIndex"
            class="group-add">
            <button
              class="field-group-button"
              type="button"
              @click.prevent="removeField(element, valueIndex)">
              <span>{{ valueListInt[element.name].length === 1
                ? $t('form.clearField')
                : $t('form.removeField', { fieldType: getFieldName(element) }) }}</span>
              <span>
                <RemoveIcon
                  class="field-group-icon" />
              </span>
            </button>
          </div>
        </div>
        <div
          :key="'multiplyButton' + index"
          class="group-multiply">
          <button
            class="field-group-button"
            type="button"
            @click.prevent="multiplyField(element)">
            <span>{{ $t('form.addGroup', { fieldType: getFieldName(element) }) }}</span>
            <span>
              <PlusIcon
                class="field-group-icon" />
            </span>
          </button>
        </div>
      </template>
      <template v-else>
        <FormFieldCreator
          :key="index"
          :field-key="index"
          :field="element"
          :field-value="valueListInt[element.name]"
          :label="getFieldName(element)"
          :placeholder="$t('form.select') + ' ' + getFieldName(element)"
          :drop-down-list="dropdownLists[element.name]"
          :secondary-dropdown="dropdownLists[element.name + '_secondary']"
          :autocomplete-loading="fieldIsLoading === element.name"
          :language="$i18n.locale"
          :available-locales="$i18n.availableLocales"
          :sort-text="$t('form.sort')"
          :class="[
            'base-form-field',
            element['x-attrs'] && element['x-attrs'].field_format === 'half'
              ? 'base-form-field-half' : 'base-form-field-full',
            { 'base-form-field-left-margin': isHalfField(element) }
          ]"
          @field-value-changed="setFieldValue($event, element.name)"
          @fetch-autocomplete="fetchAutocomplete" />
      </template>
    </template>
  </div>
</template>

<script>
import axios from 'axios';
import FormFieldCreator from './FormFieldCreator';
import RemoveIcon from '../assets/icons/remove.svg';
import PlusIcon from '../assets/icons/plus.svg';
import { getApiUrl, getLangLabel, hasFieldContent } from '../utils/commonUtils';

const { CancelToken } = axios;
let cancel;

export default {
  name: 'BaseFormNew',
  components: {
    FormFieldCreator,
    RemoveIcon,
    PlusIcon,
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
    prefetchedDropDownLists: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      valueListInt: {},
      formFieldListInt: [],
      fieldProperties: [],
      dropdownLists: {},
      timeout: null,
      // variable to specify a field that is currently loading autocomplete data
      fieldIsLoading: '',
    };
  },
  computed: {
    formFieldsHalf() {
      return this.formFieldListInt.filter(field => field['x-attrs'] && field['x-attrs'].field_format === 'half');
    },
  },
  watch: {
    valueList: {
      handler(val) {
        const changedValues = Object.keys(this.valueListInt)
          .some(key => JSON.stringify(this.valueListInt[key]) !== JSON.stringify(val[key]));
        if (changedValues) {
          this.initializeValueObject();
          // this.initializeDropDownLists();
        }
      },
      deep: true,
    },
    formFieldJson() {
      // if new field specifications were set - also reset the properties of the value object
      this.valueListInt = {};
      // initialize value object with new properties
      this.initializeValueObject();
      this.initializeDropDownLists();
    },
    prefetchedDropDownLists(val) {
      Object.keys(val).forEach((dropDown) => {
        if ((val[dropDown] && val[dropDown].length)
          && (!this.dropdownLists[dropDown] || !this.dropdownLists[dropDown].length)) {
          this.setDropDown(val[dropDown], '', '', dropDown);
        }
      });
    },
  },
  mounted() {
    this.initializeValueObject();
    this.initializeDropDownLists();
  },
  methods: {
    initializeValueObject() {
      this.formFieldListInt = Object.keys(this.formFieldJson)
        // filter out hidden properties and $ref property from JSON
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
    },
    getInitialFieldValue(field) {
      const value = this.valueList[field.name];
      if (field.type === 'integer') {
        return value ? value.toString() : '';
      }
      // check special case single-choice chips (is chips but is saved as
      // (multilang) object on backend)
      if (field['x-attrs'] && field['x-attrs'].field_type
        && field['x-attrs'].field_type.includes('chips')
        && field.type === 'object') {
        if (value && Object.keys(value).length) {
          return [].concat(value);
        }
        return [];
      }
      // check if field is array
      if (field.type === 'array') {
        // check if values are already present and set those if yes
        if (typeof value === 'object' && value && value.length) {
          return [].concat(value);
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
        return Object.assign({}, initObj, value);
      }
      // if it is not a array or object simply return value from list or empty string
      return (typeof value === 'string' ? value : '');
    },
    initializeDropDownLists() {
      this.formFieldListInt.forEach((field) => {
        // check if a source is specified in the 'x-attrs'
        const sources = field['x-attrs']
          ? Object.keys(field['x-attrs']).filter(key => !!key.includes('source')) : [];
        if (sources.length) {
          sources.forEach(async (source) => {
            // TODO: check if this can be refactored to allow for custom drop down values
            // but for now leave like this
            // check if values were provided in prop
            const name = source.includes('_') ? `${field.name}_secondary` : field.name;
            const prefetched = this.prefetchedDropDownLists[name];
            if (prefetched && prefetched.length) {
              this.setDropDown(prefetched, '', field['x-attrs'].equivalent, name);
              // for all others just set to an empty array in the beginning
            } else if (source === 'source') {
              this.setDropDown([], '', field['x-attrs'].equivalent, name);
            }
          });
        }
      });
    },
    // check if field can be multiplied
    allowMultiply(el) {
      return el.type === 'array' && el['x-attrs']
        && !['chips', 'chips-below'].includes(el['x-attrs'].field_type);
    },
    setFieldValue(value, fieldName, index) {
      if (this.dropdownLists[fieldName]) {
        // cancel a potentially still ongoing autocomplete search as soon as
        // a value was selected
        if (cancel) {
          this.fieldIsLoading = '';
          cancel('value already selected');
        }
        const fieldAttrs = this.formFieldJson[fieldName]['x-attrs'];
        // reset the dropdownlist for dynamic autosuggest
        if (fieldAttrs.dynamic_autosuggest) {
          this.setDropDown([], '', fieldAttrs.equivalent, fieldName);
        }
        // if the field has contributors as equivalent set the role!
        if (fieldAttrs.equivalent === 'contributors') {
          const fieldRole = this.$store.state.data.prefetchedTypes.contributors_role
            .find(role => role.source === fieldAttrs.default_role);
          value.forEach(entry => this.$set(entry, 'roles', [fieldRole]));
        }
      }
      if (index >= 0) {
        this.$set(this.valueListInt[fieldName], index, JSON.parse(JSON.stringify(value)));
      } else {
        this.$set(this.valueListInt, fieldName, value ? JSON.parse(JSON.stringify(value)) : value);
      }
      this.$emit('values-changed', this.valueListInt);
    },
    async fetchAutocomplete({
      value, name, source, equivalent,
    }) {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.timeout = setTimeout(async () => {
        if (value && value.length > 3) {
          this.fieldIsLoading = name;
          try {
            // TODO: use C. module
            // cancel previous request if there is any
            if (cancel) {
              cancel('new request started');
            }
            const result = await axios.get(`${getApiUrl(source)}${value ? `${value}/` : ''}`, {
              withCredentials: true,
              headers: {
                'Accept-Language': this.$i18n.locale,
              },
              /* eslint-disable-next-line */
              cancelToken: new CancelToken((c) => {
                cancel = c;
              }),
            });
            this.fieldIsLoading = '';
            this.setDropDown(result.data, value, equivalent, name);
            // TODO: add additional properties if necessary: e.g.
            //  source name, separated name, dob, profession
          } catch (e) {
            console.error(e);
            if (e instanceof DOMException) {
              console.error('If you see above error it is likely because the source is missing for a field!');
            } else {
              // TODO: inform user?? notification or just info in drop down??
            }
          }
        } else {
          // check if there is a preset list for dynamic chips input fields (e.g. keywords)
          const prefetchedValues = this.prefetchedDropDownLists[name];
          this.setDropDown(prefetchedValues || [], value, equivalent, name);
        }
      }, 600);
    },
    multiplyField(field) {
      this.valueListInt[field.name]
        .push(this.getInitialFieldValue(field.items));
    },
    removeField(field, index) {
      if (index) {
        this.valueListInt[field.name].splice(index, 1);
        this.$emit('values-changed', this.valueListInt);
      } else {
        this.$set(this.valueList, field.name, this.getInitialFieldValue(field.items));
      }
    },
    isHalfField(field) {
      const index = this.formFieldsHalf.indexOf(field);
      return index > 0 && !!(index % 2);
    },
    setDropDown(data, value, equivalent, name) {
      const modifiedData = data.map((entry) => {
        if (!['GND', 'VIAF'].includes(entry.source_name)) return entry;
        // regex to filter additional info from GND and VIAF
        const pattern = /^(([^0-9,|]*?,[^0-9,|]*|[^0-9|,]*)$|([^0-9,|]*?, [^0-9,|]*|[^0-9|,]*)(, | \| | )(.*)$)/;
        const match = pattern.exec(entry.label);
        if (match && match[1]) {
          return Object.assign({}, entry, match[3] && match[5]
            ? { label: match[3], additional: match[5] } : { label: match[1], additional: '' });
        }
        return entry;
      });
      let dropDownList = [].concat(modifiedData);
      const user = this.$store.getters['PortfolioAPI/user'];
      // add defaults to fields that have defaults or whos equivalent has defaults
      const defaults = equivalent ? process.env[`${equivalent.toUpperCase()}_DEFAULTS`]
        : process.env[`${name.toUpperCase()}_DEFAULTS`];
      dropDownList = this.setDropDownDefaults(
        dropDownList,
        defaults,
        value,
      );
      // special case contributors - add user
      if ((equivalent && equivalent === 'contributors') || name === 'contributors') {
        // set user
        dropDownList = this.setDropDownDefaults(dropDownList, [{
          label: user.name,
          source: user.uuid,
          additional: this.$t('form.myself'),
        }], value);
      }
      this.$set(this.dropdownLists, name, dropDownList);
    },
    getFieldName(val) {
      return val.title || (this.$te(`form.${val.name}`) ? this.$t(`form.${val.name}`) : val.name);
    },
    setDropDownDefaults(list, defaults, input) {
      let modifiedList = [].concat(list);
      if (defaults && defaults.length) {
        // only use defaults that match the input string
        const inputMatches = defaults
          .filter(defaultOption => getLangLabel(defaultOption.label, true).toLowerCase()
            .includes(input.toLowerCase()));
        if (input.length > 3) {
          // only add defaults that match the input
          modifiedList = modifiedList.filter(option => (!option.source
            || !defaults.map(contr => contr.source).includes(option.source)));
        }
        modifiedList = inputMatches.concat(modifiedList);
      }
      return modifiedList;
    },
    checkFieldContent(val) {
      return hasFieldContent(val);
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .base-form {
    background-color: white;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    padding: $spacing $spacing 0;

    .base-form-field {
      margin-bottom: $spacing;
    }

    .base-form-field-full, .group-multiply {
      flex: 0 0 100%;
    }

    .base-form-field-half {
      flex: 0 0 calc(50% - #{$spacing-small});
      width: calc(50% - #{$spacing-small});
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
      padding: 0;
      background-color: inherit;
      border: none;

      &:hover {
        color: $app-color;
        fill: $app-color;
      }

      .field-group-icon {
        margin-left: $spacing;
        height: $icon-small;
        width: $icon-small;
      }

      &:focus .field-group-icon {
        fill: $app-color;
      }
    }
  }

  @media screen and (max-width: 870px) {
    .base-form {
      .base-form-field-half {
        flex: 0 0 100%;
      }

      .base-form-field-left-margin {
        margin-left: 0;
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
