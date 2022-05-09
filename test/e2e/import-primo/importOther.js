/* eslint-disable */

/**
 * This suite tests the ui behavior when importing entries of type "other" from library catalogue.
 */

 describe('Test "other" type', function () {

    this.tags = ['import-other'];

    // search value used in this test
    const searchValue = "Iter italicum accedunt alia itinera, on CDROM";
    // the testing (positive) values that are expected
    const titleText = 'Iter italicum accedunt alia itinera, on CDROM ; ; a database of uncatalogued or incompletely catalogued humanistic manuscripts of the Renaissance in Italian and other libraries,Iter italicum accedunt alia itinera, on CD-ROM ; ; a database of uncatalogued';
    const subtitleText = 'Humanismus ; Handschrift ; Katalog ; CD-ROM,Renaissance ; Handschrift ; Katalog ; CD-ROM,Handschrift ; Geschichte 1420-1600 ; Katalog ; CD-ROM';

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

    it('after importing 1 entry, the portfolio entry type should be set', function(browser) {
        const page = browser.page.portfolioPage();
        page
            .assert.elementPresent('div[id^="http"][id$="artistic_sound_image_data_medium"]');
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


});

