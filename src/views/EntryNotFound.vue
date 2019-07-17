<template>
  <div class="not-found-background">
    <div class="not-found-text">
      <h1 class="not-found-title">
        {{ $t('form-view.notFound') }}
      </h1>
      <p class="not-found-subtext">
        {{ $t('form-view.notFoundSubtext', { id: entryId }) }}
      </p>
      <BaseButton
        :text="$t('returnToDashboard')"
        button-style="row"
        class="not-found-button"
        @clicked="returnToDashboard" />
    </div>
  </div>
</template>

<script>
import { BaseButton } from 'base-ui-components';

export default {
  components: {
    BaseButton,
  },
  computed: {
    entryId() {
      return this.$route.query.id;
    },
  },
  methods: {
    returnToDashboard() {
      this.$router.push('/');
    },
  },
};
</script>

<style lang="scss" scoped>
  .not-found-background {
    height: 100%;
    text-align: center;

    .not-found-text {
      padding-top: 33%;
      padding-bottom: 33%;
      color: $font-color-second;

      .not-found-title {
        font-weight: normal;
        margin-bottom: $spacing;
      }

      .not-found-subtext {
        padding: 0 $spacing;
      }
    }

    .not-found-button {
      display: none;
      margin: $spacing auto;
    }
  }

  @media screen and (max-width: $mobile) {
    .not-found-background {
      .not-found-text {
        padding-top: 10%;
        padding-bottom: 10%;
      }

      .not-found-button {
        display: block;
      }
    }
  }
</style>
