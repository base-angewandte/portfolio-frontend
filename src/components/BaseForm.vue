<template>
  <div
    ref="baseForm"
    class="base-form">
    <template
      v-for="(element, index) in list">
      <div
        :key="element.name" />
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
        @text-input="addType(element, $event)">
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
        :always-linked="element.sourceType === 'static'"
        :identifier="element.sourceType === 'dynamic' ? 'uuid' : ''"
        :class="[
          'base-form-field',
          'base-form-field-' + getSizeClass(element.size),
          { 'base-form-field-spacing': element.size === 'half' && getClassIndex(element) }
        ]"
        :draggable="true"
        :hoverbox-content="hoverBoxData"
        @selected="$emit('selected', { value: $event && $event.length
        ? $event[0][element.name] || $event[0] : null, field: element.name })"
        @fetch-dropdown-entries="fetchAutocomplete({
          value: $event.value,
          name: element.name,
          source: element.source
        })"
        @hoverbox-active="fetchInfoData">
        <template
          slot="drop-down-entry"
          slot-scope="props">
          <span>{{ props.item[element.name] }}</span>
          <span class="chips-dropdown-second">{{ props.item.born }}</span>
          <span class="chips-dropdown-third">{{ props.item.source }}</span>
        </template>
      </base-chips-input>
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
        :allow-unknown-entries="true"
        :allow-dynamic-drop-down-entries="true"
        :identifier="'uuid'"
        :hoverbox-content="hoverBoxData"
        :object-prop="element.name"
        v-model="formValuesInt[element.name]"
        class="base-form-field base-form-field-full"
        @fetch-dropdown-entries="fetchAutocomplete({
          value: $event.value,
          name: 'authors',
          source: element.source })"
        @hoverbox-active="fetchInfoData">
        <template
          slot="drop-down-entry"
          slot-scope="props">
          <span>{{ props.item[element.name] }}</span>
          <span class="chips-dropdown-second">{{ props.item.born }}</span>
          <span class="chips-dropdown-third">{{ props.item.source }}</span>
        </template>
      </base-chips-below>

      <!-- FIELD GROUPS -->
      <div
        v-else-if="fieldTypes[element.name] === 'label'"
        :key="index"
        class="base-form-field base-form-field-full base-form-field-array">
        <div class="base-form-field-array-label">
          {{ $t('form.' + element.name) + ':' }}
        </div>
        <div
          :key="index"
          class="base-form-subform-wrapper">
          <BaseForm
            :list="prepareFormProperties(element.properties)"
            :form-values="formValuesInt[element.name]"
            class="base-form-subform"/>
        </div>
      </div>

      <!-- MULTIPLY -->
      <!-- TODO: i dont want this below each form field but only one below all of one field -->
      <div
        v-if="element.type === 'array' && element['x-attrs'] && !element['x-attrs'].source"
        :key="'multiply' + index"
        class="multiply-button">
        {{ 'Multiply label +' }}
      </div>
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
  BaseHoverBox,
} from 'base-components';

export default {
  name: 'BaseForm',
  components: {
    BaseHoverBox,
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
      hoverBoxData: {},
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
      this.setDropDownLists();
    },
    formValuesInt: {
      handler(val) {
        if (JSON.stringify(this.formValues) !== JSON.stringify(val)) {
          this.$emit('values-changed', this.formValuesInt);
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
      this.setDropDownLists();
      this.setFormValues(this.formValues);
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
    setDropDownLists() {
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
    },
    async fetchInfoData(val, entry) {
      console.log(entry);
      if (val) {
        const data = await this.$store.dispatch('data/fetchInfoBoxData', entry);
        console.log(data);
        this.hoverBoxData = data;
      } else {
        this.hoverBoxData = {};
      }
    },
    prepareFormProperties(list) {
      const listArray = Object.keys(list)
        .map(key => Object.assign({}, { name: key }, list[key]));
      return listArray.sort((a, b) => {
        if (a.order > b.order) {
          return 1;
        }
        return -1;
      });
    },
    determineFieldTypes() {
      this.list.forEach(field => this.$set(this.fieldTypes, field.name, this.getFieldType(field)));
    },
    getFieldType(obj) {
      if (obj.type === 'object' && obj.format === 'date') {
        return 'date';
      } if (obj.name === 'type') {
        return 'chips';
      } if (obj.type === 'string' && obj['x-attrs'] && obj['x-attrs'].source) {
        return 'autocomplete';
      } if (obj.name === 'text' || obj.name === 'notes') {
        return 'multiline';
      } if ((obj.type === 'array' || obj.type === 'object') && obj['x-attrs'] && obj['x-attrs'].source) {
        return 'chips';
      } if (obj.type === 'array' && !(obj['x-attrs'] || obj['x-attrs'].source)) {
        return 'label';
      }
      return 'text';
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

  .chips-dropdown-second {
    color: $font-color-second;
  }

  .chips-dropdown-third {
    font-size: $font-size-small;
    color: $font-color-second;
    float: right;
  }

  .base-form-field-array {
    margin-top: $spacing-small;
    display: flex;
    flex-direction: column;

    .base-form-field-array-label {
      color: $font-color-second;
    }
  }

  .base-form-subform-wrapper {
    border-right: 3px solid rgb(240, 240, 240);
    border-left: 3px solid rgb(240, 240, 240);
    margin: $spacing 0;

    .base-form-subform {
      margin: -16px auto;
      width: calc(100% - 6px);
    }
  }

  .multiply-button {
    width: 100%;
    color: $font-color-second;
    margin-bottom: $spacing + $spacing-small;
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
