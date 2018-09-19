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
        :tabs="['German', 'English']"
        v-model="element.value"/>
      <base-chips-input
        v-else-if="element.type === 'chips'"
        :key="index"
        :placeholder="'Select ' + element.name"
        :label="element.name"
        :class="['base-form-field', 'base-form-field-' + getSizeClass(element.size)]"/>
      <base-input
        v-else-if="element.type === 'text'"
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
  BaseChipsInput,
  BaseAutocompleteInput,
  BaseMultilineTextInput,
} from 'base-components';

export default {
  components: {
    BaseMultilineTextInput,
    BaseChipsInput,
    BaseInput,
    BaseAutocompleteInput,
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
      this.$props.list.filter(element => element.type === 'autocomplete')
        .forEach(autoField => this.$set(obj, autoField.name, []));
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
  .base-form {
    background-color: white;
    display: flex;
    flex-wrap: wrap;
    padding: 16px;

    .base-form-field-full {
      flex: 0 0 100%;
    }

    .base-form-field-half {
      flex: 0 0 calc(50% - 8px);
    }

    .base-form-field-half + .base-form-field-half {
      margin-left: 16px;
    }
  }
</style>
