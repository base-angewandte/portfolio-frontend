# portfolio-frontend

> A base project

Portfolio/Showroom enable artists and scientists to announce, store and publish their own work and to exchange ideas with colleagues.

## Project Setup

git and npm (node) is required on the system

``` bash
# clone the git repository
git clone https://github.com/base-angewandte/portfolio-frontend.git

# copy env skeleton files and adapt settings if necessary
cp config/dev.env-skel.js config/dev.env.js
cp config/prod.env-skel.js config/prod.env.js

```

## Development Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# the built application available in dist folder can be served from a webserver or to test, run:
node server.js
# and visit your site at http://localhost:5000

# build for production and view the bundle analyzer report
npm run build --report

```

## Production Setup

git and docker are required on the system

``` bash
# build the project
make build-app

```

## Env Settings

in folder /config the following variables can be set for development (dev.env) and production (prod.env) respectively:
<br>
<br>
(development also uses all the production variables, if specified in dev.env additionally, they are overwritten)

| Variable              | Description                                                                                                                                                 |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| NODE_ENV              | node environment variable                                                                                                                                   |
| DATABASE_API          | url for the backend rest api (database requests)                                                                                                            |
| AUTOSUGGEST_API       | url for autocomplete fields                                                                                                                                 |
| PORTFOLIO_BACKEND_API | base url of portfolio backend                                                                                                                               |
| AUTHENTICATION        | cas server authentication urls                                                                                                                              |
|     &nbsp;&nbsp;&nbsp;&nbsp;LOGIN             | for login                                                                                                                                                   |
|     &nbsp;&nbsp;&nbsp;&nbsp;LOGOUT            | for logout                                                                                                                                                  |
| SHOW_HEADER           | show base header                                                                                                                                                            |
| HEADER_HOST           | the base url for the header                                                                                                                                 |
| HEADER                | the complete header url, no need to set manually, can be set via `gulp set-header` or `make set-header` (in production)                                                         |
| APP_PREFIX            | the desired prefix of the appication                                                                                                                        |
| LANG_URL              | the skosmos uri of the languages project                                                                                                                    |
| LOCALES               | available locales                                                                                                                                           |
| DEFAULT_LOCALE        | a default language if one should be set (else the browser language will be used)                                                                            |
| CONTRIBUTORS_DEFAULT*  | a default displayed for all contributor fields (Contributors and Roles (e.g. authors, architects), required attributes: label, optional: source, additional |
| LOCATION_DEFAULT*      | a default displayed for the location input field                                                                                                            |
| FONT_PATH              | directing to fonts on server; used in `gulp set-font-path` to set font path in fonts.scss; default: '~/assets/fonts/'|

(*if there are any other dynamic autocomplete fields in future, defaults can be added as {backend property name}_DEFAULT as well)
