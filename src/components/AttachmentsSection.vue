<template>
  <div class="base-attachments-section">
    <div
      v-if="attachedList.length && isLoading"
      class="base-attachments-section__loading">
      <BaseLoader class="base-attachments-section__loader" />
    </div>
    <div
      v-if="attachedList.length"
      class="base-attachments-section__area">
      <!-- HEADER ROW -->
      <div class="base-attachments-section__header-row">
        <BaseOptions
          :show-options="showActions"
          @options-toggle="fileText = actionInt = ''; showActions = $event">
          <template slot="beforeOptions">
            <h3
              v-if="headerText"
              class="base-attachments-section__header">
              {{ headerText }}
            </h3>
          </template>
          <template slot="options">
            <div
              v-if="!selectActive"
              class="base-attachments-section__attachment-options">
              <slot
                :set-action="setAction"
                name="option-buttons">
                <BaseButton
                  :text="optionButtonText"
                  icon-size="large"
                  icon="waste-bin"
                  button-style="single"
                  @clicked="setAction('delete')" />
              </slot>
            </div>
            <div
              v-else
              class="base-attachments-section__attachment-options">
              <BaseButton
                :text="cancelText"
                icon-size="large"
                icon="remove"
                button-style="single"
                @clicked="actionInt = ''" />
              <BaseButton
                :text="actionButtonText"
                icon-size="large"
                icon="save-file"
                button-style="single"
                @clicked="submitAction" />
            </div>
          </template>
        </BaseOptions>
      </div>

      <!-- ACTION AREA -->
      <transition-group name="slide">
        <div
          v-if="selectActive"
          :key="headerText + '_messageArea'"
          class="base-attachments-section__message-area">
          <div class="base-attachments-section__message-area-text">
            {{ messageText }}
          </div>
          <div class="base-attachments-section__message-area-subtext">
            {{ messageSubtext }}
          </div>
          <slot name="options-message-area-after" />
        </div>

        <!-- BOXAREA -->
        <div
          :key="headerText + '_boxArea'"
          class="base-attachments-section__box-area">
          <template v-for="(attached, index) of attachedList">
            <slot
              :item="attached"
              :index="index"
              :select-active="selectActive"
              name="attached-box">
              <BaseImageBox
                :key="attached.id"
                :selectable="selectActive"
                :box-size="{ width: 'calc(25% - 0.43em - (0.43em/2))' }"
                :box-ratio="100" />
            </slot>
          </template>

          <!-- ACTION BUTTON -->
          <BaseBoxButton
            v-if="showActionButtonBox && actionInt"
            :text="actionButtonText"
            :box-size="{ width: 'calc(25% - 0.43em - (0.43em/2))' }"
            icon="save-file"
            box-style="small"
            class="linked-base-box"
            @clicked="submitAction" />
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import {
  BaseButton, BaseImageBox, BaseBoxButton, BaseLoader,
} from 'base-ui-components';
import BaseOptions from './BaseOptions';

export default {
  components: {
    BaseLoader,
    BaseButton,
    BaseOptions,
    BaseImageBox,
    BaseBoxButton,
  },
  props: {
    headerText: {
      type: String,
      default: '',
    },
    attachedList: {
      type: Array,
      default() {
        return [];
      },
    },
    /**
     * if slot (options-message-area) is not used this variable
     * can be used to customize message text
     */
    messageText: {
      type: String,
      default: 'Select',
    },
    /**
     * if slot (options-message-area) is not used this variable
     * can be used to customize message subtext
     */
    messageSubtext: {
      type: String,
      default: 'Please select the relevant items:',
    },
    /**
     * if slot (options) is not used this text is used for the option button text
     */
    optionButtonText: {
      type: String,
      default: 'Delete',
    },
    /**
     * customize the action text of the submit button
     */
    actionButtonText: {
      type: String,
      default: 'Delete',
    },
    /**
     * customize the cancel button message
     */
    cancelText: {
      type: String,
      default: 'Cancel',
    },
    /**
     * define if the big button box at the end of all attached items should be shown
     */
    showActionButtonBox: {
      type: Boolean,
      default: true,
    },
    /**
     * set action from outside
     */
    action: {
      type: String,
      default: '',
    },
    /**
     * set component loader active
     */
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showActions: false,
      actionInt: '',
    };
  },
  computed: {
    selectActive() {
      return !!this.actionInt;
    },
  },
  watch: {
    action(val) {
      if (val !== this.actionInt) {
        this.actionInt = val;
      }
    },
  },
  created() {
    this.actionInt = this.action;
  },
  methods: {
    setAction(act) {
      this.actionInt = act;
      this.$emit('set-action', act);
    },
    submitAction() {
      this.$emit('submit-action', this.actionInt);
    },
  },
};
</script>

<style lang="scss" scoped>
  .base-attachments-section {
    position: relative;

    .base-attachments-section__loading {
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 2;
      background-color: rgba(255,255,255, 0.50);

      .base-attachments-section__loader {
        top: 50%;
      }
    }

    .base-attachments-section__area {

      .base-attachments-section__header {
        font-size: $font-size-regular;
        color: $font-color-second;
        font-weight: normal;
        margin: $spacing;

      }

      .base-attachments-section__header-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        .base-attachments-section__attachment-options {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
      }

      .base-attachments-section__box-area {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }

      .base-attachments-section__message-area {
        margin-bottom: $spacing-large;
        text-align: center;
        color: $font-color-second;
        backface-visibility: hidden;
        z-index: 1;

        .base-attachments-section__message-area-text {
          font-size: $font-size-large;
        }

        .base-attachments-section__message-area-subtext {
          font-size: $font-size-small;
        }
      }

      .slide-enter-active {
        transition: all .5s ease-in-out;
      }

      .slide-move {
        transition: all .15s ease-out;
      }

      .slide-enter {
        opacity: 0;
        transform: translateY(-#{$spacing});
      }

      .slide-leave-to {
        opacity: 0;
        transform: translateY(-#{$spacing});
      }

      .slide-leave-active {
        position: absolute;
        width: 100%;
        margin: auto;
        transition: opacity 0.15s ease, transform 0.3s ease;
      }
    }
  }
</style>
