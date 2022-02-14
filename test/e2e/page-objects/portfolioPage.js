/* eslint-disable */

/**
 * This file defines CSS selectors to identify various elements in a portfolio page, 
 * for the purpose of automated testing with Nightwatch.js. The goal is to have all 
 * selectors in one place, as opposed to defining them locally in each test.
  */

module.exports = {
    url: '',
    elements: {
        // Login-related
        logOutButton: {
            selector: 'footer > ul > li:nth-child(1)',
            suppressNotFoundErrors: true
        },
        // Sidebar elements
        sidebarImportButton: {
            selector: '[data-e2e-import-button]',
            suppressNotFoundErrors: true
        },
        sidebarSearchButton: {
            selector: '[data-e2e-search-button]',
            suppressNotFoundErrors: true
        },
        sidebarNewButton: {
            selector: '[data-e2e-new-button]',
            suppressNotFoundErrors: true
        },
        // Notifications
        successNotification: {
            selector: '.success.notification',
            suppressNotFoundErrors: true
        },
        // Import-specific
        importSearchBox: {
            selector: '[data-e2e-import-search-box]',
            suppressNotFoundErrors: true
        },
        importSearchInput: {
            selector: '[data-e2e-import-search-box] input',
            suppressNotFoundErrors: true
        },
        loadingSelector: {
            selector: '[data-e2e-import-loading]',
            suppressNotFoundErrors: true
        },
        noResultsSelector: {
            selector: '[data-e2e-import-noresults]',
            suppressNotFoundErrors: true
        },
        resultsAccordion: {
            selector: '[data-e2e-import-results]',
            suppressNotFoundErrors: true
        },
        resultBoxOptions: {
            selector: '[data-e2e-import-results-options]',
            suppressNotFoundErrors: true
        },
        resultsPagination: {
            selector: '[data-e2e-import-results-pagination]',
            suppressNotFoundErrors: true
        },
        runImportButton: {
            selector: '[data-e2e-import-run]',
            suppressNotFoundErrors: true
        },
        cancelImportButton: {
            selector: '[data-e2e-import-cancel]',
            suppressNotFoundErrors: true
        },
        clearIconSelector: {
            selector: '[data-e2e-import-search-box] button.base-input__remove-icon-wrapper',
            suppressNotFoundErrors: true
        },
        selectAllButton: {
            selector: '[data-e2e-import-results-options] > button > span.base-button-text',
            suppressNotFoundErrors: true
        },
        selectNoneButton: {
            selector: '[data-e2e-import-results-options] > button > span.base-button-text',
            suppressNotFoundErrors: true
        },
        checkBoxes: {
            selector: '[data-e2e-import-results] .base-expand-row-checkbox input.base-checkbox-input',
            suppressNotFoundErrors: true
        },
        firstCheckBox: {
            selector: '[data-e2e-import-results] .base-expand-row-checkbox input.base-checkbox-input:nth-child(1)',
            suppressNotFoundErrors: true
        },
        selectedEntriesCount: {
            selector: '[data-e2e-import-results-options] .base-select-options__number-selected',
            suppressNotFoundErrors: true
        },
    },
    commands: [{
        // for future use
    }]
};