<template>
  <div id="app-container">
    <BasePopUp
      :show="$store.state.data.popUp.show"
      :title="$store.state.data.popUp.header"
      :button-left-text="'Abbrechen'"
      :button-right-text="$store.state.data.popUp.buttonText"
      :button-right-icon="$store.state.data.popUp.icon"
      @close="cancelAction"
      @button-left="cancelAction"
      @button-right="popUpAction">
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
      :class="['sidebar', { 'sidebar-full': !showForm }]"
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
import { BasePopUp, BaseMediaPreview } from 'base-components';
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
  // TODO: is this a feasible way to handle this?
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      while (vm.$store.state.PortfolioAPI.loading) {
        console.log('waiting');
        /* eslint-disable-next-line */
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (!vm.$store.getters['PortfolioAPI/isAuthenticated']) {
        console.log('authenticating');
        window.location.href = 'http://localhost:8200/accounts/login';
      } else {
        vm.$store.commit('user/setAuthenticated', true);
      }
    });
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
    popUpAction() {
      this.action();
      this.clearSelected();
    },
    cancelAction() {
      this.clearSelected();
    },
    clearSelected() {
      this.$store.commit('data/setSelected', []);
      this.$store.commit('data/hidePopUp');
    },
    async action() {
      const { action } = this.$store.state.data.popUp;
      if (action === 'delete') {
        const deleteCurrentlyDisplayed = this.$store.state.data.selectedEntries
          .find(entry => entry.id === this.$route.params.id);
        await this.$store.dispatch('data/deleteEntries');
        if (deleteCurrentlyDisplayed) {
          this.$store.commit('data/deleteCurrentItem');
          this.$router.push('/');
        }
      } else if (action === 'publish') {
        await this.$store.dispatch('data/modifyEntries', { prop: 'published', value: true });
      } else if (action === 'offline') {
        await this.$store.dispatch('data/modifyEntries', { prop: 'published', value: false });
      }
      this.updateSidebarData();
      this.$store.commit('data/setOptions', false);
      this.$refs.sidebar.selectedMenuEntries = [];
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
</style>
