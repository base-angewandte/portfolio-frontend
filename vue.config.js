// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');

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
        // generate hash for cache busting
        __CACHE_HASH__: Date.now().toString(),
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
