<template>
  <BaseUploadPopUp
    ref="uploadPopUp"
    :show="!!fileList.length"
    :cancel-text="$t('cancel')"
    :upload-text="{
      title: 'upload.title',
      upload: 'upload.upload',
      done: 'upload.done',
      retry: 'upload.retry',
      quotaExceeded: 'upload.quotaExceeded',
    }"
    :current-status="currentStatus"
    :file-list="fileList"
    :rejected-files="rejectedFiles"
    :file-errors="fileErrors"
    :user-space="userSpace"
    :upload-percentage="uploadPercentage"
    :uploaded-files="uploadedFiles"
    @cancelUpload="cancelUpload"
    @removeFile="removeFile"
    @startUpload="startUpload">
    <div
      key="popup-text"
      class="popup-text">
      <BaseDropDown
        v-model="license"
        :label="$t('upload.choose_license')"
        :options="licenses"
        :show-label="true"
        :header-background-color="'rgb(240, 240, 240)'"
        :language="$i18n.locale"
        :is-disabled="!isInitial"
        value-prop="source"
        class="upload-dropdown" />
      <BaseDropDown
        v-model="publish"
        :options="[
          { label: $t('no'), value: 'false' },
          { label: $t('yes'), value: 'true' }]"
        :header-background-color="'rgb(240, 240, 240)'"
        :label="$t('upload.publish_images')"
        :show-label="true"
        :is-disabled="!isInitial"
        class="upload-dropdown" />
    </div>
  </BaseUploadPopUp>
</template>

<script>
import axios from 'axios';

const STATUS_INITIAL = 'initial';
const STATUS_SAVING = 'saving';
const STATUS_SUCCESS = 'success';
const STATUS_FAILED = 'failed';

export default {
  components: {},
  props: {
    fileList: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      uploadedFiles: [],
      rejectedFiles: [],
      uploadError: null,
      currentStatus: null,
      uploadPercentage: [],
      publish: { label: this.$t('no'), value: 'false' },
      license: {},
      disabled: true,
      fileErrors: [],
    };
  },
  computed: {
    isInitial() {
      return this.currentStatus === STATUS_INITIAL;
    },
    isSaving() {
      return this.currentStatus === STATUS_SAVING;
    },
    isSuccess() {
      return this.currentStatus === STATUS_SUCCESS;
    },
    isFailed() {
      return this.currentStatus === STATUS_FAILED;
    },
    buttonText() {
      if (this.isInitial || this.isSaving) {
        return this.$t('upload.upload');
      }
      if (this.rejectedFiles.length) {
        return this.$t('upload.retry');
      }
      return this.$t('upload.done');
    },
    licenses() {
      return this.$store.getters['data/getPrefetchedTypes']('medialicenses', 'source');
    },
    defaultLicense() {
      // TODO: set via env variable
      return this.licenses.find((license) => license.source === 'http://base.uni-ak.ac.at/portfolio/licenses/copyright');
    },
    userSpace() {
      return this.$store.state.PortfolioAPI.user.space;
    },
    userQuotaExceeded() {
      return this.userSpace < this.fileList
        .reduce((prev, curr) => prev + curr.size, 0);
    },
  },
  mounted() {
    this.reset();
    this.license = this.defaultLicense;
  },
  updated() {
    if (this.isSuccess) {
      this.$refs.uploadPopUp.$refs.uploadButton.$el.focus();
    }
  },
  methods: {
    async startUpload() {
      // check if all files were successfully uploaded already
      if (this.uploadedFiles.length && !this.rejectedFiles.length) {
        this.$emit('success');
      } else {
        if (!this.fileList.length) return;
        try {
          // reset rejected files list
          this.rejectedFiles = [];
          await Promise.all(this.fileList
            // eslint-disable-next-line no-async-promise-executor
            .map((file, index) => new Promise(async (resolve, reject) => {
              // accounting for retries by only acting on files that have no upload
              // percentage yet
              if (this.uploadPercentage[index] === 0) {
                const formData = new FormData();

                formData.append('file', file);
                formData.append('entry', this.$route.params.id);
                // These values can not be empty (also no empty string) or it will give
                // an error
                formData.append('published', this.publish.value);
                if (this.license.source) {
                  formData.append('license', JSON.stringify(this.license));
                }

                this.currentStatus = STATUS_SAVING;
                this.$emit('upload-start');

                try {
                  await axios.post(`${process.env.VUE_APP_BACKEND_BASE_URL}${process.env.VUE_APP_BACKEND_PREFIX}${process.env.VUE_APP_BACKEND_API_PATH}media/`,
                    formData,
                    {
                      withCredentials: true,
                      xsrfCookieName: 'csrftoken_portfolio',
                      xsrfHeaderName: 'X-CSRFToken',
                      headers: {
                        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
                      },
                      onUploadProgress: (progressEvent) => {
                        this.$set(this.uploadPercentage, index,
                          // eslint-disable-next-line no-mixed-operators
                          progressEvent.loaded / progressEvent.total * 100);
                      },
                    });
                  this.uploadedFiles.push(file.name);
                  resolve();
                } catch (err) {
                  this.uploadPercentage[index] = 0;
                  this.uploadError = err.response;
                  this.currentStatus = STATUS_FAILED;
                  this.rejectedFiles.push(file.name);
                  // add error messages by file name
                  this.fileErrors.push({
                    name: file.name,
                    message: Array.isArray(err.response.data.file)
                      ? err.response.data.file.join(', ')
                      : err.response.data.file,
                  });

                  reject(err);
                }
              }
              resolve();
            })));
          this.currentStatus = STATUS_SUCCESS;
        } catch (e) {
          if (e.message.includes('422')) {
            console.error(e);
            this.$notify({
              group: 'request-notifications',
              title: this.$t('notify.actionFailed', { action: this.$t('notify.upload') }),
              text: this.$t('notify.quotaExceeded'),
              type: 'error',
            });
          } else {
            console.error(e);
          }
        }
        if (this.uploadedFiles.length) {
          // TODO: duplicated in Attachments --> see if this can be made more efficient
          // maybe place in attachment area component?
          try {
            await this.$store.dispatch('data/fetchMediaData', this.$route.params.id);
          } catch (e) {
            console.error(e);
            this.$notify({
              group: 'request-notifications',
              title: this.$t('notify.somethingWrong'),
              text: this.$t('notify.fetchMediaFail'),
              type: 'error',
            });
          }
        }
      }
    },
    cancelUpload() {
      this.$emit('cancel');
      this.reset();
    },
    reset() {
      this.currentStatus = STATUS_INITIAL;
      this.uploadedFiles = [];
      this.rejectedFiles = [];
      this.fileErrors = [];
      this.publish = { label: this.$t('no'), value: false };
      this.license = {
        label: this.$t('nolicense'),
        value: 'no license',
      };
      this.uploadError = null;
      this.fileList.forEach((file, index) => this.$set(this.uploadPercentage, index, 0));
    },
    removeFile(index) {
      this.fileList.splice(index, 1);
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .popup-text {
    display: flex;
    align-items: flex-end;
    margin-top: $spacing;

    .upload-dropdown {
      width: calc(50% - #{$spacing} / 2);
      flex: 0 0 auto;
    }
  }

  .popup-text > div:first-of-type {
    margin-right: $spacing;
  }
</style>
