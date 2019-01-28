<template>
  <div>
    <AttachmentButtonRow
      :current-id="entryId"/>
    <Attachments
      :key="'attachmentArea'"
      :linked-list="linkedList"
      :attached-list="fileList"
      @show-preview="$emit('show-preview', $event)"/>
  </div>
</template>

<script>
import AttachmentButtonRow from './AttachmentButtonRow';
import Attachments from './Attachments';

export default {
  components: { AttachmentButtonRow, Attachments },
  props: {
    fileList: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  computed: {
    linkedList() {
      return this.$store.getters['data/getCurrentLinked'];
    },
    entryId() {
      return this.$route.params.id;
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
