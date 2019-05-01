<template>
  <div class="base-options">
    <div class="base-options-row">
      <div
        v-if="alignOptions === 'right' || beforeSlotHasData"
        class="base-options-before">
        <slot name="beforeOptions" />
      </div>

      <BaseButton
        v-if="useOptionsButton"
        ref="options"
        :text="$t('options')"
        :icon="'options-menu'"
        :disabled="optionsHidden"
        :class="['base-options-button', { 'base-options-button-hidden': optionsHidden }]"
        icon-position="left"
        @clicked="showOptionsToggle = !showOptionsToggle" />
      <div
        v-else-if="!optionsHidden && !isMobile"
        class="base-options-inline" >
        <slot name="options" />
      </div>
      <div
        v-if="afterSlotHasData"
        class="base-options-after">
        <slot name="afterOptions" />
      </div>
    </div>
    <transition name="slide-fade-options">
      <div
        v-if="useOptionsButton && showOptionsToggle"
        class="base-options-below" >
        <slot name="options" />
      </div>
      <slot name="animations" />
    </transition>
  </div>
</template>

<script>
import { BaseButton } from 'base-ui-components';

export default {
  components: {
    BaseButton,
  },
  props: {
    alwaysShowOptionsButton: {
      type: Boolean,
      default: false,
    },
    alignOptions: {
      type: String,
      default: 'right',
      validator(val) {
        return ['left', 'right'].includes(val);
      },
    },
    showOptions: {
      type: Boolean,
      default: false,
    },
    optionsHidden: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isMobile: window.innerWidth < 640,
    };
  },
  computed: {
    useOptionsButton() {
      return this.alwaysShowOptionsButton || this.isMobile;
    },
    beforeSlotHasData() {
      return this.$slots.beforeOptions;
    },
    afterSlotHasData() {
      return this.$slots.afterOptions;
    },
    showOptionsToggle: {
      set(val) {
        this.$emit('options-toggle', val);
      },
      get() {
        return this.showOptions;
      },
    },
  },
  created() {
    window.addEventListener('resize', this.calcOptionsToggle);
  },
  methods: {
    calcOptionsToggle() {
      this.isMobile = window.innerWidth < 640;
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";
  .base-options {
    width: 100%;
    background-color: $background-color;

    .base-options-row {
      min-height: $row-height-small;
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;

      .base-options-before {
        align-self: center;
      }

      .base-options-button {
        &.base-options-button-hidden {
          display: none;
        }
      }

      .base-options-inline {
        display: flex;
        flex-grow: 1;
        flex-shrink: 0;
        justify-content: flex-end;
      }

      .base-options-after {
        flex: 1 1 auto;
        align-self: center;
      }
    }

    .base-options-below {
      background-color: $background-color;
      display: flex;
      flex-wrap: wrap;
      height: auto;
      justify-content: center;
    }
  }

  .slide-fade-options-enter-active, .slide-fade-options-move {
    transition: all 0.5s ease;
  }
  .slide-fade-options-enter, .slide-fade-options-leave-to {
    opacity: 0;
    transform: translateY(-#{2*$spacing});
  }

  .slide-fade-options-leave-active {
    position: absolute;
    width: 100%;
    margin: auto;
    transition: all 0.3s ease;
  }
</style>
