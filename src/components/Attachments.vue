<template>
  <div class="attachment-area">

    <!-- ATTACHED ENTRIES -->
    <div
      v-if="linkedList.length"
      class="linked-area">

      <!-- HEADER ROW -->
      <div class="header-row">
        <BaseOptions
          @options-toggle="showEntryAction = false">
          <template slot="beforeOptions">
            <h3
              v-if="showTitle"
              class="attachment-area-subheader">{{ $t('form-view.attachedEntries') }}</h3>
          </template>
          <template slot="options">
            <BaseButton
              v-if="!showEntryAction"
              :text="$t('form-view.deleteLinked')"
              icon-size="large"
              icon="waste-bin"
              button-style="single"
              class="attachment-options"
              @clicked="showEntryAction = true"/>
            <div
              v-else
              class="attachment-options">
              <BaseButton
                :text="$t('cancel')"
                icon-size="large"
                icon="remove"
                button-style="single"
                @clicked="showEntryAction = false"/>
              <BaseButton
                :text="$t('form-view.deleteButton')"
                icon-size="large"
                icon="save-file"
                button-style="single"
                @clicked="deleteLinked"/>
            </div>
          </template>
        </BaseOptions>
      </div>

      <!-- ACTION AREA -->
      <transition name="slide">
        <div
          v-if="showEntryAction"
          key="message-area"
          class="message-area">
          <div class="message-area-text">
            {{ $t('form-view.deleteLinkedText') }}
          </div>
          <div class="message-area-subtext">
            {{ $t('form-view.deleteLinkedSubtext') }}
          </div>
        </div>
      </transition>

      <!-- BOX AREA -->
      <div
        key="box-area"
        class="box-area">
        <BaseImageBox
          v-for="linked of linkedList"
          :selectable="!!showEntryAction"
          :key="linked.id"
          :box-size="{ width: 'calc(25% - 12px)' }"
          :title="linked.to.title"
          :subtext="linked.to.subtitle"
          :description="linked.to.type"
          :image-url="linked.image ? getImagePath(linked.image) : ''"
          show-title
          class="linked-base-box"
          @select-triggered="entrySelected(linked.id, $event)"
          @clicked="goToLinked(linked.to.id)"/>

        <!-- ACTION BUTTON -->
        <BaseBoxButton
          v-if="!!showEntryAction"
          :text="$t('form-view.deleteLinked')"
          :box-size="{ width: 'calc(25% - 12px)' }"
          icon="save-file"
          box-style="small"
          class="linked-base-box"
          @clicked="deleteLinked"/>
      </div>
    </div>

    <!-- ATTACHED FILES -->
    <div
      v-if="attachedList.length"
      class="linked-area">

      <!-- HEADER ROW -->
      <div class="header-row">
        <BaseOptions
          @options-toggle="fileText = action = ''">
          <template slot="beforeOptions">
            <h3
              v-if="showTitle"
              class="attachment-area-subheader">Angehängte Dateien</h3>
          </template>
          <template slot="options">
            <div
              v-if="!fileText"
              class="attachment-options">
              <BaseButton
                :text="$t('form-view.changeLicense')"
                icon-size="large"
                icon="license"
                button-style="single"
                @clicked="action = 'license'"/>
              <BaseButton
                :text="$t('form-view.publishMedia')"
                icon-size="large"
                icon="eye"
                button-style="single"
                @clicked="action = 'publish'"/>
              <BaseButton
                :text="$t('form-view.deleteMedia')"
                icon-size="large"
                icon="waste-bin"
                button-style="single"
                @clicked="action = 'delete'"/>
            </div>
            <div
              v-else
              class="attachment-options">
              <BaseButton
                :text="$t('cancel')"
                icon-size="large"
                icon="remove"
                button-style="single"
                @clicked="action = ''"/>
              <BaseButton
                :text="buttonText"
                icon-size="large"
                icon="save-file"
                button-style="single"
                @clicked="saveFileMeta"/>
            </div>
          </template>
        </BaseOptions>
      </div>

      <!-- ACTION AREA -->
      <transition name="slide">
        <div
          v-if="fileText"
          class="message-area">
          <div class="message-area-text">
            {{ fileText }}
          </div>
          <div class="message-area-subtext">
            {{ fileSubtext }}
          </div>
          <!-- TODO: replace this with skosmos project values! -->
          <BaseDropDown
            v-if="action === 'license'"
            :options="[{
                         label: 'CC-BY',
                         value: 'cc-by',
                       },
                       {
                         label: 'CC0',
                         value: 'cc0',
                       }
            ]"
            :show-label="false"
            :label="$t('form-view.selectLicense')"
            :placeholder="$t('form-view.selectLicense')"
            v-model="licenseSelected"
            class="license-dropdown"/>
        </div>
      </transition>

      <!-- BOX AREA -->
      <div class="box-area">
        <BaseImageBox
          v-for="(attached, index) of attachedList"
          :show-title="true"
          :selectable="!!fileText"
          :selected="(action === 'publish' && attachedList[index].published)
          || selectedFiles.includes(attached.id)"
          :title="getFileName(attached.original)"
          :subtext="attached.license ? attached.license.toUpperCase() : ''"
          :description="attached.metadata && attached.metadata.FileType
            ? getFileType(attached.metadata.FileType.val)
          : getFileType(getFileName(attached.original))"
          :image-url="getImagePath(attached.thumbnail)"
          :box-size="{ width: 'calc(25% - 12px)' }"
          :box-ratio="100"
          :box-text="generateBoxText(attached.metadata)"
          :key="attached.id"
          :class="['linked-base-box', { 'image-box': !!attached.thumbnail }]"
          @select-triggered="filesSelected(attached.id, $event)"
          @clicked="$emit('show-preview', attached.original)">
          <template slot="top">
            <div
              v-if="attached.published"
              class="file-published">
              <EyeIcon
                aria-labelledby="title"
                class="published-icon">
                <title>Published</title>
                <desc>
                  {{ `file ${getFileName(attached.original)} was published` }}
                </desc>
              </EyeIcon>
            </div>
          </template>
        </BaseImageBox>

        <!-- ACTION BUTTON -->
        <BaseBoxButton
          v-if="action"
          :text="buttonText"
          :box-size="{ width: 'calc(25% - 12px)' }"
          icon="save-file"
          box-style="small"
          class="linked-base-box"
          @clicked="saveFileMeta"/>
      </div>
    </div>
  </div>
