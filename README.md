# portfolio-frontend

> A base project

Portfolio/Showroom enable artists and scientists to announce, store and publish their own work and to exchange ideas with colleagues.

## Project Setup

git is required on the system

``` bash
# clone the git repository
git clone https://github.com/base-angewandte/portfolio-frontend.git

# copy env file and adapt settings if necessary
cp .env .env.local

```

## Development Setup

git and npm (node) is required on the system

```bash
# install dependencies
npm install

#in case you are running the app for the first time you need to set the header component url via
gulp set-header

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# the built application available in dist folder can be served from a webserver or to test (inkl. build), run:
npm run build:test
# and visit your site at http://localhost:5000

# build for production and view the bundle analyzer report
npm run build:analyze

# run linter on project files with autofix enabled
npm run lint

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
| VUE_APP_DATABASE_API          | url for the backend rest api (database requests)                                                                                                            |                                                                                                                              |
| VUE_APP_PORTFOLIO_BACKEND_BASE_URL | base url of portfolio backend                                                                                                                      |
| VUE_APP_BACKEND_PREFIX      | a prefix for the backend                                                                                                 |
| VUE_APP_HEADER_URLS        | header / footer urls                                                                                                                              |
|     &nbsp;&nbsp;&nbsp;&nbsp;LOGIN             | for login                                                                                                                                                   |
|     &nbsp;&nbsp;&nbsp;&nbsp;LOGOUT            | for logout                                                                                                                                                  |
|     &nbsp;&nbsp;&nbsp;&nbsp;TERMS            | to link to terms and conditions                                                                                                                                                |
|     &nbsp;&nbsp;&nbsp;&nbsp;NOTICE            | to link to site legal notice                                                                                                                              |
| VUE_APP_HEADER_JSON           | json file url where the latest header version is specified                                                                                                                                  |
| VUE_APP_HEADER                | the complete header url, no need to set manually (will be overwritten!), can be set via `gulp set-header` or `make set-header` (in production)                                                         |
| VUE_APP_PREFIX            | the desired prefix of the appication                                                                                                                        |
| VUE_APP_LANG_URL              | the skosmos uri of the languages project (unless you have a separate skosmos project no need to modify from default )                                                                                                                    |
| VUE_APP_LOCALES               | available locales                                                                                                                                           |
| VUE_APP_DEFAULT_LOCALE        | a default language if one should be set (else the browser language will be used)                                                                            |
| CONTRIBUTORS_DEFAULT*  | a default displayed for all contributor fields (Contributors and Roles (e.g. authors, architects), required attributes: label, optional: source, additional |
| LOCATION_DEFAULT*      | a default displayed for the location input field                                                                                                            |

(*if there are any other dynamic autocomplete fields in future, defaults can be added as {backend property name}_DEFAULT as well)
