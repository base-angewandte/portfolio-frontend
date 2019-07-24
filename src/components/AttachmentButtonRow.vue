<template>
  <div>
    <div
      v-if="!isMobile"
      key="file-area"
      class="file-boxes">
      <BaseDropBox
        key="addEntry"
        :show-plus="true"
        :box-size="{ width: 'calc(25% - 8px)' }"
        :text="$t('form-view.addExistingEntry')"
        :subtext="$t('form-view.clickordrag')"
        icon="camera"
        drop-type="elements"
        class="file-box file-boxes-margin"
        @dropped-element="droppedEntries"
        @clicked="openEntrySelect" />
      <BaseBoxButton
        key="addNew"
        :show-plus="true"
        :box-size="{ width: 'calc(25% - 8px)'}"
        :text="$t('form-view.addNewEntry')"
        icon="sheet-empty"
        class="file-box file-boxes-margin"
        @clicked="$emit('open-new-form')" />
      <label
        class="file-select">
        <BaseDropBox
          key="addFile"
          :show-plus="true"
          :box-size="{ width: 'calc(100%)' }"
          :box-ratio="'50'"
          :text="$t('form-view.attachFile')"
          :subtext="$t('form-view.clickordrag')"
          icon="camera"
          @dropped-file="handleFileSelect($event)"
          @clicked="fileBoxClick"/>
        <input
          ref="fileInput"
          :disabled="!currentId"
          type="file"
          multiple
          class="hide"
          @click="resetInput"
          @change="handleFileSelect">
      </label>
    </div>
    <div
      v-else
      key="mobile-file-area"
      class="file-list">
      <BaseMenuEntry
        key="mobile-addFile"
        entry-id="addFile"
        icon="sheet-plus"
        title="Vorhandenen Eintrag hinzufügen"
        @clicked="openEntrySelect" />
      <BaseMenuEntry
        key="mobile-addNew"
        entry-id="addNew"
        icon="sheet-plus"
        title="Neuen Eintrag anhängen"
        @clicked="$emit('open-new-form')" />
      <label class="file-select">
        <BaseMenuEntry
          key="mobile-addExisting"
          entry-id="addExisting"
          icon="sheet-plus"
          title="Datei anhängen"
          class="mobile-file-list-attach" />
        <input
          ref="fileInputMobile"
          type="file"
          multiple
          class="hide"
          @click="resetInput"
          @change="handleFileSelect">
      </label>
    </div>

    <Uploader
      v-if="!!filesToUpload.length"
      :file-list="filesToUpload"
      @cancel="resetFiles"
      @success="resetFiles" />

    <BasePopUp
      :show="showEntryPopUp"
      title="Select Entries to Link"
      button-right-text="Link Selected"
      @button-left="showEntryPopUp = false"
      @button-right="getSelectedIdsAndLink(selectedEntries)"
      @close="showEntryPopUp = false">
      <div class="menu-wrapper">
        <Sidebar
          :list="selectableEntries"
          :select-active="true"
          :options-visible="false"
          :new-enabled="false"
          :height="isMobile ? '50vh' : '60vh'"
          :hide-active="true"
          :entry-number="totalEntries"
          :exclude-linked="true"
          :options-disabled="true"
          class="menu"
          @selected-changed="selectedEntries = [].concat($event)" />
      </div>
    </BasePopUp>
  </div>
</template>

<script>
import {
  BaseDropBox,
  BaseMenuEntry,
  BaseBoxButton,
  BasePopUp,
} from 'base-ui-components';
import Sidebar from './Sidebar';
import Uploader from './Uploader';
import { userInfo } from '../mixins/userInfo';

