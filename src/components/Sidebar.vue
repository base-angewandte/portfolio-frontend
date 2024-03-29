<template>
  <div
    id="menu-sidebar"
    ref="menuSidebar"
    :style="calcStyle"
    class="menu-sidebar">
    <BaseEntrySelector
      ref="menuSidebarEntries"
      :active-entry="activeEntry"
      :entries="listInt"
      :entries-selectable.sync="entriesSelectable"
      :entries-total="entryNumber"
      :entries-per-page="entriesPerPage"
      :entry-selector-text="{
        selectAll: $t('selectAll'),
        selectNone: $t('selectNone'),
        entriesSelected: $t('entriesSelected',
                            { type: $tc('entry', selectedMenuEntries.length) || 0 }),
        noEntriesTitle: $t('noMatchingEntriesTitle'),
        noEntriesSubtext: $t('noMatchingEntriesSubtext'),
        search: $t('search'),
        options: {
          show: $t('options'),
          hide: $t('options')
        },
        maxEntriesReached: $t('maxEntries'),
      }"
      :entry-types="entryTypesInt"
      :entry-types-config="entryTypeConfig"
      :sort-config="sortConfig"
      :sort-options="sortOptions"
      :height="'100%'"
      :is-loading="isLoading"
      :language="$i18n.locale"
      :options-hidden="optionsDisabled"
      class="base-entry-selector"
      @fetch-entries="fetchEntries"
      @entry-clicked="showEntry"
      @selected-changed="selectEntry">
      <template
        slot="head">
        <div
          :class="['base-row', { 'base-row-with-form':
            isNewForm || !!activeEntryId || isImportPage }]">
          <BaseButton
            v-if="newEnabled"
            :active="isNewForm"
            :text="isButtonMinimized ? '' : $t('new')"
            :disabled="isLoading"
            icon="add-new-object"
            icon-size="large"
            :class="['base-row-button',
                     { 'minimized': isButtonMinimized },
                     { 'maximized': isButtonMaximized }]"
            button-style="row"
            data-e2e-new-button
            @clicked="getNewForm" />
          <BaseButton
            v-if="importEnabled"
            :text="isButtonMinimized ? '' : $t('import.importButtonTitle')"
            :active="isImportPage"
            icon="download"
            icon-size="small"
            :class="['base-row-button',
                     { 'minimized': isButtonMinimized },
                     { 'maximized': isButtonMaximized }]"
            button-style="row"
            data-e2e-import-button
            @clicked="$emit('import-entries', 'goToImport')" />
          <BaseButton
            v-if="!isSearchExpanded"
            text=""
            icon="magnifier"
            icon-size="large"
            class="base-row-button search-button minimized"
            style="border-right: none;"
            button-style="row"
            data-e2e-search-button
            @clicked="expandOrCollapseSearch(true)" />
          <!-- Searchbar is conditionally visible for desktop screens -->
          <BaseSearch
            v-if="isSearchExpanded"
            id="sidebarSearchInput"
            v-model="filterString"
            :show-image="true"
            :placeholder="$t('search')"
            class="search-bar-desktop"
            @blur="onSearchInputBlur()"
            @input="filterEntries($event, 'title')" />
          <!-- Searchbar is always visible for medium and mobile screens -->
          <BaseSearch
            v-model="filterString"
            :show-image="true"
            :placeholder="$t('search')"
            :class="['search-bar-mobile', { 'search-bar-mobile__visible': isSearchExpanded }]"
            @input="filterEntries($event, 'title')" />
        </div>
      </template>
      <template
        slot="option-actions">
        <BaseButton
          :text="$tc('publish', 2)"
          :disabled="isLoading"
          :has-background-color="false"
          icon-size="large"
          icon="eye"
          button-style="single"
          @clicked="handleAction('publish')" />
        <BaseButton
          :text="$tc('offline', 2)"
          :disabled="isLoading"
          :has-background-color="false"
          icon-size="large"
          icon="forbidden"
          button-style="single"
          @clicked="handleAction('offline')" />
        <BaseButton
          :text="$tc('duplicate', 2)"
          :disabled="isLoading"
          :has-background-color="false"
          icon-size="large"
          icon="duplicate"
          button-style="single"
          @clicked="duplicateEntries" />
        <BaseButton
          :text="$tc('delete', 2)"
          :disabled="isLoading"
          :has-background-color="false"
          icon-size="large"
          icon="waste-bin"
          button-style="single"
          @clicked="handleAction('delete')" />
      </template>
      <template
        v-slot:thumbnails="{ item }">
        <base-icon
          v-if="item.shared"
          name="people"
          class="base-entry-selector__entry__icon" />
        <base-icon
          v-if="item.published"
          name="eye"
          class="base-entry-selector__entry__icon" />
        <base-icon
          v-if="item.error"
          name="attention"
          class="base-entry-selector__entry__icon" />
        <base-icon
          v-if="item.has_media"
          name="attachment"
          class="base-entry-selector__entry__icon" />
        <base-icon
          v-if="item.archive_URI && getIsArchivalEnabled"
          name="archive-sheets"
          class="base-entry-selector__entry__icon" />
      </template>
    </BaseEntrySelector>
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import { entryHandlingMixin } from '@/mixins/entryHandling';
import { userInfo } from '@/mixins/userInfo';
import { getLangLabel } from '@/utils/commonUtils';
import variables from '@/styles/exports.module.scss';

