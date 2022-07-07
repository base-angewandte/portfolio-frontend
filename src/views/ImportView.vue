<template>
  <div class="import-page">
    <!-- HEADER ROW -->
    <!-- Searchbar or Uploaded Files are shown -->
    <BaseRow
      :disable-save-button="!selectedRecords.length"
      :buttons="[{
                   action: 'importAll',
                   disabled: false,
                   icon: 'download',
                   text: 'import.importAll',
                   unsavedChanges: false,
                   visible: !!results.length && !!importedFileNames.length,
                 },
                 {
                   action: 'importSelected',
                   disabled: !selectedRecords.length,
                   icon: 'download',
                   text: 'import.importSelected',
                   unsavedChanges: !!selectedRecords.length,
                   visible: !!results.length,
                 }]"
      :save-button-text="'import.importSelected'"
      :save-button-icon="'download'"
      :show-search="!importedFileNames.length"
      :show-back-button="false"
      :show-mobile-back-button="!results.length"
      :show-remove-button="!!importedFileNames.length"
      :show-save-button="!!results.length"
      :title="importedFileNames"
      :unsaved-changes="!!selectedRecords.length"
      @return="cancelImport"
      @remove="resetSearch"
      @search="runSearch"
      @save="onImport" />

    <!-- HANDLE FILE UPLOAD(s) -->
    <label
      v-if="dropboxVisible">
      <BaseDropBox
        :box-size="{ width: 'calc(100%)', height: '250px'} "
        :icon="'add-new-object'"
        :text="$t('import.attachBibTex')"
        :subtext="$t('import.clickordrag')"
        class="drop-box"
        @dropped-file="handleFileSelect($event)" />
      <input
        ref="fileInput"
        type="file"
        accept=".bib"
        multiple
        class="hide"
        @click="resetInput"
        @change="handleFileSelect">
    </label>

    <!-- BIBTEX PARSER -->
    <BibtexParser
      v-if="!!filesToUpload.length"
      :file-list="filesToUpload"
      :enable-publishing="false"
      @cancel="resetFiles"
      @import-failed="onBibtexImportFailed($event)"
      @success="onBibtexFilesParsed($event)" />

    <!-- RESULTS -->
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
        data-e2e-import-results-options
        @selected="selectAll">
        <template v-slot:selectedText>
          {{ `${selectedRecords.length}/${results.length}
              ${$t('entriesSelected', { type: $tc('entry', results.length) })}` }}
        </template>
      </BaseSelectOptions>
      <BaseLoader
        v-if="isLoading"
        data-e2e-import-loading
        class="loader" />
      <SelectableAccordion
        v-if="results && results.length && !isLoading"
        :list="currentPageRecords"
        :selected-list="selectedIds"
        :expand-mode="'single'"
        data-e2e-import-results
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
              <tr
                v-if="item.authors">
                <td class="term-column">
                  {{ $t('import.contributor') }}
                </td>
                <td class="definition-column">
                  {{ item.authors.toString() }}
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
              <!-- This info currently only for debugging
              <tr>
                <td class="term-column">
                  Type
                </td>
                <td class="definition-column">
                  {{ item.type }}
                </td>
              </tr>
              <tr>
                <td class="term-column">
                  LAD24
                </td>
                <td class="definition-column">
                  {{ item.lad24 }}
                </td>
              </tr>
              <tr>
                <td class="term-column">
                  LDS16
                </td>
                <td class="definition-column">
                  {{ item.lds16 }}
                </td>
              </tr>
              <tr>
                <td class="term-column">
                  Description
                </td>
                <td class="definition-column">
                  {{ item.description }}
                </td>
              </tr>
              <tr>
                <td class="term-column">
                  Language
                </td>
                <td class="definition-column">
                  {{ item.language }}
                </td>
              </tr>
              <tr>
                <td class="term-column">
                  ISBN
                </td>
                <td class="definition-column">
                  {{ item.isbn }}
                </td>
              </tr>
              <tr>
                <td class="term-column">
                  DOI
                </td>
                <td class="definition-column">
                  {{ item.doi }}
                </td>
              </tr>
              <tr>
                <td class="term-column">
                  Pages
                </td>
                <td class="definition-column">
                  {{ item.pages }}
                </td>
              </tr>
              <tr>
                <td class="term-column">
                  Keywords
                </td>
                <td class="definition-column">
                  {{ item.keywords }}
                </td>
              </tr>
              <tr>
                <td class="term-column">
                  Is part of
                </td>
                <td class="definition-column">
                  {{ item.isPartOf }}
                </td>
              </tr>
              <tr>
                <td class="term-column">
                  Contributors
                </td>
                <td class="definition-column">
                  {{ item.contributors }}
                </td>
              </tr> -->
            </tbody>
          </table>
        </template>
      </SelectableAccordion>
    </div>

    <!-- TODO: should be like rest of the no results messages -->
    <div
      v-if="noResultsText"
      class="no-entries">
      <p class="no-entries-title">
        {{ $t('noMatchingEntriesTitle') }}
      </p>
      <p class="no-entries-subtext">
        {{ $t('noMatchingEntriesSubtext') }}
      </p>
    </div>

    <!-- PAGINATION -->
    <BasePagination
      v-if="results && results.length && !isLoading && pageCount > 1"
      :current="currentPage"
      :total="pageCount"
      data-e2e-import-results-pagination
      @set-page="currentPage = $event" />
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import BibtexParser from '@/components/BibtexParser';
import createEntryFromPrimo from '@/utils/primoMapper';
import createEntryFromBibtex from '@/utils/bibtexMapper';
import SelectableAccordion from '@/components/SelectableAccordion';
import BaseRow from '@/components/BaseRow';

