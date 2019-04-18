<template>
  <div>
    <AttachmentButtonRow
      :current-id="entryId"
      @open-new-form="$emit('open-new-form')"/>
    <Attachments
      :key="'attachmentArea'"
      :linked-list="linkedList"
      :attached-list="mediaList"
      @show-preview="$emit('show-preview', $event)"/>
  </div>
</template>

<script>
import AttachmentButtonRow from './AttachmentButtonRow';
import Attachments from './Attachments';
import { attachmentHandlingMixin } from '../mixins/attachmentHandling';

export default {
  components: { AttachmentButtonRow, Attachments },
  mixins: [attachmentHandlingMixin],
  computed: {
    linkedList() {
      return this.$store.getters['data/getCurrentLinked'];
    },
    mediaList() {
      return this.$store.getters['data/getCurrentMedia'];
    },
    entryId() {
      return this.$route.params.id;
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
