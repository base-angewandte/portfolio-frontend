<template>
  <div id="app-container">
    <h1 class="hide">
      {{ $t('myPortfolio') }}
    </h1>
    <BasePopUp
      :show="$store.state.data.popUp.show"
      :title="capitalizeFirstLetter($store.state.data.popUp.header)"
      :button-left-text="capitalizeFirstLetter($store.state.data.popUp.buttonTextLeft)
        || $t('cancel')"
      :button-right-text="capitalizeFirstLetter($store.state.data.popUp.buttonTextRight)"
      :button-right-icon="$store.state.data.popUp.icon"
      :is-loading="$store.state.data.popUp.isLoading"
      @close="cancelAction"
      @button-left="cancelAction($store.state.data.popUp.actionLeft)"
      @button-right="$store.state.data.popUp.actionRight()">
      <div class="sidebar-pop-up">
        <div class="pop-up-text-container">
          <p class="sidebar-pop-up-title">
            {{ $store.state.data.popUp.textTitle }}
          </p>
          <ul
            class="sidebar-pop-up-text">
            <li
              v-for="(title, index) in $store.state.data.popUp.textList"
              :key="index">
              {{ title + '\n' }}
            </li>
          </ul>
        </div>
      </div>
    </BasePopUp>
    <BaseMediaPreview
      :show-preview="showPreview"
      :media-url="previewUrl"
      :download-url="originalUrl"
      :display-size="previewSize"
      :previews="imagePreviews"
      :info-texts="{
        download: $t('form-view.download'),
        view: $t('form-view.view'),
      }"
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
import { BasePopUp, BaseMediaPreview } from 'base-ui-components';
import Sidebar from '../components/Sidebar';
import { capitalizeString, getApiUrl, getLangLabel } from '../utils/commonUtils';

export default {
  components: {
    BaseMediaPreview,
    Sidebar,
    BasePopUp,
  },
  data() {
    return {
      showPreview: false,
      previewUrl: '',
      previewSize: {},
      originalUrl: '',
      imagePreviews: [],
    };
  },
  computed: {
    showForm() {
      return this.$route.name !== 'Dashboard';
    },
    popUpText() {
      return this.$store.state.data.popUp.textList;
    },
  },
  watch: {
    $route() {
      if (!this.showForm || this.$route.name === 'newEntry') {
        this.$store.commit('data/deleteCurrentItem');
      }
      this.$store.commit('data/setNewForm', this.$route.name === 'newEntry');
    },
  },
  mounted() {
    this.$store.commit('data/setNewForm', this.$route.name === 'newEntry');
  },
  methods: {
    createNewForm() {
      const formView = this.$refs.view;
      if (formView && formView.resetForm) {
        formView.resetForm();
      }
      this.$router.push('/new');
    },
    checkUnsavedChanges(id) {
      const followUpAction = id ? () => this.routeToEntry(id) : () => this.createNewForm();
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
              const saveSuccess = await this.$refs.view.saveForm();
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
      this.$router.push(`/entry/${id}`);
    },
    cancelAction(action) {
      if (action) {
        action();
      }
      this.$store.commit('data/hidePopUp');
    },
    loadPreview(fileData) {
      // reset media variables on new image load
      this.previewSize = null;
      this.imagePreviews = [];

      this.originalUrl = getApiUrl(fileData.original);
      const filePath = fileData.playlist || fileData.mp3
        || fileData.pdf || fileData.original;
      this.previewUrl = getApiUrl(filePath);
      this.imagePreviews = fileData.previews ? fileData.previews.map((size) => {
        const [width, url] = Object.entries(size)[0];
        return Object.assign({}, { [width]: getApiUrl(url) });
      }) : [];
      if (filePath) {
        this.showPreview = !!this.previewUrl;
        // if previws are available use the last converted size in array to set image size
        // size only width - set maxWidth instead of width to prevent strange effects
        if (fileData.previews && fileData.previews.length) {
          this.previewSize = {
            maxWidth: '100%',
          };
          // else get size from metadata
          // previewSize not required for audio (and pdf)
        } else if (fileData.metadata && (fileData.metadata.ImageHeight
          || fileData.metadata.SourceImageHeight)) {
          this.previewSize = {
            height: `${fileData.metadata.ImageHeight ? fileData.metadata.ImageHeight.val
              : fileData.metadata.SourceImageHeight.val}px`,
            width: `${fileData.metadata.ImageWidth ? fileData.metadata.ImageWidth.val
              : fileData.metadata.SourceImageWidth.val}px`,
          };
        }
        // landing here if file is not fully converted yet
      } else {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.displayImage'),
          text: filePath ? this.$t('notify.notSupported') : this.$t('notify.notConverted'),
          type: 'error',
        });
        this.previewUrl = '';
      }
    },
    scrollAction(evt) {
      // disable page scrolling
      evt.preventDefault();
      // TODO: image zoom?
    },
    updateSidebarData(alwaysUpdate) {
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
        this.$refs.sidebar.fetchSidebarData();
      }
    },
    updateFormData(published) {
      const formView = this.$refs.view;
      if (formView && formView.valueList) {
        this.$set(formView.valueList, 'published', published);
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

        li {
          // necessary otherwise scrollbar always shown...
          height: $font-size-large + $spacing-small;
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
