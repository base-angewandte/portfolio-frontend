// eslint-disable-next-line import/no-extraneous-dependencies
const path = require('path');
const webpack = require('webpack');
const childProcess = require('child_process');

// generate unique hash for cache busting
const commitHash = childProcess
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

module.exports = {
  publicPath: process.env.VUE_APP_PREFIX || '/',
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        __COMMIT_HASH__: JSON.stringify(commitHash)
      })
    ]
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

    // add vue-svg-loader
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();

    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]',
      });

  }
};
