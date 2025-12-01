const { expect } = require('@playwright/test');
class FrontendPage {
  constructor(page, baseUrl) {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  // Visit the table on the frontend
  async navigateToTablePage() {
    await this.page.goto(`${this.baseUrl}/flex-table-data/`);
  }

  // Assertion Table Title is displayed above the table
  async verifyTableTitleVisible() {
    const frontendTableTitle = await this.page.locator('.swptls-table-title');
    const frontendTableContainer = await this.page.locator("#create_tables_wrapper");
    
    await expect(frontendTableTitle).toBeVisible();
    await expect(frontendTableContainer).toBeVisible();
  }

  async verifyTableTitleAboveTable() {
    const frontendTableTitle = await this.page.locator('.swptls-table-title');
    const frontendTableContainer = await this.page.locator("#create_tables_wrapper");

    const frontendTableTitleBox = await frontendTableTitle.boundingBox();
    const currentfrontendTableContainerBox1 = await frontendTableContainer.boundingBox();

    await expect(frontendTableTitleBox.y).toBeLessThan(currentfrontendTableContainerBox1.y);
  }

  // Assertion Table Description is displayed below the table
  async verifyTableDescriptionBelowTable() {
    const frontendTableDescription = await this.page.locator("#swptls-table-description");
    const frontendTableContainer = await this.page.locator("#create_tables_wrapper");
    
    await frontendTableDescription.scrollIntoViewIfNeeded();
    await expect(frontendTableDescription).toBeVisible();
    const currentfrontendTableContainerBox2 = await frontendTableContainer.boundingBox();
    const frontendTableDescriptionBox = await frontendTableDescription.boundingBox();
    await expect(frontendTableDescriptionBox.y).toBeGreaterThan(currentfrontendTableContainerBox2.y);
  }

  // Scroll into View and Assertion Entry Info displays correctly
  async verifyEntryInfoVisible() {
    const entryInfo = await this.page.locator('#create_tables_info');
    await entryInfo.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(2000);
    const entryInfoBox = await entryInfo.boundingBox();
    const tableContainerBox = await this.page.locator(".dataTables_scroll").boundingBox();
    await expect(entryInfoBox.y).toBeGreaterThan(tableContainerBox.y);
  }

  // Assertion Pagination is visible 
  async verifyPaginationVisible() {
    const pagination = await this.page.locator('#create_tables_paginate');
    const tableContainerBox = await this.page.locator(".dataTables_scroll").boundingBox();
    const paginationBox = await pagination.boundingBox();
    await expect(paginationBox.y).toBeGreaterThan(tableContainerBox.y);
  }

  // Assertion Pagination is functional if the Entry Info is text is changed
  async clickPaginationNext() {
    const paginationNext = await this.page.locator('span:has-text("Next")');
    await paginationNext.click();
    await this.page.waitForTimeout(2000);
  }

  // Assertion Pagination Previous Button is functional
  async clickPaginationPrevious() {
    const paginationPrevious = await this.page.locator('span:has-text("Previous")');
    await paginationPrevious.click();
    await this.page.waitForTimeout(2000);
  }

  // Assertion Pagination 2 Button is functional
  async clickPaginationPage(pageNumber) {
    const paginationPage = await this.page.locator(`:text-is("${pageNumber}")`);
    await paginationPage.click();
    await this.page.waitForTimeout(2000);
  }

  // Assertion Pagination 1 Button is functional
  async clickPaginationPageLink(pageNumber) {
    const paginationPageLink = await this.page.locator(`a:has-text("${pageNumber}")`);
    await paginationPageLink.click();
    await this.page.waitForTimeout(2000);
  }

  // Verify Entry Info text
  async verifyEntryInfoText(expectedText) {
    const entryInfoText = await this.page.getByText(expectedText, { exact: true });
    await expect(entryInfoText).toBeVisible();
  }

  // Assertion Rows per page matches selected value
  async verifyRowsPerPage(expectedValue) {
    const rowsPerPageFrontend = this.page.locator('[name="create_tables_length"]');
    const defaultSelectedRowsValue = await rowsPerPageFrontend.inputValue();
    console.log(`Default selected value: ${defaultSelectedRowsValue}`);
    await expect(defaultSelectedRowsValue).toBe(expectedValue);
  }

  // Assertion Table height matches selected value
  async verifyTableHeight(expectedHeight) {
    const tableHeightFrontend = await this.page.locator('.dataTables_scrollBody');
    const tableHeightValue = await tableHeightFrontend.evaluate(el => window.getComputedStyle(el).height);
    const heightNumber = parseInt(tableHeightValue);
    console.log(`Table Height: ${heightNumber}`);
    await expect(heightNumber).toBe(Number(expectedHeight));
  }

  // Assertion Table Deleted Successfully from frontend
  async verifyTableDeletedFromFrontend() {
    const tableDeletedSuccessfullyFrontend = await this.page.locator('.entry-content h5 b');
    await expect(tableDeletedSuccessfullyFrontend).toContainText("Table maybe deleted or can't be loaded.");
  }
}

module.exports = FrontendPage;