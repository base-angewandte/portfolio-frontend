<template>
  <div id="app-container">
    <base-pop-up
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
    </base-pop-up>
    <BaseMediaPreview
      :show-preview="showPreview"
      :image-url="previewUrl"
      @hide-preview="showPreview = false"/>

    <sidebar
      ref="sidebar"
      :new-form="$store.state.data.isNewForm"
      :class="['sidebar', { 'sidebar-full': !showForm }]"
      :list="sidebarData"
      @sort="$store.dispatch('data/sortEntries', $event)"
      @filter="$store.dispatch('data/filterEntries', $event)"
      @new-form="createNewForm"
      @show-entry="routeToEntry"/>
    <div
      v-if="showForm"
      class="form-view">
      <router-view
        ref="view"
        @show-preview="loadPreview"/>
    </div>
  </div>
</template>

<script>
import { BasePopUp, BaseMediaPreview } from 'base-components';
import Sidebar from './Sidebar';

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
    sidebarData() {
      return [].concat(this.$store.getters['data/getSidebarData']);
    },
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
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      if (!vm.$store.state.PortfolioAPI.user.email) {
        console.log('authenticating');
        window.location.href = 'http://localhost:8200/accounts/login';
      } else {
        vm.$store.commit('user/setAuthenticated', true);
      }
      // fetch data after user authentication was checked and necessary cookies received
      await vm.$store.dispatch('data/fetchSidebarData', { offset: 0, limit: 50 });
      vm.calculateSidebarHeight();
    });
  },
  async mounted() {
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
      console.log('routing');
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
    action() {
      const { action } = this.$store.state.data.popUp;
      if (action === 'delete') {
        const deleteCurrentlyDisplayed = this.$store.state.data.selectedEntries
          .includes(this.$route.params.id);
        this.$store.dispatch('data/deleteEntries');
        if (deleteCurrentlyDisplayed) {
          this.$store.commit('data/deleteCurrentItem');
          this.$router.push('/');
        }
      } else if (action === 'publish') {
        this.$store.dispatch('data/modifyEntries', { prop: 'published', value: true });
      } else if (action === 'offline') {
        this.$store.dispatch('data/modifyEntries', { prop: 'published', value: false });
      }
      this.$store.commit('data/setOptions', false);
      this.$refs.sidebar.selectedMenuEntries = [];
      const { view } = this.$refs;
      if (view) {
        this.$refs.view.updateForm();
      }
    },
    loadPreview(img) {
      /* eslint-disable-next-line */
      if (img.includes('http')) {
        this.previewUrl = img;
      } else if (img.includes('/images')) {
        const match = /\/assets\/images\/(\w+\.\w+)$/.exec(img);
        /* eslint-disable-next-line */
        this.previewUrl = match[1] ? require(`@/assets/images/${match[1]}`) : '';
      } else {
        this.previewUrl = '';
      }
      this.showPreview = !!this.previewUrl;
      console.log(img);
    },
    scrollAction(evt) {
      // disable page scrolling
      evt.preventDefault();
      // TODO: image zoom?
    },
    calculateSidebarHeight() {
      const top = this.$refs.sidebar.$el.offsetTop
        + this.$refs.sidebar.$refs.menuList.$el.offsetTop;
      const element = document.querySelector('footer');
      const footerHeight = getComputedStyle(element).height.replace('px', '');
      const residualHeight = window.innerHeight - top - footerHeight;
      const entryHeight = this.$refs.sidebar && this.$refs.sidebar.$refs.menuList
        && this.$refs.sidebar.$refs.menuList.$refs.menuEntry
        && this.$refs.sidebar.$refs.menuList.$refs.menuEntry.length
        ? this.$refs.sidebar.$refs.menuList.$refs.menuEntry[0].$el.clientHeight : 0;
      const entriesPerPage = Math.floor(residualHeight / entryHeight);
      this.$store.commit('data/setEntriesPerRequest', entriesPerPage);
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

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
