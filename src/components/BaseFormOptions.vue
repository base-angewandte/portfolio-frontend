<template>
  <BaseOptions
    :show-options="showOptions"
    @options-toggle="showOptions = $event">
    <template slot="options">
      <div
        class="base-form-options__options">
        <BaseButton
          v-if="getIsArchivalEnabled && getCurrentItemData && getCurrentItemData.archive_URI"
          :text="$tc('form-view.archiveButton')"
          :has-background-color="false"
          icon-size="large"
          icon="archive-sheets"
          button-style="single"
          @clicked="openArchiveUrl()" />
        <BaseButton
          v-if="getIsArchivalEnabled && getIsArchiveChanged"
          :text="$tc('archival.updateArchiveButton')"
          :has-background-color="false"
          icon-size="large"
          icon="archive-arrow"
          button-style="single"
          @clicked="updateArchiveClicked()">
          <template
            v-if="getIsArchivalBusy"
            slot="right-of-text">
          <span class="archive-loader">
            <BaseLoader />
          </span>
          </template>
        </BaseButton>
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
      </div>
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
      'getIsArchivalBusy',
      'getIsArchiveChanged',
      'getIsArchivalEnabled',
    ]),
  },
  methods: {
    /**
     * Triggered when the user clicks the "View in Archive" button.
     */
    openArchiveUrl() {
      const url = this.getCurrentItemData.archive_URI;
      Object.assign(document.createElement('a'), {
        target: '_blank',
        href: url,
      }).click();
    },
    /**
     * Triggered when the user clicks the "Update Archive" button.
     */
    updateArchiveClicked() {
      this.$store.commit('data/setIsArchiveUpdate', true);
    },
  },
};
</script>

<style lang="scss" scoped>
.base-form-options__options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.archive-loader {
  position: relative;
  transform: scale(0.5);
  margin-left: $spacing;
  padding-left: $spacing;
}
</style>
