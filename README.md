# portfolio-frontend

> A base project

Portfolio/Showroom enable artists and scientists to announce, store and publish their own work and to exchange ideas with colleagues.

## Build Setup

git and npm (node) is required on the system

``` bash
# clone the git repository
git clone https://github.com/base-angewandte/portfolio-frontend.git

# copy env skeleton files and adapt settings if necessary
cp config/dev.env-skel.js config/dev.env.js
cp config/prod.env-skel.js config/prod.env.js

# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

```

## Production Setup

git, docker and docker-compose are required on the system

``` bash
# to pull git repository and build the project
make update

# build the project
make start

# set the header file (currently same as make start, plans to keep container and just run gulp task in future)
make set-header

```
