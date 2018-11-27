<template>
  <div class="wrapper">
    <base-header
      :lang="'en'"
      :active="'portfolio'"
      :profile.prop="$store.state.auth.profile"
      :emit-navigation="true"
      :urls.prop="{
        de:'/portfolio/de/',
        en:'/portfolio/en/',
        login:'portfolio/login/',
        logout:'/portfolio/logout/'}"
      @navigate="navigate($event.detail[0])" />
    <router-view />
    <base-footer
      :base-url="linkUrl"
      :lang="lang"
      :logged-in="$store.state.isAuthenticated"
      :emit-navigation="true"
      :urls.prop="{
        de:'/recherche/de/',
        en:'/recherche/en/',
        login:'/recherche/login/',
        logout:'/recherche/logout/'}"
      @navigate="navigate($event.detail[0])" />
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    linkUrl() {
      return 'replace this at some point';
    },
    lang() {
      return 'get lang stored in store here';
    },
  },
  methods: {
    async navigate(val) {
      console.log(val);
    },
  },
};
</script>

<style lang="scss">
  @import "./styles/variables.scss";

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
        flex: 1 0 33%;
        max-width: 33%;
        align-self: flex-start;
        position: sticky;
        top: $header-height;
        z-index: 6;
      }

      & .sidebar-full {
        max-width: 100%;
      }

      .form-view {
        flex: 0 1 66%;
        margin-left: 16px;
        max-width: 66%;
        width: 65%;
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
    min-height: $row-height-small;
    width: 100%;
    display: flex;
    background-color: $background-color;
    overflow: hidden;

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
    .wrapper {
      padding: $spacing-small;
    }

    .mobile-hidden {
      display: none;
    }

    .mobile-elements {
      display: block;
    }

    .options-row {
      flex-wrap: wrap;
      height: auto;
    }

    .options-row.flex-align-right {
      justify-content: center;
    }

    .base-row .base-row-header {
      order: 3;
      border-top: $separation-line;
    }

    .base-row {
      height: auto;
      flex-wrap: wrap;
    }
  }
</style>
