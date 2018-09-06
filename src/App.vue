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
      <div class="app-container">
        <Welcome/>
      </div>
    </div>

  </div>
</template>

<script>
import Welcome from './components/Welcome';

export default {
  name: 'App',
  components: {
    Welcome,
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
      overflow: hidden;

      .app-container {
        margin-top: $header-height + $spacing;
      }
    }
  }
</style>
