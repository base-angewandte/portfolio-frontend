<template>
  <div class="base-form">
    <template
      v-for="(element, index) in list">
      <base-autocomplete-input
        v-if="element.type === 'autocomplete'"
        :key="index"
        :label="element.name"
        :placeholder="'Select ' + element.name"
        :list="dropdownLists[element.name]"
        :object-prop="element.name.toLowerCase()"
        v-model="element.value"
        :class="['base-form-field', 'base-form-field-' + getSizeClass(element.size)]"
        @autocomplete="fetchAutocomplete({ value: $event, name: element.name })"/>
      <base-multiline-text-input
        v-else-if="element.type === 'multiline'"
        :key="index"
        :tabs="element.lang"
        :label="element.name"
        :placeholder="'Write a ' + element.name"
        v-model="element.value"
        class="base-form-field base-form-field-full">
        <div
          v-if="element.name === 'Description'"
          class="multiline-dropdown">
          <base-drop-down
            :default-select="'Textart'"
            :selection-list="['Beschreibung', 'Ausstellungseinladung', 'Zeitungsartikel']" />
        </div>
      </base-multiline-text-input>
      <base-chips-input
        v-else-if="element.type === 'chips'"
        :key="index"
        :placeholder="'Select ' + element.name"
        :label="element.name"
        :object-prop="element.name"
        :list="dropdownLists[element.name]"
        :allow-dynamic-drop-down-entries="element.source === 'dynamic'"
        :allow-multiple-entries="element.mode === 'multi'"
        :allow-unknown-entries="element.unknown"
        :class="['base-form-field', 'base-form-field-' + getSizeClass(element.size)]"
        @selected="$emit('selected', $event && $event.length ? $event[0][element.name] : null)"/>
      <base-input
        v-else-if="element.type === 'text'"
        :key="index"
        :label="element.name"
        :placeholder="'Select ' + element.name"
        :id="index"
        v-model="element.value"
        :class="['base-form-field', 'base-form-field-' + getSizeClass(element.size)]"/>
      <base-date-input
        v-else-if="element.type === 'date'"
        :key="index"
        :label="element.name"
        :placeholder="'Select ' + element.name"
        :id="index"
        v-model="element.value"
        :class="['base-form-field', 'base-form-field-' + getSizeClass(element.size)]"/>
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
} from 'base-components';

export default {
  components: {
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
  },
  computed: {
    dropdownLists() {
      const obj = {};
      this.$props.list.filter(element => element.type === 'autocomplete' || element.type === 'chips')
        .forEach((autoField) => {
          if (autoField.name === 'Schlagwörter') {
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
          } else if (autoField.name === 'Typ') {
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
      return obj;
    },
  },
  methods: {
    getSizeClass(val) {
      return val && ['half', 'full'].includes(val) ? val : 'full';
    },
    async fetchAutocomplete(item) {
      if (!item.value || item.value.length > 3) {
        const result = await axios.get(`http://localhost:9900/fetchAutocomplete/${item.name.toLowerCase()}`, {
          params:
            {
              string: item.value,
            },
        });
        if (this.dropdownLists && this.dropdownLists[item.name]) {
          this.$set(this.dropdownLists, [item.name], result.data);
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

    .multiline-dropdown {
      margin-bottom: -10px;
    }
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

  .base-form-field-half + .base-form-field-half {
    margin-left: 16px;
  }

  @media screen and (max-width: $mobile) {
    .base-form-field-half {
      flex: 0 0 100%;
    }

    .base-form-field-half + .base-form-field-half {
      margin-left: 0;
    }

    .multiline-dropdown {
      order: 0;
    }
  }
</style>
