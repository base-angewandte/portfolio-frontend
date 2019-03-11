<template>
  <div
    id="menu-sidebar"
    :style="calcStyle"
    class="mobile-hidden">

    <div class="sidebar-head">
      <div class="base-row">
        <BaseButton
          v-if="newEnabled"
          :active="isNewForm"
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
          :selection-list="filterByTypeList"
          @selected="sortEntries"/>
        <base-drop-down
          :selected="selectedType"
          :selection-list="entryTypes"
          @selected="filterEntries($event, 'type')"/>
      </div>
      <transition
        name="slide-toggle"
        class="options-extend">
        <div
          v-if="showCheckbox"
          class="options-extend-box">
          <BaseButton
            :text="$tc('publish', 2)"
            icon-size="large"
            icon="eye"
            button-style="single"
            @clicked="actionEntries('publish')"/>
          <BaseButton
            :text="$tc('offline', 2)"
            icon-size="large"
            icon="forbidden"
            button-style="single"
            @clicked="actionEntries('offline')"/>
          <BaseButton
            :text="$tc('duplicate', 2)"
            icon-size="large"
            icon="duplicate"
            button-style="single"
            @clicked="duplicateEntries"/>
          <BaseButton
            :text="$tc('delete', 2)"
            icon-size="large"
            icon="waste-bin"
            button-style="single"
            @clicked="actionEntries('delete')"/>
        </div>
      </transition>
    </div>

    <div
      ref="menu-container"
      class="base-menu-container">
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
      :current="pageNumber"
      @set-page="setPage"/>
  </div>
</template>

