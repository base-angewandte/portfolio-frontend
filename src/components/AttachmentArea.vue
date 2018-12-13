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
              :text="$t('form-view.deleteButton')"
              icon-size="large"
              icon="save-file"
              button-style="single"
              @clicked="deleteLinked"/>
            <base-button
              :text="$t('cancel')"
              icon-size="large"
              icon="remove"
              button-style="single"
              @clicked="showEntryAction = false"/>
          </div>
        </div>
      </div>

      <!-- ACTION AREA -->
      <transition name="slide">
        <div
          v-if="showEntryAction"
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
      <div class="box-area">
        <BaseImageBox
          v-for="linked of linkedList"
          :selectable="!!showEntryAction"
          :key="linked.id"
          :box-size="{ width: 'calc(25% - 12px)' }"
          :title="linked.title"
          :description="linked.type"
          show-title
          class="linked-base-box"
          @select-triggered="entrySelected(linked.id, $event)"/>
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
            @clicked="actionFiles('licence')"/>
          <base-button
            text="Im Showroom veröffentlichen"
            icon-size="large"
            icon="eye"
            button-style="single"
            @clicked="actionFiles('publish')"/>
          <base-button
            text="Datei löschen"
            icon-size="large"
            icon="waste-bin"
            button-style="single"
            @clicked="actionFiles('delete')"/>
        </div>
        <div
          v-else
          class="linked-options">
          <base-button
            :text="buttonText"
            icon-size="large"
            icon="save-file"
            button-style="single"
            @clicked="saveFileMeta"/>
          <base-button
            :text="$t('form-view.cancel')"
            icon-size="large"
            icon="remove"
            button-style="single"
            @clicked="fileText = ''"/>
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
        </div>
      </transition>

      <!-- BOX AREA -->
      <div class="box-area">
        <BaseImageBox
          v-for="(attached, index) of attachedList"
          :selectable="!!fileText"
          :show-title="false"
          :box-size="{ width: 'calc(25% - 12px)' }"
          :box-ratio="100"
          :image-url="require('../static/img1.png')"
          :key="index"
          class="linked-base-box"
          @select-triggered="filesSelected(index, $event)"/>
      </div>
    </div>
  </div>
</template>

<script>
import { BaseImageBox, BaseButton } from 'base-components';

export default {
  components: {
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
    };
  },
  methods: {
    actionFiles(action) {
      const textType = this.$t(`form-view.${action}Text`);
      this.fileSubtext = this.$t(`form-view.${action}Subtext`);
      this.fileText = `Bitte die zu ${textType} Objekte auswählen:`;
      this.buttonText = this.$t(`form-view.${action}Button`);
    },
    saveFileMeta() {
      // TODO: take appropriate actions for files!!!
      console.log('Saved');
      this.fileText = '';
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
      transition: all 0s ease;
      backface-visibility: hidden;
      z-index: 1;

      .message-area-text {
        font-size: $font-size-large;
      }

      .message-area-subtext {
        font-size: $font-size-small;
      }
    }
  }

  .slide-move {
    transition: all 600ms ease-in-out;
  }

  .slide-enter-active {
    transition: all 300ms ease-out;
  }

  .slide-leave-active {
    transition: all 200ms ease-in;
    position: absolute;
    z-index: 0;
  }

  .slide-enter, .slide-leave-to {
    height: 0;
  }
</style>
