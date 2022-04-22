<template>
  <div>
    <div class="body" />
    <div class="whitebox">
      <div class="info-area">
        <div class="info-text">
          {{ $t('notAvailable') }}
        </div>
        <div class="info-buttons">
          <BaseButton
            :text="$t('returnHome')"
            background-color="rgb(240, 240, 240)"
            icon="home"
            icon-size="large"
            icon-position="right"
            class="info-button"
            @clicked="returnToBase" />
          <BaseButton
            :text="$t('refresh')"
            background-color="rgb(240, 240, 240)"
            icon="refresh"
            icon-size="large"
            icon-position="right"
            class="info-button"
            @clicked="refreshPage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    refreshPage() {
      window.location.href = `${process.env.VUE_APP_PREFIX}/`;
    },
    returnToBase() {
      window.location.href = process.env.VUE_APP_BACKEND_BASE_URL;
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .body {
    height: calc(100vh - 150px);
    width: 100%;
  }

  .whitebox {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(255, 255, 255, 0.7);
    z-index: map-get($zindex, modal_bg);

    .info-area {
      position: absolute;
      top: 30%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;

      .info-text {
        color: $font-color-second;
        font-size: $font-size-large;
        margin-bottom: $spacing-large;
      }

      .info-buttons {
        display: flex;
        justify-content: center;

        .info-button {
          margin-left: $spacing;

          .info-button-icon {
            width: $icon-medium;
            max-height: $icon-medium;
            margin-left: $spacing;
          }

          &:hover .info-button-icon {
            fill: $app-color;
            stroke: $app-color;
          }
        }
      }
    }
  }
</style>
