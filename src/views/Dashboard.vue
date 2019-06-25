<template>
  <div id="app-container">
    <BasePopUp
      :show="$store.state.data.popUp.show"
      :title="capitalizeFirstLetter($store.state.data.popUp.header)"
      :button-left-text="capitalizeFirstLetter($store.state.data.popUp.buttonTextLeft)
      || $t('cancel')"
      :button-right-text="capitalizeFirstLetter($store.state.data.popUp.buttonTextRight)"
      :button-right-icon="$store.state.data.popUp.icon"
      @close="cancelAction"
      @button-left="cancelAction($store.state.data.popUp.actionLeft)"
      @button-right="$store.state.data.popUp.actionRight()">
      <div class="sidebar-pop-up">
        <div class="pop-up-text-container">
          <p
            class="sidebar-pop-up-text"
            v-html="popUpText" />
        </div>
      </div>
    </BasePopUp>
    <BaseMediaPreview
      :show-preview="showPreview"
      :media-url="previewUrl"
      :display-size="previewSize"
      @hide-preview="showPreview = false"
      @download="downloadFile"/>

    <Sidebar
      ref="sidebar"
      :class="['sidebar', { 'sidebar-full': !showForm, 'sidebar-hidden-mobile': showForm }]"
      @new-form="createNewForm"
      @show-entry="routeToEntry"
      @update-publish-state="updateFormData"/>
    <div
      v-if="showForm"
      class="form-view">
      <router-view
        ref="view"
        @show-preview="loadPreview"
        @data-changed="updateSidebarData()"/>
    </div>
  </div>
</template>

<script>
import { BasePopUp, BaseMediaPreview } from 'base-ui-components';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { capitalizeString } from '../utils/commonUtils';

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
    };
  },
  computed: {
    showForm() {
      return this.$route.name !== 'Dashboard';
    },
    attachmentsCount() {
      return this.$store.getters['data/getCurrentMedia'].length;
    },
    popUpText() {
      return this.$store.state.data.popUp.text;
    },
  },
  watch: {
    $route() {
      if (!this.showForm || this.$route.name === 'newEntry') {
        this.$store.commit('data/deleteCurrentItem');
      }
      this.$store.commit('data/setNewForm', this.$route.name === 'newEntry');
    },
    // if attachments in form were changed from 0 to >0 or from >0 to 0 --> update
    // sidebar to display icon
    attachmentsCount(curr, prev) {
      if (this.showForm && (Boolean(curr) !== Boolean(prev))) {
        this.$refs.sidebar.fetchSidebarData();
      }
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
      const filePath = fileData.playlist || fileData.mp3
        || fileData.pdf || fileData.original;
      // TODO: remove again as soon as video and pdf and audio are available
      if (filePath && filePath.search(/(jpg|jpeg|gif|png|m3u8|mp3|pdf)$/ig) >= 0) {
        /* eslint-disable-next-line */
        if (filePath.includes('http')) {
          this.previewUrl = filePath;
        } else if (filePath.includes('/images')) {
          const match = /\/assets\/images\/(\w+\.\w+)$/.exec(filePath);
          /* eslint-disable-next-line */
          this.previewUrl = match[1] ? require(`@/assets/images/${match[1]}`) : '';
        } else {
          this.previewUrl = `${process.env.PORTFOLIO_BACKEND_API}${filePath}`;
        }
        this.showPreview = !!this.previewUrl;
        // previewSize not required for audio (and pdf)
        if (!fileData.mp3 && !fileData.pdf) {
          this.previewSize = {
            height: `${fileData.metadata.ImageHeight ? fileData.metadata.ImageHeight.val
              : fileData.metadata.SourceImageHeight.val}px`,
            width: `${fileData.metadata.ImageWidth ? fileData.metadata.ImageWidth.val
              : fileData.metadata.SourceImageWidth.val}px`,
          };
        }
        // landing here if either file type is not supported or if file is not fully
        // converted yet
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
        const { data } = await axios({
          method: 'get',
          url,
          responseType: 'blob',
        });
        const fileUrl = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = fileUrl;
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
  @import "../styles/variables";

  .sidebar-pop-up {
    text-align: center;
    font-size: $font-size-large;
    min-height: 150px;
    max-width: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;

    .pop-up-text-container {
      max-width: 100%;

      .sidebar-pop-up-text {
        margin: auto;
        text-align: center;
        overflow-wrap: break-word;
        word-wrap: break-word;
        hyphens: auto;
      }
    }
  }

  @media screen and (max-width: $mobile) {
    .sidebar-hidden-mobile {
      display: none;
    }
  }
</style>
