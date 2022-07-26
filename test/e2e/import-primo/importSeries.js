/* eslint-disable */

/**
 * This suite tests the ui behavior when importing entries of type "series" from library catalogue.
 */

 describe('Test series type', function () {

    this.tags = ['import-series'];

    // search value used in this test
    const searchValue = "Gmundner GeoStudien geologisch, angewandt, interessant,Gmundner Geo-Studien geologisch, angewandt, interessant";
    // the testing (positive) values that are expected
    const titleText = 'Gmundner GeoStudien geologisch, angewandt, interessant,Gmundner Geo-Studien geologisch, angewandt, interessant';
    const pagesText = '30 cm'
    const descText = 'Adresse d. Verl.: A-4810 Gmunden, Kammerhofgasse 8';

    before(function (browser) {
        // Login to app
        browser.globals.login(browser);
    });

    it('assert search box visible after clicking import', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .click('@sidebarImportButton')
            .assert.visible('@importSearchBox');
    });

    it('after importing 1 entry, success notification appears', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .setValue('@importSearchInput', searchValue)
            .waitForElementVisible('@resultsAccordion', 12000)
            .click('@firstCheckBox')
            .click('@runImportButton')
            .assert.visible('@successNotification')
            .click('@closeNotificationButton');
    });

    it('after importing 1 entry, the portfolio entry type should be series', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('div[id^="http"][id$="series_monographic_series"]');
    });

    it('after importing 1 entry, the title should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@titleSelector')
            .assert.valueEquals('@titleSelector', titleText)
    });

    it('after importing 1 entry, the pages field should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@pagesSelector')
            .assert.valueEquals('@pagesSelector', pagesText)
    });

    it('after importing 1 entry, the language should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
        .assert.elementPresent('div[id^="http"][id$="de"]');
    });

    it('after importing 1 entry, the description field should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('textarea[id="texts_0_0_main2"]')
            .assert.valueEquals('textarea[id="texts_0_0_main2"]', descText)
    });


});

