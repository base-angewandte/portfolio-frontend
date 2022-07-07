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
          :class="['base-row', { 'base-row-with-form': isNewForm || !!activeEntryId }]">
          <BaseButton
            v-if="newEnabled"
            :active="isNewForm"
            :text="$t('new')"
            :disabled="isLoading"
            icon="add-new-object"
            icon-size="large"
            class="base-row-button"
            button-style="row"
            @clicked="getNewForm" />
          <BaseSearch
            v-model="filterString"
            :show-image="true"
            :placeholder="$t('search')"
            class="search-bar"
            @input="filterEntries($event, 'title')" />
        </div>
      </template>
      <template
        slot="option-actions">
        <div
          ref="optionButtons">
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
        </div>
      </template>
      <template
        v-slot:thumbnails="{ item }">
        <base-icon
          v-if="item.shared"
          name="people" />
        <base-icon
          v-if="item.published"
          name="eye" />
        <base-icon
          v-if="item.error"
          name="attention" />
        <base-icon
          v-if="item.has_media"
          name="attachment" />
        <base-icon
          v-if="item.archive_URI && getIsArchivalEnabled"
          name="archive-sheets" />
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

      // default entry types to render component immediately
      entryTypesInt: [{
        label: {
          de: this.$t('dropdown.allTypes'),
          en: this.$t('dropdown.allTypes'),
        },
        source: '',
      }],
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
      return this.windowWidth && this.windowWidth <= 640;
    },
    ...mapGetters('data', [
      'getCurrentItemData',
    ]),
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
        // refetch sidebar data when switching from overview to form view and vice versa
        this.calculateSidebarHeight();
        this.fetchSidebarData();

        if (this.$refs.menuSidebarEntries
          && this.$refs.menuSidebarEntries.$refs.pagination) {
          this.$refs.menuSidebarEntries.$refs.pagination.setStartEnd();
        }
      }
    },
    windowWidth() {
      this.calculateSidebarHeight();
      this.fetchSidebarData();
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
  mounted() {
    this.listInt = this.list.map((entry) => ({
      ...entry,
      icon: entry.icon && entry.icon.includes('calendar-many')
        ? 'calendar-many' : 'file-object',
    }));
    this.calculateSidebarHeight();
    this.$store.dispatch('data/fetchEntryTypes');
    this.fetchSidebarData();

    if (this.selectActive) {
      this.entriesSelectable = true;
    }
  },
  methods: {
    fetchEntries(request) {
      this.sortParam = request.sort;
      this.filterType = request.type;
      this.pageNumber = request.page;
      this.fetchSidebarData();
    },
    showEntry(id) {
      this.$emit('show-entry', id);
    },
    selectEntry(evt) {
      this.selectedMenuEntries = evt;
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
    async fetchSidebarData() {
      this.calculateSidebarHeight();
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
    calculateSidebarHeight() {
      const { menuSidebarEntries } = this.$refs;
      const sidebarHeight = this.$refs.menuSidebar.clientHeight;
      const sidebarHeadHeight = menuSidebarEntries.$refs.head
        ? menuSidebarEntries.$refs.head.clientHeight
        : 0;
      const optionsButtonsHeight = this.$refs.optionButtons
        ? this.$refs.optionButtons.clientHeight
        : 0;

      // calculate usable content height for entries in sidebar,
      // taking expanded options height into account.
      this.sidebarMenuHeight = sidebarHeight - sidebarHeadHeight
        + optionsButtonsHeight;

      // deduct height and spacing for pagination element from sidebar height
      this.sidebarMenuHeight = this.sidebarMenuHeight - 48 - 16;

      // hardcoded because unfortunately no other possibility found
      const entryHeight = this.isMobile ? 48 : 57;
      const numberOfEntries = Math.floor(this.sidebarMenuHeight / entryHeight);
      this.entriesPerPage = numberOfEntries > 4 ? numberOfEntries : 4;
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
  }

  // special width dictated by header / footer component
  @media screen and (max-width: 1083px) {
    .menu-sidebar {
      height: calc(100vh - #{$header-height} - #{$row-height-small} - 131px);
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
          border-bottom: $separation-line;
        }
      }
    }
  }

  @media screen and (max-width: $mobile) {
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
  }
</style>
