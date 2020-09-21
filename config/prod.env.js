'use strict'
module.exports= {
  NODE_ENV: 'production',
  DATABASE_API: 'http://localhost:8200/api/v1/',
  PORTFOLIO_BACKEND_BASE_URL: 'http://localhost:8200',
  BACKEND_PREFIX: '',
  HEADER_URLS: {
    LOGIN: 'http://localhost:8200/accounts/login/',
    LOGOUT: 'http://localhost:8200/accounts/logout/?next=/',
    TERMS: 'https://basedev.uni-ak.ac.at/terms',
    NOTICE: 'https://basedev.uni-ak.ac.at/site-notice',
  },
  HEADER_JSON: 'https://portfolio-dev.uni-ak.ac.at/bs/portfolio-showroom-header.json',
  HEADER: 'https://portfolio-dev.uni-ak.ac.at/bs/js/portfolio-showroom-header.e01146881f4e9c8b3292.js',
  APP_PREFIX: '/portfolio',
  LANG_URL: 'http://base.uni-ak.ac.at/portfolio/languages/',
  LOCALES: ['de', 'en'],
  DEFAULT_LOCALE: 'de',
  CONTRIBUTORS_DEFAULTS: [
    { label: 'Universität für Angewandte Kunst Wien', source: 'http://d-nb.info/gnd/5299671-2' },
  ],
  LOCATION_DEFAULTS: [
    {
      label: "Wien, Österreich",
      source: "https://api.geocode.earth/v1/place?ids=whosonfirst:locality:101748073",
      house_number:null,
      street:null,
      postcode:null,
      locality:"Vienna",
      region:"Wien",
      country:"Austria",
      geometry:{
        type:"Point",
        coordinates:[
          16.348388,
          48.198674
        ]
      },
      source_name:"geocode.earth",
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
    },
    {
      label: "Online",
      source: "angewandte-online-event",
      geometry:{
        type:"Point",
        coordinates: [
          0.000000,
          0.000000,
        ]
      },
    },
  ],
};

