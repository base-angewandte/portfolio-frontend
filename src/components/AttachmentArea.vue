<template>
  <div>
    <!-- BUTTON ROW FOR ADDING ENTRIES AND FILES -->
    <AttachmentButtonRow
      :current-id="entryId"
      @upload-done="updateUserQuota"
      @open-new-form="$emit('open-new-form')" />
    <!-- ACTUAL LINKED ENTRIES AND FILES -->
    <Attachments
      ref="attachmentArea"
      :key="'attachmentArea'"
      :linked-list="linkedList"
      :attached-list="mediaList"
      @files-deleted="updateUserQuota"
      @show-preview="$emit('show-preview', $event)" />
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
    // get linked entries from store
    linkedList() {
      return this.$store.getters['data/getCurrentLinked'];
    },
    // get file list from store
    mediaList() {
      return this.$store.getters['data/getCurrentMedia'];
    },
    // current entry id
    entryId() {
      return this.$route.params.id;
    },
  },
  methods: {
    // this is used for checking the available user quota for file upload, needs to be refetched
    // after uploading / deleting files
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
