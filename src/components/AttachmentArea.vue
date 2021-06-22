<template>
  <div>
    <!-- BUTTON ROW FOR ADDING ENTRIES AND FILES -->
    <AttachmentButtonRow
      :current-id="entryId"
      @upload-done="postUploadActions"
      @open-new-form="$emit('open-new-form')" />
    <!-- ACTUAL LINKED ENTRIES AND FILES -->
    <Attachments
      ref="attachmentArea"
      :key="'attachmentArea'"
      :linked-list="linkedList"
      :attached-list="mediaList"
      :parent-list="parentList"
      @save-before-archival="$emit('save-before-archival')"
      @files-deleted="updateUserQuota"
      @show-preview="$emit('show-preview', $event)"
      @open-linked="$emit('open-linked', $event)" />
  </div>
</template>

<script>
import AttachmentButtonRow from './AttachmentButtonRow';
import Attachments from './Attachments';
import { attachmentHandlingMixin } from '../mixins/attachmentHandling';

export default {
  components: { AttachmentButtonRow, Attachments },
  mixins: [attachmentHandlingMixin],
  data() {
    return {
      mediaRequestIntervall: null,
      mediaRequestTimeout: null,
    };
  },
  computed: {
    // get linked entries from store
    linkedList() {
      return this.$store.getters['data/getCurrentLinked'];
    },
    // get file list from store
    mediaList() {
      return this.$store.getters['data/getCurrentMedia'];
    },
    // get parent list from the store
    parentList() {
      return this.$store.getters['data/getLinkedParents'];
    },
    // current entry id
    entryId() {
      return this.$route.params.id;
    },
  },
  beforeDestroy() {
    // clear request intervall if component is destroyed
    clearInterval(this.mediaRequestIntervall);
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
    postUploadActions() {
      this.updateUserQuota();
      // cancel previously set intervals and timeouts
      if (this.mediaRequestIntervall) {
        clearInterval(this.mediaRequestIntervall);
        this.mediaRequestIntervall = null;
      }
      if (this.mediaRequestTimeout) {
        clearTimeout(this.mediaRequestTimeout);
        this.mediaRequestTimeout = null;
      }
      // after upload request media again every 10s for 40s to fetch converted
      this.mediaRequestIntervall = setInterval(() => {
        this.$refs.attachmentArea.fetchMedia();
      }, 10000);
      this.mediaRequestTimeout = setTimeout(() => {
        clearInterval(this.mediaRequestIntervall);
      }, 40000);
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
