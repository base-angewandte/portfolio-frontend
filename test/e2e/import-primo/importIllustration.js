/* eslint-disable */

/**
 * This suite tests the ui behavior when importing entries of type "illustration" from library catalogue.
 */

 describe('Test illustration type', function () {

    this.tags = ['import-illustration'];

    // search value used in this test
    const searchValue = "Rumänien Moldawien Autokarte";
    // the testing (positive) values that are expected
    const titleText = 'Rumänien Moldawien Autokarte ; Citypläne, Ortsregister mit Postleitzahlen, touristische Informationen = Romania Moldova,Rumänien - Moldawien Autokarte ; Citypläne, Ortsregister mit Postleitzahlen, touristische Informationen = Romania - Moldova';
    const dateText = '2005';

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

    it('after importing 1 entry, the portfolio entry type should be illustration', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('div[id^="http"][id$="illustration"]');
    });

    it('after importing 1 entry, the title should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@titleSelector')
            .assert.valueEquals('@titleSelector', titleText)
    });

    it('after importing 1 entry, the date should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('#Date-date_0_date_location_2_0_extended_date_location')
            .assert.valueEquals('#Date-date_0_date_location_2_0_extended_date_location', dateText)
    });

});

