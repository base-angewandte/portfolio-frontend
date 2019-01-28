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
      :list="[].concat(this.$store.getters['data/getSidebarData'])"
      @sort="$store.dispatch('data/sortEntries', $event)"
      @filter="$store.dispatch('data/filterEntries', $event)"
      @new-form="createNewForm"
      @show-entry="fetchEntryData"/>
    <div
      v-if="showForm"
      class="form-view">
      <router-view
        ref="view"
        @form-saved="saveForm"
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
      showForm: false,
      showPreview: false,
      previewUrl: '',
    };
  },
  watch: {
    $route() {
      this.showForm = this.$route.name !== 'Dashboard';
      if (!this.showForm) {
        this.$store.commit('data/deleteCurrentItem');
      }
      this.$store.commit('data/setNewForm', this.$route.name === 'newEntry');
    },
  },
  mounted() {
    this.showForm = this.$route.name !== 'Dashboard';
    this.$store.commit('data/setNewForm', this.$route.name === 'newEntry');
  },
  methods: {
    createNewForm() {
      const formView = this.$refs.view;
      if (formView) {
        formView.resetForm();
      }
      this.showForm = true;
      this.$router.push('/new');
    },
    fetchEntryData(item) {
      console.log('fetchentrydata');
      this.$store.commit('data/setCurrentItem', item);
      this.$store.dispatch('data/fetchLinked');
      this.$store.commit('data/deleteParentItems');
      this.showForm = true;
      this.$router.push(`/entry/${item.id}`);
    },
    saveForm() {
      console.log('saved');
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
        this.$store.commit('data/deleteSidebarItems');
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
