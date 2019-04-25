<template>
  <div class="base-row">
    <div
      class="base-row-header">
      <BaseMenuEntry
        :entry-id="'asingleentry'"
        :icon="'sheet-empty'"
        :title="showOverlay ? '' : title"
        :title-bold="true"
        :is-activatable="false"
        :subtext="type"/>
    </div>
    <div
      id="form-back-button"
      :class="[
        'form-button',
        'mobile-elements',
        { 'form-button-child' : showBackButton }
    ]">
      <BaseButton
        :text="unsavedChanges ? $t('cancel') : $t('back')"
        :icon="unsavedChanges ? '' : 'arrow-left'"
        icon-size="small"
        button-style="row"
        class="form-button-inner"
        @clicked="$emit('return')"/>
    </div>
    <div
      id="form-save-button"
      class="form-button">
      <BaseButton
        :active="unsavedChanges"
        :text="$t('save')"
        :disabled="dbRequestOngoing"
        :icon="isSaving ? '' : 'save-file'"
        button-type="submit"
        icon-size="small"
        button-style="row"
        class="form-button-inner"
        @clicked="$emit('save')">
        <template
          v-if="isSaving"
          slot="left-of-text">
          <span class="save-loader">
            <BaseLoader />
          </span>
        </template>
      </BaseButton>
    </div>

  </div>
</template>

<script>
import { BaseMenuEntry, BaseButton, BaseLoader } from 'base-components';

export default {
  components: {
    BaseMenuEntry,
    BaseButton,
    BaseLoader,
  },
  props: {
    unsavedChanges: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    showSave: {
      type: Boolean,
      default: true,
    },
    showBackButton: {
      type: Boolean,
      default: true,
    },
    isSaving: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showOverlay: false,
    };
  },
  computed: {
    dbRequestOngoing() {
      // TODO: think about separate loading indicator for sidebar / form
      return this.$store.getters['PortfolioAPI/isLoading'];
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  #form-save-button {
    border-left: $separation-line;
  }

  .form-button-child {
    display: block;
    border-left: $separation-line;
  }

  .save-loader {
    position: relative;
    transform: scale(0.5);
    margin-right: $spacing;
    padding-right: $spacing;
  }

  @media screen and (max-width: $mobile) {
    #form-back-button, #form-save-button {
      width: 50%;
    }

    #form-back-button {
      order: 1;
    }

    #form-save-button {
      order: 2;
    }

    .form-button-inner {
      width: 100%;
    }
  }
</style>
