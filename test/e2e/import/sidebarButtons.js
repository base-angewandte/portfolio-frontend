/* eslint-disable */

/**
 * This suite tests the behaviour of buttons at the top of the application's sidebar ("New", "Import", and "Search") in conjunction with the "Import" feature.
 */

const logOutButtonSelector = 'footer > ul > li:nth-child(1)';
const sidebarImportButtonSelector = '[data-e2e-import-button]';
const searchImportInputSelector = '[data-e2e-search-import-input]';
const sidebarSearchButtonSelector = '[data-e2e-search-button]';
const sidebarNewButtonSelector = '[data-e2e-new-button]';

describe('Test sidebar buttons behaviour', function () {

    before(function (browser) {
        // Login to app
        browser.globals.login(browser);
    });

    it('assert login successful', function (browser) {
        browser
            .assert.visible(logOutButtonSelector)
            .assert.textContains(logOutButtonSelector, 'Log Out');
    });

    it('assert import button visible', function (browser) {
        browser
            .assert.visible(sidebarImportButtonSelector)
            .assert.textContains(sidebarImportButtonSelector, 'Import');
    });

    it('clicking the import button displays the import view', function (browser) {
        browser
            .click(sidebarImportButtonSelector)
            .assert.visible(searchImportInputSelector);
    });

    it('clicking the sidebar search minimizes the "import" and "new" buttons', function (browser) {
        browser
            .click(sidebarSearchButtonSelector)
            .assert.hasClass(sidebarImportButtonSelector, 'minimized')
            .assert.hasClass(sidebarNewButtonSelector, 'minimized');
    });

    it('clicking the "new" button maximizes the "import" button and minimizes the "search" button', function (browser) {
        browser
            .click(sidebarNewButtonSelector)
            .assert.hasClass(sidebarImportButtonSelector, 'maximized')
            .assert.hasClass(sidebarSearchButtonSelector, 'minimized');
    });

});

