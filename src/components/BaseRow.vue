<template>
  <div
    :class="['base-row',
             { 'base-row-multiple-buttons':
               buttons.filter((button) => button.visible).length > 1 }]">
    <div
      v-if="showTitle || showSearch"
      class="base-row-header">
      <div
        v-if="!showSearch"
        class="base-row-header__text-wrapper">
        <BaseMenuEntry
          :entry-id="'asingleentry'"
          :icon="'file-object'"
          :title="showOverlay ? '' : title"
          :title-bold="true"
          :is-activatable="false"
          :subtext="type"
          :show-thumbnails="false" />
        <div
          v-if="showRemoveButton"
          class="form-button form-reset-button"
          @click="$emit('remove')">
          <BaseIcon
            name="remove"
            class="form-reset-button__icon" />
        </div>
      </div>
      <BaseSearch
        v-if="showSearch"
        v-model="searchText"
        data-e2e-import-search-box
        label="SearchInput"
        :placeholder="$t('import.searchCatalogueText')"
        show-image
        @input="$emit('search', searchText)" />
    </div>
    <div
      class="base-row-buttons">
      <div
        v-if="showMobileBackButton || showBackButton"
        :class="[
          'form-button',
          'form-back-button',
          'mobile-elements',
          { 'form-button-child' : showBackButton }
        ]">
        <BaseButton
          :text="unsavedChanges ? $t('cancel') : $t('back')"
          :icon="unsavedChanges ? '' : 'arrow-left'"
          icon-size="small"
          button-style="row"
          class="form-button-inner"
          @clicked="cancel" />
      </div>

      <template
        v-if="buttons">
        <template
          v-for="(button, index) in buttons">
          <div
            v-if="button.visible"
            :key="index"
            :class="['form-button',
                     'form-save-button',
                     'form-save-button-' + (index + 1)]">
            <BaseButton
              :active="button.unsavedChanges"
              :text="$t(button.text)"
              :disabled="dbRequestOngoing || button.disabled"
              :icon="isSaving ? '' : button.icon"
              button-type="submit"
              icon-size="small"
              button-style="row"
              class="form-button-inner"
              @clicked="save(button.action)">
              <template
                v-if="isSaving"
                slot="left-of-text">
                <span class="save-loader">
                  <BaseLoader />
                </span>
              </template>
            </BaseButton>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    /**
     * define if save button should be underlined underlined
     */
    unsavedChanges: {
      type: Boolean,
      default: false,
    },
    /**
     * define title
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * define type as subtitle
     */
    type: {
      type: String,
      default: '',
    },
    /**
     * define save button(s)<br>
     */
    buttons: {
      type: Array,
      default: () => [{
        action: 'save',
        disabled: false,
        icon: 'save-file',
        text: 'save',
        unsavedChanges: false,
        visible: true,
      }],
      validator: (data) => data.every((obj) => ['action', 'disabled', 'icon', 'text', 'unsavedChanges', 'visible'].every((key) => Object.keys(obj).includes(key))),
    },
    /**
     * define visibility of save button
     */
    showSaveButton: {
      type: Boolean,
      default: true,
    },
    /**
     * define visibility of back button
     */
    showBackButton: {
      type: Boolean,
      default: true,
    },
    /**
     * define visibility of back button on mobile resolution
     */
    showMobileBackButton: {
      type: Boolean,
      default: true,
    },
    /**
     * define visibility of remove button (x)
     */
    showRemoveButton: {
      type: Boolean,
      default: false,
    },
    /**
     * define visibility of title
     */
    showTitle: {
      type: Boolean,
      default: true,
    },
    /**
     * define visibility of title
     */
    showSearch: {
      type: Boolean,
      default: false,
    },
    /**
     * define current saving status
     */
    isSaving: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showOverlay: false,
      searchText: '',
    };
  },
  computed: {
    dbRequestOngoing() {
      // TODO: think about separate loading indicator for sidebar / form
      return this.$store.getters['PortfolioAPI/isLoading'];
    },
  },
  methods: {
    resetSearchText() {
      this.searchText = '';
    },
    cancel() {
      this.resetSearchText();
      this.$emit('return');
    },
    save(action) {
      this.resetSearchText();
      this.$emit('save', action);
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .form-save-button {
    border-left: $separation-line;
    white-space: nowrap;
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

  .base-row-header {

    &__text-wrapper {
      display: flex;

      .form-reset-button {
        align-items: center;
        background-color: #ffffff;
        color: $font-color-third;
        cursor: pointer;
        display: flex;
        justify-content: center;

        &:focus, &:active {
          color: $app-color;
        }

        .form-reset-button__icon {
          height: $icon-medium;
          width: $icon-medium;
          margin-right: $spacing;
        }
      }
    }
  }

  .base-row-buttons {
    display: flex;

    & > .form-button:only-child {
      width: 100%;
    }
  }

  @media screen and (max-width: $tablet) {
    .base-row-multiple-buttons {
      flex-wrap: wrap;

      .base-row-header {
        border-bottom: $separation-line;
      }

      .base-row-buttons {
        width: 100%;

        .form-save-button {
          white-space: normal;
        }

        .form-save-button-1 {
          border-left: none;
        }
      }

      .form-save-button {
        width: 50%;

        .form-button-inner {
          width: 100%;
        }
      }
    }
  }

  @media screen and (max-width: $mobile) {
    .form-back-button, .form-save-button {
      width: 50%;
    }

    .form-button-child {
      border-left: none;
    }

    .form-back-button {
      order: 1;
    }

    .form-save-button {
      order: 2;
    }

    .form-button-inner {
      width: 100%;
    }

    .base-row-buttons {
      width: 100%;
    }

    .base-row-multiple-buttons {
      .base-row-buttons {
        flex-wrap: wrap;

        .form-back-button {
          width: 100%;
          border-bottom: $separation-line;
        }
      }
    }
  }
</style>
