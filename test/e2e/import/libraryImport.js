/* eslint-disable */

/**
 * This suite tests the ui for importing data from library catalogue (more specifically, typing some value in the import search box, selecting entries, and then clicking the import button).
 */

const logOutButton = 'footer > ul > li:nth-child(1)';
const sidebarImportButton = '[data-e2e-import-button]';
const importSearchBox = '[data-e2e-import-search-box]';
const importSearchInput = '[data-e2e-import-search-box] input';
const loadingSelector = '[data-e2e-import-loading]';
const noResultsSelector = '[data-e2e-import-noresults]';
const resultsAccordion = '[data-e2e-import-results]';
const resultBoxOptions = '[data-e2e-import-results-options]';
const resultsPagination = '[data-e2e-import-results-pagination]';
const runImportButton = '[data-e2e-import-run]';
const cancelImportButton = '[data-e2e-import-cancel]';
const dummyText = 'a1a1a1a1a1';
const searchText = 'carl';
const clearIconSelector = importSearchBox + ' button.base-input__remove-icon-wrapper';
const selectAllButton = resultBoxOptions + ' > button > span.base-button-text';
const selectNoneButton = resultBoxOptions + ' > button > span.base-button-text';
const checkBoxes = resultsAccordion + ' .base-expand-row-checkbox input.base-checkbox-input';
const firstCheckBox = resultsAccordion + ' .base-expand-row-checkbox input.base-checkbox-input:nth-child(1)';
const selectedEntriesCount = resultBoxOptions + ' .base-select-options__number-selected';
const successNotification = '.success.notification';

describe('Test library import', function () {

    this.tags = ['library-import'];

    before(function (browser) {
        // Login to app
        browser.globals.login(browser);
    });

    it('after login, logout button should be shown', function (browser) {
        browser
            .assert.visible(logOutButton)
            .assert.textContains(logOutButton, 'Log Out');
    });

    it('assert search box visible after clicking import', function (browser) {
        browser
            .click(sidebarImportButton)
            .assert.visible(importSearchBox);
    });

    it('when typing dummy text, no results should be shown', function (browser) {
        browser
            .setValue(importSearchInput, dummyText)
            .waitForElementVisible(loadingSelector)
            .waitForElementVisible(noResultsSelector)
            // no results found text should be visible
            .assert.textContains(noResultsSelector, 'No Results Found')
            // results accordion, options, and pagination should not be present
            .assert.not.elementPresent(resultsAccordion)
            .assert.not.elementPresent(resultBoxOptions)
            .assert.not.elementPresent(resultsPagination);
    });

    it('when typing non-dummy text, the results grid should be shown', function (browser) {
        browser
            .setValue(importSearchInput, searchText)
            // accordion and options should be present
            .waitForElementVisible(loadingSelector)
            .waitForElementVisible(resultBoxOptions)
            .waitForElementVisible(resultsAccordion)
            .assert.elementPresent(resultBoxOptions)
            .assert.elementPresent(resultsAccordion)
            // 'no results found' div should not be present
            .assert.not.elementPresent(noResultsSelector);
    });

    it('the import button should be disabled by default', function (browser) {
        browser
            .setValue(importSearchInput, searchText)
            .waitForElementPresent(runImportButton)
            .assert.not.enabled(runImportButton);
    });

    it('the cancel button should clear the results', function (browser) {
        browser
            .click(cancelImportButton)
            .assert.not.elementPresent(resultBoxOptions)
            .assert.not.elementPresent(resultsAccordion)
            .assert.not.elementPresent(resultsPagination)
            .assert.textContains(importSearchInput, '');
    });

    it('the clear icon should clear the results', function (browser) {
        browser
            .setValue(importSearchInput, searchText)
            // wait for results
            .waitForElementVisible(resultsAccordion)
            .click(clearIconSelector)
            .assert.not.elementPresent(resultBoxOptions)
            .assert.not.elementPresent(resultsAccordion)
            .assert.not.elementPresent(resultsPagination)
            .assert.textContains(importSearchInput, '');
    });

    it('"select all" should select all records and change to "select none"', function (browser) {
        browser
            .setValue(importSearchInput, searchText)
            .waitForElementVisible(resultsAccordion)
            .click(selectAllButton)
            .assert.selected(checkBoxes, 'All check boxes are selected.')
            .assert.textContains(selectAllButton, 'Select None', '"Select All" changed to "Select None".')
            .assert.textContains(selectedEntriesCount, '10', 'Number of selected entries is 10.')
            .assert.enabled(runImportButton, '"Import" button is enabled.');
    });

    it('"select none" should clear selected records and change to "select all"', function (browser) {
        browser
            .setValue(importSearchInput, searchText)
            .waitForElementVisible(resultsAccordion)
            .click(selectAllButton)
            .click(selectNoneButton)
            .assert.not.selected(checkBoxes, 'No check boxes are selected.')
            .assert.textContains(selectAllButton, 'Select All', '"Select None" changed to "Select All".')
            .assert.textContains(selectedEntriesCount, '0 Entries Selected', 'Number of selected entries is 0.')
            .assert.not.enabled(runImportButton, '"Import" button is disabled.')
            .click(cancelImportButton);
    });

    it('after importing 1 entry, the success notification message should mention 1 entry', function(browser) {
        browser
            .setValue(importSearchInput, searchText)
            .waitForElementVisible(resultsAccordion)
            .click(firstCheckBox)
            .click(runImportButton)
            .assert.visible(successNotification)
            .assert.textContains(successNotification, '1 entries were imported successfully.')
            .waitForElementNotPresent(successNotification);
    });

    it('after importing 10 entries, the success notification message should mention 10 entries', function(browser) {
        browser
            .click(sidebarImportButton)
            .setValue(importSearchInput, searchText)
            .waitForElementVisible(resultsAccordion)
            .click(selectAllButton)
            .click(runImportButton)
            .assert.visible(successNotification)
            .assert.textContains(successNotification, '10 entries were imported successfully.')
            .waitForElementNotPresent(successNotification);
    });

});

