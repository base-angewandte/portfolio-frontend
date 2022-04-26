/* eslint-disable */

/**
 * This suite tests the ui behavior when importing entries of type "audio recording" from library catalogue.
 */

 describe('Test audio type', function () {

    this.tags = ['import-audio'];

    // search value used in this test
    const searchValue = "Entorno empresarial curso de español para extranjeros";
    // the testing (positive) values that are expected
    const titleText = 'Entorno empresarial curso de español para extranjeros ; nivel B2 ; [ELE] CD';
    const dateText = '2008';

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

    it('after importing 1 entry, the portfolio entry type should be audio', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('div[id^="http"][id$="audio_recording"]');
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
        .assert.elementPresent('div[id^="http"][id$="es"]');
    });

});

