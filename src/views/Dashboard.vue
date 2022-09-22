<template>
  <div id="app-container">
    <h1 class="hide">
      {{ $t('myPortfolio') }}
    </h1>
    <BasePopUp
      ref="sidebarPopUp"
      :show="showPopUp"
      :title="capitalizeFirstLetter($store.state.data.popUp.header)"
      :button-left-text="capitalizeFirstLetter($store.state.data.popUp.buttonTextLeft)
        || $t('cancel')"
      :button-right-text="capitalizeFirstLetter($store.state.data.popUp.buttonTextRight)"
      :button-right-icon="$store.state.data.popUp.icon"
      :is-loading="$store.state.data.popUp.isLoading"
      is-open-focus="#popup-right-button"
      description-element-id="sidebar-pop-up-title"
      @close="cancelAction"
      @button-left="cancelAction($store.state.data.popUp.actionLeft)"
      @button-right="$store.state.data.popUp.actionRight()">
      <div class="sidebar-pop-up">
        <div class="pop-up-text-container">
          <p
            id="sidebar-pop-up-title"
            class="sidebar-pop-up-title">
            {{ $store.state.data.popUp.textTitle }}
          </p>
          <ul
            class="sidebar-pop-up-text">
            <li
              v-for="(title, index) in $store.state.data.popUp.textList"
              :key="index"
              class="sidebar-pop-up-text-row">
              <span class="sidebar-pop-up-text-row-marks">"</span>
              <span class="sidebar-pop-up-text-row-text">{{ title + '\n' }}</span>
              <span class="sidebar-pop-up-text-row-marks">"</span>
            </li>
          </ul>
        </div>
      </div>
    </BasePopUp>

    <BaseMediaCarousel
      :show-preview="showPreview"
      :initial-slide="initialPreviewSlide"
      :items="mediaPreviewData"
      :info-texts="{
        download: $t('form-view.download'),
        view: $t('form-view.view'),
      }"
      @hide="showPreview = false"
      @download="downloadFile" />

    <h2
      v-if="!showForm"
      class="hide">
      {{ $t('entryOverview') }}
    </h2>
    <Sidebar
      ref="sidebar"
      :class="['sidebar', { 'sidebar-full': !showForm, 'sidebar-hidden-mobile': showForm }]"
      @new-form="checkUnsavedChanges"
      @show-entry="checkUnsavedChanges"
      @import-entries="checkUnsavedChanges"
      @update-publish-state="updateFormData" />
    <main
      v-if="showForm"
      class="form-view">
      <router-view
        ref="view"
        @show-preview="openMediaPreview"
        @data-changed="updateSidebarData" />
    </main>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { capitalizeString, getApiUrl, getLangLabel } from '@/utils/commonUtils';
import Sidebar from '../components/Sidebar';

