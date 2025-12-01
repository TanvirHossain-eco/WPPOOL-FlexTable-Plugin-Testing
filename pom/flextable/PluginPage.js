const { expect } = require('@playwright/test');
class PluginPage {
  constructor(page) {
    this.page = page;
  }

  // 1. Navigate to the Installed Plugin Page
  async navigateToPlugins() {
    await this.page.getByRole("link", { name: "Plugins", exact: true }).click();
    await this.page.waitForLoadState("networkidle");
  }

  // 2. Search FlexTable Plugin (Installed Plugins Page)
  async searchPlugin(pluginName) {
    await this.page.locator('#plugin-search-input').fill(pluginName);
    await this.page.waitForTimeout(2000);
  }

  // Check if plugin is found in installed plugins
  async getSearchResult() {
    return await this.page.locator('.displaying-num').first().textContent();
  }

  // Go to Plugin Repository Page for Adding FlexTable Plugin
  async navigateToAddPlugins() {
    await this.page.locator('a.page-title-action').click();
    await this.page.waitForLoadState("networkidle");
  }

  // Search FlexTable Plugin at Repository
  async searchPluginInRepository(pluginName) {
    await this.page.locator('#search-plugins').fill(pluginName);
    await this.page.waitForTimeout(3000);
  }

  // Verify Plugin Title & Author
  async verifyPluginTitle() {
    await expect(
      this.page.locator('a', { hasText: 'FlexTable – Live WP table sync with Google Sheets' }).first()
    ).toBeVisible();
  }

  async verifyAuthor() {
    await expect(
      this.page.locator('a', { hasText: 'WPPOOL' }).first()
    ).toBeVisible();
  }

  // Install Plugin
  async installPlugin() {
    await this.page.locator('a[aria-label^="Install FlexTable"]').click();
    await this.page.waitForLoadState("networkidle");
  }

  // Wait for Activate Button
  async waitForActivateButton() {
    await expect(
      this.page.getByRole("button", { name: "Activate FlexTable" })
    ).toBeVisible({ timeout: 15000 });
  }

  // Activate Plugin
  async activatePlugin() {
    await this.page.getByRole('button', { name: 'Activate FlexTable' }).click();
    await this.page.waitForLoadState("networkidle");
  }

  // Navigate to Installed Plugins Page (after activation)
  async navigateToInstalledPlugins() {
    await this.page.getByRole("link", { name: "Plugins", exact: true }).click();
    await this.page.waitForLoadState("networkidle");
  }

  // Search FlexTable Plugin at Installed Plugins Page (after activation)
  async searchInstalledPlugin(pluginName) {
    await this.page.locator('#plugin-search-input').fill(pluginName);
    await this.page.waitForTimeout(1000);
  }

  // Verify plugin is installed & activated
  async verifyPluginActivated() {
    await expect(
      this.page.locator("#deactivate-sheets-to-wp-table-live-sync")
    ).toBeVisible();
  }

  // Check & Verify "FlexTable Deactivate" is visible
  async isPluginDeactivated() {
    const deactivatebutton = await this.page.locator('#deactivate-sheets-to-wp-table-live-sync');
    return await deactivatebutton.isVisible().catch(() => false);
  }

  // If "FlexTable Deactivate" is visible
  async verifyPluginDeactivateVisible() {
    await expect(
      this.page.locator('#deactivate-sheets-to-wp-table-live-sync')
    ).toBeVisible();
  }

  // Activate plugin if not activated
  async activatePluginIfInactive() {
    const activateButton = await this.page.locator('#activate-sheets-to-wp-table-live-sync');
    await activateButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  // Finally Navigate to WordPress Dashboard
  async navigateToDashboard() {
    const wpDashBoard = await this.page.locator(':text-is("Dashboard")').first();
    await wpDashBoard.click();
    await this.page.waitForLoadState("networkidle");
  }

  // Assertion Return to WordPress Dashboard
  async verifyDashboardLoaded() {
    await expect(
      this.page.getByRole("heading", { name: 'Welcome to WordPress!' })
    ).toBeVisible();
  }
}

module.exports = PluginPage;