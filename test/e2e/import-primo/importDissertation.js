/* eslint-disable */

/**
 * This suite tests the ui behavior when importing entries of type "dissertation" from library catalogue.
 */

 describe('Test dissertation type', function () {

    this.tags = ['import-dissertation'];

    // search value used in this test
    const searchValue = "Funktion, Aufbau und Bedeutung betrieblicher Entgeltmodelle eine personalwirtschaftlichsystemische Analyse exemplarisch angewandt am EFQMModell";
    // the testing (positive) values that are expected
    const titleText = 'Funktion, Aufbau und Bedeutung betrieblicher Entgeltmodelle eine personalwirtschaftlichsystemische Analyse exemplarisch angewandt am EFQMModell,Funktion, Aufbau und Bedeutung betrieblicher Entgeltmodelle eine personalwirtschaftlich-systemische Analyse exe';
    const subtitleText = 'Lohnsystem ; Organisation ; Qualitätsmanagement';
    const dateText = '1997';
    const pagesText = '238 Bl.'

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

    it('after importing 1 entry, the portfolio entry type should be dissertation', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('div[id^="http"][id$="doctoral_dissertation"]');
    });

    it('after importing 1 entry, the title should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@titleSelector')
            .assert.valueEquals('@titleSelector', titleText)
    });

    it('after importing 1 entry, the subtitle should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@subtitleSelector')
            .assert.valueEquals('@subtitleSelector', subtitleText)
    });

    it('after importing 1 entry, the date should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@dateSelector')
            .assert.valueEquals('@dateSelector', dateText)
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

});

