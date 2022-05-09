/* eslint-disable */

/**
 * This suite tests the behaviour of buttons at the top of the application's sidebar ("New", "Import", and "Search") in conjunction with the "Import" feature.
 */

describe('Test sidebar buttons behaviour', function () {

    this.tags = ['sidebar-buttons', 'library-import'];

    before(function (browser) {
        // Login to app
        browser.globals.login(browser);
        // Ensure wide screen for this test
        browser.setWindowSize(1500, 800);
    });

    it('after login, the logout button should be shown', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.visible('@logOutButton')
            .assert.textContains('@logOutButton', 'Log Out');
    });

    it('after login, the import button should be visible', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.visible('@sidebarImportButton')
            .assert.textContains('@sidebarImportButton', 'Import');
    });

    it('clicking the sidebar import button should display the import view', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .click('@sidebarImportButton')
            .assert.visible('@importSearchBox')
            .assert.urlContains('/import');
    });

    it('clicking the sidebar search should minimize the "import" and "new" buttons', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .click('@sidebarSearchButton')
            .assert.hasClass('@sidebarImportButton', 'minimized')
            .assert.hasClass('@sidebarNewButton', 'minimized');
    });

    it('clicking the "new" button should maximize the "import" button and minimize the "search" button', function (browser) {
        const page = browser.page.portfolioPage();
        page
            .pause(5000)
            .click('@sidebarNewButton')
            .assert.hasClass('@sidebarImportButton', 'maximized')
            .assert.hasClass('@sidebarSearchButton', 'minimized')
            .assert.urlContains('/new');
    });

});

