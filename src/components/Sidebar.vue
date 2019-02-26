<template>
  <div
    id="menu-sidebar"
    :style="calcStyle"
    class="mobile-hidden">

    <div class="sidebar-head">
      <div class="base-row">
        <BaseButton
          v-if="newEnabled"
          :active="$store.state.data.isNewForm"
          :text="$t('new')"
          icon="sheet-plus"
          icon-size="large"
          button-style="row"
          @clicked="getNewForm"/>
        <BaseSearch
          :show-image="true"
          :placeholder="$t('search')"
          @input="filterEntries($event, 'title')"/>
      </div>
      <div class="options-row">
        <div
          v-if="optionsVisible"
          class="options">
          <BaseButton
            :text="$t('options')"
            :icon="'options-menu'"
            icon-size="small"
            icon-position="left"
            @clicked="toggleSidebarOptions"/>
        </div>
        <base-drop-down
          :placeholder="'Sortieren nach'"
          :selection-list="['Nach Typ', 'A-Z', 'Z-A', 'Neueste', 'Älteste']"
          @selected="sortEntries"/>
        <base-drop-down
          :selected="'Alle Typen'"
          :selection-list="availableEntryTypes"
          @selected="filterEntries($event, 'type')"/>
      </div>
      <transition
        name="slide-toggle"
        class="options-extend">
        <div
          v-if="showCheckbox"
          class="options-extend-box">
          <BaseButton
            text="In Showroom veröffentlichen"
            icon-size="large"
            icon="eye"
            button-style="single"
            @clicked="actionEntries('publish')"/>
          <BaseButton
            text="Einträge offline stellen"
            icon-size="large"
            icon="forbidden"
            button-style="single"
            @clicked="actionEntries('offline')"/>
          <BaseButton
            text="Einträge duplizieren"
            icon-size="large"
            icon="duplicate"
            button-style="single"
            @clicked="duplicateEntries"/>
          <BaseButton
            text="Einträge löschen"
            icon-size="large"
            icon="waste-bin"
            button-style="single"
            @clicked="actionEntries('delete')"/>
        </div>
      </transition>
    </div>

    <div class="base-menu-container">
      <div
        v-if="isLoading"
        class="loading-area">
        <div class="loader">
          <svg class="circular">
            <circle
              class="path"
              cx="50"
              cy="50"
              r="20"
              fill="none"
              stroke-width="4"
              stroke-miterlimit="10" />
          </svg>
        </div>
      </div>

      <BaseMenuList
        id="menu-list"
        key="menu-list"
        ref="menuList"
        :selected="selectActive || showCheckbox"
        :list="listInt"
        :active-entry="activeEntry"
        @clicked="showEntry"
        @selected="selectEntry"/>
    </div>

    <BasePagination
      v-if="pageTotal > 1"
      :total="pageTotal"
      @set-page="setPage"/>
  </div>
</template>

<script>
import {
  BaseMenuList,
  BaseButton,
  BaseDropDown,
  BaseSearch,
  BasePagination,
} from 'base-components';
import 'base-components/dist/lib/base-components.min.css';

