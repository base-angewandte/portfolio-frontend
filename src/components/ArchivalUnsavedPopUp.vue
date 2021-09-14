<template>
  <base-pop-up
    :show="isPopUpOpen"
    :title="$t('notify.archive')">
    <div class="popup-body">
      <p class="popup-title">
        {{ $t("notify.saveChanges") }}
      </p>
      <p class="popup-para">
        {{ $t("notify.saveBeforeArchive") }}
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
        @clicked="$emit('cancel-unsaved')" />
      <base-button
        button-style="single"
        :text="$t('notify.saveChanges')"
        :icon="getIsFormSaving ? '' : 'save-file-thin'"
        icon-position="right"
        icon-size="small"
        class="base-archival-bar-button"
        @clicked="$emit('save-form')">
        <template
          v-if="getIsFormSaving"
          slot="right-of-text">
          <span class="base-upload-bar-loader">
            <BaseLoader />
          </span>
        </template>
      </base-button>
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
  },
  computed: {
    ...mapGetters('data', [
      'getIsFormSaving',
    ]),
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
  .base-upload-bar-loader {
    position: relative;
    transform: scale(0.5);
    margin-left: $spacing;
    padding-left: $spacing;
  }
}
.base-archival-bar-button + .base-archival-bar-button {
  margin-left: $spacing;
}
@media screen and (max-width: $mobile) {
  .base-archival-bar-button + .base-archival-bar-button {
    margin-left: 0;
    margin-top: $spacing;
  }
}
</style>
