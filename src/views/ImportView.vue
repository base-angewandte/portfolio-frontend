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
      v-if="!isBibtexImportInProgress"
      v-model="searchText"
      data-e2e-search-import-input
      label="SearchInput"
      :placeholder="$t('import.searchCatalogueText')"
      show-image
      @input="runSearch" />

    <label>
      <BaseDropBox
        v-if="dropboxVisible"
        :box-size="{ width: 'calc(100%)', height: '250px'} "
        :icon="'add-new-object'"
        :text="$t('import.attachBibTex')"
        :subtext="$t('import.clickordrag')"
        class="drop-box"
        @dropped-file="handleFileSelect($event)" />
      <input
        ref="fileInput"
        type="file"
        multiple
        class="hide"
        @click="resetInput"
        @change="handleFileSelect">
    </label>

    <BibtexParser
      v-if="!!filesToUpload.length"
      :file-list="filesToUpload"
      :enable-publishing="false"
      @cancel="resetFiles"
      @import-failed="onBibtexImportFailed($event)"
      @success="onBibtexFilesParsed($event)" />

    <div class="results-container">
      <BaseSelectOptions
        v-if="results && results.length && !isLoading"
        :list="currentPageRecords"
        :selected-list="selectedIds"
        :selected-number-text="$t(
          'entriesSelected',
          { type: $tc('notify.entry', selectedRecords.length) }
        )"
        :select-text="$t('selectAll')"
        :deselect-text="$t('selectNone')"
        @selected="selectAll" />
      <BaseLoader
        v-if="isLoading"
        loader-color="red"
        class="loader" />
      <SelectableAccordion
        v-if="results && results.length && !isLoading"
        :list="currentPageRecords"
        :selected-list="selectedIds"
        :expand-mode="'single'"
        @selected="selectRecord($event)">
        <template v-slot="{ item }">
          <table style="width: 100%">
            <tbody>
              <tr>
                <td class="term-column">
                  {{ $t('import.title') }}
                </td>
                <td class="definition-column">
                  {{ item.title }}
                </td>
              </tr>
              <tr>
                <td class="term-column">
                  {{ $t('import.responsible') }}
                </td>
                <td class="definition-column">
                  {{ item.responsible }}
                </td>
              </tr>
              <tr>
                <td class="term-column">
                  {{ $t('import.year') }}
                </td>
                <td class="definition-column">
                  {{ item.year }}
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </SelectableAccordion>
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
    <div
      v-if="results && results.length && !isLoading"
      class="buttons-container">
      <base-button
        :text="$t('cancel')"
        style="margin-right: 4px;"
        icon="remove"
        button-style="row"
        icon-size="small"
        @clicked="resetSearch" />
      <base-button
        :text="$t('import.importButtonTitle')"
        :disabled="!selectedRecords.length"
        icon="download"
        button-style="row"
        icon-size="small"
        @clicked="onImport" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import BibtexParser from '@/components/BibtexParser';
import SelectableAccordion from '@/components/SelectableAccordion';

