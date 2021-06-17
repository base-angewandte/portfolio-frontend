<template>
  <BaseOptions
    :show-options="showOptions"
    @options-toggle="showOptions = $event">
    <template slot="options">
      <a
        v-if="getCurrentItemData && getCurrentItemData.archive_URI"
        :href="getCurrentItemData.archive_URI"
        target="_blank">
        <BaseButton
          :text="$tc('form-view.archiveButton')"
          :has-background-color="false"
          icon-size="large"
          icon="link"
          button-style="single" />
      </a>
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
import { mapGetters } from 'vuex';

export default {
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
  computed: {
    ...mapGetters('data', [
      'getCurrentItemData',
    ]),
  },
};
</script>
