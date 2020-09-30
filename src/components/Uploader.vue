<template>
  <BasePopUp
    :show="!!fileList.length"
    :title="$t('upload.title')"
    @close="cancelUpload()">
    <transition-group name="list-complete">
      <div
        v-if="userQuotaExceeded"
        key="user-warning"
        class="base-uploader-user-warning">
        <FailIcon
          class="icon base-uploader-user-warning-icon" />
        {{ $t('upload.quotaExceeded', { space: convertDiskSpace(userSpace) }) }}
      </div>
      <div
        key="upload-area"
        class="popup-upload-area">
        <transition-group
          name="bar-move"
          class="transition">
          <BaseProgressBar
            v-for="(file, index) of fileList"
            :key="file.name"
            :progress="uploadPercentage[index]"
            :file-name="file.name"
            :file-size="userQuotaExceeded ? convertDiskSpace(file.size) : ''"
            :status="getStatus(file.name)"
            :show-remove="isInitial"
            class="upload-bar"
            @remove-item="removeFile(index)" />
        </transition-group>
      </div>
    </transition-group>
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
    <template
      slot="button-row">
      <BaseButton
        v-if="isInitial || isFailed"
        :text="$t('cancel')"
        :icon="'remove'"
        :icon-position="'right'"
        :icon-size="'small'"
        class="base-upload-bar-button"
        @clicked="cancelUpload" />
      <!-- @event buttonRight -->
      <BaseButton
        ref="uploadButton"
        :text="buttonText"
        :icon="!isSaving && !isFailed ? 'check-mark' : ''"
        :icon-position="'right'"
        :icon-size="'small'"
        :disabled="isSaving || userQuotaExceeded"
        class="base-upload-bar-button"
        @clicked="startUpload">
        <template
          v-if="isSaving"
          slot="right-of-text">
          <span class="base-upload-bar-loader">
            <BaseLoader />
          </span>
        </template>
      </BaseButton>
    </template>
  </BasePopUp>
</template>

<script>
import axios from 'axios';
import FailIcon from '../assets/icons/attention.svg?inline';
import { convertSpace } from '../utils/commonUtils';

const STATUS_INITIAL = 0;
const STATUS_SAVING = 1;
const STATUS_SUCCESS = 2;
const STATUS_FAILED = 3;

export default {
  components: {
    FailIcon,
  },
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
      this.$refs.uploadButton.$el.focus();
    }
  },
  methods: {
    async startUpload() {
      // check if all files were sucessfully uploaded already
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
              // accounting for retrys by only acting on files that have no upload
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
                  await axios.post(`${process.env.VUE_APP_DATABASE_API}media/`,
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
                  console.log('first error');
                  this.uploadPercentage[index] = 0;
                  this.uploadError = err.response;
                  this.currentStatus = STATUS_FAILED;
                  this.rejectedFiles.push(file.name);
                  reject(err);
                }
              }
              resolve();
            })));
          this.currentStatus = STATUS_SUCCESS;
        } catch (e) {
          console.log('Second error');
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
      this.publish = { label: this.$t('no'), value: false };
      this.license = {
        label: this.$t('nolicense'),
        value: 'no license',
      };
      this.uploadError = null;
      this.fileList.forEach((file, index) => this.$set(this.uploadPercentage, index, 0));
    },
    getStatus(fileName) {
      if (this.uploadedFiles.includes(fileName)) {
        return 'success';
      }
      if (this.rejectedFiles.includes(fileName)) {
        return 'fail';
      }
      return '';
    },
    removeFile(index) {
      this.fileList.splice(index, 1);
    },
    convertDiskSpace(bytes) {
      return convertSpace(bytes, true);
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .base-uploader-user-warning {
    color: #ff4444;
    fill: #ff4444;
    margin-bottom: $spacing;
    display: flex;
    align-items: center;

    .icon {
      max-height: $icon-large;
      width: $icon-large;

      &.base-uploader-user-warning-icon {
        margin-right: $spacing-small;
        flex: 0 0 auto;
      }
    }
  }

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

  .files-popup-input-field {
    margin-bottom: $spacing;
  }

  .popup-upload-area {
    max-height: ($row-height-small + $spacing) * 10;
    overflow-y: auto;

    .upload-bar:not(:last-child) {
      margin-bottom: $spacing;
    }
  }

  .base-upload-bar-button {
    flex-basis: 100%;

    .base-upload-bar-loader {
      position: relative;
      transform: scale(0.5);
      margin-left: $spacing;
      padding-left: $spacing;
    }
  }

  .base-upload-bar-button + .base-upload-bar-button {
    margin-left: $spacing;
  }

  .list-complete-enter, .list-complete-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }

  .list-complete-leave-active {
    position: absolute;
  }

  .list-complete-move {
    transition: all 500ms;
  }

  .transition {
    display: flex;
    flex-direction: column;
  }

  .bar-move-leave-active {
    opacity: 0;
    transition: all 300ms;
  }

  @media screen and (max-width: $mobile) {
    .popup-upload-area {
      max-height: ($row-height-small + $spacing) * 5;
    }

    .base-upload-bar-button + .base-upload-bar-button {
      margin-left: 0;
      margin-top: $spacing;
    }
  }
</style>
