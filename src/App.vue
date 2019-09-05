<template>
  <div id="app">
    <div class="wrapper">
      <component
        :is="`${headerName}-header`"
        :lang="lang"
        :active="'portfolio'"
        :profile.prop="profile"
        :urls.prop="urls" />
      <BaseNotification />
      <router-view />
      <component
        :is="`${headerName}-footer`"
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
        login: process.env.HEADER_URLS.LOGIN,
        logout: process.env.HEADER_URLS.LOGOUT,
        terms: process.env.HEADER_URLS.TERMS,
        siteNotice: process.env.HEADER_URLS.NOTICE,
      };
    },
    isAuthenticated() {
      return this.$store.getters['PortfolioAPI/isAuthenticated'];
    },
    headerName() {
      return process.env.HEADER_JSON.match(/\/([a-z-]+)-header\.json$/)[1];
    },
    headerComponent() {
      return 'portfolio-showroom-header';
    },
    footerComponent() {
      return 'portfolio-showroom-footer';
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
  created() {
    // prevent app from displaying dropped files
    window.addEventListener('dragover', e => e.preventDefault());
    window.addEventListener('drop', e => e.preventDefault());
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
    min-height: $row-height-large;
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

    &:not(:last-child) {
      border-bottom: 2px solid #f0f0f0;
    }
  }

  .v-slide-enter-active,
  .v-slide-leave-active,
  .v-slide-move {
    transition: all 1s ease;
  }

  .slide-fade-enter, .v-slide-leave-to {
    background-color: transparent;
    opacity: 0;
  }

  .v-slide-leave-active {
    z-index: 0;
    position: absolute;
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
