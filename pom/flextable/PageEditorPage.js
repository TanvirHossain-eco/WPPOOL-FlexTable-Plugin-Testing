const { expect } = require('@playwright/test');
class PageEditorPage {
  constructor(page) {
    this.page = page;
  }

  // Navigate to the Pages Menu
  async navigateToPages() {
    const pagesMenu = await this.page.locator("//div[normalize-space()='Pages']");
    await pagesMenu.hover();
    const allPagesMenu = await this.page.locator('a:has-text("All Pages")');
    await allPagesMenu.click();
  }

  // Go to Add New Page
  async addNewPage() {
    const addNewPageButton = await this.page.locator(".page-title-action");
    await addNewPageButton.click();
    await this.page.waitForTimeout(5000);
  }

  // Add Page Title
  async fillPageTitle(title) {
    const pageTitle = await this.page.getByLabel('Add title');
    await pageTitle.click();
    await pageTitle.fill(title);
  }

  // Add Page Block
  // Search the required block
  async addFlexTableBlock() {
    const pageBlock = await this.page.getByLabel('Add block');
    await pageBlock.click();
    const searchBlock = await this.page.locator('#components-search-control-0');
    await searchBlock.click();
    await searchBlock.fill('FlexTable');
    const flexTableBlock = await this.page.locator('span').filter({ hasText: 'FlexTable' }).first();
    await flexTableBlock.click();
  }

  // Connect the Required table
  // Select the table from the dropdown option
  async selectTable(shortValue) {
    const chooseTable = await this.page.getByRole('button', { name: 'Choose Table' });
    await chooseTable.click();
    const select = await this.page.getByLabel('Select Table')
    await select.selectOption(shortValue);
    await this.page.waitForTimeout(5000);
  }

  // Save & Publish
  async publishPage() {
    const saveAndPublishButton = await this.page.locator(':text-is("Publish")');
    await saveAndPublishButton.click();
    await this.page.waitForTimeout(5000);
    const confirmPublishButton = await this.page.locator("//button[@class='components-button editor-post-publish-button editor-post-publish-button__button is-primary is-compact']");
    await confirmPublishButton.click();
    await this.page.waitForTimeout(5000);
  }

  // Return to Pages Menu from Page Editor
  async returnToPages() {
    const viewPageButton = await this.page.getByLabel('View Pages');
    await viewPageButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  // Assertion Page is published
  // need to create logic so that check if there are any page were before and if does then must able to edit and modified accordingly also need to ensure there is only one page with the same title.
  async getPublishedPageTitle() {
    const publishedPage = await this.page.locator('a.row-title').first();
    return publishedPage;
  }

  // Navigate to the Published Page
  // Open the Page
  async openPublishedPage() {
    const publishedPage = await this.page.locator('a.row-title').first();
    await publishedPage.hover();
    const pageView = await this.page.locator("a[aria-label='View “Flex Table Data”']");
    await pageView.click();
    await this.page.waitForLoadState("networkidle");
  }

  // Assertion
  async verifyFrontPageTitle(expectedTitle) {
    const frontPageTitle = await this.page.locator('h1.entry-title');
    await expect(frontPageTitle).toHaveText(expectedTitle);
  }

  // verify that 6 table cells match with the Google Sheet data.
  // Keep the Google Sheet Data in an array
  async extractTableData(shortValue) {
    try {
      // Extract data from the table rendered by shortcode
      const table = await this.page.locator(`div[id='${shortValue}']`);
      await table.scrollIntoViewIfNeeded();
      await table.waitFor({ state: 'visible' });

      // Get only first 2 rows
      const row1 = table.locator('tbody tr:nth-child(1)');
      const row2 = table.locator('tbody tr:nth-child(2)');

      // Extract data from first row (first 3 columns)
      const row1Data = {
        Name: (await row1.locator('td:nth-child(1)').textContent()).trim(),
        ID: (await row1.locator('td:nth-child(2)').textContent()).trim(),
        Subject: (await row1.locator('td:nth-child(3)').textContent()).trim()
      };

      // Extract data from second row (first 3 columns)
      const row2Data = {
        Name: (await row2.locator('td:nth-child(1)').textContent()).trim(),
        ID: (await row2.locator('td:nth-child(2)').textContent()).trim(),
        Subject: (await row2.locator('td:nth-child(3)').textContent()).trim()
      };

      // Compare with Google Sheet data
      return { row1Data, row2Data };
    } catch (error) {
      console.error('Data comparison failed:', error.message);
      throw error;
    }
  }

  // Delete the Page from the Backend
  async deletePage() {
    const publishedPage = await this.page.locator('a.row-title').first();
    await publishedPage.hover();
    await this.page.waitForTimeout(2000);
    const trashPageBtn = await this.page.locator('a.submitdelete').first();
    await trashPageBtn.click();
  }

  // Go to Trash Page
  async goToTrash() {
    const trashPage = await this.page.locator('.subsubsub .trash a');
    await trashPage.click();
    await this.page.waitForLoadState("networkidle");
  }

  // Delete the Page Permanently
  async permanentlyDeletePage() {
    const deletePage = await this.page.locator(':text-is("Flex Table Data")').first();
    await deletePage.hover();
    await this.page.waitForTimeout(2000);
    const permanentlyDeletePage = await this.page.locator('.submitdelete');
    await permanentlyDeletePage.click();
    await this.page.waitForTimeout(2000);
  }

  // Assertion The text
  async verifyPageDeletedFromTrash() {
    const pageDeletedSuccessfully = await this.page.locator('td.colspanchange');
    await expect(pageDeletedSuccessfully).toContainText('No pages found in Trash.');
  }
}

module.exports = PageEditorPage;