/* eslint-disable */

/**
 * This file defines global variables used in automated testing with Nightwatch.js. 
 * Before attempting to run any e2e tests, the following LOCAL ONLY environment variables must be set in the *.env.local* file:
 * E2E_TESTING_USERNAME -- set this to the username of the portfolio account which will run automated tests
 * E2E_TESTING_PASSWORD -- set this to the password of the portfolio account which will run automated tests
 * E2E_TESTING_URL -- set this to the portfolio app url that is to be tested
 * E2E_TESTING_ADMIN_URL -- set this to the portfolio's admin url (only required when testing locally).
 */
require('dotenv').config({
    path: __dirname + `./../../.env.local`,
});

module.exports = {

    // these globals are the same regardless of the environment
    appUsername: process.env.E2E_TESTING_USERNAME,
    appPassword: process.env.E2E_TESTING_PASSWORD,
    portfolioUrl: process.env.E2E_TESTING_URL,
    dummyText: 'a1a1a1a1a1',
    searchText: 'carl',

    // these globals are specific to the 'default' (local) environment
    'default': {
        isLocal: true,
        portfolioAdminUrl: process.env.E2E_TESTING_ADMIN_URL,
        // on localhost, login to admin page first and then navigate to portfolio url
        login(browser) {
            browser
                .navigateTo(browser.globals.portfolioAdminUrl)
                .setValue('#id_username', browser.globals.appUsername)
                .setValue('#id_password', browser.globals.appPassword)
                .click('.submit-row > input:nth-child(2)')
                .navigateTo(browser.globals.portfolioUrl);
        }
    },

    // these globals are specific to the staging environment
    'staging': {
        isLocal: false,
        // on the staging server, login to portfolio app directly
        login(browser) {
            browser
                .navigateTo(browser.globals.portfolioUrl)
                .setValue('#id_username', browser.globals.appUsername)
                .setValue('#id_password', browser.globals.appPassword)
                .click('button[name=submit]');
        }
    },

};