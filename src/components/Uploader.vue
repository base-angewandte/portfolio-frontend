<template>
  <BasePopUp
    :show="!!fileList.length"
    :button-right-text="isSuccess ? 'Fertig' : 'Hochladen'"
    title="Dateien hochladen"
    button-left-text="Abbrechen"
    @button-right="startUpload"
    @button-left="cancelUpload('cancel')"
    @close="cancelUpload('done')">
    <div
      class="popup-upload-area">
      <BaseUploadBar
        v-for="(file, index) of fileList"
        :key="index"
        :progress="uploadPercentage[index]"
        :filename="file.name"
        :status="getStatus(file.name)"
        class="upload-bar"/>
    </div>
    <div class="popup-text">
      <BaseDropDown
        :label="$t('form-view.chooseLicense')"
        :selection-list="[
          {
            label: 'CC0',
            value: 'cc0',
          }
        ]"
        :background-color="'rgb(240, 240, 240)'"
        :fixed-width="true"
        v-model="license"
        header-style="inline"/>
      <BaseDropDown
        :selection-list="[
          { label: $t('no'), value: 'false' },
          { label: $t('yes'), value: 'true' }]"
        :background-color="'rgb(240, 240, 240)'"
        :fixed-width="true"
        :label="$t('form-view.showImages')"
        v-model="publish"
        header-style="inline"/>
    </div>
  </BasePopUp>
</template>

<script>
import {
  BasePopUp,
  BaseDropDown,
  BaseInput,
  BaseUploadBar,
} from 'base-components';
import axios from 'axios';
// import upload from '../assets/file-upload.fake.service';

const STATUS_INITIAL = 0;
const STATUS_SAVING = 1;
const STATUS_SUCCESS = 2;
const STATUS_FAILED = 3;

export default {
  components: {
    BasePopUp,
    BaseDropDown,
    BaseInput,
    BaseUploadBar,
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
      license: {
        label: 'CC-BY',
        value: 'cc-by',
      },
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
  },
  mounted() {
    this.reset();
  },
  methods: {
    async startUpload() {
      if (this.uploadedFiles.length) {
        this.$emit('success');
      } else {
        if (!this.fileList.length) return;
        await Promise.all(this.fileList
          .map((file, index) => new Promise(async (resolve, reject) => {
            const formData = new FormData();

            formData.append('file', file);
            formData.append('entry', this.$route.params.id);
            // These values can not be empty (also no empty string) or it will give
            // an error
            formData.append('published', this.publish.value);
            formData.append('license', this.license.value);

            this.currentStatus = STATUS_SAVING;
            this.$emit('upload-start');

            try {
              await axios.post(`${process.env.API}media/`,
                formData,
                {
                  withCredentials: true,
                  xsrfCookieName: 'csrftoken_portfolio',
                  xsrfHeaderName: 'X-CSRFToken',
                  headers: {
                    'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
                  },
                  onUploadProgress: (progressEvent) => {
                    this.uploadPercentage[index] = Math
                      .round(progressEvent.loaded / progressEvent.total);
                  },
                });
              this.uploadedFiles.push(file.name);
              this.currentStatus = STATUS_SUCCESS;
              resolve();
            } catch (err) {
              this.uploadPercentage[index] = 0;
              this.uploadError = err.response;
              this.currentStatus = STATUS_FAILED;
              this.rejectedFiles.push(file.name);
              reject();
            }
          })));
        await this.$store.dispatch('data/fetchMediaData', this.$route.params.id);
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
        label: 'CC-BY',
        value: 'cc-by',
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
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .popup-text {
    display: flex;
    align-items: flex-end;
  }

  .popup-text > div:first-of-type {
    margin-right: $spacing;
  }

  .files-popup-input-field {
    margin-bottom: $spacing;
  }

  .popup-upload-area {

    .upload-bar {
      margin-bottom: $spacing;
    }
  }
</style>
