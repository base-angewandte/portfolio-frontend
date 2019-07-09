'use strict'
module.exports= {
  NODE_ENV: 'production',
  DATABASE_API: 'insert complete api url here e.g. https://basedev.uni-ak.ac.at/portfolio/api/v1/',
  PORTFOLIO_BACKEND_BASE_URL: 'insert backend server url here e.g. https://basedev.uni-ak.ac.at',
  BACKEND_PREFIX: 'if backend route has a prefix insert it here e.g. /portfolio else leave as empty string',
  HEADER_URLS: {
    LOGIN: 'insert your cas server login route here e.g. https://basedev.uni-ak.ac.at/portfolio/accounts/login/',
    LOGOUT: 'insert your cas server logout route here e.g. https://basedev.uni-ak.ac.at/portfolio/accounts/logout/',
    TERMS: 'insert a url to a terms and conditions page here e.g. https://basedev.uni-ak.ac.at/terms',
    NOTICE: 'insert a url to a site notice https://basedev.uni-ak.ac.at/site-notice',
  },
  HEADER_JSON: 'https://portfolio-dev.uni-ak.ac.at/bs/portfolio-showroom-header.json',
  HEADER: 'https://basedev.uni-ak.ac.at/bs/js/base-header.2f43c9ee481679497c60.js',
  APP_PREFIX: 'specify a route prefix for the frontend e.g. /portfolio',
  LANG_URL: 'the skosmos url (no need to modify) http://base.uni-ak.ac.at/portfolio/languages/',
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
  FONT_PATH: 'the path to the fonts files (in case of doubt leave empty) e.g. https://basedev.uni-ak.ac.at/bs/fonts/',
};