export default {
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
     * whether the import button is to be shown; e.g. this is not required
     * when the sidebar instance is used on the "attach existing entries" pop-up
     */
    importEnabled: {
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
     * define if already linked entries should be excluded (done in BE)
     */
    excludeLinked: {
      type: Boolean,
      default: false,
    },
    /**
     * to disable the options button (eg. in popUps)
     */
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
      filterString: '',
      entryTypeConfig: {
        label: this.$t('dropdown.allTypes'),
        default: {
          label: {
            de: this.$t('dropdown.allTypes'),
            en: this.$t('dropdown.allTypes'),
          },
          source: '',
        },
        valuePropertyName: 'source',
      },
      sortConfig: {
        label: this.$t('dropdown.date_modified'),
        default: {
          label: this.$t('dropdown.date_modified'),
          value: 'date_modified',
        },
        valuePropertyName: 'value',
      },
      filterType: {},
      sortParam: {},
      entriesExist: false,
      noEntriesTitle: '',
      noEntriesSubtext: '',
      sidebarMenuHeight: '0px',
      entriesSelectable: false,
      // used to horizontally collapse/expand the sidebar's search input
      isSearchExpanded: true,
      // default entry types to render component immediately
      entryTypesInt: [{
        label: {
          de: this.$t('dropdown.allTypes'),
          en: this.$t('dropdown.allTypes'),
        },
        source: '',
      }],
      /**
       * timeout variable to not trigger entry calculation while
       * resize ongoing
       * @type {?number}
       */
      resizeTimeout: null,
      /**
       * resize observer to be triggered when menu list changes size
       * @type {?ResizeObserver}
       */
      resizeObserver: null,
      /**
       * store previous element height and width to only trigger entry number
       * calculation when window height and width actually changed
       * (this prevents a recalculation when the menu options are opened and
       * resize observer on menuList triggers would trigger)
       * @type {number}
       */
      prevHeight: 0,
      prevWidth: 0,
      /**
       * need variable to store recent route change to have it available in observer
       * to trigger a recalculation of menu list entry number
       * @type {boolean}
       */
      routeChanged: false,
    };
  },
  computed: {
    ...mapGetters('data', [
      'getIsArchivalEnabled',
    ]),
    activeEntry() {
      if (!this.hideActive && this.activeEntryId) {
        return this.listInt.map((entry) => entry.id).indexOf(this.activeEntryId);
      }
      return -1;
    },
    activeEntryId() {
      return this.$route.params.id || null;
    },
    calcStyle() {
      return this.height ? { height: this.height } : {};
    },
    isNewForm() {
      return this.$route.name === 'newEntry';
    },
    isImportPage() {
      return this.$route.path === '/import';
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
        {
          label: this.$t('dropdown.date_modified'),
          value: 'date_modified',
        },
      ];
    },
    entryTypes() {
      return this.$store.getters['data/getEntryTypes'];
    },
    windowWidth() {
      return this.$store.state.data.windowWidth;
    },
    isMobile() {
      return !!this.windowWidth && this.windowWidth <= 640;
    },
    ...mapGetters('data', [
      'getCurrentItemData',
    ]),
    /**
     * Returns true if sidebar head buttons such as 'New' or 'Import'
     * are to be rendered in minimized state (i.e. without text and limited width).
     */
    isButtonMinimized() {
      return this.isSearchExpanded && this.$route.path !== '/';
    },
    /**
     * Returns true if sidebar head buttons such as 'New' or 'Import'
     * are to be rendered in maximized state (i.e. with text and full width).
     */
    isButtonMaximized() {
      return !this.isSearchExpanded && this.$route.path !== '/';
    },
  },
  watch: {
    entryTypes(val) {
      if (val) {
        this.entryTypesInt = val;
      }
    },
    list(val) {
      this.listInt = val.map((entry) => ({
        ...entry,
        icon: entry.icon && entry.icon.includes('calendar-many')
          ? 'calendar-many' : 'file-object',
      }));
    },
    $route(to, from) {
      this.setInfoText();
      if (!(from.name === to.name || from.name.includes(to.name) || to.name.includes(from.name))) {
        this.expandOrCollapseSearch();
      }
      // if a switch from or to Dashboard occurs the sidebar width changes and entry number should
      // be re-calculated - therefore save in variable that route changed so resize observer can
      // trigger recalculation
      if (from.name === 'Dashboard' || to.name === 'Dashboard') {
        this.routeChanged = true;
      }
    },
    getCurrentItemData(val) {
      // whenever the active store entry gets an archive_URI,
      // find the relevant menu entry in sidebar and set the archive_URI property
      // so as to display the "archived" icon
      if (val && val.archive_URI) {
        const archivedEntryIndex = this.listInt.findIndex((entry) => entry.id === val.id);
        if (this.listInt[archivedEntryIndex]) {
          this.listInt[archivedEntryIndex].archive_URI = val.archive_URI;
        }
      }
    },
  },
  created() {
    this.expandOrCollapseSearch();
  },
  mounted() {
    this.listInt = this.list.map((entry) => ({
      ...entry,
      icon: entry.icon && entry.icon.includes('calendar-many')
        ? 'calendar-many' : 'file-object',
    }));

    this.$store.dispatch('data/fetchEntryTypes');

    if (this.selectActive) {
      this.entriesSelectable = true;
    }
    this.initObserver();
  },
  destroyed() {
    this.resizeObserver.disconnect();
  },
  methods: {
    /**
     * function to initialize the resize observer necessary to adapt
     * sidebar entry list (number of displayed items) on resize events
     */
    initObserver() {
      // create an observer
      const tempResizeObserver = new ResizeObserver((elements) => {
        const menuListHeight = elements[0].contentRect.height;
        // first check if resize of element was caused by a route change
        if (this.routeChanged) {
          this.calculateSidebarHeight(menuListHeight);
          this.routeChanged = false;
          // if not go the regular timeout way
        } else {
          // when triggered call timeout function
          this.setResizeTimeout(menuListHeight);
        }
      });
      // put it on the relevant element
      tempResizeObserver.observe(this.$refs.menuSidebarEntries.$refs.body);
      // store it
      this.resizeObserver = tempResizeObserver;
    },
    fetchEntries(request) {
      this.sortParam = request.sort;
      this.filterType = request.type;
      this.pageNumber = request.page;
      this.fetchSidebarData();
    },
    showEntry(id) {
      this.$emit('show-entry', 'goToEntry', id);
    },
    selectEntry(evt) {
      this.selectedMenuEntries = evt;
      // TODO: check if selectedEntries should also be handled internally
      this.$emit('selected-changed', this.selectedMenuEntries);
    },
    getNewForm() {
      this.$store.commit('data/deleteCurrentItem');
      this.$store.commit('data/deleteParentItems');
      this.$emit('new-form', 'goToNew');
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
          if (val.length === 0 || val.length > 2) {
            this.fetchSidebarData();
          }
        }, 600);
      }
      this.pageNumber = 1;
    },
    async duplicateEntries() {
      if (this.selectedMenuEntries.length) {
        this.isLoading = true;
        // dispatch selected entries to be duplicated and successfully duplicated ids are returned
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
        // if any entries were successfully duplicated route to the new entry
        if (duplicatedNumber) {
          this.selectedMenuEntries = [];
          await this.fetchSidebarData();
          await this.$router.push(`/entry/${routingIds.pop()}`);
        }
        this.entriesSelectable = false;
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
        .some((entry) => entry.id === this.activeEntryId);
      await this.actionEntries(action);
      this.selectedMenuEntries = [];
      this.entriesSelectable = false;
      await this.fetchSidebarData();
      // if the form was open and the item was selected for deletion a redirect to dashboard
      // will be done
      if (action === 'delete') {
        try {
          // update user quota in case any of the deleted entries had files attached
          await this.$store.dispatch('PortfolioAPI/fetchUser');
        } catch (e) {
          console.error(e);
        }
        if (currentSelected) {
          await this.$router.push('/');
        }
      } else if ((action === 'publish' || action === 'offline') && currentSelected) {
        this.$emit('update-publish-state', action === 'publish');
      }
    },
    setResizeTimeout(height) {
      // get window inner height
      const { innerHeight, innerWidth } = window;
      // only trigger recalculation of sidebar height when actual window height
      // has changed or switch was between mobile/tablet/desktop
      if (innerHeight !== this.prevHeight
        || innerWidth !== this.prevWidth) {
        // check if there is a timeout already set and clear it if yes
        if (this.resizeTimeout) {
          clearTimeout(this.resizeTimeout);
          this.resizeTimeout = null;
        }
        // then set time out new
        this.resizeTimeout = setTimeout(() => {
          this.calculateSidebarHeight(height);
        }, 500);
        // set previous height to new measurement
        this.prevHeight = innerHeight;
        this.prevWidth = innerWidth;
      }
    },
    async fetchSidebarData() {
      this.isLoading = true;
      try {
        let offset = (this.pageNumber - 1) * this.entriesPerPage;
        let response = await this.dataRequest(offset);
        // should there be not enough entries to give results with the current offset
        // try again with a offset 0
        if (offset && offset >= response.count) {
          offset = 0;
          this.pageNumber = 1;
          response = await this.dataRequest(offset);
        }
        this.listInt = response.results
          .map((entry) => ({
            ...entry,
            description: entry.type && entry.type.label ? getLangLabel(entry.type.label) : '',
            icon: entry.icon && entry.icon.includes('calendar-many')
              ? 'calendar-many' : 'file-object',
          }));
        this.entryNumber = response.count;
        if (!this.entryNumber) {
          this.setInfoText();
        }
        // check if this was a general data request (no filters etc)
        // to determine if entries exist at all
        if (!(this.filterType.source || this.filterString)) {
          this.entriesExist = !!this.entryNumber;
        }
        this.$emit('sidebar-data-changed');
        this.isLoading = false;
      } catch (e) {
        if (axios.isCancel(e)) {
          console.warn(e.message);
        } else if (e.response && e.response.status !== 403) {
          this.isLoading = false;
          console.error(e);
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.entryFetchFail'),
            text: this.$t('notify.entryFetchFailSub'),
            type: 'error',
          });
        } else {
          console.error(e);
          this.isLoading = false;
        }
      }
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
    calculateSidebarHeight(bodyHeight) {
      // store the previous entries per page number in order to be able
      // to only trigger entry re-fetching if number changes
      const previousEntriesPerPage = this.entriesPerPage;
      // determine row height
      // get the current font size for px calculation from rem and convert to number
      let { fontSize } = getComputedStyle(document.getElementsByTagName('body')[0]);
      fontSize = Number(fontSize.replace('px', ''));
      // get row height and border width from scss variables and also convert to numbers
      const rowHeight = Number(variables.rowHeightLarge.replace('rem', ''));
      const border = Number(variables.borderWidth.replace('px', ''));
      // now calculate the actual entry height - should currently be either
      // 50px (mobile) or 59px (> mobile)
      const entryHeight = (rowHeight * fontSize) + border;

      // calculate menuList height
      // first get pagination height - this is important because on first page load the
      // pagination is not there yet and therefore menuList values to large
      // if this is not first page load we dont need to subtract pagination --> 0
      const paginationHeight = this.$refs.menuSidebarEntries
      && this.$refs.menuSidebarEntries.$refs
      && this.$refs.menuSidebarEntries && this.$refs.menuSidebarEntries.$refs.pagination
      && this.$refs.menuSidebarEntries.$refs.pagination.$el.clientHeight
        ? 0 : 32 + 16;
      // now subtract the value depending if its first pageload (48) or not (0) from the
      // observer provided list height
      const menuListHeight = bodyHeight - paginationHeight;

      // calculate the actual entries fitting the area
      const numberOfEntries = Math.floor(menuListHeight / entryHeight);

      // then either use this number OR if its less then 4 - 4 entries min for entries
      // to display
      this.entriesPerPage = numberOfEntries > 4 ? numberOfEntries : 4;
      // finally check if calculation changed the number of entries per page
      if (previousEntriesPerPage !== this.entriesPerPage) {
        // after everything was calculated refetch sidebar data
        this.fetchSidebarData();
      }
    },
    setInfoText() {
      if (this.entriesExist && (this.filterString || this.filterType.source)) {
        this.noEntriesTitle = this.$t('noMatchingEntriesTitle');
        this.noEntriesSubtext = this.$t('noMatchingEntriesSubtext');
      } else if (this.excludeLinked) {
        this.noEntriesTitle = this.$t('noLinkEntriesTitle');
        this.noEntriesSubtext = this.$t('noLinkEntriesSubtext');
      } else if (this.isNewForm) {
        this.noEntriesTitle = this.$t('noEntriesTitle', { action: this.$t('actionSave') });
        this.noEntriesSubtext = this.$t('noEntriesFormSubtext');
      } else {
        this.noEntriesTitle = this.$t('noEntriesTitle', { action: this.$t('actionCreate') });
        this.noEntriesSubtext = this.$t('noEntriesMainSubtext');
      }
    },
    resetFilters() {
      this.filterString = '';
      this.filterType = {
        label: this.$t('dropdown.allTypes'),
        source: '',
      };
    },
    checkContainerPosition() {
      if (this.listInt.length && this.$refs.sidebarHead) {
        // check sidebar head position for whole page scroll and menuContainer position
        // for container scrolling
        this.sidebarBelow = (this.isMobile && this.optionsVisible
          && this.$refs.sidebarHead.offsetTop > 0)
          || this.$refs.menuContainer.scrollTop > 0;
      }
    },
    /**
     * Triggers a (horizontally) collapsed or an expanded state for the search input
     * of the sidebar.
     */
    expandOrCollapseSearch(forceExpand = false) {
      // expand the search in the following cases: (a) we are on root page
      // (b) import is disabled (c) forceExpand flag is true
      if (this.$route.path === '/' || !this.importEnabled || forceExpand) {
        this.isSearchExpanded = true;
        // set focus on the search input
        this.$nextTick(() => {
          const inputEl = document.querySelector('#sidebarSearchInput');
          if (inputEl) {
            inputEl.focus();
          }
        });
      } else {
        this.isSearchExpanded = false;
      }
    },
    /**
     * Occurs when the sidebar search input loses focus
     */
    onSearchInputBlur() {
      // collapse search input if text is empty
      if (!this.filterString.length) {
        this.expandOrCollapseSearch();
      }
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

    .menu-sidebar__options {
      border: red;
    }

    .base-row-with-form {
      overflow: hidden;
    }

    .base-row-button {
      max-width: 100%;
      border-right: $separation-line;
    }

    .minimized {
      width: 3rem;
    }

    .maximized {
      width: 100%;
    }

    .search-bar-mobile {
      display: none;
    }
  }

  .base-icon.base-entry-selector__entry__icon {
    width: $icon-small;
    height: $icon-small;
  }

  // special width dictated by header / footer component
  @media screen and (max-width: 1083px) {
    .menu-sidebar {
      height: calc(100vh - #{$header-height} - #{$row-height-small} - 131px);

      .search-bar-desktop {
        display: none;
      }

      .search-bar-mobile {
        display: none;

        &__visible {
          display: block;
        }
      }
    }
  }

  @media screen and (max-width: $tablet) {
    .menu-sidebar {
      height: calc(100vh - #{$header-height} - #{$row-height-small} - 131px);

      .base-row-with-form {
        height: auto;
        flex-wrap: wrap;

        .base-row-button {
          width: 100%;
          border-right: none;
          border-bottom: $separation-line;
        }

        .search-button {
          display: none !important;
        }

        .search-bar-desktop {
          display: none;
        }

        .search-bar-mobile {
          display: block;
        }
      }
    }
  }

  @media screen and (max-width: $mobile) {
    .base-button {
      border-right: none !important;

      &.base-button-row {
        width: 50%;
        border-bottom: $separation-line;
        transition: color 250ms ease-in-out;

        &:first-child {
          width: calc(50% - #{$border-width});
          margin-right: $border-width;
        }
      }
    }

    .search-button {
      display: none !important;
    }

    .menu-sidebar {
      height: calc(100vh - #{$header-height} - (2 * #{$spacing}));

      .search-bar-mobile {
        display: block;
        border-left: none;
      }

      .search-bar-desktop {
        display: none;
      }
    }
  }
</style>
