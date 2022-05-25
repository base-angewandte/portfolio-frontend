// eslint-disable-next-line import/no-extraneous-dependencies
const path = require('path');

module.exports = {
  publicPath: process.env.VUE_APP_PREFIX || '/',
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
      },
    },
  },
  css: {
    loaderOptions: {
      scss: {
        prependData: `@import "~@/styles/variables.scss";`,
      }
    },
  },
  // to be able to use npm link with base-ui-components
  chainWebpack: (config) => {
    config.resolve.symlinks(false);
  }
};
