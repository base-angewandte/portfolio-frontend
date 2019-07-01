<template>
  <div id="app">
    <div class="wrapper">
      <base-header
        v-if="showBaseHeader"
        :lang="lang"
        :active="'portfolio'"
        :profile.prop="profile"
        :urls.prop="urls" />
      <div
        v-else
        class="header-placeholder"/>
      <BaseNotification />
      <router-view />
      <base-footer
        v-if="showBaseHeader"
        ref="baseFooter"
        :lang="lang"
        :logged-in="isAuthenticated"
        :urls.prop="urls" />
    </div>
  </div>
</template>

<script>
import { getApiUrl } from './utils/commonUtils';

export default {
  name: 'App',
  components: {
    BaseNotification: () => import('./components/BaseNotification'),
  },
  computed: {
    lang() {
      return this.$store.state.PortfolioAPI.lang;
    },
    profile() {
      return this.$store.state.PortfolioAPI ? this.$store.state.PortfolioAPI.user : {};
    },
    urls() {
      return {
        de: `${process.env.APP_PREFIX}/de${this.$route.path}`,
        en: `${process.env.APP_PREFIX}/en${this.$route.path}`,
        login: `${process.env.AUTHENTICATION.LOGIN}`,
        logout: `${process.env.AUTHENTICATION.LOGOUT}`,
      };
    },
    isAuthenticated() {
      return this.$store.getters['PortfolioAPI/isAuthenticated'];
    },
    showBaseHeader() {
      return process.env.SHOW_HEADER;
    },
  },
  beforeCreate() {
    // initializing stores before app instance is created
    this.$store.dispatch('PortfolioAPI/init', {
      baseURL: getApiUrl(),
      lang: this.$i18n.locale,
    }).catch((e) => {
      if ((e.response && e.response.status === '404') || e.message === 'Network Error') {
        this.$router.push('/404');
      }
    });
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

    .header-placeholder {
      position: fixed;
      top: 0;
      background-color: $background-color;
      height: $header-height;
      width: 100%;
      z-index: 2;
    }

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
        // TODO: why so many width?
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

  /* for some reason this is only working here not in
  BaseNotification component ... */
  .notification-wrapper {
    box-shadow: 0 3px 3px rgba(0, 0, 0, .05);

    &:not(:first-child) {
      border-top: $separation-line;
    }
  }

  .v-slide-enter-active,
  .v-slide-leave-active,
  .v-slide-move {
    transition: all 0.8s;
  }

  .v-slide-leave-active {
    z-index: 0;
    position: absolute;
  }

  .v-slide-leave-to, .v-slide-enter-from {
    transition: all 1s ease-out;
    opacity: 0;
  }

  @media screen and (max-width: $mobile) {
    .wrapper {
      padding: $spacing-small;

      #app-container {
        .form-view {
          margin-left: 0;
          width: 100%;
          max-width: 100%;
          flex-basis: 100%;
        }
      }
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
