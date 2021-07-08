<template>
  <base-pop-up
    :show="isPopUpOpen"
    :title="$t('archival.confirmTitle')"
    @close="onCancel">
    <div class="popup-body">
      <p class="popup-title">
        {{ $t('archival.confirmText') }}
      </p>
      <ul class="popup-title">
        <li
          v-for="fileName in selectedFileNames"
          :key="fileName">
          {{ fileName }}
        </li>
      </ul>
      <p class="popup-para">
        {{ $t('archival.disclaimerText') }}
      </p>
      <p class="popup-para">
        <base-checkmark
          :show-label="true"
          :label="$t('archival.archiveMediaConsent')"
          mark-style="checkbox"
          @clicked="toggleAgreement" />
      </p>
    </div>
    <template v-slot:button-row>
      <base-button
        button-style="single"
        :text="$t('cancel')"
        icon="remove"
        icon-position="right"
        icon-size="small"
        class="base-archival-bar-button"
        @clicked="onCancel" />
      <base-button
        button-style="single"
        :text="$t('archival.archiveWizardButton')"
        icon="archive-arrow"
        icon-position="right"
        icon-size="small"
        :disabled="!getArchiveMediaConsent"
        class="base-archival-bar-button"
        @clicked="onNext" />
    </template>
  </base-pop-up>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    isPopUpOpen: {
      type: Boolean,
      default() {
        return false;
      },
    },
    selectedFiles: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  computed: {
    ...mapGetters('data', [
      'getCurrentMedia',
      'getArchiveMediaConsent',
    ]),
    /**
     * Returns an array with short file names (no path) + extension for currently selected files.
     */
    selectedFileNames() {
      const fileNames = [];
      // first filter out only objects where filename is selected
      const selObjects = this.getCurrentMedia.filter((obj) => this.selectedFiles.includes(obj.id));
      // now iterate through filtered objects and populate fileNames
      selObjects.forEach((obj) => {
        // push only part after the last / character
        fileNames.push(obj.original.substr(obj.original.lastIndexOf('/') + 1));
      });
      return fileNames;
    },
  },
  methods: {
    /**
     * Occurs when the user clicks "Next" on the pop-up.
     */
    onNext() {
      this.$emit('next-step');
    },
    /**
     * Occurs when the user clicks "Cancel" on the pop-up.
     */
    onCancel() {
      // revoke the licensing agreement consent
      this.$store.commit('data/setArchiveMediaConsent', false);
      this.$emit('cancel-agreement');
    },
    /**
     * Accept or revoke the archival licensing agreement, based on the previous state.
     */
    toggleAgreement() {
      // set the store value to the opposite of what it currently is
      this.$store.commit('data/setArchiveMediaConsent', !this.getArchiveMediaConsent);
    },
  },
};
</script>

<style lang="scss" scoped>
.popup-title {
  margin: $spacing auto 0 auto;
  font-size: $font-size-large;
}
.popup-para {
  margin: $spacing auto 0 auto;
}
.popup-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: $font-color-second;
}
.base-archival-bar-button {
  flex-basis: 100%;
}
.base-archival-bar-button + .base-archival-bar-button {
    margin-left: $spacing;
 }
 @media screen and (max-width: $tablet) {
  .attachment-area {
    .base-archival-bar-button + .base-archival-bar-button {
      margin-left: 0;
      margin-top: $spacing;
    }
  }
}
</style>
