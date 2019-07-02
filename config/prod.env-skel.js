'use strict'
module.exports= {
  NODE_ENV: 'production',
  DATABASE_API: 'https://basedev.uni-ak.ac.at/portfolio/api/v1/',
  PORTFOLIO_BACKEND_BASE_URL: 'https://basedev.uni-ak.ac.at',
  BACKEND_PREFIX: '/portfolio',
  AUTHENTICATION: {
    LOGIN: 'https://basedev.uni-ak.ac.at/portfolio/accounts/login/',
    LOGOUT: 'https://basedev.uni-ak.ac.at/portfolio/accounts/logout/',
  },
  SHOW_HEADER: true,
  HEADER_HOST: 'https://basedev.uni-ak.ac.at/',
  HEADER: 'https://basedev.uni-ak.ac.at/bs/js/base-header.2f43c9ee481679497c60.js',
  APP_PREFIX: '/portfolio',
  LANG_URL: 'http://base.uni-ak.ac.at/portfolio/languages/',
  LOCALES: ['de', 'en'],
  DEFAULT_LOCALE: 'de',
  CONTRIBUTORS_DEFAULTS: [
    { label: 'Universität für Angewandte Kunst', source: 'http://d-nb.info/gnd/5299671-2' },
  ],
  LOCATION_DEFAULTS: [
    {
      label: "Wien, Österreich",
      source: "https://api.geocode.earth/v1/place?ids=whosonfirst:locality:101748073",
    },
    {
      source:"https://api.geocode.earth/v1/place?ids=openstreetmap:venue:way/25427674",
      label:"Universität für angewandte Kunst in Wien, Wien, Österreich",
      house_number:"2",
      street:"Oskar-Kokoschka-Platz",
      postcode:"1010",
      locality:"Wien",
      region:"Wien",
      country:"Österreich",
      geometry:{
        type:"Point",
        coordinates: [
          16.382464,
          48.208126,
        ]
      },
      source_name:"geocode.earth",
    }
  ],
  FONT_PATH: 'https://basedev.uni-ak.ac.at/bs/fonts/',
};
