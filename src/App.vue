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
        :logged-in="true"
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
  data() {
    return {
      resizeTimeout: null,
    };
  },
  computed: {
    lang() {
      return this.$store.state.PortfolioAPI.lang;
    },
    profile() {
      return this.$store.state.PortfolioAPI ? this.$store.state.PortfolioAPI.user : {};
    },
    urls() {
      const backendUrl = `${process.env.VUE_APP_BACKEND_BASE_URL}${process.env.VUE_APP_BACKEND_PREFIX}`;
      return {
        de: `${process.env.VUE_APP_PREFIX}/de${this.$route.path}`,
        en: `${process.env.VUE_APP_PREFIX}/en${this.$route.path}`,
        login: `${backendUrl}/accounts/login/`,
        logout: `${backendUrl}/accounts/logout/?next=/`,
        terms: process.env.VUE_APP_HEADER_URL_TERMS,
        siteNotice: process.env.VUE_APP_HEADER_NOTICE,
      };
    },
    headerName() {
      return process.env.VUE_APP_HEADER_JSON.match(/\/([a-z-]+)-header\.json$/)[1];
    },
  },
  beforeCreate() {
    // initializing stores before app instance is created
    this.$store.dispatch('PortfolioAPI/init', {
      baseURL: getApiUrl(),
      lang: this.$i18n.locale,
    }).catch((e) => {
      if ((e.response && e.response.status === '404') || e.message === 'Network Error') {
        this.$router.push('/error');
      }
    });
  },
  created() {
    // prevent app from displaying dropped files
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => e.preventDefault());
    // to have fully responsive app listen for window size once and save in store
    window.addEventListener('resize', this.setResizeTimeout);
  },
  mounted() {
    this.setResizeTimeout();
  },
  destroyed() {
    window.removeEventListener('resize', this.setResizeTimeout);
  },
  methods: {
    setResizeTimeout() {
      // check if there is a timeout already set and clear it if yes
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = null;
      }
      // then set time out new
      this.resizeTimeout = setTimeout(() => {
        this.$store.commit('data/setWindowWidth', window.innerWidth);
      }, 500);
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
        z-index: map-get($zindex, sidebar);
      }

      & .sidebar-full {
        max-width: 100%;
      }

      .form-view {
        flex: 0 1 66%;
        margin-left: $spacing;
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
    border-top: 2px solid #f0f0f0;
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
