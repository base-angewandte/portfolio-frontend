<template>
  <div
    class="notification-container">
    <div class="notification-box">
      <notifications
        :duration="4000"
        :width="'100%'"
        group="request-notifications"
        position="top right"
        animation-name="v-slide">
        <template
          slot="body"
          slot-scope="props">
          <div
            role="alert"
            :class="[props.item.type, 'notification']"
            @click="props.close">
            <base-icon
              v-if="props.item.type === 'error'"
              name="attention"
              class="icon notification-status-icon" />
            <base-icon
              v-else-if="props.item.type === 'success'"
              name="success"
              class="icon notification-status-icon" />
            <div class="notification-text">
              <h5
                class="notification-title">
                {{ notificationTitle(props.item.title) }}
              </h5>
              <div class="notification-message">
                {{ props.item.text }}
              </div>
            </div>

            <div
              class="notification-close"
              @click="props.close">
              <base-icon
                name="remove"
                aria-labelledby="title"
                class="icon notification-icon" />
            </div>
          </div>
        </template>
      </notifications>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      duration: 4000,
    };
  },
  methods: {
    // capitalize first letter of title
    notificationTitle(val) {
      return val.slice(0, 1).toUpperCase() + val.slice(1);
    },
  },
};
</script>

<style lang="scss" scoped>
  .notification-container{
    position: sticky;
    top: $header-height;
    z-index: map-get($zindex, notification);
    max-width: 100%;
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
    }
  }

  .notification {
    position: relative;
    padding: $spacing;
    background-color: white;

    font-size: $font-size-small;

    border-left: 5px solid $app-color;
    display: flex;
    align-items: center;

    .notification-text {
      flex-grow: 1;

      .notification-title {
        font-size: inherit;
        font-weight: 600;
      }

      .notification-message {
        word-break: break-word;
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

    .notification-status-icon {
      width: $icon-large;
      max-height: $icon-large;
      margin-right: $spacing;
      fill: $font-color-second;
      stroke: $font-color-second;
      flex-shrink: 0;
    }
  }

  /* this is not working here - please check App.vue */
  .notification-wrapper {
    box-shadow: 0 3px 3px rgba(0, 0, 0, .05);
    border-top: $separation-line;
  }

  @media screen and (min-width: $mobile-min-width) {
    .notification-container {
      max-width: 450px;
    }
  }
</style>
