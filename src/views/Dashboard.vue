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

    <BaseMediaPreview
      :show-preview="showPreview"
      :media-url="getFilePath(assetFilePath)"
      :media-poster-url="assetObject !== null
        && assetObject.type === 'v' ? getFilePath( assetObject.cover.jpg) : null"
      :download-url="assetObject !== null ? getFilePath( assetObject.original) : ''"
      :display-size="previewSize"
      :info-texts="{
        download: $t('form-view.download'),
        view: $t('form-view.view'),
      }"
      :previews="imagePreviews"
      :additional-info="assetInfoText"
      @hide-preview="showPreview = false"
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
        @show-preview="loadPreview"
        @data-changed="updateSidebarData" />
    </main>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar';
import { capitalizeString, getApiUrl, getLangLabel } from '../utils/commonUtils';

export default {
  components: {
    Sidebar,
  },
  data() {
    return {
      showPreview: false,
      previewSize: {},
      imagePreviews: [],
      assetObject: null,
    };
  },
  computed: {
    showForm() {
      return this.$route.name !== 'Dashboard';
    },
    showPopUp() {
      return this.$store.state.data.popUp.show;
    },
    assetFilePath() {
      return this.assetObject !== null ? this.assetObject.playlist || this.assetObject.mp3
        || this.assetObject.pdf || this.assetObject.original : '';
    },
    assetInfoText() {
      if (this.assetObject === null) return [];
      const infoStringArray = [];
      if (this.assetObject.license) {
        infoStringArray.push(`${this.$t('license')}: ${getLangLabel(this.assetObject.license.label, this.$i18n.locale, true)}`);
      }
      if (this.assetObject.archive_URI && this.assetObject.archive_URI !== '') {
        infoStringArray.push(`Archive-ID: ${this.assetObject.archive_id}`);
      }
      infoStringArray.push(`${this.$t('status')}: ${this.assetObject.published
        ? this.$t('public') : this.$t('private')}`);
      return infoStringArray;
    },
    importComplete() {
      return this.$store.getters['data/getImportedIds'];
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
    async importComplete() {
      await this.updateSidebarData(true);
      const goToId = this.$refs.sidebar.listInt[0].id;
      this.routeToEntry(goToId);
    },
  },
  mounted() {
    this.$store.commit('data/setNewForm', this.$route.name === 'newEntry');
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
            this.$router.push('/import');
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
    loadPreview(fileData) {
      this.assetObject = null;
      // reset media variables on new image load
      this.previewSize = null;
      this.imagePreviews = [];

      this.assetObject = fileData;
      this.imagePreviews = fileData.previews ? fileData.previews.map((size) => {
        const [width, url] = Object.entries(size)[0];
        return { [width]: getApiUrl(url) };
      }) : [];
      // check if file is already converted
      // a) old version: no file path was in file data if not
      // b) new version: check for response_code - 202 means it is still converting
      if (this.assetFilePath
        && (!this.assetObject.response_code || this.assetObject.response_code !== 202)) {
        this.showPreview = true;
        // if previews are available use the last converted size in array to set image size
        // size only width - set maxWidth instead of width to prevent strange effects
        if (fileData.previews && fileData.previews.length) {
          this.previewSize = {
            maxWidth: '100%',
          };
          const imageHeight = fileData.metadata && fileData.metadata.ImageHeight
            ? fileData.metadata.ImageHeight.val : null;
          const imageWidth = fileData.metadata && fileData.metadata.ImageWidth
            ? fileData.metadata.ImageWidth.val : null;
          if (imageWidth && imageWidth > imageHeight && imageWidth < window.innerWidth) {
            this.previewSize = { ...this.previewSize, maxWidth: `${fileData.metadata.ImageWidth.val}px` };
          } else if (imageHeight && imageHeight > imageWidth && imageHeight < window.innerHeight) {
            this.previewSize = { ...this.previewSize, maxHeight: `${fileData.metadata.ImageHeight.val}px` };
          }
        } else {
          // previewSize not required for audio, video and pdf
        }
        // landing here if file is not fully converted yet
      } else {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.displayImage'),
          text: this.$t('notify.notConverted'),
          type: 'error',
        });
      }
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
    getFilePath(path) {
      return getApiUrl(path);
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
