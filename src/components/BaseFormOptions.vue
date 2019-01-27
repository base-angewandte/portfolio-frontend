<template>
  <div class="form-options">
    <!-- TODO: make this conditional with defaultExpanded -->
    <div class="options-button-row mobile-elements">
      <BaseButton
        :text="$t('options')"
        :icon="'remove'"
        :hide-icon="!showOptions"
        icon-position="right"
        class="options"
        @clicked="showOptions = !showOptions"/>
    </div>
    <transition name="slide-fade-options">
      <div
        v-if="showOptions"
        class="options-row flex-align-right" >
        <BaseButton
          :disabled="isNewForm"
          :text="isPublished ? $t('form-view.offline') : $t('form-view.publish')"
          icon-size="large"
          icon="eye"
          button-style="single"
          @clicked="actionEntry(isPublished ? 'offline' : 'publish')"/>
        <BaseButton
          :disabled="true"
          :text="$t('form-view.edit')"
          icon-size="large"
          icon="people"
          button-style="single" />
        <BaseButton
          :disabled="isNewForm"
          :text="$t('form-view.delete', { type: formType ? formType : $t('entry') })"
          icon-size="large"
          icon="waste-bin"
          button-style="single"
          @clicked="actionEntry('delete')"/>
      </div>
    </transition>
  </div>
</template>

<script>
import { BaseButton } from 'base-components';

export default {
  components: {
    BaseButton,
  },
  props: {
    defaultExpanded: {
      type: Boolean,
      default: true,
    },
    // TODO: remove this and make more generalized component
    isNewForm: {
      type: Boolean,
      default: false,
    },
    // TODO: remove this and make more generalized component
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showOptions: this.defaultExpanded,
      // TODO: remove this and make more generalized component
      formType: 'test',
    };
  },

};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";
  .options-button-row {
    width: 100%;

    .options {
      margin: auto;
    }
  }

  .slide-fade-options-enter-active, .slide-fade2-move {
    transition: all 0.5s ease;
  }
  .slide-fade-options-enter, .slide-fade2-leave-to {
    opacity: 0;
    transform: translateY(-#{$spacing});
  }

  .slide-fade-options-leave-active {
    position: absolute;
    transition: all 0.3s ease;
  }
</style>
