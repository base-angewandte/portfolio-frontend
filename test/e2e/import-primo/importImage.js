/* eslint-disable */

/**
 * This suite tests the ui behavior when importing entries of type "image" from library catalogue.
 */

 describe('Test image type', function () {

    this.tags = ['import-image'];

    // search value used in this test
    const searchValue = "wien rieger albert";
    // the testing (positive) values that are expected
    const titleText = 'Wien';
    const subtitleText = 'Altkarte$$QAltkarte';
 
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

    it('after importing 1 entry, the portfolio entry type should be image', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('div[id^="http"][id$="image"]');
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

    it('after importing 1 entry, a contributor with author role should be added', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('.base-chips-below-list-item')
            .assert.attributeEquals('.base-chips-below-list-item', 'name', 'Rieger, Albert, 1834-1905 [KünstlerIn]')
            .assert.elementPresent('div[id^="http"][id$="author"]');
    });



});

