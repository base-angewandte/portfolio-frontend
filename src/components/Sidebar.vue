<template>
  <div
    id="menu-sidebar"
    :style="calcStyle"
    class="menu-sidebar">
    <div class="sidebar-head">
      <div :class="['base-row', { 'base-row-with-form': isNewForm || !!activeEntryId }]">
        <BaseButton
          v-if="newEnabled"
          :active="isNewForm"
          :text="$t('new')"
          :disabled="isLoading"
          icon="sheet-plus"
          icon-size="large"
          class="base-row-button"
          button-style="row"
          @clicked="getNewForm" />
        <BaseSearch
          :show-image="true"
          :placeholder="$t('search')"
          class="search-bar"
          @input="filterEntries($event, 'title')" />
      </div>
      <BaseOptions
        :always-show-options-button="true"
        :show-options="showCheckbox"
        :options-hidden="optionsDisabled"
        align-options="left"
        @options-toggle="toggleSidebarOptions">
        <template slot="afterOptions">
          <div class="sidebar-drop-downs">
            <BaseDropDown
              v-model="sortParam"
              :placeholder="$t('dropdown.sortBy')"
              :label="$t('dropdown.sortBy')"
              :options="sortOptions"
              @value-selected="fetchSidebarData" />
            <BaseDropDown
              v-model="filterType"
              :label="$t('dropdown.filterByType')"
              :options="entryTypes"
              :language="$i18n.locale"
              value-prop="source"
              @value-selected="filterEntries($event, 'type')" />
          </div>
        </template>
        <template
          slot="options">
          <BaseButton
            :text="$tc('publish', 2)"
            :disabled="isLoading"
            icon-size="large"
            icon="eye"
            button-style="single"
            @clicked="handleAction('publish')" />
          <BaseButton
            :text="$tc('offline', 2)"
            :disabled="isLoading"
            icon-size="large"
            icon="forbidden"
            button-style="single"
            @clicked="handleAction('offline')" />
          <BaseButton
            :text="$tc('duplicate', 2)"
            :disabled="isLoading"
            icon-size="large"
            icon="duplicate"
            button-style="single"
            @clicked="duplicateEntries" />
          <BaseButton
            :text="$tc('delete', 2)"
            :disabled="isLoading"
            icon-size="large"
            icon="waste-bin"
            button-style="single"
            @clicked="handleAction('delete')" />
        </template>
      </BaseOptions>
    </div>
    <div
      ref="menuContainer"
      class="base-menu-container">
      <div
        v-if="isLoading"
        class="loading-area">
        <BaseLoader />
      </div>

      <BaseMenuList
        v-if="listInt.length"
        id="menu-list"
        key="menu-list"
        ref="menuList"
        :selected="selectActive || showCheckbox"
        :list="listInt"
        :active-entry="activeEntry"
        :selected-list="selectedList"
        @clicked="showEntry"
        @selected="selectEntry" />
      <div
        v-else-if="!entriesExist && !isLoading"
        class="no-entries">
        <p class="no-entries-title">
          {{ isNewForm ? $t('noEntriesTitle', { action: $t('actionSave') })
            : $t('noEntriesTitle', { action: $t('actionCreate') }) }}
        </p>
        <p class="no-entries-subtext">
          {{ isNewForm ? $t('noEntriesFormSubtext') : $t('noEntriesMainSubtext') }}
        </p>
      </div>
      <div
        v-else-if="entriesExist && !isLoading"
        class="no-entries">
        <p class="no-entries-title">
          {{ $t('noMatchingEntriesTitle') }}
        </p>
        <p class="no-entries-subtext">
          {{ $t('noMatchingEntriesSubtext') }}
        </p>
      </div>
    </div>

    <BasePagination
      v-if="pageTotal > 1"
      :total="pageTotal"
      :current="pageNumber"
      @set-page="setPage" />
  </div>
</template>

<script>
import {
  BaseMenuList,
  BaseButton,
  BaseDropDown,
  BaseSearch,
  BasePagination,
  BaseLoader,
} from 'base-ui-components';
import BaseOptions from './BaseOptions';
import { entryHandlingMixin } from '../mixins/entryHandling';
import { userInfo } from '../mixins/userInfo';
import { capitalizeString } from '../utils/commonUtils';