export default {
  components: {
    BaseMenuList,
    BaseButton,
    BaseDropDown,
    BaseSearch,
    BasePagination,
  },
  props: {
    /**
     * make optional for link entries functionality
     */
    optionsVisible: {
      type: Boolean,
      default: true,
    },
    /**
     * make optional for link entries functionality
     */
    newEnabled: {
      type: Boolean,
      default: true,
    },
    /**
     * need to set from outside for link entries functionality
     */
    selectActive: {
      type: Boolean,
      default: false,
    },
    /**
     * custom height needed for link entries functionality
     */
    height: {
      type: String,
      default: '',
    },
    /**
     * to hide the active entry from the link entries functionality
     */
    hideActive: {
      type: Boolean,
      default: false,
    },
    /**
     * the list of entries to display in the sidebar
     */
    list: {
      type: Array,
      default() {
        return [];
      },
    },
    /**
     * the number of entries that are in the db (and matching filter criteria)
     * in total
     */
    entryNumber: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      selectedMenuEntries: [],
      listInt: [],
      activeEntryInt: null,
      // TODO: Re-evaluate if storing these values here is necessary / desirable
      pageNumber: 1,
      sortParam: null,
      filterType: null,
      filterString: null,
      entriesPerPage: 0,
    };
  },
  computed: {
    showCheckbox() {
      return this.$store.state.data.showOptions;
    },
    isLoading() {
      // TODO: have loader showing for at least xx to avoid flashing?
      return this.$store.getters['PortfolioAPI/isLoading'];
    },
    activeEntry: {
      get() {
        const id = this.$store.state.data.currentItemId;
        if (!this.hideActive && id && this.$store.getters['data/getSidebarData'].find(entry => entry.id === id)) {
          return this.activeEntryInt || this.$store.getters['data/getCurrentItemIndex'];
        }
        return null;
      },
      set(val) {
        this.activeEntryInt = val;
      },
    },
    availableEntryTypes() {
      return this.$store.getters['data/getEntryTypes'].filter(type => !!type);
    },
    calcStyle() {
      return this.height ? { height: this.height } : {};
    },
    pageTotal() {
      return this.entriesPerPage ? Math.ceil(this.entryNumber / this.entriesPerPage) : 0;
    },
  },
  watch: {
    list(val) {
      this.listInt = [].concat(val);
      this.calcEntriesPerPage();
    },
    showCheckbox(val) {
      // delete selected when options menu is closed
      if (!val) {
        this.selectedMenuEntries = [];
      }
    },
  },
  mounted() {
    this.calcEntriesPerPage();
    this.listInt = this.list;
  },
  methods: {
    showEntry(index) {
      this.$emit('show-entry', this.list[index].id);
    },
    selectEntry(evt) {
      if (evt.selected) {
        this.selectedMenuEntries.push(this.list[evt.index].id);
      } else {
        this.selectedMenuEntries = this.selectedMenuEntries
          .filter(entry => entry !== this.list[evt.index].id);
      }
      this.$emit('selected-changed', this.selectedMenuEntries);
    },
    getNewForm() {
      this.$store.commit('data/setCurrentItem', {});
      this.$store.commit('data/setLinked', { list: [] });
      this.$store.commit('data/deleteParentItems');
      this.$emit('new-form');
    },
    sortEntries(evt) {
      if (evt === 'Nach Typ') {
        this.sortParam = 'type';
      } else if (evt === 'A-Z') {
        this.sortParam = 'title';
      } else if (evt === 'Z-A') {
        this.sortParam = '-title';
      } else if (evt === 'Neueste') {
        this.sortParam = '-date_created';
      } else if (evt === 'Älteste') {
        this.sortParam = 'date_created';
      }
      this.$emit('sort', { sort: this.sortParam });
    },
    filterEntries(val, type) {
      if (type === 'type') {
        this.filterType = val;
        this.$emit('filter', { type: this.filterType });
        // there is no endpoint to filter entries for strings yet!!
      } else if (type === 'title') {
        // TODO: add time delay! (maybe also > 3 chars)
        this.filterString = val;
        this.$emit('filter', { string: this.filterString });
        // TODO: this is not working and always only gives overall number of entries!!
      }
    },
    setPage(number) {
      this.pageNumber = number;
      this.$emit('fetch-data', {
        entriesPerPage: this.entriesPerPage,
        pageNumber: this.pageNumber,
        sortParam: this.sortParam,
        filterString: this.filterString,
        filterType: this.filterType,
      });
    },
    async duplicateEntries() {
      // TODO: disable action buttons until action finished!
      if (this.selectedMenuEntries.length) {
        // dispatch selected entries to be duplicated and sucessfully duplicated ids are returned
        const routingIds = await this.$store.dispatch('data/duplicateEntries', this.selectedMenuEntries);
        this.selectedMenuEntries = [];
        // if any entries were sucessfully duplicated route to the new entry
        if (routingIds.length) {
          this.$router.push(`/entry/${routingIds.pop()}`);
        }
      } else {
        this.$notify({
          group: 'request-notifications',
          title: 'No Entries Selected',
          text: 'Please select Entries from the Sidebar first!',
          type: 'warn',
        });
      }
    },
    actionEntries(value) {
      if (this.selectedMenuEntries.length) {
        this.$store.dispatch('data/actionEntries', { action: value, entries: this.selectedMenuEntries });
      } else {
        this.$notify({
          group: 'request-notifications',
          title: 'No Entries Selected',
          text: 'Please select Entries from the Sidebar first!',
          type: 'warn',
        });
      }
    },
    toggleSidebarOptions() {
      this.$refs.menuList.entryProps.forEach(entry => this.$set(entry, 'selected', false));
      this.$store.commit('data/setOptions', !this.showCheckbox);
    },
    calcEntriesPerPage() {
      const sidebarHeight = this.$refs.menuList.$el.clientHeight;
      const entryHeight = 56;
      this.entriesPerPage = Math.floor(sidebarHeight / entryHeight);
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  #menu-sidebar {
    display: flex;
    flex-direction: column;
    height: calc(100vh - #{$header-height} - #{$row-height-small} - 40px);

    button + div {
      border-left: $separation-line;
    }

    .sidebar-head {
      position: sticky;
      top: $header-height;
      z-index: 5;
      padding-top: $spacing;
      padding-bottom: $spacing-small;
      background-color: $background-color;
      flex: 0 0 auto;

      .options-extend-box {
        width: 100%;
        background-color: $background-color;
        overflow: hidden;
      }

      .options-extend {
      }
    }
  }

  .base-menu-container {
    position: relative;
    flex: 1 1 auto;
    overflow-y: auto;

    #menu-list {
      height: 100%;
    }

    .loading-area {
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 2;
      background-color: rgba(255,255,255, 0.50);

      .loader{
        position: absolute;
        width: 100px;
        height: 100px;
        top: 20%;
        left: 50%;
        transform: translate(-50%,-50%);

        .circular{
          animation: rotate 2s linear infinite;
          height: 100px;
          position: relative;
          width: 100px;

          .path {
            stroke-dasharray: 1,200;
            stroke-dashoffset: 0;
            stroke:$app-color;
            color: $app-color;
            animation:
              dash 1.5s ease-in-out infinite;
          }
        }
      }
    }
  }

  .slide-toggle-enter-active,
  .slide-toggle-leave-active {
    transition: height .5s ease;
  }
  .slide-toggle-enter-active {
    height: calc(4 * #{$row-height-small});
  }
  .slide-toggle-enter,
  .slide-toggle-leave-active {
    height: 0;
  }
  .slide-toggle-leave {
    height: calc(4 * #{$row-height-small});
  }

  @keyframes rotate{
    100%{
      transform: rotate(360deg);
    }
  }

  @keyframes dash{
    0%{
      stroke-dasharray: 1,200;
      stroke-dashoffset: 0;
    }
    50%{
      stroke-dasharray: 89,200;
      stroke-dashoffset: -35;
    }
    100%{
      stroke-dasharray: 89,200;
      stroke-dashoffset: -124;
    }
  }

  @media screen and (max-width: $mobile) {
    .base-menu-entry {
      display: block;
    }
  }
</style>
