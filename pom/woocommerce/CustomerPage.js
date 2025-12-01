const { expect } = require('@playwright/test');

class CustomerPage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {string} baseUrl
   */
  constructor(page, baseUrl) {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  // Login as customer (assumes already on my-account page)
  async loginCustomer(username, password) {
    const customerUsernameInput = await this.page.locator('#username');
    await customerUsernameInput.fill(username);
    const customerPasswordInput = await this.page.locator('#password');
    await customerPasswordInput.fill(password);
    const customerLoginButton = await this.page.locator('button[name="login"]');
    await customerLoginButton.click();
    // Wait for navigation after login
    await this.page.waitForLoadState('networkidle');
  }

  // Get displayed account user text
  async getAccountUserText() {
    const myAccountHeading = await this.page.locator('.account-text-user').first();
    return (await myAccountHeading.textContent()) || '';
  }

  // MINI-CART HELPERS

  // Open mini cart
  async openMiniCart() {
    const cartViewOpen = await this.page.locator('#mini-cart');
    await cartViewOpen.click();
    await this.page.waitForTimeout(2000);
  }

  // Close mini cart
  async closeMiniCart() {
    const cartCloseButton = await this.page.locator("div[class='minicart-overlay'] svg");
    if (await cartCloseButton.isVisible().catch(() => false)) {
      await cartCloseButton.click();
      await this.page.waitForTimeout(2000);
    }
  }

  // Get mini cart items count
  async getMiniCartItemsCount() {
    return await this.page.locator('.mini_cart_item').count();
  }

  // Get mini cart item name at index
  async getMiniCartItemName(index = 0) {
    const el = await this.page.locator('.mini_cart_item .product-details a').nth(index);
    return (await el.textContent()) || '';
  }

  // PDP helpers

  // Get PDP title text
  async getPDPTitleText() {
    const pdp3Title = await this.page.locator('h2.product_title.entry-title');
    return (await pdp3Title.textContent()) || '';
  }

  // Increase quantity on PDP by clicking plus and return numeric value
  async increaseQuantityOnPDP() {
    const quantityAdd = await this.page.locator('.plus');
    await quantityAdd.click();
    const quantityInput2 = await this.page.locator('[name="quantity"]');
    const quantityInputValue2 = await quantityInput2.inputValue();
    const quantityValue2 = parseInt(quantityInputValue2 || '1', 10);
    return quantityValue2;
  }

  // Click add to cart on PDP
  async addToCartOnPDP() {
    const addToCart3 = await this.page.locator('[name="add-to-cart"]');
    await addToCart3.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Get final quantity count from `.cart-items`
  async getFinalQuantityCount() {
    const finalQuantityCountText = await this.page.locator('.cart-items').textContent();
    return parseInt(finalQuantityCountText || '1', 10);
  }

  // Logout as Customer
  async logoutCustomer() {
    const logoutLink = await this.page.locator('a:has-text("Log out")');
    await logoutLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = CustomerPage;