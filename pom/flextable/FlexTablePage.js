const { expect } = require('@playwright/test');
class FlexTablePage {
  constructor(page) {
    this.page = page;
  }

  // Navigate to FlexTable Dashboard
  async navigateToDashboard() {
    const flexTableMenu = await this.page.locator(':text("FlexTable")').first();
    await flexTableMenu.hover();
    await this.page.waitForLoadState("networkidle");
    const flexTableDashboard = await this.page.locator("a[href='admin.php?page=gswpts-dashboard#/doc']");
    await flexTableDashboard.click();
    await this.page.waitForLoadState("networkidle");
  }

  // Assertion FlexTable Dashboard Loaded
  async verifyDashboardLoaded() {
    const flexTableDashboardHeading = await this.page.locator('.cta-title').textContent();
    return flexTableDashboardHeading.includes('Get started with your first table');
  }

  // On FlexTable Dashboard, click Create New Table.
  async clickCreateNewTable() {
    const createNewTable = await this.page.getByRole('button', { name: 'Create new table' });
    await createNewTable.click();
    await this.page.waitForLoadState("networkidle");
  }

  // Enter the Google Sheet URL, Table Title, and Table Description.
  // Provide Google Sheet URL & Click "Create table from URL"
  async fillGoogleSheetUrl(url) {
    const linkUrlInputTextBox = await this.page.getByRole('textbox', { name: 'Paste your Google Sheet URL here' });
    await linkUrlInputTextBox.fill(url);
  }

  async createTableFromUrl() {
    const createTableButton = await this.page.getByRole('button', { name: 'Create table from URL' });
    await createTableButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  // Provide Table Title & Table Description
  async fillTableDetails(title, description) {
    const tableTitle = await this.page.locator('#table-name');
    const tableDescription = await this.page.locator('#table-description');
    await tableTitle.fill(title);
    await tableDescription.fill(description);
  }

  // Click on the Save changes Button
  async saveChanges() {
    const saveChangesButton = await this.page.getByRole('button', { name: 'Save changes' });
    await saveChangesButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  // Assertion Setting Saved Successfully
  async verifySavedSuccessfully() {
    const settingSavedSuccessfully = await this.page.locator(':text-is("Settings saved successfully.")');
    await expect(settingSavedSuccessfully).toContainText('Settings saved successfully.');
  }

  // Return to FlexTable Dashboard
  async returnToDashboard() {
    const flexTableMenu = await this.page.locator(':text("FlexTable")').first();
    await flexTableMenu.click();
  }

  // Assertion A new table entry appears in the FlexTable Dashboard list.
  // Assertion Dashboard Table Name is matching with Table Title
  async verifyTableTitle(expectedTitle) {
    const flexDashboardTableTitle = await this.page.locator("a[class='table-edit'] h4[class='swptls-title h4']").nth(0);
    await expect(flexDashboardTableTitle).toHaveText(expectedTitle);
  }

  // Copy the shortcode
  async getShortcodeValue() {
    const copyShortcodeButton = await this.page.locator('button.copy-shortcode.btn-shortcode:visible').first();
    const shortCodeText = await copyShortcodeButton.textContent();
    const shortValue = shortCodeText.match(/\d+/)[0];
    return shortValue;
  }

  // Navigate to FlexTable All Tables Page
  async navigateToAllTables() {
    const flexTableMenu2 = await this.page.locator(':text("FlexTable")').first();
    await flexTableMenu2.hover();
    await this.page.waitForTimeout(2000);
    const flexTableAllTables = await this.page.locator(':text-is("All Tables")');
    await flexTableAllTables.click();
    await this.page.waitForLoadState("networkidle");
  }

  // Assertion FlexTable All Tables Page Loaded
  async verifyAllTablesPageLoaded() {
    const assertionFlexTableAllTablesPage = await this.page.locator('.header-title').textContent();
    return assertionFlexTableAllTablesPage.includes('All Tables');
  }

  // Navigate to TABLE_TITLE edit page
  async navigateToTableEditPage() {
    const tableTitleEditPage = await this.page.locator("div[class='tooltip-wrapper'] a[class='table-edit']").first();
    await tableTitleEditPage.click();
    await this.page.waitForTimeout(2000);
  }

  // Navigate to Table Customization Tab
  async navigateToTableCustomization() {
    const tableCustomizationTab = await this.page.locator(':text-is("3. Table customization")');
    await tableCustomizationTab.click();
    await this.page.waitForTimeout(2000);
  }

  // Enable 'Show Table Title' and 'Show Table Description Below the Table
  async enableShowTableTitle() {
    const showTableTitle = await this.page.locator('#show-title');
    await showTableTitle.click();
    await this.page.waitForTimeout(2000);
  }

  async enableShowTableDescription() {
    const showTableDescription = await this.page.locator('#show-description');
    await showTableDescription.click();
    await this.page.waitForTimeout(2000);
  }

  async setDescriptionPositionBelow() {
    const showTableDescriptionBelowTable = await this.page.locator('#description-position');
    await showTableDescriptionBelowTable.selectOption('below');
    await this.page.waitForTimeout(2000);
  }

  // Assertion Table Bottom Elements are displayed
  async verifyTableBottomElements() {
    const tableBottomElements = await this.page.getByRole('heading', { name: 'Table bottom elements' });
    await expect(tableBottomElements).toBeVisible();
  }

  // Enable Show Entry Info and Show Pagination
  async enableEntryInfo() {
    const showEntryInfo = await this.page.locator("#hide-entry-info");
    await showEntryInfo.click();
  }

  async enablePagination() {
    const showPagination = await this.page.locator("#hide-pagination");
    await showPagination.click();
  }

  // Navigate to Styling Tab
  async navigateToStylingTab() {
    const stylingTab = await this.page.locator(':text-is("Styling")');
    await stylingTab.click();
    await this.page.waitForTimeout(2000);
  }

  // Select any value from Rows Per Page
  async setRowsPerPage(value) {
    const rowsPerPage = this.page.locator('#rows-per-page');
    await rowsPerPage.scrollIntoViewIfNeeded();
    await rowsPerPage.selectOption(value);
    await this.page.waitForTimeout(2000);
  }

  // Select a value for Table height.
  async setTableHeight(height) {
    const tableHeight = this.page.locator('#table_height');
    await tableHeight.selectOption(height);
    await this.page.waitForTimeout(2000);
  }

  // Delete the table
  async deleteTable() {
    const deleteTable = await this.page.locator(".table-delete");
    await deleteTable.click();
    await this.page.waitForTimeout(2000);
  }

  // Handling Delete Popup
  async confirmDelete() {
    const deletePopup = await this.page.locator(':text-is("Are you sure to delete the table?")');
    await expect(deletePopup).toBeVisible();
    const deleteButton = await this.page.locator(':text-is("Delete")');
    await deleteButton.click();
    await this.page.waitForTimeout(2000);
  }

  // Assertion Table Deleted Successfully
  async verifyTableDeletedFromBackend() {
    const tableDeletedSuccessfully = await this.page.locator('.no-tables-created-intro p').first();
    await expect(tableDeletedSuccessfully).toContainText('Click the button below to create your first table!');
  }
}

module.exports = FlexTablePage;