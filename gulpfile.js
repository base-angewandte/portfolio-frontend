const path = require('path');
const fs = require('fs');
const gulp = require('gulp')
const axios = require('axios')
const log = require('fancy-log')
const replace = require('gulp-replace')

let envFile = './.env.local';
const pjson = require('./package.json');

// fallback if user forgets to create an .env.local file
if (!fs.existsSync(envFile)) {
  fs.copyFileSync('./.env', envFile);
  log.info('.env.local file was not found and was created! However it most likely needs adaptions - please check the configuration!');
}

require('dotenv').config({
  path: envFile,
})

gulp.task('set-header', async function () {
  try {
    const res = await axios.get(`${process.env.VUE_APP_HEADER_JSON}`);
    const baseUrl = process.env.VUE_APP_HEADER_JSON.match(/(^https?:\/\/[a-z-.]+)/)[0];
    return gulp.src([envFile], { base: './' })
      .pipe(replace(/(\s+VUE_APP_HEADER=).*/, function (match, p1) {
        return `${p1}${baseUrl}/${res.data.latest}`
      }))
      .pipe(gulp.dest('.'))
      .on('end', function () { log('Header file set to: ' + res.data.latest) })
  } catch (e) {
    log.warn(`WARNING: header file could not be set and default ${process.env.VUE_APP_HEADER} (might be outdated) will be used!`)
    log.error(e);
  }
});

gulp.task('set-default-lists', async function () {
  try {
    // create default_lists from default_lists-skel if it does not exist
    if (!fs.existsSync('./config/default_lists.json')) {
      fs.copyFileSync('./config/default_lists-skel.json', './config/default_lists.json');
      log.info('default_lists file was created.');
    }
  } catch(e) {
    log.warn('Something went wrong while creating the file config/default_lists.json from config/default_lists-skel.json!' +
      'please check if file exists and create manually if necessary.');
    log.error(e);
  }
  try {
    const defaultListData = JSON.stringify(require(path.join(__dirname, './config/default_lists.json')));
    return gulp.src([envFile], { base: './' })
      .pipe(replace(/(\s+VUE_APP_DEFAULT_LISTS=).*/, function (match, p1) {
        return `${p1}${defaultListData}`
      }))
      .pipe(gulp.dest('.'))
      .on('end', function () { log('Default lists updated!') })
  } catch (e) {
    log.warn(`WARNING: Default lists from config/default_lists.json could not be set!
     Please make sure the VUE_APP_DEFAULT_LISTS variable in .env.local has an appropriate value!`)
    log.error(e);
  }
});

gulp.task('set-version', () => {
    try {
      console.log(pjson.version);
      return gulp.src('Makefile', { base: './' })
        .pipe(replace(/(baseangewandte\/portfolio-frontend-build:)\d+\.\d+\.\d+/, function (match, p1) {
          return `${p1}${pjson.version}`
        }))
        .pipe(gulp.dest('.'))
        .on('end', function () { log('Version for docker-container set to: ' + pjson.version) })
  } catch (e) {
    log.warn(`WARNING: Version in Makefile could not be updated to ${pjson.version} and should be updated to `)
    log.error(e);
  }
});

gulp.task('default', gulp.series(gulp.parallel('set-header', 'set-default-lists')));
