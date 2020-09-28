const gulp = require('gulp')
const axios = require('axios')
const log = require('fancy-log')
const replace = require('gulp-replace')
require('dotenv').config({
  path: './.env.local',
})

gulp.task('set-header', async function () {
  try {
    const res = await axios.get(`${process.env.VUE_APP_HEADER_JSON}`);
    const baseUrl = process.env.VUE_APP_HEADER_JSON.match(/(^https?:\/\/[a-z-.]+)/)[0];
    return gulp.src(['.env.local'], { base: './' })
      .pipe(replace(/(\s+VUE_APP_HEADER: ).*/, function (match, p1) {
        return `${p1}'${baseUrl}/${res.data.latest}',`
      }))
      .pipe(gulp.dest('.'))
      .on('end', function () { log('Header file set to: ' + res.data.latest) })
  } catch (e) {
    log.warn(`WARNING: header file could not be set and default ${process.env.VUE_APP_HEADER} (might be outdated) will be used!`)
    log.error(e);
  }
});

gulp.task('default', gulp.series(gulp.parallel('set-header')));
