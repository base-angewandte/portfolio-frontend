<template>
  <div class="attachment-area">

    <!-- ATTACHED ENTRIES -->
    <div
      v-if="linkedList.length"
      class="linked-area">

      <!-- HEADER ROW -->
      <div class="header-row">
        <h3
          v-if="showTitle"
          class="attachment-area-subheader">{{ $t('form-view.attachedEntries') }}</h3>
        <div class="linked-options">
          <base-button
            v-if="!showEntryAction"
            :text="$t('form-view.deleteLinked')"
            icon-size="large"
            icon="waste-bin"
            button-style="single"
            @clicked="showEntryAction = true"/>
          <div
            v-else
            class="linked-options">
            <base-button
              :text="$t('cancel')"
              icon-size="large"
              icon="remove"
              button-style="single"
              @clicked="showEntryAction = false"/>
            <base-button
              :text="$t('form-view.deleteButton')"
              icon-size="large"
              icon="save-file"
              button-style="single"
              @clicked="deleteLinked"/>
          </div>
        </div>
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
          :title="linked.title"
          :description="linked.type"
          :image-url="linked.files && linked.files.length ? getImagePath(linked.files[0].url) : ''"
          show-title
          class="linked-base-box"
          @select-triggered="entrySelected(linked.id, $event)"/>
        <BaseBoxButton
          v-if="!!showEntryAction"
          :text="$t('form-view.deleteLinked')"
          :box-size="{ width: 'calc(25% - 12px)' }"
          icon="save-file"
          box-style="small"
          class="linked-base-box"
          @clicked="saveFileMeta"/>
      </div>
    </div>

    <!-- ATTACHED FILES -->
    <div
      v-if="attachedList.length"
      class="linked-area">

      <!-- HEADER ROW -->
      <div class="header-row">
        <h3
          v-if="showTitle"
          class="attachment-area-subheader">Angehängte Dateien</h3>
        <div
          v-if="!fileText"
          class="linked-options">
          <base-button
            :text="'Lizenz ändern'"
            icon-size="large"
            icon="licence"
            button-style="single"
            @clicked="action = 'licence'"/>
          <base-button
            text="Im Showroom veröffentlichen"
            icon-size="large"
            icon="eye"
            button-style="single"
            @clicked="action = 'publish'"/>
          <base-button
            text="Datei löschen"
            icon-size="large"
            icon="waste-bin"
            button-style="single"
            @clicked="action = 'delete'"/>
        </div>
        <div
          v-else
          class="linked-options">
          <base-button
            :text="$t('cancel')"
            icon-size="large"
            icon="remove"
            button-style="single"
            @clicked="action = ''"/>
          <base-button
            :text="buttonText"
            icon-size="large"
            icon="save-file"
            button-style="single"
            @clicked="saveFileMeta"/>
        </div>
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
          <BaseDropDown
            v-if="action === 'licence'"
            :selection-list="['CC-BY', 'CC0']"
            :show-label="false"
            label="Select License"
            placeholder="Select License"
            class="licence-dropdown"/>
        </div>
      </transition>

      <!-- BOX AREA -->
      <div class="box-area">
        <BaseImageBox
          v-for="(attached, index) of attachedList"
          :show-title="true"
          :selectable="!!fileText"
          :title="attached.filename"
          :subtext="attached.licence"
          :description="getFileType(attached.filename)"
          :image-url="getImagePath(attached.url)"
          :box-size="{ width: 'calc(25% - 12px)' }"
          :box-ratio="100"
          :image-url="require('../static/img1.png')"
          :box-text="['Size: 200kb', 'Creator: S.H.', 'Last Modified: xxxxx', 'xxxxx',
                      'xxxxx', 'yyyyyyyyyyyyyyy']"
          :key="index"
          class="linked-base-box"
          @select-triggered="filesSelected(index, $event)"
          @clicked="$emit('show-preview', attached.url)">
          <template slot="top">
            <div
              v-if="attached.published"
              class="file-published">
              <img
                src="../static/eye.svg"
                class="published-icon">
            </div>
          </template>
        </BaseImageBox>
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
import { BaseImageBox, BaseButton, BaseDropDown } from 'base-components';
import BaseBoxButton from 'base-components/src/components/BaseBoxButton/BaseBoxButton';

export default {
  components: {
    BaseBoxButton,
    BaseDropDown,
    BaseImageBox,
    BaseButton,
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
      action: '',
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
      }
    },
  },
  methods: {
    saveFileMeta() {
      // TODO: take appropriate actions for files!!!
      console.log('Saved');
      this.action = '';
      // TODO: need to handle here or propagate action!
      this.$emit('file-action', 'action');
    },
    deleteLinked() {
      // also check first if any entries were selected
      this.showEntryAction = false;
      // TODO: this needs to be action in future communicating with the database!
      this.$store.commit('data/deleteLinked', this.selectedEntries);
    },
    entrySelected(objId, sel) {
      if (sel) {
        this.selectedEntries.push(objId);
      } else {
        this.selectedEntries = this.selectedEntries.filter(entryId => entryId !== objId);
      }
    },
    filesSelected(index, sel) {
      // TODO: replace index with file identifier
      console.log(index);
      console.log(sel);
    },
    getFileType(file) {
      if (file) {
        // TODO: also catch 4 letter ending (jpeg)
        const fileEnding = file.match(/\.([a-z]{3}$)/);
        if (fileEnding && ['jpg', 'gif', 'jpeg', 'png'].includes(fileEnding[1])) {
          return 'Picture';
        } if (fileEnding && ['mp4', 'mvw'].includes(fileEnding[1])) {
          return 'Video';
        } if (fileEnding && ['mp3'].includes(fileEnding[1])) {
          return 'Audio';
        }
        return 'Document';
      }
      return '';
    },
    getImagePath(iconName) {
      // for local images
      // TODO: remove for production!
      if (iconName.includes('images')) {
        const match = /\/assets\/images\/(\w+\.\w+)$/.exec(iconName);
        /* eslint-disable-next-line */
        return require(`@/assets/images/${match[1]}`);
      } if (iconName.includes('http')) {
        return iconName;
      }
      return '';
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

        .linked-options {
          display: flex;
          flex-direction: row;
        }
      }

      .box-area {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .linked-base-box {

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

      .licence-dropdown {
        margin: $spacing auto 0 auto;
        text-align: left;
      }
    }

    .slide-enter-active {
      transition: all .5s ease-in-out;
    }

    .slide-enter {
      opacity: 0;
    }
  }
</style>
