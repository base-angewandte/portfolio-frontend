<template>
  <div id="app-container">
    <base-pop-up
      :show="$store.state.data.popUp.show"
      :title="$store.state.data.popUp.header"
      :button-left-text="'Abbrechen'"
      :button-right-text="$store.state.data.popUp.buttonText"
      :button-right-icon="$store.state.data.popUp.icon"
      @close="$store.commit('data/hidePopUp')"
      @clicked="removeEntryAction">
      <div class="delete-pop-up">
        <div>
          <p class="delete-pop-up-text">
            {{ $store.state.data.popUp.text }}
          </p>
        </div>
      </div>
    </base-pop-up>
    <sidebar
      ref="sidebar"
      :new-form="$store.state.data.isNewForm"
      :class="['sidebar', { 'sidebar-full': !showForm }]"
      @newForm="createNewForm"
      @showEntry="fetchEntryData"/>
    <div
      v-if="showForm"
      class="form-view">
      <router-view
        @formSaved="saveForm"/>
    </div>
  </div>
</template>

<script>
import { BasePopUp } from 'base-components';
import Sidebar from './Sidebar';

export default {
  components: {
    Sidebar,
    BasePopUp,
  },
  data() {
    return {
      showForm: false,
    };
  },
  watch: {
    $route() {
      this.showForm = this.$route.name !== 'Dashboard';
    },
  },
  mounted() {
    this.showForm = this.$route.name !== 'Dashboard';
  },
  methods: {
    createNewForm() {
      this.showForm = true;
      this.$store.commit('data/setNewForm', true);
      this.$router.push('/dashboard/newItem');
    },
    fetchEntryData(item) {
      this.showForm = true;
      this.$store.commit('data/setNewForm', false);
      this.$router.push(`/dashboard/Item/${item.id}`);
    },
    saveForm() {
      console.log('saved');
    },
    removeEntryAction(evt) {
      if (evt === 'buttonRight') {
        this.deleteEntry();
      }
      this.$store.commit('data/setDeletable', []);
      this.$store.commit('data/hidePopUp');
    },
    deleteEntry() {
      const deleteCurrentlyDisplayed = this.$store.state.data.deletableEntries
        .includes(this.$route.params.id);
      this.$store.commit('data/deleteSidebarItems');
      this.$store.commit('data/setOptions', false);
      if (deleteCurrentlyDisplayed) {
        this.$store.commit('data/deleteCurrentItem');
        this.$router.push('/dashboard');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .delete-pop-up {
    text-align: center;
    font-size: $font-size-large;
    min-height: 150px;
    max-width: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;

    .delete-pop-up-text {
      margin: auto;
      text-align: center;
    }
  }
</style>