export default {
  components: {
    BaseMenuList,
    BaseButton,
    BaseDropDown,
    BaseSearch,
    BasePagination,
    BaseOptions,
    BaseLoader,
  },
  mixins: [entryHandlingMixin, userInfo],
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
    optionsDisabled: {
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
      isLoading: false,
      timeout: null,
      filterType: {
        label: this.$t('dropdown.allTypes'),
        source: '',
      },
      sortParam: {},
      entriesExist: false,
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
      return -1;
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
    sortOptions() {
      return [
        {
          label: this.$t('dropdown.type'),
          value: `type_${this.$i18n.locale}`,
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
    entryTypes() {
      return this.$store.getters['data/getEntryTypes'];
    },
    selectedList() {
      return this.selectedMenuEntries.map(entry => entry.id);
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
    $route(from) {
      if (from.name === 'Dashboard') {
        // refetch sidebar data when switching from overview to form view
        this.calculateSidebarHeight();
        this.fetchSidebarData();
      }
    },
  },
  created() {
    this.$store.dispatch('data/fetchEntryTypes');
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
    getNewForm() {
      this.$store.commit('data/deleteCurrentItem');
      this.$store.commit('data/deleteParentItems');
      this.$emit('new-form');
    },
    filterEntries(val, type) {
      if (type === 'type') {
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
      if (this.selectedMenuEntries.length) {
        this.isLoading = true;
        // dispatch selected entries to be duplicated and sucessfully duplicated ids are returned
        const { routingIds, failedTitles } = await this.$store.dispatch('data/duplicateEntries', [].concat(this.selectedMenuEntries));
        const duplicatedNumber = routingIds.length;
        // if entries could not be duplicated inform user about it
        this.informUser({
          successArr: routingIds,
          failedArr: failedTitles,
          action: 'duplicate',
          type: 'entry',
          entryCount: 0,
          listEntries: true,
        });
        // if any entries were sucessfully duplicated route to the new entry
        if (duplicatedNumber) {
          this.selectedMenuEntries = [];
          this.fetchSidebarData();
          this.$router.push(`/entry/${routingIds.pop()}`);
        }
        this.isLoading = false;
      } else {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.noEntriesSelected'),
          text: this.$t('notify.selectEntries'),
          type: 'error',
        });
      }
    },
    handleAction(value) {
      if (this.selectedMenuEntries.length) {
        this.confirmAction({ action: value, entries: this.selectedMenuEntries });
      } else {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.noEntriesSelected'),
          text: this.$t('notify.selectEntries'),
          type: 'error',
        });
      }
    },
    async action(action) {
      const currentSelected = this.selectedMenuEntries
        .some(entry => entry.id === this.activeEntryId);
      await this.actionEntries(action);
      this.selectedMenuEntries = [];
      this.fetchSidebarData();

      this.$store.commit('data/setOptions', false);
      // if the form was open and the item was selected for deletion a redirect to dashboard
      // will be done
      if (action === 'delete' && currentSelected) {
        this.$router.push('/');
      } else if ((action === 'publish' || action === 'offline') && currentSelected) {
        this.$emit('update-publish-state', action === 'publish');
      }
    },
    toggleSidebarOptions() {
      const { menuList } = this.$refs;
      if (menuList) {
        this.$refs.menuList.entryProps.forEach(entry => this.$set(entry, 'selected', false));
      }
      this.$store.commit('data/setOptions', !this.showCheckbox);
    },
    async fetchSidebarData() {
      this.isLoading = true;
      try {
        let offset = (this.pageNumber - 1) * this.entriesPerPage;
        let response = await this.dataRequest(offset);
        // should there be not enough entries to give results with the current offset
        // try again with a offset 0
        if (offset >= response.count) {
          offset = 0;
          this.pageNumber = 1;
          response = await this.dataRequest(offset);
        }
        this.listInt = response.results
          .map(entry => Object.assign({}, entry, {
            description: entry.type && entry.type.label ? capitalizeString(entry.type.label[this.$i18n.locale]) : '',
          }));
        this.entryNumber = response.count;
        // check if this was a general data request (no filters etc)
        // to determine if entries exist at all
        if (!(this.filterType.source || this.filterString || this.excludeLinked)) {
          this.entriesExist = !!this.entryNumber;
        }
        this.$emit('sidebar-data-changed');
      } catch (e) {
        console.error(e);
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.entryFetchFail'),
          text: this.$t('notify.entryFetchFailSub'),
          type: 'error',
        });
      }
      await this.$store.dispatch('data/fetchEntryTypes');
      this.isLoading = false;
    },
    async dataRequest(offset) {
      const response = await this.$store.dispatch('PortfolioAPI/get', {
        kind: 'entry',
        sort: this.sortParam.value,
        offset,
        limit: this.entriesPerPage,
        type: this.filterType.source,
        q: this.filterString,
        link_selection_for: this.excludeLinked ? this.activeEntryId : '',
      });
      return response;
    },
    calculateSidebarHeight() {
      const sidebarHeight = this.$refs.menuContainer.clientHeight - 32 - 16;
      // hardcoded because unfortunately no other possibility found
      const entryHeight = window.innerWidth >= 640 ? 56 : 48;
      this.entriesPerPage = Math.floor(sidebarHeight / entryHeight);
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .menu-sidebar {
    display: flex;
    flex-direction: column;
    height: calc(100vh - #{$header-height} - #{$row-height-small} - 40px);

    .search-bar {
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

      .sidebar-drop-downs {
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .base-menu-container {
    position: relative;
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;

    #menu-list {
      height: 100%;
    }

    .loading-area {
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 2;
      background-color: rgba(255,255,255, 0.50);
    }
  }

  .no-entries {
    height: 100%;
    width: 100%;
    padding-top: 50px;

    .no-entries-title, .no-entries-subtext {
      text-align: center;
      color: $font-color-second;
      margin-bottom: $spacing;
    }

    .no-entries-title {
      font-size: $font-size-large;
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

  @media screen and (max-width: $tablet) {
    .menu-sidebar {
      height: calc(100vh - #{$header-height} - #{$row-height-small} - 130px);

      .sidebar-head {
        & .sidebar-drop-downs {
          flex-wrap: wrap;
        }

        .base-row-with-form {
          height: auto;
          flex-wrap: wrap;

          .base-row-button {
            width: 100%;
            border-bottom: $separation-line;
          }
        }
      }
    }
  }

  @media screen and (max-width: $mobile) {
    .base-menu-entry {
      display: block;
    }

    .base-row-button {
      width: 100%;
      border-bottom: $separation-line;
    }

    .menu-sidebar {
      height: calc(100vh - #{$header-height} - (2 * #{$spacing}));

      .search-bar {
        border-left: none;
      }
    }

    .options-row {
      flex-wrap: wrap;
      justify-content: center;

      .options {
        flex-basis: 100%;

        .options-button {
          width: 100%;
        }
      }
    }
  }
</style>
