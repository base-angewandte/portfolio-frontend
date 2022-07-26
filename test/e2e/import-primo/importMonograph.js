/* eslint-disable */

/**
 * This suite tests the ui behavior when importing entries of type "monograph" from library catalogue.
 */

 describe('Test monograph type', function () {

    this.tags = ['import-monograph'];

    // search value used in this test
    const searchValue = "Andres Segovia Mein Gitarrenbuch"
    // the testing (positive) values that are expected
    const titleText = 'Mein Gitarrenbuch eine Anleitung für das Gitarrespiel';
    const dateText = '1980';
    const isbnText = '3451189933';
    const pagesText = '63 S., zahlr. Ill., Notenbeisp., 27 cm'

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

    it('after importing 1 entry of type monograph, success notification appears', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .setValue('@importSearchInput', searchValue)
            .waitForElementVisible('@resultsAccordion', 12000)
            .click('@firstCheckBox')
            .click('@runImportButton')
            .assert.visible('@successNotification')
            .click('@closeNotificationButton')
    });

    it('after importing 1 entry of type monograph, the portfolio entry type should be monograph', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('div[id^="http"][id$="monograph"]');
    });

    it('after importing 1 entry of type monograph, the title should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@titleSelector')
            .assert.valueEquals('@titleSelector', titleText)
    });

    it('after importing 1 entry of type monograph, the date should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@dateSelector')
            .assert.valueEquals('@dateSelector', dateText)
    });

    it('after importing 1 entry of type monograph, the ISBN should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@isbnSelector')
            .assert.valueEquals('@isbnSelector', isbnText)
    });

    it('after importing 1 entry of type monograph, the pages field should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@pagesSelector')
            .assert.valueEquals('@pagesSelector', pagesText)
    });

    it('after importing 1 entry of type monograph, the language should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
        .assert.elementPresent('div[id^="http"][id$="de"]');
    });

});

