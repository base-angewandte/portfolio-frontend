<template>
  <div class="import-page">
    <BaseButton
      :text="$t('back')"
      icon="arrow-left"
      icon-size="small"
      button-style="row"
      class="back-button"
      @clicked="$router.push('/')" />
    <BaseSearch
      label="Search your Entries"
      :placeholder="$t('import.searchCatalogueText')"
      show-image />
  </div>
</template>

<style lang="scss" scoped>

.import-page {
  position: relative;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  top: $spacing;

  .back-button {
    display: none;
  }
}

@media screen and (max-width: $mobile) {
  .import-page {
    top: $spacing-small;
    .back-button {
      display: block;
      border-bottom: $separation-line;
      width: 100%;
    }
  }
}

</style>
