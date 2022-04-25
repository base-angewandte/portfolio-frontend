/* eslint-disable */

/**
 * This suite tests the ui behavior when importing entries of type "journal" from library catalogue.
 */

 describe('Test journal type', function () {

    this.tags = ['import-journal'];

    // search value used in this test
    const searchValue = "Ecology news / Österreichisches Ökologie-Institut für Angewandte Umweltforschung";
    // the testing (positive) values that are expected
    const titleText = 'Ecology news / Österreichisches Ökologie-Institut für Angewandte Umweltforschung,Ecology news / Österreichisches ÖkologieInstitut für Angewandte Umweltforschung,Ecology news / Österreichisches Ökologie-Institut für Angewandte Umweltforschung Sponsoringpos';
    const subtitleText = '';
    const dateText = '';
    const pagesText = '21 x 29 cm';

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

    it('after importing 1 entry of type journal, success notification appears', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .setValue('@importSearchInput', searchValue)
            .waitForElementVisible('@resultsAccordion', 12000)
            .click('@firstCheckBox')
            .click('@runImportButton')
            .assert.visible('@successNotification')
            .click('@closeNotificationButton')
    });

    it('after importing 1 entry of type journal, the portfolio entry type should be monograph', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('div[id^="http"][id$="journal"]');
    });

    it('after importing 1 entry of type journal, the title should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@titleSelector')
            .assert.valueEquals('@titleSelector', titleText)
    });

    it('after importing 1 entry of type journal, the subtitle should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@subtitleSelector')
            .assert.valueEquals('@subtitleSelector', subtitleText)
    });

    it('after importing 1 entry of type journal, the date should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@dateSelector')
            .assert.valueEquals('@dateSelector', dateText)
    });

    it('after importing 1 entry of type journal, the pages field should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@pagesSelector')
            .assert.valueEquals('@pagesSelector', pagesText)
    });

    it('after importing 1 entry of type journal, the language should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
        .assert.elementPresent('div[id^="http"][id$="de"]');
    });

});

