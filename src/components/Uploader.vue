<template>
  <base-pop-up
    :show="!!fileList.length"
    :button-right-text="isSuccess ? 'Fertig' : 'Hochladen'"
    title="Dateien hochladen"
    button-left-text="Abbrechen"
    @button-right="startUpload"
    @button-left="$emit('cancel')"
    @close="$emit('cancel')">
    <div
      class="popup-upload-area">
      <base-upload-bar
        v-for="(file, index) of fileList"
        :key="index"
        :progress="uploadPercentage"
        :filename="file.name"
        class="upload-bar"/>
    </div>
    <div class="popup-text">
      <base-drop-down
        :label="'Lizenz auswählen'"
        :selected="'CC-0'"
        :selection-list="['CC-0', 'CC-BY', 'CC-BY-SA',
                          'CC-BY-ND', 'CC-BY-NC', 'CC-BY-NC-SA', 'CC-BY-NY-DD']"
        :background-color="'rgb(240, 240, 240)'"
        :fixed-width="true"
        header-style="inline"/>
      <base-drop-down
        :selected="'Bilder nicht veröffentlichen'"
        :selection-list="['Bilder anzeigen', 'Bilder nicht veröffentlichen']"
        :background-color="'rgb(240, 240, 240)'"
        :fixed-width="true"
        label="Bilder im Showroom anzeigen?"
        header-style="inline"/>
    </div>
  </base-pop-up>
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
      uploadPercentage: 0,
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
      const formData = new FormData();
      if (!this.fileList.length) return;
      Array.from(Array(this.fileList.length).keys())
        .map(x => formData.append('file', this.fileList[x], this.fileList[x].name));
      this.currentStatus = STATUS_SAVING;
      // TODO: check if all parameters are set and actually upload files
      // --> adjust upload bar accordingly
      this.$emit('upload-start');

      try {
        const res = await axios.post('/data-api/file-progress',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: function (progressEvent) {
              this.uploadPercentage = Math.round(progressEvent.loaded / progressEvent.total);
            }.bind(this),
          });
        this.uploadedFiles = [].concat(res);
        this.currentStatus = STATUS_SUCCESS;
      } catch (err) {
        this.uploadError = err.response;
        this.currentStatus = STATUS_FAILED;
        console.log(err);
      }
      /*
      try {
        const res = await upload(formData);
        console.log(res);
        this.uploadedFiles = [].concat(res);
        this.currentStatus = STATUS_SUCCESS;
        this.$emit('success');
      } catch (err) {
        this.uploadError = err.response;
        this.currentStatus = STATUS_FAILED;
      } */
    },
    reset() {
      this.currentStatus = STATUS_INITIAL;
      this.uploadedFiles = [];
      this.uploadError = null;
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
