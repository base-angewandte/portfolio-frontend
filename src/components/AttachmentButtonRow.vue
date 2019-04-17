<template>
  <div>
    <div
      key="file-area"
      class="file-boxes">
      <BaseDropBox
        key="addEntry"
        :show-plus="true"
        :box-size="{ width: 'calc(25% - 8px)' }"
        icon="camera"
        text="Vorhandenen Eintrag hinzufügen"
        subtext="(Click oder Drag'n Drop)"
        class="file-boxes-margin"
        @dropped="droppedEntries($event)"
        @clicked="openEntrySelect"/>
      <BaseBoxButton
        key="addNew"
        :show-plus="true"
        :box-size="{ width: 'calc(25% - 8px)'}"
        icon="sheet-empty"
        text="Neuen Eintrag anhängen"
        class="file-boxes-margin"
        @clicked="$emit('open-new-form')"/>
      <label class="file-select">
        <BaseDropBox
          key="addFile"
          :show-plus="true"
          :box-size="{ width: 'calc(100%)' }"
          :box-ratio="'50'"
          icon="camera"
          text="Dateien anhängen"
          subtext="(Click oder Drag'n Drop)"
          @dropped="handleFileSelect($event)"/>
        <input
          type="file"
          multiple
          @change="handleFileSelect">
      </label>

    </div>
    <div
      key="mobile-file-area"
      class="file-list mobile-elements">
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
        @clicked="$emit('open-new-form')"/>
      <label class="file-select">
        <BaseMenuEntry
          key="mobile-addExisting"
          entry-id="addExisting"
          icon="sheet-plus"
          title="Datei anhängen"
          class="mobile-file-list-attach"/>
        <input
          type="file"
          multiple
          @change="handleFileSelect">
      </label>
    </div>

    <Uploader
      v-if="!!filesToUpload.length"
      :file-list="filesToUpload"
      @cancel="filesToUpload = []"
      @success="updateFiles"/>

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
          :height="'62vh'"
          :hide-active="true"
          :entry-number="totalEntries"
          :exclude-linked="true"
          :options-disabled="true"
          class="menu"
          @selected-changed="selectedEntries = [].concat($event)"/>
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
} from 'base-components';
import Sidebar from './Sidebar';
import Uploader from './Uploader';

export default {
  components: {
    BaseBoxButton,
    BaseDropBox,
    BaseMenuEntry,
    BasePopUp,
    Sidebar,
    Uploader,
  },
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
  },
  methods: {
    droppedEntries(e) {
      // check if it was not a file that was dragged in and if anything is attached to event at all
      if (!e.dataTransfer.files.length && e.dataTransfer.items) {
        // get the id of the dragged item
        const id = e.dataTransfer.getData('text/plain');
        // check if the dragged item was actually the one already open
        if (id !== this.currentId) {
          // if not link the entry
          this.linkEntries([id]);
        } else {
          // otherwise issue a warning that entry can not be linked to itself
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.linkingNotPossible'),
            text: this.$t('notify.selfLinked'),
            type: 'error',
          });
        }
      }
    },
    handleFileSelect(e) {
      // get files - depending if dragged or selected from file browse different event prop
      const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
      // TODO: check if item was saved already!
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
        // TODO: also check if it is a parent already!!!!!
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
        await this.$store.dispatch('data/actionLinked', { list, action: 'save' });
        // otherwise just save state in store for now and commit with general first save of entry
      } else {
        const fullList = await Promise.all(list
          .map((entryId, index) => new Promise(async (resolve, reject) => {
            try {
              const entry = await this.$store.dispatch('PortfolioAPI/get', { kind: 'entry', id: entryId });
              resolve({
                id: `tempId${this.$store.getters['data/getCurrentLinked'].length + index}`,
                to: entry,
              });
            } catch (e) {
              console.error(e);
              reject(e);
            }
          })));
        this.$store.commit('data/setLinked', { list: fullList || [], replace: false });
      }
      this.showEntryPopUp = false;
    },
    updateFiles() {
      this.filesToUpload = [];
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
      margin-right: 16px;
    }

    .file-select {
      width: 50%;

      & > input[type='file'] {
        display: none;
      }
    }
  }

  .file-list {
    margin-top: $spacing;

    & input[type='file'] {
      display: none;
    }

    .mobile-file-list-attach {
      border-top: $separation-line;
    }
  }

  .menu-wrapper {
    padding: 0 $spacing $spacing;
    background-color: rgb(240, 240, 240);
  }

  @media screen and (max-width: $mobile) {
    .file-boxes {
      display: none;
    }
  }
</style>
