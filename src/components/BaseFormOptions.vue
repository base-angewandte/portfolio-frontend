<template>
  <BaseOptions
    :show-options="showOptions"
    @options-toggle="showOptions = $event">
    <template slot="options">
      <BaseButton
        v-if="getCurrentItemData && getCurrentItemData.archive_URI"
        :text="$tc('form-view.archiveButton')"
        :has-background-color="false"
        icon-size="large"
        icon="archive-arrow"
        button-style="single"
        @clicked="openArchiveUrl()" />
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
  methods: {
    /**
     * Triggered when the user clicks the "View in Phaidra" button.
     */
    openArchiveUrl() {
      const url = this.getCurrentItemData.archive_URI;
      Object.assign(document.createElement('a'), {
        target: '_blank',
        href: url,
      }).click();
    },
  },
};
</script>
