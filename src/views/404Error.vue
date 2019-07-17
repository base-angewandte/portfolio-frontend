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
            class="info-button"
            @clicked="returnToBase">
            <template
              slot="right-of-text">
              <HomeIcon
                class="info-button-icon" />
            </template>
          </BaseButton>
          <BaseButton
            :text="$t('refresh')"
            class="info-button"
            @clicked="refreshPage">
            <template
              slot="right-of-text">
              <RefreshIcon
                class="info-button-icon" />
            </template>
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { BaseButton } from 'base-ui-components';
import HomeIcon from '../assets/icons/home.svg';
import RefreshIcon from '../assets/icons/refresh.svg';

export default {
  components: {
    BaseButton,
    HomeIcon,
    RefreshIcon,
  },
  methods: {
    refreshPage() {
      window.location.href = `${process.env.APP_PREFIX}/`;
    },
    returnToBase() {
      window.location.href = process.env.HEADER_HOST;
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
    z-index: 1000000;

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