</template>

<script>
import {
  BaseBoxButton, BaseImageBox, BaseButton, BaseDropDown,
} from 'base-components';
import BaseOptions from './BaseOptions';
import EyeIcon from '../assets/icons/eye.svg';

export default {
  components: {
    BaseBoxButton,
    BaseDropDown,
    BaseImageBox,
    BaseButton,
    BaseOptions,
    EyeIcon,
  },
  props: {
    linkedList: {
      type: Array,
      default() {
        return [];
      },
    },
    attachedList: {
      type: Array,
      default() {
        return [];
      },
    },
    showTitle: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      fileText: '',
      fileSubtext: '',
      buttonText: '',
      showEntryAction: false,
      selectedEntries: [],
      selectedFiles: [],
      publishFiles: [],
      action: '',
      licenseSelected: {},
    };
  },
  watch: {
    action(val) {
      if (val) {
        const textType = this.$t(`form-view.${val}Text`);
        this.fileSubtext = this.$t(`form-view.${val}Subtext`);
        this.fileText = `Bitte die zu ${textType} Objekte auswählen:`;
        this.buttonText = this.$t(`form-view.${val}Button`);
      } else {
        this.fileText = '';
        this.publishFiles = [];
        this.selectedFiles = [];
      }
    },
  },
  methods: {
    async saveFileMeta() {
      // check if files were selected
      debugger;
      if ((this.action === 'publish' && !this.publishFiles.length) || !this.selectedFiles.length) {
        // if not notify user that he needs to select files
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.changesFailed', { action: this.$t(`notify.${this.action}`) }),
          text: this.$t('notify.selectFiles', { action: this.$t(`notify.${this.action}File`) }),
          type: 'error',
        });
        // check if a license was selected if action is license change
        // if not inform user he should select a license
      } else if (this.action === 'license' && !this.licenseSelected.value) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.changesFailed', { action: this.$t('notify.license') }),
          text: this.$t('notify.selectLicense'),
          type: 'error',
        });
      } else {
        await this.$store.dispatch('data/actionFiles', {
          list: this.action === 'publish' ? this.publishFiles : this.selectedFiles,
          action: this.action,
          value: this.licenseSelected.value,
        });
        // clear all variables after action
        this.action = '';
        this.selectedFiles = [];
        this.publishFiles = [];
        this.licenseSelected = {};
      }
    },
    async deleteLinked() {
      // TODO: also check first if any entries were selected
      await this.$parent.actionLinked({ list: this.selectedEntries, action: 'delete' });
      this.showEntryAction = false;
      this.selectedEntries = [];
    },
    entrySelected(objId, sel) {
      if (sel) {
        this.selectedEntries.push(objId);
      } else {
        this.selectedEntries = this.selectedEntries.filter(entryId => entryId !== objId);
      }
    },
    filesSelected(objId, sel) {
      if (this.action !== 'publish') {
        if (sel) {
          this.selectedFiles.push(objId);
        } else {
          this.selectedFiles = this.selectedFiles.filter(entryId => entryId !== objId);
        }
      } else {
        // check if the file was already changed previously (which means now it is
        // back in original state) --> filter out
        /* eslint-disable-next-line */
        if (this.publishFiles.some(file => file.id === objId)) {
          this.publishFiles = this.publishFiles.filter(file => file.id === objId);
        } else {
          this.publishFiles.push({ id: objId, selected: sel });
        }
      }
    },
    getFileName(file) {
      if (file) {
        return file.split('/').pop();
      }
      return '';
    },
    getFileType(fileType) {
      if (fileType) {
        if (['jpg', 'gif', 'jpeg', 'png'].includes(fileType.toLowerCase())) {
          return 'Picture';
        } if (['mp4', 'mvw'].includes(fileType.toLowerCase())) {
          return 'Video';
        } if (['mp3'].includes(fileType.toLowerCase())) {
          return 'Audio';
        }
        return 'Document';
      }
      return '';
    },
    getImagePath(iconName) {
      if (iconName) {
        // for local images
        // TODO: remove for production!
        if (iconName.includes('images')) {
          const match = /\/assets\/images\/(\w+\.\w+)$/.exec(iconName);
          /* eslint-disable-next-line */
          return require(`@/assets/images/${match[1]}`);
        } if (iconName.includes('http')) {
          return iconName;
        }
        return `${process.env.PORTFOLIO_API}${iconName}`;
      }
      return '';
    },
    generateBoxText(metadata) {
      const wantedAttributes = ['FileSize', 'ImageSize'];
      return Object.keys(metadata).filter(key => wantedAttributes.includes(key))
        .map(data => `${data}: ${metadata[data].val}`);
    },
    goToLinked(id) {
      this.$store.commit('data/deleteLastParentItem');
      this.$router.push(`/entry/${id}`);
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .attachment-area {
    .attachment-area-subheader {
      font-size: $font-size-regular;
      color: $font-color-second;
      font-weight: normal;
      margin: $spacing;

    }

    .linked-area {

      .header-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        .attachment-options {
          margin-bottom: $spacing-small;
          display: flex;

        }
      }

      .box-area {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .linked-base-box {
          cursor: pointer;

          .file-published {
            height: $icon-max;
            width: $icon-max;
            position: absolute;
            border-radius: $icon-max/2;
            background: radial-gradient(closest-side,
              rgba(255,255,255,1) 50%,
              rgba(255,255,255,0) 100%);
            right: -$spacing-small;
            top: -$spacing-small;
            display: flex;

            .published-icon {
              height: $icon-medium;
              max-width: $icon-medium;
              margin: auto;
            }
          }
        }

        .linked-base-box:nth-of-type(n + 5) {
          margin-top: $spacing;
        }

        .linked-base-box:not(:nth-child(4n)) {
          margin-right: $spacing;
        }

        .image-box {
          cursor: pointer;
        }
      }
    }

    .message-area {
      margin: $spacing 0 $spacing-large;
      text-align: center;
      color: $font-color-second;
      backface-visibility: hidden;
      z-index: 1;

      .message-area-text {
        font-size: $font-size-large;
      }

      .message-area-subtext {
        font-size: $font-size-small;
      }

      .license-dropdown {
        margin: $spacing auto 0 auto;
        text-align: left;
      }
    }

    .slide-enter-active {
      transition: all .5s ease-in-out;
    }

    .slide-enter {
      opacity: 0;
      transform: translateY(-#{$spacing});
    }
  }

  @media screen and (max-width: $mobile) {
    .attachment-area {
      .attachment-area-subheader {
      }

      .linked-area {

        .box-area {

          .linked-base-box {
            flex: 0 0 calc(50% - #{$spacing-small});
          }

          .linked-base-box:nth-of-type(n + 3) {
            margin-top: $spacing;
          }

          .linked-base-box:not(:nth-child(4n)) {
            margin-right: 0;
          }

          .linked-base-box:not(:nth-child(2n)) {
            margin-right: $spacing;
          }
        }
      }
    }
  }
</style>
