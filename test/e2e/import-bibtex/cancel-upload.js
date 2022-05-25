/* eslint-disable */

/**
 * This suite tests the ui for importing data from a Bibtex (.bib) file.
 */

 describe('Test cancellation of Bibtex file upload', function () {

    this.tags = ['cancel-bibtex-upload'];

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

    it('after uploading the file, the results options and accordeon (grid) should be visible', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .click('.popup-button-row >button:nth-child(2)')
            .waitForElementVisible('@resultBoxOptions')
            .waitForElementVisible('@resultsAccordion', 12000);
    });

    it('after clicking cancel, the results grid should be cleared', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .click('@cancelImportButton')
            .assert.not.elementPresent('@resultBoxOptions')
            .assert.not.elementPresent('@resultsAccordion')
            .assert.not.elementPresent('@resultsPagination')
    });

});

