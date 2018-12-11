<template>
  <div
    class="notification-container">
    <div class="notification-box">
      <notifications
        :duration="3000"
        :width="'100%'"
        group="request-notifications"
        position="top right"
        animation-name="v-slide">
        <template
          slot="body"
          slot-scope="props">
          <div
            :class="[props.item.type, 'notification']"
            @click="props.close">
            <div class="notification-text">
              <div
                class="notification-title"
                v-html="props.item.title" />
              <div class="notification-message">
                {{ props.item.text }}
              </div>

            </div>

            <div
              class="notification-close"
              @click="props.close">
              <img
                :alt="'remove Message'"
                src="../static/remove.svg"
                class="icon notification-icon" >
            </div>
          </div>
        </template>
      </notifications>
    </div>
  </div>
</template>

<script>
export default {
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables";

  .notification-container{
    position: sticky;
    top: $header-height;
    z-index: 10;
    width: 450px;
    margin-left: auto;
    margin-top: $header-height;

    &.fixed {
      position: fixed;
      top: $header-height;
    }

    .notification-box {
      position: relative;
    }

    .notifications {
      position: absolute;
      background-color: white;

      .notification-wrapper {
        box-shadow: 0 3px 3px rgba(0, 0, 0, .05);

        &:not(:first-child) {
          border-top: $separation-line;
        }
      }
    }
  }

  .notification {
    position: relative;
    padding: $spacing;

    font-size: $font-size-small;

    border-left: 5px solid $app-color;
    display: flex;
    align-items: center;

    .notification-text {
      flex-grow: 1;

      .notification-title {
        font-weight: 600;
      }
    }

    .notification-close {
      margin: auto;
      cursor: pointer;

      .notification-icon {
        width: $icon-medium;
        max-height: $icon-medium;
        vertical-align: middle;
        margin-left: $spacing;
      }
    }
    /**
    &.warn {
      border-left-color: #f48a06;
    }

    &.success {
      border-left-color: #42A85F;
    }

    &.error {
      border-left-color: #B82E24;
    }

    &.warn .notification-title {
      color: #e58206;
    }

    &.error .notification-title {
      color: #B82E24;
    }

    &.success .notification-title {
      color: #3b9655;
    } **/
  }

  .v-slide-enter-active,
  .v-slide-leave-active,
  .v-slide-move {
    transition: all 0.8s;
  }

  .v-slide-leave-active {
    z-index: 0;
    position: absolute;
  }

  .v-slide-leave-to, .v-slide-enter-from {
    transition: all 1s ease-out;
    opacity: 0;
  }

  @media screen and (max-width: $mobile) {

    .notification-container {
      max-width: 100%;
    }
  }
</style>
