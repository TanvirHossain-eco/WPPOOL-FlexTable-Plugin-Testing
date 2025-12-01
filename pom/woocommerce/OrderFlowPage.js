const { expect } = require('@playwright/test');
class OrderFlowPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  // Navigate to cart via "View cart" / "WC forward" button
  async goToCartViaViewCartButton() {
    const viewCartButton = await this.page.locator("a[class='button wc-forward']");
    await viewCartButton.click();
    await this.page.waitForTimeout(5000); // wait for 5 seconds
  }

  // Verify Cart Table visible
  async isCartTableVisible() {
    return await this.page.locator('table.shop_table.cart').isVisible();
  }

  // Helper functions to extract numeric values to integer
  getInt(text) {
    return parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
  }

  // Loop through expectedProducts and verify unit price * qty === displayed subtotal
  // Returns calculatedSubtotalAll (integer)
  async verifyLineItemsAndComputeSubtotal(expectedProducts) {
    let calculatedSubtotalAll = 0;

    for (let i = 0; i < expectedProducts; i++) {
      // Get the unit price with integer value
      const priceText = await this.page.locator('td.product-price').nth(i).innerText();
      const unitPrice = this.getInt(priceText);
      console.log(`Unit Price for product ${i + 1}: ${unitPrice}`);

      // Get the quantity with integer value
      const qtyText = await this.page.locator('input.input-text.qty.text').nth(i).inputValue();
      const unitQty = this.getInt(qtyText);
      console.log(`Quantity for product ${i + 1}: ${unitQty}`);

      // Get the displayed subtotal with integer value
      const subtotalText = await this.page.locator('td.product-subtotal[data-title="Subtotal"] .woocommerce-Price-amount.amount bdi').nth(i).innerText();
      const displayedSubtotal = this.getInt(subtotalText);

      // Calculation of Subtotal
      const calculatedSubtotal = unitPrice * unitQty;
      console.log(`Calculated Subtotal for product ${i + 1}: ${calculatedSubtotal}`);

      // Assert calculated subtotal with displayed subtotal
      if (calculatedSubtotal !== displayedSubtotal) {
        throw new Error(`Calculated subtotal (${calculatedSubtotal}) does not match displayed (${displayedSubtotal}) for product ${i + 1}`);
      }
      console.log(`Product ${i + 1} -> Price: ${unitPrice}, Qty: ${unitQty}, Subtotal: ${calculatedSubtotal} are matched and verified.`);

      // Add to overall subtotal
      calculatedSubtotalAll += calculatedSubtotal;
    }

    return calculatedSubtotalAll;
  }

  // Get shipping price
  async getShippingPrice() {
    const shippingText = await this.page.locator('#shipping_method .woocommerce-Price-amount.amount').first().innerText();
    return this.getInt(shippingText);
  }

  // Get displayed total
  async getDisplayedTotal() {
    const totalText = await this.page.locator('tr.order-total td .woocommerce-Price-amount.amount bdi').innerText();
    return this.getInt(totalText);
  }

  // Proceed to checkout
  async proceedToCheckout() {
    const proceedToCheckoutButton = await this.page.locator('a:has-text("PROCEED TO CHECKOUT")');
    await proceedToCheckoutButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  //
  // Checkout form helpers (billing, shipping, terms, notes, place order)
  //

  // Fill billing form fields if needed
  async fillBillingDetailsIfNeeded() {
    // Check first name and set to "Tanvir" if not need to change
    const firstNameInput = await this.page.locator('#billing_first_name');
    const firstNameValue = (await firstNameInput.inputValue()).trim();
    if (firstNameValue !== 'Tanvir') {
      await firstNameInput.fill('Tanvir');
    }
    await expectElementValueToBe(firstNameInput, 'Tanvir');

    // Check if last name is "Tester1" and set if needed
    const lastNameInput = await this.page.locator('#billing_last_name');
    const lastNameValue = (await lastNameInput.inputValue()).trim();
    if (lastNameValue !== 'Tester1') {
      await lastNameInput.fill('Tester1');
    }
    await expectElementValueToBe(lastNameInput, 'Tester1');

    // Check if Street address field is already filled, if not or yes then fill it with "123 Testing Avenue"
    const addressInput = await this.page.locator('#billing_address_1'); 
    const addressValue = (await addressInput.inputValue()).trim();
    if (addressValue !== '123 Testing Avenue') {
      await addressInput.fill('123 Testing Avenue');
    }
    await expectElementValueToBe(addressInput, '123 Testing Avenue');

    // Check if Town/City field "Testing City" is already filled, if not then fill them
    const cityInput = await this.page.locator('#billing_city'); 
    const cityValue = (await cityInput.inputValue()).trim();
    if (cityValue !== 'Testing City') {
      await cityInput.fill('Testing City');
    }
    await expectElementValueToBe(cityInput, 'Testing City');

    // Check if District field "Dhaka" is already filled, if not then Search and select Dhaka
    const districtSelect = await this.page.locator('#billing_state');
    const currentDistrict = await districtSelect.inputValue();
    console.log(`Current district value: ${currentDistrict}`);
    
    if (currentDistrict !== 'BD-13') { // BD-13 is Dhaka
      console.log("District is not Dhaka. Selecting Dhaka...");
      await districtSelect.selectOption('BD-13'); // Select Dhaka by value
      await this.page.waitForTimeout(500);
      
      // Verify Dhaka is now selected
      const newDistrict = await districtSelect.inputValue();
      if (newDistrict !== 'BD-13') throw new Error('Failed to set district to BD-13');
      console.log("District changed to Dhaka successfully.");
    } else {
      console.log("District is already set to Dhaka.");
    }

    // Check if Postcode field "1234" is already filled, if not then Delete the existing value and fill them
    const postcodeInput = await this.page.locator('#billing_postcode');
    const postcodeValue = (await postcodeInput.inputValue()).trim();
    if (postcodeValue !== '1234') {
      await postcodeInput.fill('1234');
    }
    await expectElementValueToBe(postcodeInput, '1234');

    // Check if Phone field is already filled, if not then fill them
    const phoneInput = await this.page.locator('#billing_phone');
    const phoneValue = (await phoneInput.inputValue()).trim();
    if (phoneValue !== '+8801234567890') {
      await phoneInput.fill('+8801234567890');
    }
    await expectElementValueToBe(phoneInput, '+8801234567890');

    // Check if Email field is already filled, if not then fill them with "Tanvir@tester1.com"
    const emailInput = await this.page.locator('#billing_email');
    const emailValue = (await emailInput.inputValue()).trim();
    if (emailValue !== 'Tanvir@tester1.com') {
      await emailInput.fill('Tanvir@tester1.com');
    }
    await expectElementValueToBe(emailInput, 'Tanvir@tester1.com');
  }

  // Ensure shipping address hidden (uncheck "Ship to a different address?" if shown)
  async ensureShippingAddressHidden() {
    const differentAddressCheckbox = await this.page.locator('span:has-text("Ship to a different address?")');
    const shippingAddressDiv = this.page.locator('.shipping_address');
    // Used the shipping company name field to scroll to shipping section
    const shippingCompanyName = this.page.locator('#shipping_company');
    await shippingCompanyName.scrollIntoViewIfNeeded();

    const displayStyle = await shippingAddressDiv.evaluate(el => window.getComputedStyle(el).display);
    
    if (displayStyle !== 'none') {
      // Shipping section is visible, so checkbox is checked - uncheck it
      await this.page.waitForTimeout(3000);
      await differentAddressCheckbox.click();
      console.log("Ship to a different address is checked. Unchecking it...");           
      
      // Verify it's now unchecked by checking display style
      const newDisplayStyle = await shippingAddressDiv.evaluate(el => window.getComputedStyle(el).display);
      if (newDisplayStyle !== 'none') throw new Error('Failed to hide shipping address');
      console.log('Checkbox unchecked successfully & shipping address hidden.');
    } else {
      // Shipping section is hidden with display: none, so checkbox is already unchecked
      console.log('Ship to different address is already unchecked');
    }
  }

  // Accept Terms & Conditions
  async acceptTerms() {
    const termsCheckbox = await this.page.locator("#tos");
    await termsCheckbox.scrollIntoViewIfNeeded();
    await termsCheckbox.click();
  }

  // Fill order notes
  async fillOrderNotes(text) {
    const orderNotesTextarea = await this.page.locator('#order_comments');
    await orderNotesTextarea.fill(text);
  }

  // Place order
  async placeOrder() {
    const placeOrderButton = await this.page.locator('#place_order');
    await placeOrderButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Get order status and number on order received page
  async getOrderStatusAndNumber() {
    const orderStatusElement = await this.page.locator(".font-weight-bold.order-status.text-primary.text-uppercase");
    const orderStatusText = await orderStatusElement.textContent();
    const orderNumberElement = await this.page.locator('.order-number');
    const orderNumberText = await orderNumberElement.textContent();
    const orderNumber = parseInt(orderNumberText.trim(), 10);
    return {
      orderStatusText: orderStatusText ? orderStatusText.trim() : null,
      orderNumber
    };
  }
}

// Small helper used in this file for asserting element value (keeps original expect style logs)
async function expectElementValueToBe(locator, expected) {
  // We can't import expect here to avoid circular dependency if file is required by test,
  // so perform a basic check and throw if mismatch to preserve behavior.
  const val = (await locator.inputValue()).trim();
  if (val !== expected) {
    throw new Error(`Expected element value to be "${expected}" but found "${val}"`);
  }
}

module.exports = OrderFlowPage;