<script>
import axios from 'axios';
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
    excludeLinked: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedMenuEntries: [],
      listInt: [],
      entriesPerPage: null,
      pageNumber: 1,
      entryNumber: null,
      entryTypes: [],
      isLoading: false,
      timeout: null,
    };
  },
  computed: {
    showCheckbox() {
      return this.$store.state.data.showOptions;
    },
    activeEntry() {
      if (!this.hideActive && this.activeEntryId) {
        return this.listInt.map(entry => entry.id).indexOf(this.activeEntryId);
      }
      return null;
    },
    activeEntryId() {
      return this.$route.params.id || null;
    },
    calcStyle() {
      return this.height ? { height: this.height } : {};
    },
    pageTotal() {
      return this.entriesPerPage ? Math.ceil(this.entryNumber / this.entriesPerPage) : 0;
    },
    isNewForm() {
      return this.$route.name === 'newEntry';
    },
    filterByTypeList() {
      return [
        {
          label: this.$t('dropdown.type'),
          value: 'type',
        },
        {
          label: this.$t('dropdown.title'),
          value: 'title',
        },
        {
          label: this.$t('dropdown.-title'),
          value: '-title',
        },
        {
          label: this.$t('dropdown.-date_created'),
          value: '-date_created',
        },
        {
          label: this.$t('dropdown.date_created'),
          value: 'date_created',
        },
      ];
    },
    selectedType() {
      return this.filterType ? this.entryTypes.find(type => type.value === this.filterType)
        : { label: this.$t('dropdown.allTypes'), value: '' };
    },
  },
  watch: {
    list(val) {
      this.listInt = [].concat(val);
    },
    showCheckbox(val) {
      // delete selected when options menu is closed
      if (!val) {
        this.selectedMenuEntries = [];
      }
    },
  },
  created() {
    // TODO: eventually store entryTypes in Store since the same in every instance and
    // needs to be updated when entries added or deleted or updated
    this.getEntryTypes();
  },
  mounted() {
    this.listInt = this.list;
    this.calculateSidebarHeight();
    this.fetchSidebarData();
  },
  methods: {
    showEntry(index) {
      this.$emit('show-entry', this.listInt[index].id);
    },
    selectEntry(evt) {
      if (evt.selected) {
        this.selectedMenuEntries.push(this.listInt[evt.index]);
      } else {
        this.selectedMenuEntries = this.selectedMenuEntries
          .filter(entry => entry.id !== this.listInt[evt.index].id);
      }
      // TODO: check if selectedEntries should also be handled internally
      this.$emit('selected-changed', this.selectedMenuEntries);
    },
    // get all the types of the entries a user has (alternative to just displaying all
    // > 150 types
    async getEntryTypes() {
      // TODO: replace with C. store module!
      try {
        const response = await axios.get(`${process.env.API}entity/types/`, {
          withCredentials: true,
        });
        const types = response.data;
        // TODO: check if this is even needed (of if types come with label aready...)
        const typeArr = await Promise.all(types.map(type => new Promise(async (resolve, reject) => {
          try {
            // TODO: replace lang with app lang!
            const labelData = await this.$store.dispatch('SkosmosAPI/getSearch', {
              query: type,
              lang: 'de',
              vocab: 'portfolio',
            });
            if (labelData && labelData.data && labelData.data.results
              && labelData.data.results.length) {
              // TODO: use URI instead of prefLabel!!
              const option = {
                label: labelData.data.results[0].prefLabel,
                value: labelData.data.results[0].prefLabel,
              };
              resolve(option);
            } else {
              resolve();
            }
          } catch (e) {
            reject(e);
          }
        })));
        this.entryTypes = typeArr.filter(type => !!type);
      } catch (e) {
        // TODO: inform user?
      }
    },
    getNewForm() {
      this.$store.commit('data/setCurrentItem', {});
      this.$store.commit('data/setLinked', { list: [], replace: true });
      this.$store.commit('data/setMedia', { list: [], replace: true });
      this.$store.commit('data/deleteParentItems');
      this.$emit('new-form');
    },
    sortEntries(evt) {
      this.sortParam = evt.value;
      this.fetchSidebarData();
    },
    filterEntries(val, type) {
      if (type === 'type') {
        this.filterType = val.value;
        this.$emit('filter', { type: this.filterType });
        this.fetchSidebarData();
      } else if (type === 'title') {
        if (this.timeout) {
          clearTimeout(this.timeout);
          this.timeout = null;
        }
        this.timeout = setTimeout(() => {
          if (val.length === 0 || val.length > 3) {
            this.filterString = val;
            this.fetchSidebarData();
          } else {
            this.filterString = '';
          }
        }, 600);
      }
      this.pageNumber = 1;
    },
    setPage(number) {
      this.pageNumber = number;
      this.fetchSidebarData();
    },
    async duplicateEntries() {
      // TODO: disable action buttons until action finished!
      // TODO: do this in component not store!
      if (this.selectedMenuEntries.length) {
        // dispatch selected entries to be duplicated and sucessfully duplicated ids are returned
        const routingIds = await this.$store.dispatch('data/duplicateEntries', [].concat(this.selectedMenuEntries));
        this.selectedMenuEntries = [];
        // if any entries were sucessfully duplicated route to the new entry
        if (routingIds.length) {
          this.$router.push(`/entry/${routingIds.pop()}`);
        }
        this.fetchSidebarData();
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
      // TODO: do this in component not store!
      if (this.selectedMenuEntries.length) {
        this.$store.dispatch('data/actionEntries', { action: value, entries: [].concat(this.selectedMenuEntries) });
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
    async fetchSidebarData() {
      this.isLoading = true;
      try {
        const response = await this.$store.dispatch('PortfolioAPI/get', {
          kind: 'entity',
          sort: this.sortParam,
          offset: (this.pageNumber - 1) * this.entriesPerPage,
          limit: this.entriesPerPage,
          type: this.filterType,
          q: this.filterString,
          link_selection_for: this.excludeLinked ? this.activeEntryId : '',
        });
        this.listInt = response.results;
        this.entryNumber = response.count;
        this.$emit('sidebar-data-changed');
      } catch (e) {
        this.$notify({
          group: 'request-notifications',
          title: 'Fetching of Entry Data Failed',
          text: 'Unfortunately there was a problem and we could not fetch the data. Please try again!',
          type: 'warn',
        });
      }
      this.isLoading = false;
    },
    calculateSidebarHeight() {
      const sidebarHeight = this.$refs.menuList.$el.clientHeight - 32 - 16;
      // hardcoded because unfortunately no other possibility found
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
