const { expect } = require('@playwright/test');
class LoginPage {
  constructor(page) {
    this.page = page;
  }

  // Navigate to the WordPress admin
  async navigateToLogin(url) {
    await this.page.goto(url);
    // Wait for the page to load
    await this.page.waitForLoadState("domcontentloaded");
  }

  // Handle sandbox continue button if present
  async handleSandboxContinue() {
    const continueButton = this.page.getByRole("button", { name: "Continue" });
    if (await continueButton.isVisible({ timeout: 5000 })) {
      await continueButton.click();
      // waits until all network requests finish (page fully loaded)
      await this.page.waitForLoadState("networkidle");
    }
  }

  // Fill login form efficiently without redundant actions
  async login(username, password) {
    await this.page
      .getByRole("textbox", { name: 'Username or Email Address' })
      .fill(username);

    await this.page
      .getByRole("textbox", { name: 'Password' })
      .fill(password);

    // Submit login form and wait for navigation
    await Promise.all([
      this.page.waitForURL(/wp-admin/),
      this.page.getByRole("button", { name: 'Log In' }).click(),
    ]);
  }

  // Verify successful login
  async verifyLoginSuccess() {
    await this.page.waitForTimeout(2000); // brief wait for stability
    await expect(
      this.page.getByRole("heading", { name: 'Welcome to WordPress!' })
    ).toBeVisible();
    await this.page.waitForLoadState("networkidle");
  }
}

module.exports = LoginPage;