const { CancelToken } = axios;
let cancel;

export default {
  name: 'ImportView',
  components: {
    BibtexParser,
    SelectableAccordion,
    BaseRow,
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
      // semicolon separated list of uploaded filenames
      importedFileNames: '',
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
    ...mapGetters('data', [
      'getPortfolioLangs',
    ]),
  },
  watch: {
    /**
     * Clear previous results/messages if search input is empty.
     */
    searchText() {
      if (this.searchText.length === 0) {
        this.resetSearch();
      } else {
        this.dropboxVisible = false;
      }
    },
  },
  async created() {
    await this.$store.dispatch('data/fetchIsoLanguages');
  },
  methods: {
    /**
     * Occurs when the search input changes.
     */
    runSearch(value) {
      this.searchText = value;

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
        const apiUrl = encodeURI(`${backendUrl}/autosuggest/v1/bibrecs/any,contains,${this.searchText}/`);
        // cancel previous request if there is any
        if (cancel) {
          cancel('a new request has started');
        }
        const response = await axios.get(apiUrl, {
          withCredentials: true,
          xsrfCookieName: 'csrftoken_portfolio',
          xsrfHeaderName: 'X-CSRFToken',
          headers: {
            'Accept-Language': this.$i18n.locale,
          },
          /* eslint-disable-next-line */
          cancelToken: new CancelToken(((c) => {
            cancel = c;
          })),
        });
        this.results = this.processResults(response.data);
        this.noResultsText = response.data.length ? '' : this.$t('form.noResult');
        // }
      } catch (e) {
        // on status code >= 300
        if (e.response && e.response.status) {
          console.error(`Error fetching search results. HTTP status code: ${e.response.status}`);
        } else if (axios.isCancel(e)) {
          console.warn('Request cancelled:', e.message);
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
        const result = {
          id: index,
          title: res.label.toString().substring(0, 255),
          subject: res.subject ? res.subject.toString().substring(0, 255) : '',
          authors: res.author ? res.author : '',
          year: res.creationdate ? res.creationdate.toString() : '',
          sourceName: 'primo',
          type: res.type ? res.type.toString() : '',
          lad24: res.lad24 ? res.lad24 : '',
          lds16: res.lds16 ? res.lds16.toString() : '',
          description: res.description ? res.description : '',
          language: res.language ? res.language : '',
          isbn: res.isbn ? res.isbn[0] : '',
          pages: res.pages ? res.pages[0] : '',
          isPartOf: res.ispartof ? res.ispartof.toString() : '',
          contributors: res.contributors ? res.contributors : '',
        };
        return result;
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
        this.selectedRecords = this.selectedRecords
          .filter((el) => el.id !== rec.id);
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
    async onImport(action) {
      if (action === 'importAll') {
        this.selectedRecords = this.results;
      }

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
            // initially, the portfolio entry to be created is an empty object
            let entry = {};
            // to create the entry, send the record to its respective mapper method;
            // 'primo' and 'bibtex' are valid values for sourceName
            switch (record.sourceName) {
            case 'primo':
              entry = createEntryFromPrimo(record, this.getPortfolioLangs);
              break;
            case 'bibtex':
              entry = createEntryFromBibtex(record);
              break;
            default:
              console.error('Unknown record type');
            }
            // dispatch the entry to the store for posting to API
            await this.$store.dispatch('data/addOrUpdateEntry', entry)
              .then((id) => {
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
      // cancel current search requests
      if (cancel) {
        cancel('search request has been canceled');
      }

      // reset states
      this.importedFileNames = '';
      this.searchText = '';
      this.results = [];
      this.noResultsText = '';
      this.selectedRecords = [];
      this.currentPage = 1;
      this.isBibtexImportInProgress = false;
      this.dropboxVisible = true;
    },
    /**
     * cancel import and route to dashboard
     */
    cancelImport() {
      this.resetSearch();
      this.$router.push('/');
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
    /**
     * reset filesToUpload when upload of files is complete
     */
    resetFiles() {
      this.filesToUpload = [];
    },
    onBibtexImportFailed(reason) {
      this.resetFiles();
      this.$notify({
        group: 'request-notifications',
        title: this.$t('import.failText'),
        text: this.$t('import.failSubtext', { error: reason }),
        type: 'error',
      });
      this.resetSearch();
    },
    onBibtexFilesParsed(data) {
      this.importedFileNames = this.filesToUpload.map((file) => file.name).join('; ');
      this.filesToUpload = [];
      this.results = this.processParsed(data);
      this.dropboxVisible = false;
      this.isBibtexImportInProgress = true;
    },
    processParsed(bibRecords) {
      return bibRecords.map((bibRecord, index) => {
        // use a regex to remove { and } from e.g. title
        const pattern = /{|}/g;
        const item = {
          id: index,
          // also trim long titles to 255 chars max
          title: this.getValue(bibRecord.entryTags, 'title')
            ? this.getValue(bibRecord.entryTags, 'title').replace(pattern, '').substring(0, 255) : '',
          keywords: this.getValue(bibRecord.entryTags, 'keywords')
            ? this.getValue(bibRecord.entryTags, 'keywords').replace(pattern, '') : '',
          authors: this.getValue(bibRecord.entryTags, 'author')
            ? this.getValue(bibRecord.entryTags, 'author').replace(pattern, '') : '',
          year: this.getValue(bibRecord.entryTags, 'year')
            ? this.getValue(bibRecord.entryTags, 'year') : '',
          pages: this.getValue(bibRecord.entryTags, 'pages')
            ? this.getValue(bibRecord.entryTags, 'pages') : '',
          isbn: this.getValue(bibRecord.entryTags, 'isbn')
            ? this.getValue(bibRecord.entryTags, 'isbn') : '',
          doi: this.getValue(bibRecord.entryTags, 'doi')
            ? this.getValue(bibRecord.entryTags, 'doi') : '',
          description: this.getValue(bibRecord.entryTags, 'abstract')
            ? this.getValue(bibRecord.entryTags, 'abstract').replace(pattern, '') : '',
          note: this.getValue(bibRecord.entryTags, 'note')
            ? this.getValue(bibRecord.entryTags, 'note').replace(pattern, '') : '',
          journal: this.getValue(bibRecord.entryTags, 'journal')
            ? this.getValue(bibRecord.entryTags, 'journal') : '',
          volume: this.getValue(bibRecord.entryTags, 'volume')
            ? this.getValue(bibRecord.entryTags, 'volume') : '',
          number: this.getValue(bibRecord.entryTags, 'number')
            ? this.getValue(bibRecord.entryTags, 'number') : '',
          sourceName: 'bibtex',
          type: bibRecord.entryType.toLowerCase(),
        };
        return item;
      });
    },
    /**
    * Return an object key's value regardless of the key's case.
    * See also https://stackoverflow.com/questions/12484386/access-javascript-property-case-insensitively
    * @param {Object} object
    * @param {string} key
    * @return {any} value
    */
    getValue(object, key) {
      const asLowercase = key.toLowerCase();
      return object[Object.keys(object)
        .find((k) => k.toLowerCase() === asLowercase)
      ];
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
}

.loader {
  color: $app-color;
  margin: 25vh 0 0 0;
}

.drop-box {
  margin: $spacing 0;
}

.results-container {
  margin: $spacing 0;
}

.no-entries {
  height: 100%;
  width: 100%;
  padding-top: 50px;

  .no-entries-title, .no-entries-subtext {
    text-align: center;
    color: $font-color-second;
    margin-bottom: $spacing;
    padding: 0 $spacing-large;
  }

  .no-entries-title {
    font-size: $font-size-large;
  }
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
</style>
