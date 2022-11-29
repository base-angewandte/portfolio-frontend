const path = require('path');
const fs = require('fs');
const gulp = require('gulp');
const axios = require('axios');
const log = require('fancy-log');
const replace = require('gulp-replace');
const conventionalChangelog = require('gulp-conventional-changelog');

let envFile = './.env.local';

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
    if (!process.env.VUE_APP_HEADER_JSON) {
      log.warn('ATTENTION: The variable \'VUE_APP_HEADER_JSON\' seems to be missing in your .env.local file! Please set it in order to be able to get the latest header file successfully.')
    }
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

gulp.task('changelog', (cb) => {
  // check if the file exists and create it if necessary
  // fallback if user forgets to create an .env.local file
  if (!fs.existsSync('CHANGELOG.md')) {
    fs.openSync('CHANGELOG.md', 'w');
    console.info('CHANGELOG.md file was created.');
  }

  gulp.src('CHANGELOG.md')
    .pipe(conventionalChangelog({
      // conventional-changelog options go here
      preset: 'conventionalcommits',
      append: false,
      releaseCount: 1,
    }, {
      // do not link references to github repo
      linkReferences: false,
    }, {
      // git-raw-commits options go here
    }, {
      // conventional-commits-parser options go here
    }, {
      // sections are created based on commit type
      groupBy: 'type',
      reverse: false,
      // order by scope first so that components affecting same component are at least
      // listed below each other
      commitsSort: ['scope', 'subject'],
      // sort the sections according to a predefined order
      commitGroupsSort: (val1, val2) => {
        // define groups for which order is fixed here
        // (everything else will come after)
        const sortOrder = ['feat', 'change', 'deprecate', 'remove', 'fix', 'security'];
        const val1Index = sortOrder.indexOf(val1.title);
        const val2Index = sortOrder.indexOf(val2.title);
        // if val1 does not exist in the order array sort val2 before val1
        if (val1Index === -1) {
          return 1;
        }
        // if val2 does not exist in array sort val1 before val1
        if (val2Index === -1) {
          return -1;
        }
        // else sort according to the index value in sort array
        return val1Index - val2Index;
      },
      // do transformations for every single commit here
      // (also tried with transform function of conventional-changelog options however
      // outcome was quite different so leaving it here)
      // needing to keep this otherwise style will be the original one (Bug fixes etc)??
      transform: (commit) => {
        // initialize an object for the modified properties (so there is potential
        // to modify further props)
        const modifiedProps = {};
        // return original commit object together with modified props overwriting original
        // if necessary via spread operator
        return {
          ...commit,
          ...modifiedProps,
        };
      },
      finalizeContext: (context) => {
        // define which type should go into which section here (as specified in documentation)
        const changelogGroups = {
          feat: 'Added',
          change: 'Changed',
          deprecate: 'Deprecated',
          remove: 'Removed',
          fix: 'Fixed',
          security: 'Security',
        };
        return {
          ...context,
          // create custom section headers instead of the default type derived ones
          commitGroups: context.commitGroups.map((group) => {
            // in order to exclude all groups that are not defined in the documentation
            // (https://hedgedoc.uni-ak.ac.at/#Changelog)
            // if undefined groups should be left in there just leave first condition!
            if (group.title) {
              const newTitleString = changelogGroups[group.title] || group.title;
              return {
                ...group,
                // check if there is actually a title string and if yes uppercase it
                title: newTitleString ? newTitleString.charAt(0).toUpperCase() + newTitleString.slice(1) : '',
              };
            }
            // returning an empty object will ignore the section in the changelog output
            return {};
          }),
        };
      },
    }))
    .pipe(gulp.dest('./'));
  cb();
});

gulp.task('default', gulp.series(gulp.parallel('set-header', 'set-default-lists')));
