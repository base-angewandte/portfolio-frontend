<template>
  <div class="attachment-area">
    <div
      v-if="linkedList.length"
      class="linked-area">
      <div class="header-row">
        <h3
          v-if="showTitle"
          class="attachment-area-subheader">Verknüpfte Einträge</h3>
        <div class="linked-options">
          <base-button
            v-if="!showEntryAction"
            text="Verlinkung löschen"
            icon-size="large"
            icon="waste-bin"
            button-style="single"
            @clicked="showEntryAction = true"/>
          <base-button
            v-else
            text="Abbrechen"
            icon-size="large"
            icon="remove"
            button-style="single"
            @clicked="showEntryAction = false"/>
        </div>
      </div>
      <transition name="slide">
        <div
          v-if="showEntryAction"
          class="message-area">
          <div class="message-area-text">
            Bitte die zu löschenden Einträge auswählen:
          </div>
          <div class="message-area-subtext">
            Die Verlinkung zu diesen Einträgen wird gelöscht.
          </div>
        </div>
      </transition>
      <div class="box-area">
        <BaseImageBox
          v-for="linked of linkedList"
          :selectable="!!showEntryAction"
          :key="linked.id"
          :box-size="{ width: 'calc(25% - 12px)' }"
          :title="linked.title"
          :description="linked.type"
          show-title
          class="linked-base-box"/>
      </div>
    </div>
    <div
      v-if="attachedList.length"
      class="linked-area">
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
            text="Speichern"
            icon-size="large"
            icon="save-file"
            button-style="single"
            @clicked="saveFileMeta"/>
          <base-button
            text="Abbrechen"
            icon-size="large"
            icon="remove"
            button-style="single"
            @clicked="fileText = ''"/>
        </div>
      </div>
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
      <div class="box-area">
        <BaseImageBox
          v-for="attached of attachedList"
          :selectable="!!fileText"
          :show-title="false"
          :box-size="{ width: 'calc(25% - 12px)' }"
          :box-ratio="100"
          :image-url="require('../static/img1.png')"
          :key="attached.id"
          class="linked-base-box"/>
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
      showEntryAction: false,
    };
  },
  methods: {
    actionFiles(action) {
      this.fileText = `Bitte die zu ${action} Objekte auswählen:`;
      this.fileSubtext = 'Die Lizenz dieser Objekte wird geändert';
      if (action === 'licence') {
        this.fileSubtext = 'Die Lizenz dieser Objekte wird geändert.';
      } else if (action === 'publish') {
        this.fileSubtext = 'Diese Objekte werden für Showroom freigegeben.';
      } else if (action === 'delete') {
        this.fileSubtext = 'Diese Objekte werden gelöscht.';
      }
    },
    saveFileMeta() {
      console.log('Saved');
      this.fileText = '';
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
