# portfolio-frontend

> A base project

Portfolio/Showroom enable artists and scientists to announce, store and publish their own work and to exchange ideas with colleagues.

## Project Setup

git is required on the system

``` bash
# clone the git repository
git clone https://github.com/base-angewandte/portfolio-frontend.git

```
Also check and if necessary adapt the configuration:
```shell
# switch into the project folder
cd portfolio-frontend

# create a local copy of your environment variables
cp .env .env.local

# use your favourite text editor to inspect and adapt the config file 
nano .env.local

# if you would like to adapt the default values for drop down lists (in the respective form fields) 
# also create a local copy of default lists
cp default_lists-skel.json default_lists.json
# and edit the lists
nano config/default_lists.json
```

For details on configuration options see the [config section](#configuration-of-the-portfolio-app).

## Production Setup

git and docker are required on the system

``` bash
# build the project
make build-app

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

## Configuration of the Portfolio App

The configuration of your project can be done with environment variables specified in `.env` files.

##### Configurable values:
In the `.env` file contained in the project folder the following variables can be set:

| Variable              | Description                                                                                                                                                 |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| VUE_APP_BACKEND_BASE_URL      | base url of portfolio backend                                                                                                                      |
| VUE_APP_BACKEND_API_PATH      | path to the backend rest api (database requests)                                                                                                    |
| VUE_APP_BACKEND_PREFIX      | a prefix for the backend                                                                                                 |
| VUE_APP_HEADER_URL_TERMS      | to link to terms and conditions                                                                                                                                                |
| VUE_APP_HEADER_URL_NOTICE     | to link to site legal notice                                                                                                                              |
| VUE_APP_HEADER_JSON           | json file url where the latest header version is specified                                                                                                                                  |
| VUE_APP_HEADER                | the complete header url, no need to set manually (will be overwritten!), can be set via `gulp set-header` (but is run automatically on project start up as well)                                                      |
| VUE_APP_PREFIX            | the desired prefix of the application                                                                                                                        |
| VUE_APP_LANG_URL              | the [Skosmos](https://skosmos.org/) uri of the languages project (unless you have a separate skosmos project no need to modify from default )                                                                                                                    |
| VUE_APP_LOCALES               | available locales                                                                                                                                           |
| VUE_APP_DEFAULT_LOCALE        | a default language if one should be set (else the browser language will be used)                                                                            |
| VUE_APP_EN_TITLE_CASING        | as per default with locale set to english, all text except complete sentences will be title-cased. Set false to turn this behaviour off.                                                                            |
| VUE_DEFAULT_LISTS  | Please dont edit this value directly but via [default_lists.json](config/default_lists.json) in the `/config` folder. It contains all default values for customizable drop down lists - this is set via `gulp set-default-lists` (run automatically on project start up). As per default the JSON file contains:<br><br>CONTRIBUTORS_DEFAULT*: a default displayed for all contributor fields (Contributors and Roles (e.g. authors, architects)<br><br>LOCATION_DEFAULT*: a default displayed for the location input field <br><br>required attributes for each default entry: label, optional: source, additional|

(*if there are any other dynamic autocomplete fields in the future, defaults can be added as {backend property name}_DEFAULT as well)



#### For Development:

* As per default there is one `.env` file in the project folder where a local copy `.env.local` should be created.
  In case you need development and production specific values the file could be copied
  to create new files `.env.development.local` and `env.production.local` which will overwrite the default `.env.local` file.
  
* For further details on the use of environmental variables in this App also refer to the  [Vue-CLI documentation](https://cli.vuejs.org/guide/mode-and-env.html#environment-variables).  
  
