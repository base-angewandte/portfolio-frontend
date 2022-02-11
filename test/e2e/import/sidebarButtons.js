/* eslint-disable */

/**
 * This suite tests the behaviour of buttons at the top of the application's sidebar ("New", "Import", and "Search") in conjunction with the "Import" feature.
 */

const logOutButton = 'footer > ul > li:nth-child(1)';
const sidebarImportButton = '[data-e2e-import-button]';
const importSearchBox = '[data-e2e-import-search-box]';
const sidebarSearchButton = '[data-e2e-search-button]';
const sidebarNewButton = '[data-e2e-new-button]';

describe('Test sidebar buttons behaviour', function () {

    this.tags = ['sidebar-buttons'];

    before(function (browser) {
        // Login to app
        browser.globals.login(browser);
    });

    it('after login, the logout button should be shown', function (browser) {
        browser
            .assert.visible(logOutButton)
            .assert.textContains(logOutButton, 'Log Out');
    });

    it('after login, the import button should be visible', function (browser) {
        browser
            .assert.visible(sidebarImportButton)
            .assert.textContains(sidebarImportButton, 'Import');
    });

    it('clicking the sidebar import button should display the import view', function (browser) {
        browser
            .click(sidebarImportButton)
            .assert.visible(importSearchBox)
            .assert.urlContains('/import');
    });

    it('clicking the sidebar search should minimize the "import" and "new" buttons', function (browser) {
        browser
            .click(sidebarSearchButton)
            .assert.hasClass(sidebarImportButton, 'minimized')
            .assert.hasClass(sidebarNewButton, 'minimized');
    });

    it('clicking the "new" button should maximize the "import" button and minimize the "search" button', function (browser) {
        browser
            .click(sidebarNewButton)
            .assert.hasClass(sidebarImportButton, 'maximized')
            .assert.hasClass(sidebarSearchButton, 'minimized')
            .assert.urlContains('/new');
    });

});

