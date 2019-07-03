const gulp = require('gulp')
const axios = require('axios')
const log = require('fancy-log')
const replace = require('gulp-replace')
const env = require('./config/prod.env');

gulp.task('set-header', async function () {
  try {
    const res = await axios.get(`${env.HEADER_JSON}`);
    const baseUrl = env.HEADER_JSON.match(/(^https?:\/\/[a-z-.]+)/)[0];
    return gulp.src(['config/prod.env.js'], { base: './' })
      .pipe(replace(/(\s+HEADER: ).*/, function (match, p1) {
        return `${p1}'${baseUrl}/${res.data.latest}',`
      }))
      .pipe(gulp.dest('.'))
      .on('end', function () { log('Header file set to: ' + res.data.latest) })
  } catch (e) {
    log.warn(`WARNING: header file could not be set and default ${process.env.HEADER} (might be outdated) will be used!`)
    log.error(e);
  }
});

gulp.task('set-font-path', async function () {
  try {
    const fontPath = env.FONT_PATH || '~/assets/fonts/'
    return gulp.src(['./src/styles/fonts.scss'])
      .pipe(replace(/^(\$font_path: ).*/, function (match, p1) {
        return p1 + "'" + fontPath + "';"
      }))
      .pipe(gulp.dest('./src/styles/'))
      .on('end', function () { log('Font path set to "' + fontPath + '"') })
  } catch (e) {
    log.warn('WARNING: font path in fonts.scss not set or potentially set to invalid path')
  }
});

gulp.task('default', gulp.series(gulp.parallel('set-header', 'set-font-path')));
