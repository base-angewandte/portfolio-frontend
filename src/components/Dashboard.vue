<template>
  <div id="app-container">
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
import Sidebar from './Sidebar';

export default {
  components: {
    Sidebar,
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
  },
};
</script>

<style lang="scss" scoped>

</style>
