<template>
  <div class="form-options">
    <div class="options-button-row">
      <BaseButton
        ref="options"
        :text="$t('options')"
        :icon="'options-menu'"
        :class="['options', { 'options-not-mobile-hidden': optionsButtonMobileOnly }]"
        icon-position="left"
        @clicked="showOptionsToggle = !showOptionsToggle"/>
    </div>
    <!-- TODO: fix transition (close) -->
    <transition name="slide-fade-options">
      <div
        v-if="showOptions"
        :class="[
          'options-row',
          'flex-align-right']" >
        <slot />
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
    optionsButtonMobileOnly: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      showOptions: true,
      showOptionsToggle: false,
    };
  },
  watch: {
    showOptionsToggle(val) {
      this.showOptions = ((window.innerWidth > 640 && this.optionsButtonMobileOnly)
        || val);
    },
  },
  created() {
    this.showOptions = ((window.innerWidth > 640 && this.optionsButtonMobileOnly)
      || this.showOptionsToggle);
    window.addEventListener('resize', this.calcOptionsToggle);
  },
  methods: {
    calcOptionsToggle() {
      this.showOptionsToggle = window.innerWidth > 640 && this.optionsButtonMobileOnly;
    },
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
  .options-not-mobile-hidden {
    display: none;
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

  @media screen and (max-width: $mobile) {
    &.options-not-mobile-hidden {
      display: block;
    }
  }


</style>
