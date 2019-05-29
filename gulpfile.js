const gulp = require('gulp')
const axios = require('axios')
const log = require('fancy-log')
const replace = require('gulp-replace')
const env = require('./config/prod.env');

gulp.task('set-header', async function () {
  try {
    const res = await axios.get(`${env.HEADER_HOST}bs/base-header.json`)
    return gulp.src(['config/prod.env.js'], { base: './' })
      .pipe(replace(/(HEADER: ).*/, function (match, p1) {
        return `${p1}'${env.HEADER_HOST}${res.data.latest}',`
      }))
      .pipe(gulp.dest('.'))
      .on('end', function () { log('Header file set to: ' + res.data.latest) })
  } catch (e) {
    log.warn(`WARNING: header file could not be set and default ${process.env.HEADER} (might be outdated) will be used!`)
  }
});

gulp.task('default', gulp.series(gulp.parallel('set-header')));
