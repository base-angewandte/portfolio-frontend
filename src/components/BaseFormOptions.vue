<template>
  <BaseOptions
    :show-options="showOptions"
    @options-toggle="showOptions = $event">
    <template slot="options">
      <div
        class="base-form-options__options">
        <BaseDropButton
          v-if="getIsArchivalEnabled && getCurrentItemData && getCurrentItemData.archive_URI"
          :buttons="archivalDropButtons"
          expand-button-label="Show more actions"
          :primary-button="primaryArchivalButton"
          @clicked="runArchivalAction">
          <template
            v-if="getIsArchivalBusy"
            slot="right-of-text">
            <span class="archive-loader">
              <BaseLoader />
            </span>
          </template>
        </BaseDropButton>
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
    /**
     * Returns buttons to populate the BaseDropButton component
     */
    archivalDropButtons() {
      const dropButtons = [{
        label: this.$tc('form-view.archiveButton'),
        action: 'view-archive',
        icon: 'archive-sheets',
      }];
      if (this.getIsArchiveChanged) {
        dropButtons.push({
          label: this.$tc('archival.updateArchiveButton'),
          action: 'update-archive',
          icon: 'archive-arrow',
        });
      }
      return dropButtons;
    },
    /**
     * Returns the primary button for the BaseDropButton component
     */
    primaryArchivalButton() {
      return this.getIsArchiveChanged ? 'update-archive' : 'view-archive';
    },
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
    onUpdateArchiveClicked() {
      this.$store.commit('data/setIsArchiveUpdate', true);
    },
    /**
     * Perform an archival action depending on what button was clicked
     * on the BaseDropButton component.
     */
    runArchivalAction(action) {
      switch (action) {
      case 'view-archive':
        this.openArchiveUrl();
        break;
      case 'update-archive':
        this.onUpdateArchiveClicked();
        break;
      default:
        console.error('Unknown archival action');
      }
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
