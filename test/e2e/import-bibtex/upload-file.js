/* eslint-disable */

/**
 * This suite tests the ui for importing data from a Bibtex (.bib) file.
 */

 describe('Test Bibtex file upload', function () {

    this.tags = ['upload-file'];

    before(function (browser) {
        // Login to app
        browser.globals.login(browser);
    });

    it('after login, logout button should be shown', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.visible('@logOutButton')
            .assert.textContains('@logOutButton', 'Log Out');
    });

    it('after clicking import, upload drop box should be visible', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .click('@sidebarImportButton')
            .assert.visible('@importDropBox');
    });

    it('after selecting a file, the upload dialog box should contain the file name', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .uploadFile('input[type="file"]', require('path').resolve(__dirname + '/files/bibliography.bib'))
            .assert.visible('.base-pop-up')
            .assert.textContains('div[class="base-progress-bar__file-name"]', "bibliography.bib");
    });

    it('after clicking upload, the results options and accordeon (grid) should be visible', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .click('.popup-button-row >button:nth-child(2)')
            .waitForElementVisible('@resultBoxOptions')
            .waitForElementVisible('@resultsAccordion', 12000)
            .assert.elementPresent('@resultBoxOptions')
            .assert.elementPresent('@resultsAccordion')
            // the import button should be disabled by default
            .assert.not.enabled('@runImportButton')
            // the first row of the grid should have a title
            .assert.textContains('[data-e2e-import-results] :nth-child(1) > div > button > div > div', 'Interpreting Mixed Membership Models: Implications of Erosheva\'s Representation Theorem')
            // the second row of the grid should have a title
            .assert.textContains('[data-e2e-import-results] :nth-child(2) > div > button > div > div', 'Cognitive Psychology and Educational Assessment')
    });

    it('after clicking "select all", all records should be selected and button text changed to "select none"', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .click('@selectAllButton')
            .assert.selected('@checkBoxes', 'All check boxes are selected.')
            .assert.textContains('@selectAllButton', 'Select None', '"Select All" changed to "Select None".')
            .assert.textContains('@selectedEntriesCount', '2', 'Number of selected entries is 2.')
            .assert.enabled('@runImportButton', '"Import" button is enabled.');
    });

    it('after clicking cancel, the results should be cleared', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .click('@cancelImportButton')
            .assert.not.elementPresent('@resultBoxOptions')
            .assert.not.elementPresent('@resultsAccordion')
            .assert.not.elementPresent('@resultsPagination')
    });

});

