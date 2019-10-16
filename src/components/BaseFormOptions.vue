<template>
  <BaseOptions
    :show-options="showOptions"
    @options-toggle="showOptions = $event">
    <template slot="options">
      <BaseButton
        :disabled="isNewForm"
        :text="isPublished ? $tc('offline') : $tc('publish')"
        :has-background-color="false"
        icon-size="large"
        icon="eye"
        button-style="single"
        @clicked="$emit('action-entry', isPublished ? 'offline' : 'publish')" />
      <BaseButton
        :disabled="isNewForm"
        :text="$tc('delete')"
        :has-background-color="false"
        icon-size="large"
        icon="waste-bin"
        button-style="single"
        @clicked="$emit('action-entry', 'delete')" />
    </template>
  </BaseOptions>
</template>

<script>
import { BaseButton, BaseOptions } from 'base-ui-components';

export default {
  components: {
    BaseButton,
    BaseOptions,
  },
  props: {
    defaultExpanded: {
      type: Boolean,
      default: true,
    },
    isNewForm: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    formType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showOptions: this.defaultExpanded,
    };
  },
};
</script>
