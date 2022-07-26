<template>
  <BasePopUp
    :show="!!fileList.length"
    :title="$t('upload.title')"
    @close="cancelProcessing">
    <div
      key="upload-area"
      class="popup-upload-area">
      <transition-group
        name="bar-move"
        class="transition">
        <BaseProgressBar
          v-for="(file, index) of fileList"
          :key="file.name"
          :file-name="file.name"
          :show-remove="isInitial"
          class="upload-bar"
          @remove-item="removeFile(index)" />
      </transition-group>
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
        @clicked="cancelProcessing" />
      <BaseButton
        ref="uploadButton"
        :text="$t('upload.upload')"
        :icon="!isSaving && !isFailed ? 'check-mark' : ''"
        :icon-position="'right'"
        :icon-size="'small'"
        :disabled="isSaving"
        class="base-upload-bar-button"
        @clicked="startProcessing">
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
import bibtexParse from 'bibtex-parse-js';

const STATUS_INITIAL = 0;
const STATUS_PROCESSING = 1;
const STATUS_SUCCESS = 2;
const STATUS_FAILED = 3;

export default {
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
      currentStatus: null,
      bibRecords: [],
      processedFileCount: 0,
    };
  },
  computed: {
    isInitial() {
      return this.currentStatus === STATUS_INITIAL;
    },
    isSaving() {
      return this.currentStatus === STATUS_PROCESSING;
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
    startProcessing() {
      this.fileList.forEach((file) => {
        if (this.getFileExtension(file.name) === 'bib') {
          this.currentStatus = STATUS_PROCESSING;
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            try {
              const parsed = bibtexParse.toJSON(reader.result);
              if (!parsed || parsed.length === 0) {
                this.currentStatus = STATUS_FAILED;
                this.$emit('import-failed', this.$t('import.invalidBibTex'));
              } else {
                for (let j = 0; j < parsed.length; j += 1) {
                  this.bibRecords.push(parsed[j]);
                  // if this is the last processed record, increment the count of processed files
                  if (j === parsed.length - 1) {
                    this.processedFileCount += 1;
                    // processing is complete when we reached the last file
                    if (this.processedFileCount === this.fileList.length) {
                      this.$emit('success', this.bibRecords);
                    }
                  }
                }
              }
            } catch (error) {
              this.currentStatus = STATUS_FAILED;
              this.$emit('import-failed', this.$t('import.invalidBibTex'));
            }
          });
          reader.readAsText(file);
        } else {
          // extension is not .bib
          this.currentStatus = STATUS_FAILED;
          this.$emit('import-failed', this.$t('import.invalidFileType'));
        }
      });
    },
    cancelProcessing() {
      this.$emit('cancel');
      this.reset();
    },
    reset() {
      this.currentStatus = STATUS_INITIAL;
      this.bibRecords = [];
    },
    removeFile(index) {
      this.fileList.splice(index, 1);
    },
    getFileExtension(fileName) {
      return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length) || fileName;
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

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
