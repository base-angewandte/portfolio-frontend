<template>
  <div>
    <!-- if not mobile use large box buttons -->
    <div
      v-if="!isMobile"
      key="file-area"
      class="file-boxes">
      <!-- LINK EXÌSTING ENTRIES -->
      <BaseDropBox
        key="addEntry"
        :box-size="{ width: 'calc(25% - 16rem / 19 / 2)' }"
        :text="$t('form-view.addExistingEntry')"
        :subtext="$t('form-view.clickordrag')"
        icon="file-object"
        drop-type="elements"
        drag-item-class="base-menu-list__list-entry"
        drop-element-name="menuEntry"
        render-element-as="button"
        class="file-box file-boxes-margin"
        @dropped-element="droppedEntries"
        @clicked="openEntrySelect" />

      <!-- LINK A NEW ENTRY -->
      <BaseBoxButton
        key="addNew"
        :show-plus="true"
        :box-size="{ width: 'calc(25% - 16rem / 19 / 2)'}"
        :text="$t('form-view.addNewEntry')"
        :disabled="!currentId"
        :show-tooltip="!currentId ? true : false"
        icon="file-object"
        class="file-box file-boxes-margin"
        render-element-as="button"
        @clicked="$emit('open-new-form')"
        @onTooltip="$emit('open-new-form')" />

      <!-- ADD FILES -->
      <!-- TODO: is this label really needed?
      alternatively: should it be extended with a label text (accessibility?) -->
      <label
        class="file-select">
        <BaseDropBox
          key="addFile"
          :box-size="{ width: 'calc(100%)' }"
          :box-ratio="'50'"
          :text="$t('form-view.attachFile')"
          :subtext="$t('form-view.clickordrag')"
          :disabled="!currentId"
          :show-tooltip="!currentId ? true : false"
          icon="camera"
          @dropped-file="handleFileSelect($event)"
          @clicked="checkEntrySaved" />
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

    <!-- else just use buttons -->
    <div
      v-else
      key="mobile-file-area"
      class="file-list">
      <!-- LINK EXÌSTING ENTRIES -->
      <BaseButton
        key="mobile-addFile"
        :text="$t('form-view.addExistingEntry')"
        icon-size="large"
        button-style="row"
        icon="file-object"
        align-text="left"
        class="file-list-button"
        @clicked="openEntrySelect" />

      <!-- LINK A NEW ENTRY -->
      <BaseButton
        key="mobile-addNew"
        :text="$t('form-view.addNewEntry')"
        :disabled="!currentId"
        :show-tooltip="!currentId ? true : false"
        icon-size="large"
        button-style="row"
        align-text="left"
        class="file-list-button mobile-file-list-attach"
        icon="add-new-object"
        @clicked="$emit('open-new-form')" />

      <!-- ADD FILES -->
      <!-- TODO: is this label really needed?
      alternatively: should it be extended with a label text (accesibility?) -->
      <label class="file-select">
        <BaseButton
          key="mobile-addExisting"
          :text="$t('form-view.attachFile')"
          :disabled="!currentId"
          :show-tooltip="!currentId ? true : false"
          icon="camera"
          icon-size="large"
          align-text="left"
          button-style="row"
          class="file-list-button mobile-file-list-attach"
          @clicked="openFileDialogue" />
        <input
          ref="fileInputMobile"
          :disabled="!currentId"
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
      is-open-focus=".base-menu-list__list-entry input"
      :show="showEntryPopUp"
      :title="$t('form-view.selectentries')"
      :button-right-text="$t('form-view.linkselected')"
      :button-left-text="$t('cancel')"
      @button-left="showEntryPopUp = false"
      @button-right="getSelectedIdsAndLink(selectedEntries)"
      @close="showEntryPopUp = false">
      <div class="menu-wrapper">
        <Sidebar
          :list="selectableEntries"
          :select-active="true"
          :options-visible="false"
          :new-enabled="false"
          :import-enabled="false"
          :height="`calc(${isMobile ? '50vh' : '60vh'} - 32px)`"
          :hide-active="true"
          :entry-number="totalEntries"
          :exclude-linked="true"
          :options-disabled="true"
          :set-pagination-as-links="false"
          class="menu"
          @selected-changed="selectedEntries = [].concat($event)" />
      </div>
    </BasePopUp>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from './Sidebar';
import Uploader from './Uploader';
import { userInfo } from '../mixins/userInfo';

export default {
  components: {
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
      // to handle the pop up for linking existing entries
      showEntryPopUp: false,
      // entries shown in the pop up
      selectableEntries: [],
      // entries selected from the pop up
      selectedEntries: [],
      // files that were selected for upload
      filesToUpload: [],
      // total number of available entries to link
      totalEntries: null,
    };
  },
  computed: {
    // get currently linked entries
    linkedList() {
      return this.$store.getters['data/getCurrentLinked'];
    },
    // check if browser is mobile to switch between box and list display
    isMobile() {
      return this.$store.state.data.windowWidth <= 640;
    },
  },
  methods: {
    checkEntrySaved() {
      // check if entry was already saved and display error message if not
      if (!this.currentId) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.uploadingNotPossible'),
          text: this.$t('notify.saveBeforeUpload'),
          type: 'error',
        });
      }
    },
    // reset file input values everytime the file dialogue is opened
    resetInput() {
      // check if file box or button is active
      const inputRef = this.$refs.fileInput || this.$refs.fileInputMobile;
      inputRef.value = '';
    },
    // function called when elements were dropped into the link entries drop box
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
    // function called on dropping files into box or on file input change event
    handleFileSelect(e) {
      // get files - depending if dragged or selected from file browse different event prop
      const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
      // check if it was actual files that were dragged in
      if (files && files.length && this.currentId) {
        for (let i = 0; i < files.length; i += 1) {
          this.filesToUpload.push(files[i]);
        }
      }
    },
    // function triggered upon click on link entries drop box
    openEntrySelect() {
      this.showEntryPopUp = true;
    },
    getSelectedIdsAndLink(objList) {
      // get only a list of ids from entries that should be linked
      const idList = objList.map((entry) => entry.id);
      this.linkEntries(idList);
    },
    async linkEntries(val) {
      const list = [];
      val.forEach((entryId) => {
        // if entry is not linked already - add it to the list that will be linked
        if (!this.linkedList.map((e) => e.to.id).includes(entryId)) {
          list.push(entryId);
          // otherwise inform user about it
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
          // eslint-disable-next-line no-async-promise-executor
          .map((entryId, index) => new Promise(async (resolve) => {
            try {
              // get the data of the linked entry
              const entry = await this.$store.dispatch('PortfolioAPI/get', { kind: 'entry', id: entryId });
              resolve({
                id: `tempId${this.$store.getters['data/getCurrentLinked'].length + index}`,
                to: entry,
              });
            } catch (e) {
              if (axios.isCancel(e)) {
                console.warn(e.message);
              } else {
                console.error(e);
              }
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
      // close the pop up again
      this.showEntryPopUp = false;
    },
    // when upload of files complete reset the variable and inform parent
    resetFiles() {
      this.filesToUpload = [];
      this.$emit('upload-done');
    },
    // trigger file select dialogue manually
    openFileDialogue() {
      // check first if entry was saved already to display notification
      this.checkEntrySaved();
      // trigger input click event manually since not triggered for base menu entry
      // otherwise
      if (this.currentId) {
        this.$refs.fileInputMobile.dispatchEvent(new MouseEvent('click'));
      }
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

    .file-list-button {
      width: 100%;
    }

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
        // added 0.01rem thing for edge
        flex: 0 0 calc(50% - #{$spacing}/2 - 0.01rem);

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
