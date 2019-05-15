'use strict'
const merge = require('webpack-merge');
const prodEnv = require('./prod.env');

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API: '"http://localhost:8200/api/v1/"',
  APP_PREFIX: '""',
  PORTFOLIO_HOST: '"http://localhost:8200"',
});
