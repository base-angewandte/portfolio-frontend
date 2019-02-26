<template>
  <div>
    <div
      key="file-area"
      class="file-boxes mobile-hidden">
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
        title="Vorhandenen Eintrag hinzufügen" />
      <BaseMenuEntry
        key="mobile-addNew"
        entry-id="addNew"
        icon="sheet-plus"
        title="Neuen Eintrag anhängen"
        @activated="$emit('open-new-form')"/>
      <BaseMenuEntry
        key="mobile-addExisting"
        entry-id="addExisting"
        icon="sheet-plus"
        title="Datei anhängen"/>
    </div>

    <Uploader
      v-if="!!filesToUpload.length"
      :file-list="filesToUpload"
      @cancel="filesToUpload = []"
      @success="filesToUpload = []"/>

    <BasePopUp
      :show="showEntryPopUp"
      title="Select Entries to Link"
      button-right-text="Link Selected"
      @button-left="showEntryPopUp = false"
      @button-right="linkEntries(selectedEntries)"
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
          class="menu"
          @sort="setFilters"
          @filter="setFilters"
          @selected-changed="selectedEntries = [].concat($event)"
          @fetch-data="filterSelectable"/>
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
            type: 'warn',
          });
        }
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
      this.filterSelectable({ pageNumber: 1 });
      this.showEntryPopUp = true;
    },
    setFilters({
      type,
      string,
      sort,
      entriesPerPage,
    }) {
      if (sort) {
        this.sortBy = sort;
      } else if (type) {
        this.filterType = type === 'Alle Typen' ? '' : type;
      } else if (string) {
        this.filterString = string;
      }
      this.filterSelectable({ pageNumber: 1, entriesPerPage });
    },
    async filterSelectable({ pageNumber, entriesPerPage }) {
      let offset = 0;
      if (pageNumber) {
        offset = entriesPerPage * (pageNumber - 1);
      }
      const data = await this.$store.dispatch('PortfolioAPI/get', {
        kind: 'entity',
        sort: this.sortBy,
        type: this.filterType,
        offset,
        limit: entriesPerPage,
      });
      this.totalEntries = data.count;
      // filter already linked and the current item from the list
      // TODO: this leads to shorter lists than originally considered in request...
      // would be nicer if i could filter for id's in request directly...
      this.selectableEntries = data.results
        .filter(entry => entry.id !== this.$store.state.data.currentItemId
          && !this.linkedList.map(e => e.to.id).includes(entry.id));
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
            type: 'warn',
          });
        }
      });
      // only save to db if entry exists in db already
      if (this.currentId) {
        await this.$store.dispatch('data/actionLinked', { list, action: 'save' });
        // otherwise just save state in store for now and commit with general first save of entry
      } else {
        await this.$store.commit('data/setLinked', { list, replace: false });
      }
      this.showEntryPopUp = false;
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
  }

  .menu-wrapper {
    padding: 0 $spacing $spacing;
    background-color: rgb(240, 240, 240);
  }
</style>
