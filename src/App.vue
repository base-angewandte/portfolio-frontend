<template>
  <div id="app">
    <div class="wrapper">
      <base-header
        :lang="'en'"
        :active="'recherche'"
        :profile.prop="null"
        :emit-navigation="true"
        :urls.prop="{
          de:'/recherche/de/',
          en:'/recherche/en/',
          login:'/recherche/login/',
          logout:'/recherche/logout/'}"
        @navigate="navigate($event.detail[0])" />
      <div id="app-container">
        <sidebar
          :new-form="isNewForm"
          class="sidebar"
          @newForm="createNewForm"
          @showEntry="fetchEntryData"/>
        <div
          v-if="showForm"
          class="form-view">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar';

export default {
  name: 'App',
  components: {
    Sidebar,
  },
  data() {
    return {
      isNewForm: false,
      showForm: false,
    };
  },
  watch: {
    $route() {
      this.showForm = this.$route.name !== 'Landing';
    },
  },
  mounted() {
    this.showForm = this.$route.name !== 'Landing';
  },
  methods: {
    createNewForm() {
      this.showForm = true;
      this.isNewForm = true;
      this.$router.push('newItem');
    },
    fetchEntryData(item) {
      this.showForm = true;
      this.isNewForm = false;
      this.router.push('/Item/xxxxx');
    },
  },
};
</script>

<style lang="scss">
  @import "./styles/variables.scss";

  #app {
    .wrapper {
      display: block;
      margin: 0 auto;
      max-width: $page-max-width;
      min-width: $page-min-width;
      padding: $spacing;
      position: relative;
      min-height: 100vh;

      #app-container {
        margin-top: $header-height;
        display: flex;

        .sidebar {
          flex: 1 0 calc(33% - 8px);
          align-self: flex-start;
          position: sticky;
          top: $header-height;
          padding-top: $spacing;
        }

        .form-view {
          flex: 1 0 calc(66% - 32px);
          margin-left: 16px;
        }
      }
    }
  }

  .mobile-elements {
    display: none;
  }

  #menu-sidebar + #form-component {
    margin-left: 0;
  }

  .options-row {
    height: $row-height-small;
    width: 100%;
    display: flex;
    align-items: baseline;
    background-color: $background-color;

    &.flex-align-right {
      justify-content: flex-end;
      margin-right: -32px;
    }

    .options {
      flex-grow: 2;
    }
  }

  .base-row {
    height: $row-height-large;
    box-shadow: $box-shadow-reg;
    display: flex;
    margin-bottom: $spacing-small;
    width: 100%;

    &:hover {
      box-shadow: $box-shadow-hov;
    }

    .base-row-header {
      overflow: hidden;
      width: 100%;
    }
  }

  .options-button-row {
    width: 100%;

    .options {
      margin: auto;
    }
  }

  .base-row {
    height: $row-height-large;
    box-shadow: $box-shadow-reg;
    display: flex;
    margin-bottom: $spacing-small;
    width: 100%;

    &:hover {
      box-shadow: $box-shadow-hov;
    }

    .base-row-header {
      overflow: hidden;
      width: 100%;
    }
  }

  @media screen and (max-width: $mobile) {
    #app .wrapper {
      padding: $spacing-small;
    }

    .mobile-hidden {
      display: none;
    }

    .mobile-elements {
      display: block;
    }

    #app .options-row {
      flex-wrap: wrap;
      height: auto;
    }

    #app .options-row.flex-align-right {
      justify-content: center;
    }

    #app .base-row .base-row-header {
      order: 3;
      border-top: $separation-line;
    }

    #app .base-row {
      height: auto;
      flex-wrap: wrap;
    }
  }
</style>
