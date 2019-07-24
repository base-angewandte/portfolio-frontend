<template>
  <div id="app-container">
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
          <p class="sidebar-pop-up-title">{{ $store.state.data.popUp.textTitle }}</p>
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
      :info-texts="{
        download: $t('form-view.download'),
        view: $t('form-view.view'),
      }"
      :orientation="imageOrientation"
      @hide-preview="showPreview = false"
      @download="downloadFile" />

    <Sidebar
      ref="sidebar"
      :class="['sidebar', { 'sidebar-full': !showForm, 'sidebar-hidden-mobile': showForm }]"
      @new-form="createNewForm"
      @show-entry="routeToEntry"
      @update-publish-state="updateFormData" />
    <div
      v-if="showForm"
      class="form-view">
      <router-view
        ref="view"
        @show-preview="loadPreview"
        @data-changed="updateSidebarData()" />
    </div>
  </div>
</template>

<script>
import { BasePopUp, BaseMediaPreview } from 'base-ui-components';
// import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { capitalizeString, getApiUrl } from '../utils/commonUtils';

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
      imageOrientation: 0,
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
      this.originalUrl = getApiUrl(fileData.original);
      const filePath = fileData.playlist || fileData.mp3
        || fileData.pdf || fileData.original;
      this.previewUrl = getApiUrl(filePath);
      if (filePath) {
        this.showPreview = !!this.previewUrl;
        // previewSize not required for audio (and pdf)
        if (fileData.metadata && (fileData.metadata.ImageHeight
          || fileData.metadata.SourceImageHeight)) {
          this.previewSize = {
            height: `${fileData.metadata.ImageHeight ? fileData.metadata.ImageHeight.val
              : fileData.metadata.SourceImageHeight.val}px`,
            width: `${fileData.metadata.ImageWidth ? fileData.metadata.ImageWidth.val
              : fileData.metadata.SourceImageWidth.val}px`,
          };
        }
        if (fileData.metadata.Orientation) {
          this.imageOrientation = fileData.metadata.Orientation.num;
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
    updateSidebarData() {
      this.$refs.sidebar.fetchSidebarData();
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
          height: $line-height;
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