export default {
  name: 'ImportView',
  components: {
    BibtexParser,
    SelectableAccordion,
  },
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
      // the currently selected records
      selectedRecords: [],
      // true if BibTex drop box is visible
      dropboxVisible: true,
      // bibtex files to upload
      filesToUpload: [],
      // true when import from bibtex file(s) is in progress
      isBibtexImportInProgress: false,
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
    /**
     * returns the ids of records that are currently selected
     */
    selectedIds() {
      return this.selectedRecords.map((record) => record.id);
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
        this.dropboxVisible = true;
      } else {
        this.dropboxVisible = false;
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
      this.selectedRecords = [];

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
     * This method takes the "raw" results and converts them to a structure
     * suitable for displaying them as an accordion component.
     */
    processResults(results) {
      return results.map((res, index) => {
        const entry = {
          // use dummy data for now
          id: index,
          title: res.source,
          subtitle: res.label.substring(0, res.label.indexOf('|'))
            ? res.label.substring(0, res.label.indexOf('|'))
            : res.label,
          responsible: res.label,
          year: '{ placeholder} ',
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
        this.selectedRecords.push(rec);
      } else {
        // deselect, i.e. remove the record id from the selection
        this.selectedRecords = this.selectedRecords.filter((el) => el.id !== rec.id);
      }
    },
    /**
     * Select or deselect all records on the current page.
     */
    selectAll(val) {
      if (val) {
        // add all records on current page to records that have been already selected
        this.selectedRecords = this.selectedRecords.concat(this.currentPageRecords);
        // remove duplicate elements from the array;
        // deduplication is necessary e.g. when some individual records
        // were selected and then 'select all' was clicked
        this.selectedRecords = Array.from(new Set(this.selectedRecords));
      } else {
        // get all records ids from the current page into an array
        const ids = this.currentPageRecords.map((rec) => rec.id);
        // remove deselected record ids from the selection
        this.selectedRecords = this.selectedRecords.filter((rec) => !ids.includes(rec.id));
      }
    },
    /**
     * Occurs when the "Import" button is clicked.
     */
    async onImport() {
      this.isLoading = true;
      await this.importSelected()
        .then((entryIds) => {
          // update the store about the import completed event
          // so as to trigger update of sidebar etc. in relevant components
          this.$store.commit('data/setImportedIds', entryIds);
          // reset the search
          this.resetSearch();
          // notify the user
          this.$notify({
            group: 'request-notifications',
            title: this.$t('import.successText'),
            text: this.$t('import.successSubtext', { count: entryIds.length }),
            type: 'success',
          });
        })
        .catch((err) => {
          this.$notify({
            group: 'request-notifications',
            title: this.$t('import.failText'),
            text: this.$t('import.failSubtext', { error: err }),
            type: 'error',
          });
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    /**
     * Performs a batch import, i.e. creates new entries for each of the selected records.
     */
    async importSelected() {
      return Promise.all(this.selectedRecords
      // eslint-disable-next-line no-async-promise-executor
        .map((record) => new Promise(async (resolve, reject) => {
          try {
            await this.$store.dispatch('data/addOrUpdateEntry', {
              title: record.title,
              subtitle: record.subtitle,
              type: {
                source: 'http://base.uni-ak.ac.at/portfolio/taxonomy/scientific_publication',
                label: { de: 'wissenschaftliche Veröffentlichung', en: 'Scientific Publication' },
              },
              data: {
                authors: [
                  {
                    label: record.responsible,
                    source: record.title,
                    roles: [
                      {
                        source: 'http://base.uni-ak.ac.at/portfolio/vocabulary/author',
                        label: { de: 'Autor*in', en: 'author' },
                      },
                    ],
                  },
                ],
              },
            }).then((id) => {
              resolve(id);
            }).catch((e) => {
              console.error(e);
              reject(e);
            });
          } catch (e) {
            console.error(e);
            reject(e);
          }
        })));
    },
    /**
     * Resets the search controls and data to initial state.
     * Occurs when the "Cancel" button is clicked or the import has completed.
     */
    resetSearch() {
      this.searchText = '';
      this.results = [];
      this.noResultsText = '';
      this.selectedRecords = [];
      this.currentPage = 1;
      this.isBibtexImportInProgress = false;
      this.dropboxVisible = true;
    },
    handleFileSelect(e) {
      const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
      if (files && files.length) {
        for (let i = 0; i < files.length; i += 1) {
          this.filesToUpload.push(files[i]);
        }
      }
    },
    // reset file input value everytime the file dialogue is opened
    resetInput() {
      this.$refs.fileInput.value = '';
    },
    // when upload of files complete reset the variable
    resetFiles() {
      this.filesToUpload = [];
    },
    onBibtexImportFailed(reason) {
      this.filesToUpload = [];
      this.$notify({
        group: 'request-notifications',
        title: this.$t('import.failText'),
        text: this.$t('import.failSubtext', { error: reason }),
        type: 'error',
      });
      this.resetSearch();
    },
    onBibtexFilesParsed(data) {
      this.filesToUpload = [];
      this.results = this.processParsed(data);
      this.dropboxVisible = false;
      this.isBibtexImportInProgress = true;
    },
    processParsed(records) {
      return records.map((res, index) => {
        const entry = {
          id: index,
          title: res.entryTags.title ? res.entryTags.title : '',
          subtitle: res.entryTags.keywords ? res.entryTags.keywords : '',
          responsible: res.entryTags.author ? res.entryTags.author : '',
          year: res.entryTags.year ? res.entryTags.year : '',
          sourceName: 'BibTex File',
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

.drop-box {
  margin: $spacing 0;
}

.results-container {
  margin: $spacing 0;
}

.no-results-container {
  margin: $spacing 0;
  text-align: center;
}

.buttons-container {
  display: flex;
  padding: $spacing;
  justify-content: center;
}

.term-column {
  width: 15%;
  font-size: $font-size-small;
}

.definition-column {
  font-size: $font-size-small;
  color: $font-color-second;
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
