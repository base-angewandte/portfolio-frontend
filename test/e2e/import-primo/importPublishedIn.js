/* eslint-disable */

/**
 * This suite tests the ui behavior when importing entries of type "article" that have a "published in" field.
 */

 describe('Test "published in" field', function () {

    this.tags = ['import-published-in'];

    // search value used in this test
    const searchValue = "contextualizing praying bodies";
    // the testing (positive) values that are expected
    const titleText = 'Contextualizing Praying Bodies Gestures and the Military';
    const dateText = '2021';
    const publishedInText = 'Enthalten in: Throwing gestures / edited by Florian Bettel, Irina Kaldrack, Konrad Strutz ; with contributions from Florian Bettel [und 14 weitere], Wien : Verlag für moderne Kunst, [2021], Seite 79-88  . - ISBN:9783903572256 390357225X'

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

    it('after importing 1 entry of type article, success notification appears', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .setValue('@importSearchInput', searchValue)
            .waitForElementVisible('@resultsAccordion', 12000)
            .click('@firstCheckBox')
            .click('@runImportButton')
            .assert.visible('@successNotification')
            .click('@closeNotificationButton');
    });

    it('after importing 1 entry of type article, the portfolio entry type should be article', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('div[id^="http"][id$="article"]');
    });

    it('after importing 1 entry of type article, the title should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@titleSelector')
            .assert.valueEquals('@titleSelector', titleText)
    });

    it('after importing 1 entry of type article, the date should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@dateSelector')
            .assert.valueEquals('@dateSelector', dateText)
    });

    it('after importing 1 entry, the "published in" field should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        const pubInSelector = 'input[id=title_0_published_in_8_0_extended_published_in]';
        page
            .assert.elementPresent(pubInSelector)
            .assert.valueEquals(pubInSelector, publishedInText)
    });

    it('after importing 1 entry of type article, the language should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
        .assert.elementPresent('div[id^="http"][id$="en"]');
    });

});

