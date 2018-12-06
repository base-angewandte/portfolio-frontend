<template>
  <div class="attachment-area">
    <transition name="slide">
      <div
        v-if="text"
        class="message-area">
        <div class="message-area-text">
          {{ text }}
        </div>
        <div class="message-area-subtext">
          {{ subtext }}
        </div>
      </div>
    </transition>
    <div
      v-if="linkedList.length"
      class="linked-area">
      <h3
        v-if="showTitle"
        class="attachment-area-subheader">Verknüpfte Einträge</h3>
      <div class="box-area">
        <BaseImageBox
          v-for="linked of linkedList"
          :selectable="!!text"
          :key="linked.id"
          :box-size="{ width: 'calc(25% - 12px)' }"
          :title="linked.title"
          show-title
          class="linked-base-box"/>
      </div>
    </div>
    <div
      v-if="attachedList.length"
      class="linked-area">
      <h3
        v-if="showTitle"
        class="attachment-area-subheader">Angehängte Dateien</h3>
      <div class="box-area">
        <BaseImageBox
          v-for="attached of attachedList"
          :selectable="!!text"
          :show-title="false"
          :box-size="{ width: 'calc(25% - 12px)' }"
          :box-ratio="100"
          :image-url="require('../static/img1.png')"
          :key="attached.id"
          class="linked-base-box"/>
      </div>
    </div>
  </div>
</template>

<script>
import { BaseImageBox } from 'base-components';

export default {
  components: {
    BaseImageBox,
  },
  props: {
    linkedList: {
      type: Array,
      default() {
        return [];
      },
    },
    attachedList: {
      type: Array,
      default() {
        return [];
      },
    },
    showTitle: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: '',
    },
    subtext: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .attachment-area {
    .attachment-area-subheader {
      font-size: $font-size-regular;
      color: $font-color-second;
      font-weight: normal;
      margin: $spacing;

    }

    .linked-area {
      margin-top: $spacing;

      .box-area {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .linked-base-box {
          margin-bottom: $spacing;
        }

        .linked-base-box:not(:nth-child(4n)) {
          margin-right: $spacing;
        }
      }
    }

    .message-area {
      margin: $spacing-large;
      text-align: center;
      color: $font-color-second;
      transition: all 0s ease;
      backface-visibility: hidden;
      z-index: 1;

      .message-area-text {
        font-size: $font-size-large;
      }

      .message-area-subtext {
        font-size: $font-size-small;
      }
    }
  }

  .slide-move {
    transition: all 600ms ease-in-out;
  }

  .slide-enter-active {
    transition: all 300ms ease-out;
  }

  .slide-leave-active {
    transition: all 200ms ease-in;
    position: absolute;
    z-index: 0;
  }

  .slide-enter, .slide-leave-to {
    height: 0;
  }
</style>
