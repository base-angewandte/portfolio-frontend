<template>
  <div>
    <AttachmentButtonRow
      :current-id="entryId"
      @upload-done="updateUserQuota"
      @open-new-form="$emit('open-new-form')"/>
    <Attachments
      :key="'attachmentArea'"
      :linked-list="linkedList"
      :attached-list="mediaList"
      @files-deleted="updateUserQuota"
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
  methods: {
    updateUserQuota() {
      try {
        this.$store.dispatch('PortfolioAPI/fetchUser');
      } catch (e) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.somethingWrong'),
          text: this.$t('notify.saveBeforeUpload'),
          type: 'error',
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
