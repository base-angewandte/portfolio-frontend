<template>
  <div class="wrapper">
    <base-header
      :lang="lang"
      :active="'portfolio'"
      :profile.prop="profile"
      :urls.prop="urls" />
    <BaseNotification />
    <router-view />
    <base-footer
      ref="baseFooter"
      :lang="lang"
      :logged-in="isAuthenticated"
      :urls.prop="urls" />
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
    BaseNotification: () => import('./components/BaseNotification'),
  },
  computed: {
    lang() {
      return this.$store.state.SkosmosAPI.lang;
    },
    profile() {
      return this.$store.state.PortfolioAPI ? this.$store.state.PortfolioAPI.user : {};
    },
    urls() {
      return {
        de: `/portfolio/de${this.$route.path}`,
        en: `/portfolio/en${this.$route.path}`,
        login: '/portfolio/accounts/login/',
        logout: '/cas/logout/',
      };
    },
    isAuthenticated() {
      return this.$store.getters['PortfolioAPI/isAuthenticated'];
    },
  },
  beforeCreate() {
    // initializing stores before app instance is created
    this.$store.dispatch('PortfolioAPI/init', {
      baseURL: `${process.env.PORTFOLIO_HOST}${process.env.APP_PREFIX}`,
      lang: this.$i18n.locale,
    });
    this.$store.dispatch('SkosmosAPI/init', {
      baseURL: process.env.SKOSMOS_API,
      lang: this.$i18n.locale,
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