export default {
  components: {
    Sidebar,
  },
  data() {
    return {
      // show baseMediaCarousel
      showPreview: false,
      // slide to open if preview is enabled
      initialPreviewSlide: null,
    };
  },
  computed: {
    ...mapGetters({
      importedIds: 'data/getImportedIds',
    }),
    showForm() {
      return this.$route.name !== 'Dashboard';
    },
    showPopUp() {
      return this.$store.state.data.popUp.show;
    },
    /**
     * media preview items to display
     *
     * @returns {*[]} - filtered array
     */
    mediaPreviewData() {
      // filter still processing files beforehand
      return this.serializeMediaPreviewData(this.$store.state.data.linkedMedia)
        .filter((item) => !item.processing);
    },
  },
  watch: {
    $route() {
      if (!this.showForm || this.$route.name === 'newEntry') {
        this.$store.commit('data/deleteCurrentItem');
      }
      this.$store.commit('data/setNewForm', this.$route.name === 'newEntry');
    },
    // upon successful import of entries, update the sidebar and open the topmost entry
    async importedIds(val) {
      await this.updateSidebarData(true);
      // get the first entry that was imported
      const lastId = val[val.length - 1];
      // open form of first imported entry
      this.routeToEntry(lastId);
    },
  },
  mounted() {
    this.$store.commit('data/setNewForm', this.$route.name === 'newEntry');
    // when user presses browser back button put preview to false in case its open!
    window.addEventListener('popstate', () => {
      this.showPreview = false;
    });
  },
  methods: {
    createNewForm() {
      const formView = this.$refs.view;
      // only push route when it is not the same as previous
      // --> form will not be reset - do it here manually
      if (this.$route.name === 'newEntry') {
        if (formView && formView.resetForm) {
          formView.resetForm();
        }
      } else {
        this.$router.push('/new');
      }
    },
    checkUnsavedChanges(action, id) {
      const followUpAction = () => {
        // remove leftover stored values before entering new item;
        sessionStorage.removeItem('valueList');
        sessionStorage.removeItem('parent');
        if (id) {
          this.routeToEntry(id);
        } else {
          switch (action) {
          case 'goToNew':
            this.createNewForm();
            break;
          case 'goToImport':
            if (this.$route.name !== 'importEntries') {
              this.$router.push('/import');
            }
            break;
          default:
            console.error('An unknown route/action was requested.');
          }
        }
      };
      if (this.$refs.view && this.$refs.view.unsavedChanges) {
        this.$store.commit('data/setPopUp', {
          show: true,
          header: this.$t('notify.unsavedChangesTitle'),
          textTitle: this.$t('notify.unsavedChangesText'),
          textList: [],
          icon: 'save-file',
          buttonTextRight: this.$t('notify.saveChanges'),
          buttonTextLeft: this.$t('notify.dismissChanges'),
          actionRight: async () => {
            try {
              const saveSuccess = await this.$refs.view.saveForm(false);
              if (saveSuccess) {
                followUpAction();
              }
            } catch (e) {
              console.error(e);
            }
            this.$store.commit('data/hidePopUp');
          },
          actionLeft: () => { followUpAction(); },
        });
      } else {
        followUpAction();
      }
    },
    routeToEntry(id) {
      this.$store.commit('data/deleteParentItems');
      // navigation to currently active route seems not allowed (error message DuplicationError)
      // but not necessary anyways --> just delete unsaved changes
      if (this.$route.params.id === id) {
        const formComponent = this.$refs.view;
        formComponent.valueList = JSON.parse(JSON.stringify(formComponent.valueListOriginal));
      } else {
        this.$router.push(`/entry/${id}`);
      }
    },
    cancelAction(action) {
      if (action) {
        action();
      }
      this.$store.commit('data/hidePopUp');
    },
    scrollAction(evt) {
      // disable page scrolling
      evt.preventDefault();
      // TODO: image zoom?
    },
    async updateSidebarData(alwaysUpdate) {
      if (!this.$refs.sidebar.entriesExist) {
        this.$refs.sidebar.resetFilters();
      }
      const activeSidebarEntryIndex = this.$refs.sidebar.activeEntry;
      const activeSidebarEntry = this.$refs.sidebar.listInt[activeSidebarEntryIndex];
      // only fetching entries if
      // a) parameter is set (for updating publish state and media)
      // b) entry is new entry
      // c) sorting is last modified and entry is not the first one
      // d) title or type have changed
      if (alwaysUpdate
        || !this.$refs.view.currentItemId
        || (this.$refs.sidebar.sortParam.value === 'date_modified' && this.$refs.sidebar.activeEntry !== 0)
        || (activeSidebarEntry
          && (activeSidebarEntry.title !== this.$refs.view.title
            || ((!activeSidebarEntry.type && this.$refs.view.type)
              || (activeSidebarEntry.type
                && getLangLabel(activeSidebarEntry.type.label, this.$i18n.locale)
                !== this.$refs.view.type))))) {
        await this.$refs.sidebar.fetchSidebarData();
      }
    },
    updateFormData(published) {
      const formView = this.$refs.view;
      if (formView && formView.valueList) {
        this.$set(formView.valueList, 'published', published);
        this.$set(formView.valueListOriginal, 'published', published);
      }
    },
    capitalizeFirstLetter(text) {
      if (text) {
        return capitalizeString(text);
      }
      return '';
    },
    async downloadFile({ url, name }) {
      try {
        const link = document.createElement('a');
        link.href = `${url}?download`;
        link.setAttribute('download', name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        this.showPreview = false;
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.somethingWrong'),
          text: `An error occured during the download of file ${name}`,
          type: 'error',
        });
      }
    },
    /**
     * get media title from source url
     * @param source
     * @returns {string}
     */
    mediaTitle(source) {
      const match = source.match(/([^/]+)$/);
      return match ? decodeURI(match[1]) : '';
    },
    /**
     * add baseUrl to media sources
     *
     * @param {Array} previews - array with media objects
     * @returns {*} - modified array with media objects
     */
    mediaPreviews(previews) {
      return previews.map((elem) => {
        const key = Object.keys(elem);
        const withBaseUrl = [];
        withBaseUrl[key] = getApiUrl(elem[key]);
        return withBaseUrl;
      });
    },
    /**
     * set info text for media item footer
     *
     * @param {Object} item - media object
     * @returns {*[]}
     */
    mediaInfoText(item) {
      if (item === null) return [];
      const infoStringArray = [];
      if (item.license) {
        infoStringArray.push(`${this.$t('license')}: ${getLangLabel(item.license.label, this.$i18n.locale, true)}`);
      }
      if (item.archive_URI && item.archive_URI !== '') {
        infoStringArray.push(`Archive-ID: ${item.archive_id}`);
      }
      infoStringArray.push(`${this.$t('status')}: ${item.published
        ? this.$t('public') : this.$t('private')}`);
      return infoStringArray;
    },
    /**
     * serialize data for media preview
     *   add mediaUrl, previews, displaySize, title, processing state
     *
     * @param {Array} data - array with preview objects
     * @returns {Array} - modified data
     */
    serializeMediaPreviewData(data) {
      // add baseUrl to src for local development
      const baseUrl = process.env.VUE_APP_BACKEND_BASE_URL;

      return data.map((item) => {
        let obj;

        // audio
        if (item.type === 'a') {
          obj = {
            mediaUrl: `${baseUrl}${item.mp3}`,
          };
        }

        // image
        if (item.type === 'i') {
          obj = {
            mediaUrl: `${baseUrl}${item.original}`,
            // check if medium is still converting
            previews: item.previews ? this.mediaPreviews(item.previews) : [],
            displaySize: item.previews ? {
              // use largest preview image size and set to max-width to respect intrinsic size
              'max-width': `${parseInt(Object.keys(item.previews.slice(-1)[0]), 10)}px`,
            } : {},
          };
        }

        // video
        if (item.type === 'v') {
          obj = {
            mediaPosterUrl: `${baseUrl}${item.poster}`,
            mediaUrl: `${baseUrl}${item.playlist}`,
            displaySize: { 'max-width': '1200px', width: '100%' },
            hlsStartLevel: 2,
          };
        }

        // document or undefined
        if (item.type === 'd' || item.type === 'x') {
          obj = {
            mediaUrl: `${baseUrl}${item.original}`,
          };
        }

        return {
          id: item.id,
          title: this.mediaTitle(item.original),
          additionalInfo: this.mediaInfoText(item),
          processing: item.response_code !== 200,
          ...obj,
        };
      });
    },
    /**
     * open media in preview carousel
     *
     * @param {Object} fileData - media item to open
     */
    openMediaPreview(fileData) {
      // if file is already converted
      // a) check for response_code - 202 means it is still converting
      if (fileData.response_code === 202) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.displayImage'),
          text: this.$t('notify.notConverted'),
          type: 'error',
        });
        return;
      }
      // otherwise find array id depending on media.id
      this.initialPreviewSlide = this.mediaPreviewData.findIndex((item) => item.id === fileData.id);
      // and open preview
      this.showPreview = true;
    },
  },
};
</script>

<style lang="scss" scoped>
  .sidebar-pop-up {
    text-align: center;
    font-size: $font-size-large;
    min-height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;

    .pop-up-text-container {
      width: 100%;

      .sidebar-pop-up-title {
        margin: $spacing;
      }

      .sidebar-pop-up-text {
        text-align: center;
        overflow-wrap: break-word;
        word-wrap: break-word;
        hyphens: auto;
        max-height: calc(49vh - #{$spacing});
        overflow-y: auto;
        padding: 0 $spacing-large;

        .sidebar-pop-up-text-row {
          display: flex;
          justify-content: center;

          .sidebar-pop-up-text-row-marks {
            width: 10px;
          }

          .sidebar-pop-up-text-row-text {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        li {
          // necessary otherwise scrollbar always shown...
          min-height: $font-size-large + $spacing-small;
        }
      }
    }
  }

  @media screen and (max-width: $mobile) {
    .sidebar-hidden-mobile {
      display: none;
    }
  }
</style>
