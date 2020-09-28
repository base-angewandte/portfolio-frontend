'use strict';

require('dotenv').config({
  path: ('.env.local'),
});

module.exports= {
  template: require('html-webpack-template'),
  inject: false,
  appMountId: 'app',
  title: 'Portfolio | base Angewandte',
  meta: [
    {
      charset: 'utf-8',
    },
    {
      lang: 'en',
    },
    {
      name: 'viewport',
      content: 'width=device-width,initial-scale=1.0'
    },
    {
      hid: 'description',
      name: 'description',
      content: 'Making Art Research Accessible.'
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'base'
    },
    {
      name: 'application-name',
      content: 'base'
    },
    {
      name: 'theme-color',
      content: '#ffffff'
    },
  ],
  links: [
    {
      href: '/apple-touch-icon.png',
      rel: 'apple-touch-icon',
      sizes: '180x180'
    },
    {
      href: '/favicon-32x32.png',
      rel: 'icon',
      sizes: '32x32',
      type: 'image/png'
    },
    {
      href: '/favicon-32x32.png',
      rel: 'icon',
      sizes: '16x16',
      type: 'image/png'
    },
    {
      href: '/safari-pinned-tab.svg',
      rel: 'mask-icon',
      size: '180x180',
    }
  ],
  scripts: [
    {
      src: process.env.VUE_APP_HEADER,
      body: true,
    },
  ],
};
