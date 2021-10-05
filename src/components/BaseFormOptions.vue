<template>
  <BaseOptions
    :show-options="showOptions"
    @options-toggle="showOptions = $event">
    <template slot="options">
      <div
        class="base-form-options__options">
        <BaseButton
          :disabled="isNewForm"
          :text="isPublished ? $tc('offline') : $tc('publish')"
          :has-background-color="false"
          :button-text-wrap="false"
          icon-size="large"
          icon="eye"
          button-style="single"
          @clicked="$emit('action-entry', isPublished ? 'offline' : 'publish')" />
        <BaseButton
          :disabled="isNewForm"
          :text="$tc('delete')"
          :has-background-color="false"
          :button-text-wrap="false"
          icon-size="large"
          icon="waste-bin"
          button-style="single"
          @clicked="$emit('action-entry', 'delete')" />
      </div>
    </template>
  </BaseOptions>
</template>

<script>
export default {
  props: {
    defaultExpanded: {
      type: Boolean,
      default: true,
    },
    isNewForm: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    formType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showOptions: this.defaultExpanded,
    };
  },
};
</script>

<style lang="scss" scoped>
.base-form-options__options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