export default {
  components: {
    BaseBoxButton,
    BaseDropBox,
    BaseMenuEntry,
    BasePopUp,
    Sidebar,
    Uploader,
  },
  mixins: [userInfo],
  props: {
    currentId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showEntryPopUp: false,
      selectableEntries: [],
      selectedEntries: [],
      filesToUpload: [],
      sortBy: '-date_created',
      filterString: '',
      filterType: '',
      totalEntries: null,
    };
  },
  computed: {
    linkedList() {
      return this.$store.getters['data/getCurrentLinked'];
    },
    isMobile() {
      return window.innerWidth <= 640;
    },
  },
  methods: {
    fileBoxClick() {
      // check if entry was already saved
      if (!this.currentId) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.uploadingNotPossible'),
          text: this.$t('notify.saveBeforeUpload'),
          type: 'error',
        });
      }
    },
    resetInput() {
      const inputRef = this.$refs.fileInput || this.$refs.fileInputMobile;
      inputRef.value = '';
    },
    droppedEntries(elementId) {
      // check if the dragged item was actually the one already open
      if (elementId !== this.currentId) {
        // if not link the entry
        this.linkEntries([elementId]);
      } else {
        // otherwise issue a warning that entry can not be linked to itself
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.linkingNotPossible'),
          text: this.$t('notify.selfLinked'),
          type: 'error',
        });
      }
    },
    handleFileSelect(e) {
      // get files - depending if dragged or selected from file browse different event prop
      const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
      // check if it was actual files that were dragged in
      if (files && files.length) {
        for (let i = 0; i < files.length; i += 1) {
          this.filesToUpload.push(files[i]);
        }
      }
    },
    openEntrySelect() {
      this.showEntryPopUp = true;
    },
    getSelectedIdsAndLink(objList) {
      const idList = objList.map(entry => entry.id);
      this.linkEntries(idList);
    },
    async linkEntries(val) {
      const list = [];
      val.forEach((entryId) => {
        if (!this.linkedList.map(e => e.to.id).includes(entryId)) {
          list.push(entryId);
        } else {
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.linkingNotPossible'),
            text: this.$t('notify.alreadyLinked'),
            type: 'error',
          });
        }
      });
      // only save to db if entry exists in db already
      if (this.currentId) {
        await this.$parent.actionLinked({ list, action: 'save' });
        // otherwise just save state in store for now and commit with general first save of entry
      } else {
        const failArr = [];
        const fullList = await Promise.all(list
          .map((entryId, index) => new Promise(async (resolve) => {
            try {
              // get the data of the linked entry
              const entry = await this.$store.dispatch('PortfolioAPI/get', { kind: 'entry', id: entryId });
              resolve({
                id: `tempId${this.$store.getters['data/getCurrentLinked'].length + index}`,
                to: entry,
              });
            } catch (e) {
              console.error(e);
              failArr.push(entryId);
              resolve();
            }
          })));
        const linkedList = fullList.filter(Boolean);
        if (linkedList.length) {
          this.$store.commit('data/setLinked', { list: fullList.filter(Boolean), replace: false });
        }
        this.informUser({
          failedArr: failArr,
          action: 'link',
          type: 'entry',
        });
      }
      this.showEntryPopUp = false;
    },
    resetFiles() {
      this.filesToUpload = [];
      this.$emit('upload-done');
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";
  .file-boxes {
    display: flex;
    margin-top: $spacing;

    .file-boxes-margin {
      margin-right: $spacing;
    }

    .file-select {
      width: 50%;
    }
  }

  .file-list {
    margin-top: $spacing;

    .mobile-file-list-attach {
      border-top: $separation-line;
    }
  }

  .menu-wrapper {
    padding: 0 $spacing $spacing;
    background-color: rgb(240, 240, 240);
  }

  @media screen and (max-width: $tablet) {
    .file-boxes {
      flex-wrap: wrap;

      .file-box {
        flex: 0 0 calc(50% - #{$spacing}/2);

        &:nth-of-type(2n) {
          margin-right: 0;
        }
      }

      .file-select {
        margin-top: $spacing;
        width: 100%;
      }
    }
  }
</style>
