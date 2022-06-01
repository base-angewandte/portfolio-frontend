/* eslint-disable */

/**
 * This suite tests the ui behavior when importing entries where language is other than "de" or "en".
 * For such entries, description should go into the "Notes" field.
 */

 describe('Test how the field "Notes" is populated', function () {

    this.tags = ['populate-notes'];

    // search value used in this test
    const searchValue = "Educaţia istorică între discursul politic şi identitar în Republica Moldova,Educaţia istorică - între discursul politic şi identitar în Republica Moldova";
    // the testing (positive) values that are expected
    const titleText = 'Educaţia istorică între discursul politic şi identitar în Republica Moldova,Educaţia istorică - între discursul politic şi identitar în Republica Moldova';
    const dateText = '2010';
    const pagesText = '363 S., Ill.';
    const descText = 'Literaturverz. S. 133 - 168';

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

    it('after importing 1 entry of type book, the portfolio entry type should be monograph', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('div[id^="http"][id$="monograph"]');
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
            .assert.elementPresent('@dateSelector')
            .assert.valueEquals('@dateSelector', dateText)
    });

    it('after importing 1 entry, the pages field should be populated', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('@pagesSelector')
            .assert.valueEquals('@pagesSelector', pagesText)
    });

    it('after importing 1 entry where primary language is "ro", the language should be populated as such', function(browser) {
        const page = browser.page.portfolioPage();
        page
        .assert.elementPresent('div[id^="http"][id$="ro"]');
    });

    it('after importing 1 entry where primary language is other than "de" or "en", the "notes" should be populated with description text', function(browser) {
        const page = browser.page.portfolioPage();
        page
        .assert.elementPresent('@notesSelector')
        .assert.valueEquals('@notesSelector', descText);
    });

});

