'use strict'
const merge = require('webpack-merge');
const prodEnv = require('./prod.env');

module.exports = merge(prodEnv, {
  NODE_ENV: 'development',
  HOST: 'fe.basedev.uni-ak.ac.at',
  PORT: 8080,
  HTTPS: false,
});
