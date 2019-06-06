<template>
  <div class="not-found-background">
    <div class="not-found-text">
      <h1 class="not-found-title">{{ $t('form-view.notFound') }}</h1>
      <p class="not-found-subtext">{{ $t('form-view.notFoundSubtext', { id: entryId }) }}</p>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    entryId() {
      return this.$route.query.id;
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables";

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
  }
</style>
