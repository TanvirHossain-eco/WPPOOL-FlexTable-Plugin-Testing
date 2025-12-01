const { expect } = require('@playwright/test');
class WooComAdminPage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {string} adminUrl
   */
  constructor(page, adminUrl) {
    this.page = page;
    this.adminUrl = adminUrl;
  }

  // Open admin dashboard (login page)
  async openAdmin() {
    await this.page.goto(this.adminUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Login as admin
  async loginAdmin(username, password) {
    const adminUsernameInput = await this.page.locator('#user_login');
    await adminUsernameInput.fill(username);
    const adminPasswordInput = await this.page.locator('#user_pass');
    await adminPasswordInput.fill(password);
    const adminLoginButton = await this.page.locator('#wp-submit');
    await adminLoginButton.click();
    // Wait for navigation after login
    await this.page.waitForLoadState('networkidle');
  }

  // Verify Dashboard heading is visible
  async isDashboardVisible() {
    const dashboardHeading = await this.page.locator("div[class='wrap'] h1");
    return (await dashboardHeading.textContent()).includes('Dashboard');
  }

  // Navigate to WooCommerce Orders section
  async openOrdersList() {
    const wooCommerceMenu = await this.page.locator("a[class='wp-has-submenu wp-not-current-submenu menu-top toplevel_page_woocommerce menu-top-first'] div[class='wp-menu-name']");
    if (await wooCommerceMenu.isVisible().catch(() => false)) {
      await wooCommerceMenu.hover();
    }
    const woocommerceOrdersLink = await this.page.locator("a[href='edit.php?post_type=shop_order']");
    await woocommerceOrdersLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Open a specific order row by strong text matching "#<orderNumber> <customerName>"
  async openOrderRow(orderNumber, customerName) {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const orderRow = await this.page.locator(`strong:has-text("#${orderNumber} ${customerName}")`);
    await orderRow.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Verify the Order Details page is open (Edit order)
  async verifyOrderDetailsPageOpen() {
    const orderDetailsPageTitle = await this.page.locator('.wp-heading-inline');
    if (!(await orderDetailsPageTitle.textContent()).includes('Edit order')) {
      throw new Error('Order Details page not open (Edit order not found)');
    }
  }

  // Verify order title contains the order number
  async verifyOrderTitleContains(orderNumber) {
    const orderTitle = await this.page.locator('.woocommerce-order-data__heading');
    const text = await orderTitle.textContent();
    if (!text.includes(`Order #${orderNumber}`)) {
      throw new Error(`Order title does not contain Order #${orderNumber}`);
    }
  }

  // Verify customer name visible
  async verifyCustomerName(expectedName) {
    const customerName = await this.page.locator("//span[@id='select2-customer_user-container']");
    const txt = (await customerName.textContent()).trim();
    if (!txt.includes(expectedName)) {
      throw new Error(`Customer name ${expectedName} not visible in admin order`);
    }
  }

  // Get order items count (.wc-order-item-name)
  async getOrderItemsCount() {
    const orderItems = await this.page.locator('.wc-order-item-name');
    return await orderItems.count();
  }

  // Compute total quantity shown in admin order table (td.quantity:visible)
  async computeTotalQuantityInAdminOrder() {
    const orderItems = await this.page.locator('.wc-order-item-name');
    const orderItemsCount = await orderItems.count();
    let totalQuantityInOrder = 0;
    for (let i = 0; i < orderItemsCount; i++) {
      const quantityText = await this.page.locator('td.quantity:visible').nth(i).textContent();
      const quantity = parseInt(quantityText.replace(/\D/g, ''), 10);
      totalQuantityInOrder += quantity;
    }
    return totalQuantityInOrder;
  }

  // Get order total price integer
  async getOrderTotalPriceInt() {
    const orderTotalPriceElement = await this.page.locator('//td[text()="Order Total:"]/following-sibling::td[@class="total"]//bdi');
    const orderTotalPriceText = await orderTotalPriceElement.textContent();
    return parseInt(orderTotalPriceText.replace(/\D/g, ''), 10);
  }

  // Change status to Completed and save
  async changeStatusToCompletedAndSave() {
    const orderStatusSelect = await this.page.locator('#order_status');
    await orderStatusSelect.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(3000);
    await orderStatusSelect.selectOption('wc-completed');
    const currentOrderStatus = await orderStatusSelect.locator('option:checked').textContent();
    const currentOrderStatusText = currentOrderStatus.trim();
    await this.page.waitForTimeout(5000);
    const updateButton = await this.page.locator('button[name="save"]');
    await updateButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    const successMessage = await this.page.locator("div[id='message'] p");
    await successMessage.waitFor();
    return currentOrderStatusText;
  }

  // Admin logout
  async logoutAdmin() {
    const adminUserMenu = await this.page.locator('#wp-admin-bar-my-account');
    await adminUserMenu.hover();
    await this.page.waitForTimeout(2000);
    const adminLogoutLink = await this.page.locator('#wp-admin-bar-logout a');
    await adminLogoutLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = WooComAdminPage;