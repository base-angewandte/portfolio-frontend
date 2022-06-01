/* eslint-disable */

/**
 * This suite tests the ui behavior when importing entries of type "video" from library catalogue.
 */

 describe('Test video type', function () {

    this.tags = ['import-video'];

    // search value used in this test
    const searchValue = "Divina.com lapidi dantesche a Firenze";
    // the testing (positive) values that are expected
    const titleText = 'Divina.com lapidi dantesche a Firenze = the Dante plaques in Florence : mixed media event in 36 parts for voice, ensemble, live electronics and video';
    const dateText = '2016';
    const authorText = 'Lombardi, Daniele, 1946- [KomponistIn]. [DirigentIn]';

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

    it('after importing 1 entry, the portfolio entry type should be video', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('div[id^="http"][id$="video"]');
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
            .assert.elementPresent('@dateLocationSelector')
            .assert.valueEquals('@dateLocationSelector', dateText)
    });

    it('after importing 1 entry, the language should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
        .assert.elementPresent('div[id^="http"][id$="it"]');
    });

    it('after importing 1 entry, a contributor with author role should be added', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('.base-chips-below-list-item')
            .assert.attributeEquals('.base-chips-below-list-item', 'name', authorText)
            .assert.elementPresent('div[id^="http"][id$="author"]');
    });

});

