const { expect } = require('@playwright/test');
class HomePage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {string} baseUrl
   */
  constructor(page, baseUrl) {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  // Navigate to the base URL
  async openBase() {
    await this.page.goto(this.baseUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Handle sandbox continue button if present
  async continueIfSandboxPresent() {
    const continueButton = await this.page.getByRole('button', { name: 'Continue' });
    if (await continueButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      // waits until all network requests finish (page fully loaded)
      await this.page.waitForLoadState('networkidle');
    }
  }

  // Scroll to top control if present
  async ensureScrollTopControl() {
    const scrollTopButton = await this.page.locator('#topcontrol');
    if (await scrollTopButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTopButton.click();
      await this.page.waitForTimeout(5000); // wait for 2 seconds after clicking
    }
  }

  // Go to My Account page
  async goToMyAccount() {
    await this.page.goto(`${this.baseUrl}my-account/`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // PRODUCT LIST HELPERS

  // Get product title at index (0-based)
  async getProductTitleAt(index = 0) {
    const el = await this.page.locator('h3.woocommerce-loop-product__title').nth(index);
    await el.scrollIntoViewIfNeeded();
    return (await el.textContent()) || '';
  }

  // Hover product title at index
  async hoverProductTitleAt(index = 0) {
    const el = await this.page.locator('h3.woocommerce-loop-product__title').nth(index);
    await el.hover();
  }

  // Add to cart from list using the "a.viewcart-style-3" button at index
  // Returns added quantity (from data-quantity attr or 1)
  async addToCartFromListAt(index = 0) {
    const addBtn = await this.page.locator('a.viewcart-style-3').nth(index);
    const quantityAttr = await addBtn.getAttribute('data-quantity');
    const addedQuantity = parseInt(quantityAttr || '1', 10) || 1;
    await addBtn.click();
    return addedQuantity;
  }

  // Open quick view for a product at index
  async openQuickViewAt(index = 0) {
    const qv = await this.page.locator('.quickview').nth(index);
    await qv.click();
    await this.page.waitForTimeout(3000); // wait for quick view modal
  }

  // On quick view: get quantity input value
  async getQuickViewQuantityValue() {
    const quantityInput1 = await this.page.locator('[name="quantity"]');
    const quantityInputValue1 = await quantityInput1.inputValue();
    return parseInt(quantityInputValue1 || '1', 10);
  }

  // Click Add to Cart button inside quick view
  async clickQuickViewAddToCart() {
    const addToCart2 = await this.page.locator('button.single_add_to_cart_button.button.alt');
    await addToCart2.click();
  }

  // Close quick view modal if visible
  async closeQuickView() {
    const quickViewClose = await this.page.locator('a.fancybox-item.fancybox-close');
    if (await quickViewClose.isVisible().catch(() => false)) {
      await quickViewClose.click();
    }
  }

  // Open product detail page by clicking a product title at index
  async openProductPageAt(index = 0) {
    const product = await this.page.locator('h3.woocommerce-loop-product__title').nth(index);
    await product.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = HomePage;