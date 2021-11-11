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
    <BaseLoader
      v-if="isLoading"
      loader-color="red"
      class="loader" />
    <BaseMenuList
      v-if="results && results.length && !isLoading"
      class="results-container"
      :list="results"
      :selected="true" />
    <BaseTextList
      v-if="noResultsText"
      class="no-results-container"
      render-label-as="h4"
      :data="[{ label: noResultsText }]" />
  </div>
</template>

<script>
import axios from 'axios';

export default {
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
    };
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
      this.noResultsText = '';

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      if (this.searchText.length >= 3) {
        this.isLoading = true;
        // let quick key strokes not trigger an api call
        this.timeout = setTimeout(async () => {
          this.fetchSearchResults();
        }, 600);
      } else {
        this.results = [];
      }
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
