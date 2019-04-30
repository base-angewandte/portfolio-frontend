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
            v-html="$store.state.data.popUp.text" />
        </div>
      </div>
    </BasePopUp>
    <BaseMediaPreview
      :show-preview="showPreview"
      :image-url="previewUrl"
      @hide-preview="showPreview = false"/>

    <Sidebar
      ref="sidebar"
      :class="['sidebar', { 'sidebar-full': !showForm, 'sidebar-hidden-mobile': showForm }]"
      @new-form="createNewForm"
      @show-entry="routeToEntry"/>
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
import Sidebar from '../components/Sidebar';

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
    };
  },
  computed: {
    showForm() {
      return this.$route.name !== 'Dashboard';
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
      if (formView) {
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
    loadPreview(img) {
      if (img) {
        /* eslint-disable-next-line */
        if (img.includes('http')) {
          this.previewUrl = img;
        } else if (img.includes('/images')) {
          const match = /\/assets\/images\/(\w+\.\w+)$/.exec(img);
          /* eslint-disable-next-line */
          this.previewUrl = match[1] ? require(`@/assets/images/${match[1]}`) : '';
        } else {
          this.previewUrl = `${process.env.PORTFOLIO_API}${img}`;
        }
        this.showPreview = !!this.previewUrl;
      } else {
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
    capitalizeFirstLetter(text) {
      if (text) {
        return text.slice(0, 1).toUpperCase() + text.slice(1);
      }
      return '';
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
