<template>
  <div class="base-form">
    <template
      v-for="(element, index) in list">
      <base-input
        v-if="element.type === 'text'"
        :key="index"
        :label="element.name"
        :placeholder="'Select ' + element.name"
        :id="index"
        v-model="element.value"
        :class="['base-form-field', 'base-form-field-' + getSizeClass(element.size)]"/>
      <base-chips-input
        v-else-if="element.type === 'chips'"
        :key="index"
        :placeholder="'Select ' + element.name"
        :label="element.name"
        :class="['base-form-field', 'base-form-field-' + getSizeClass(element.size)]"/>
    </template>
  </div>
</template>

<script>
import BaseInput from 'base-components/src/components/BaseInput';
import BaseChipsInput from 'base-components/src/components/BaseChipsInput';

export default {
  components: { BaseChipsInput, BaseInput },
  props: {
    list: {
      type: Array,
      required: true,
    },
  },
  methods: {
    getSizeClass(val) {
      return val && ['half', 'full'].includes(val) ? val : 'full';
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
