<template>
  <BasePopUp
    :show="!!fileList.length"
    :button-right-text="isSuccess ? 'Fertig' : 'Hochladen'"
    title="Dateien hochladen"
    button-left-text="Abbrechen"
    @button-right="startUpload"
    @button-left="$emit('cancel')"
    @close="$emit('cancel')">
    <div
      class="popup-upload-area">
      <BaseUploadBar
        v-for="(file, index) of fileList"
        :key="index"
        :progress="uploadPercentage[index]"
        :filename="file.name"
        class="upload-bar"/>
    </div>
    <div class="popup-text">
      <BaseDropDown
        :label="$t('form-view.chooseLicense')"
        :selected="{
          label: $t('nolicense'),
          value: '',
        }"
        :selection-list="[{
                            label: 'CC-BY',
                            value: 'cc-by',
                          },
                          {
                            label: 'CC0',
                            value: 'cc0',
                          }
        ]"
        :background-color="'rgb(240, 240, 240)'"
        :fixed-width="true"
        header-style="inline"/>
      <BaseDropDown
        :selected="{ label: $t('no'), value: false }"
        :selection-list="[
          { label: $t('no'), value: false },
          { label: $t('yes'), value: true }]"
        :background-color="'rgb(240, 240, 240)'"
        :fixed-width="true"
        :label="$t('form-view.showImages')"
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
      uploadError: null,
      currentStatus: null,
      uploadFileName: 'photos',
      uploadPercentage: [],
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
        this.fileList.forEach(async (file, index) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('entry', this.$route.params.id);
          formData.append('published', false);

          this.currentStatus = STATUS_SAVING;
          this.$emit('upload-start');

          try {
            const res = await axios.post(`${process.env.API}media/`,
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
            this.uploadedFiles = [].concat(res);
            this.currentStatus = STATUS_SUCCESS;
          } catch (err) {
            this.uploadError = err.response;
            this.currentStatus = STATUS_FAILED;
            console.log(err);
          }
        });
        this.$store.dispatch('data/fetchMediaData', this.$route.params.id);
      }
    },
    reset() {
      this.currentStatus = STATUS_INITIAL;
      this.uploadedFiles = [];
      this.uploadError = null;
      this.fileList.forEach((file, index) => this.$set(this.uploadPercentage, index, 0));
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
