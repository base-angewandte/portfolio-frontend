<template>
  <div class="import-page">
    <BaseButton
      :text="$t('back')"
      icon="arrow-left"
      icon-size="small"
      button-style="row"
      class="back-button"
      @clicked="$router.push('/')" />
    <BaseSearch
      v-model="searchText"
      label="SearchInput"
      :placeholder="$t('import.searchCatalogueText')"
      show-image
      @input-change="runSearch" />
    <div class="results-container">
      <BaseSelectOptions
        v-if="results && results.length && !isLoading"
        :list="currentPageRecords"
        :selected-list="selectedIndexes"
        :selected-number-text="$t(
          'entriesSelected',
          { type: $tc('notify.entry', selectedIndexes.length) }
        )"
        :select-text="$t('selectAll')"
        :deselect-text="$t('selectNone')"
        @selected="selectAll" />
      <BaseLoader
        v-if="isLoading"
        loader-color="red"
        class="loader" />
      <BaseMenuList
        v-if="results && results.length && !isLoading"
        :list="currentPageRecords"
        :selected-list="selectedIndexes"
        :selected="true"
        @selected="selectRecord($event)" />
    </div>
    <BaseTextList
      v-if="noResultsText"
      class="no-results-container"
      render-label-as="h4"
      :data="[{ label: noResultsText }]" />
    <BasePagination
      v-if="results && results.length && !isLoading"
      :current="currentPage"
      :total="pageCount"
      @set-page="currentPage = $event" />
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ImportView',
  data() {
    return {
      // true while fetching results from the api server
      isLoading: false,
      // the text entered in the search input
      searchText: '',
      // the search results returned by the api
      results: [],
      // text to notify user when search retrieved no results
      noResultsText: '',
      // number of records per page
      recordsPerPage: 10,
      // current page number
      currentPage: 1,
      // the indices of currently selected entries
      selectedIndexes: [],
    };
  },
  computed: {
    /**
     * Returns the subset of results that are to be displayed on the current page.
     */
    currentPageRecords() {
      const records = Array.from(this.results);
      const start = this.currentPage * this.recordsPerPage - this.recordsPerPage;
      const end = start + this.recordsPerPage;
      return records.slice(start, end);
    },
    /**
     * Returns the total number of pages.
     */
    pageCount() {
      if (this.results) {
        if (this.results.length % this.recordsPerPage === 0) {
          return this.results.length / this.recordsPerPage;
        }
        return Math.ceil(this.results.length / this.recordsPerPage);
      }
      return 0;
    },
  },
  watch: {
    /**
     * Clear previous results/messages if search input is empty.
     */
    searchText() {
      if (this.searchText.length === 0) {
        this.results = [];
        this.noResultsText = '';
      }
    },
  },
  methods: {
    /**
     * Occurs when the search input changes.
     */
    runSearch() {
      // clear/reset values pertaining to previous search
      this.noResultsText = '';
      this.currentPage = 1;

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      // let quick key strokes not trigger an api call
      this.timeout = setTimeout(async () => {
        if (this.searchText.length >= 3) {
          this.isLoading = true;
          this.fetchSearchResults();
        } else {
          this.results = [];
        }
      }, 600);
    },
    /**
     * Retrieves search results from the API and populates
     * the 'results' data property.
     */
    async fetchSearchResults() {
      try {
        const backendUrl = `${process.env.VUE_APP_BACKEND_BASE_URL}${process.env.VUE_APP_BACKEND_PREFIX}`;
        const apiUrl = `${backendUrl}/autosuggest/v1/contributors/${encodeURI(this.searchText)}/`;
        const response = await axios.get(apiUrl, {
          withCredentials: true,
          xsrfCookieName: 'csrftoken_portfolio',
          xsrfHeaderName: 'X-CSRFToken',
          headers: {
            'Accept-Language': this.$i18n.locale,
          },
        });
        this.results = this.processResults(response.data);
        this.noResultsText = response.data.length ? '' : this.$t('form.noResult');
        // }
      } catch (e) {
        // on status code >= 300
        if (e.response && e.response.status) {
          console.error(`Error fetching search results. HTTP status code: ${e.response.status}`);
        } else {
          console.error(e);
        }
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * At the minimum, each search result retrieved from the API must have an id.
     * This method takes the raw results and converts them to an internal format
     * suitable for displaying them as a BaseMenuList (for now) component.
     */
    processResults(results) {
      return results.map((res, index) => {
        const entry = {
          id: index,
          title: res.label,
          description: res.source,
          sourceName: res.source_name,
        };
        return entry;
      });
    },
    /**
     * Select or deselect a single record.
     */
    selectRecord(evt) {
      const rec = this.currentPageRecords[evt.index];
      if (evt.selected) {
        this.selectedIndexes.push(rec.id);
      } else {
        // deselect, i.e. remove the record id from the selection
        this.selectedIndexes = this.selectedIndexes.filter((el) => el !== rec.id);
      }
    },
    /**
     * Select or deselect all records on the current page.
     */
    selectAll(val) {
      // get all records ids from the current page into an array
      const ids = this.currentPageRecords.map((rec) => rec.id);
      if (val) {
        // add all ids on current page to records that have been already selected
        this.selectedIndexes = this.selectedIndexes.concat(ids);
        // remove duplicate elements from the array;
        // deduplication is necessary e.g. when some individual records
        // were selected and then 'select all' was clicked
        this.selectedIndexes = Array.from(new Set(this.selectedIndexes));
      } else {
        // remove deselected record ids from the selection
        this.selectedIndexes = this.selectedIndexes.filter((id) => !ids.includes(id));
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.import-page {
  position: relative;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  top: $spacing;

  .back-button {
    display: none;
  }
}

.loader {
  top: 50%;
  transform: translateY(-50%);
}

.results-container {
  margin: $spacing 0;
}

.no-results-container {
  margin: $spacing 0;
  text-align: center;
}

@media screen and (max-width: $mobile) {
  .import-page {
    top: $spacing-small;
    .back-button {
      display: block;
      border-bottom: $separation-line;
      width: 100%;
    }
  }
}
</style>
