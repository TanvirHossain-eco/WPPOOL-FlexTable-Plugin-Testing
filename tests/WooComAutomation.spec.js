const { test, expect } = require('@playwright/test');
const HomePage = require('../pom/woocommerce/HomePage');
const CustomerPage = require('../pom/woocommerce/CustomerPage');
const OrderFlowPage = require('../pom/woocommerce/OrderFlowPage');
const WooComAdminPage = require('../pom/woocommerce/WooComAdminPage');

const config = {
    WOOCOMMERCE_BASE_URL: process.env.WOOCOMMERCE_BASE_URL,
    WOOCOMMERCE_ADMIN_URL: process.env.WOOCOMMERCE_ADMIN_URL,
    WOOCOMMERCE_ADMIN_USERNAME: process.env.WOOCOMMERCE_ADMIN_USERNAME,
    WOOCOMMERCE_ADMIN_PASSWORD: process.env.WOOCOMMERCE_ADMIN_PASSWORD,
    WOOCOMMERCE_CUSTOMER_NAME: process.env.WOOCOMMERCE_CUSTOMER_NAME,
    WOOCOMMERCE_CUSTOMER_USERNAME: process.env.WOOCOMMERCE_CUSTOMER_USERNAME,
    WOOCOMMERCE_CUSTOMER_PASSWORD: process.env.WOOCOMMERCE_CUSTOMER_PASSWORD
}
// Global counters for products and quantity
let productsAdded = 0;
let quantityAdded = 0;
// Global variable to store total price
let totalPrice = 0;
// Global variable to store order number
let orderNumber = null;
// Global variable to store Order Status
let orderStatus = null;

test.describe.serial('WooCommerce Website Testing', () => {
    let page;
    let homePage;
    let customerPage;
    let orderPage;
    let wooAdminPage;

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        page = await context.newPage();

        // Initialize POM pages
        homePage = new HomePage(page, config.WOOCOMMERCE_BASE_URL);
        customerPage = new CustomerPage(page, config.WOOCOMMERCE_BASE_URL);
        orderPage = new OrderFlowPage(page);
        wooAdminPage = new WooComAdminPage(page, config.WOOCOMMERCE_ADMIN_URL);
    });

    test.afterAll(async () => {
        if (page) {
            await page.close();
        }
    });
    
    // Navigate to WooCommerce Site & Login as Customer
    test('Test case 1: Navigate to WooCommerce Site & Login as Customer', async () => {
        // Validate that credentials are available
        if (!config.WOOCOMMERCE_CUSTOMER_USERNAME || !config.WOOCOMMERCE_CUSTOMER_PASSWORD) {
            throw new Error(
                "WooCommerce Customer credentials are not set in environment variables"
            );
        }
        // Navigate to WooCommerce Site
        await homePage.openBase();
        // Wait for the page to load
        await page.waitForLoadState("domcontentloaded");
        // await page.waitForLoadState("networkidle");

        // Handle sandbox continue button if present
        await homePage.continueIfSandboxPresent();
        // await page.waitForTimeout(5000); // wait for 2 seconds
        await homePage.ensureScrollTopControl();

        // Navigate to the My Account page
        await homePage.goToMyAccount();
        // Wait for the page to load
        await page.waitForLoadState("domcontentloaded");
        // Sign in as Customer
        await customerPage.loginCustomer(config.WOOCOMMERCE_CUSTOMER_USERNAME, config.WOOCOMMERCE_CUSTOMER_PASSWORD);
        // Wait for navigation after login
        await page.waitForLoadState("networkidle");
        // Verify successful login by checking for "My Account" heading
        const myAccountHeading = await customerPage.getAccountUserText();
        await expect(myAccountHeading).toBe(config.WOOCOMMERCE_CUSTOMER_NAME);
        console.log("Customer logged in successfully & Customer Name verified.");

    });
    // Navigate to Homepage, Add Product Multiple Products to Cart & Verify Cart Items & Count
    test('Test case 2: Navigate to Homepage, Add Product Multiple Products to Cart & Verify Cart Items &Count', async () => {
        // Navigate to the Homepage
        await homePage.openBase();
        // Wait for the page to load
        await page.waitForLoadState("domcontentloaded");
        // Add Total 3 products from the display to the cart and Just last product with 2 quantity choose all the products randomly & verify cart count after each addition
        // Scroll to the products section
        // const scrollToProductsSection = await page.locator(".products.products-container.grid");
        // const scrollToProductsSection = await page.locator(':text("Customer Services")');
        // await scrollToProductsSection.scrollIntoViewIfNeeded();
        // await page.waitForTimeout(3000); // wait for 3 
        
        // Edge case: Need to check if the mini cart is empty or not before adding products.
        // if mini cart is empty, productsAdded and quantityAdded should be 0
        // Else if mini cart has items, we need to get the count of items and quantity from there
        // And added the count to productsAdded and quantityAdded variables 

        // // Put a counter for number of products added
        // let productsAdded = 0;
        // // Put a counter for number of quantity added
        // let quantityAdded = 0;
        // Select the Products
        // Product 1
        const product1Text = await homePage.getProductTitleAt(0);
        await homePage.hoverProductTitleAt(0);
        await page.waitForTimeout(2000); // wait for 2 seconds
        // Add the product to cart
        const addedQuantity = await homePage.addToCartFromListAt(0);
        // Get the data-quantity attribute to determine how many units are added
        // Update counters based on actual quantity from button
        productsAdded += 1;
        quantityAdded += addedQuantity;
        // Assertion Product 1 added to cart by verifying cart view
        await customerPage.openMiniCart();
        await page.waitForTimeout(2000); // wait for 2 seconds
        // check cart item count
        const cartItems = await customerPage.getMiniCartItemsCount();
        
        if (cartItems == 1) {
            console.log("Cart item count is 1");
            const cartItemP1Text = await customerPage.getMiniCartItemName(0);
            await expect(cartItemP1Text).toContain(product1Text);
            console.log("Product 1 Part1 added to cart successfully & verified.");
        } else {
            console.log(`Cart item count is ${cartItems}`);
            const cartItemP2Text = await customerPage.getMiniCartItemName(0);
            await expect(cartItemP2Text).toContain(product1Text);
            console.log("Product 1 Part2 added to cart successfully & verified.");        
        }
            
        
        // Close cart view
        await customerPage.closeMiniCart();
        await page.waitForTimeout(2000); // wait for 2 seconds
        
        // Product 2
        const product2Text = await homePage.getProductTitleAt(1);
        await homePage.hoverProductTitleAt(1);
        await page.waitForTimeout(2000);
        await homePage.openQuickViewAt(1);
        await page.waitForTimeout(3000); // wait for 3 seconds
        // Verify the Product Quantity in Quick View modal
        const quantityValue1 = await homePage.getQuickViewQuantityValue();
        productsAdded += 1;
        quantityAdded += quantityValue1;        
        // Click Add to Cart button in Quick View modal
        await homePage.clickQuickViewAddToCart();
        await page.waitForTimeout(5000); // wait for 5 seconds
        const viewCartButton = await page.locator("//a[@title='View cart']");
        await expect(viewCartButton).toBeVisible();
        // await page.waitForTimeout(3000); // wait for 3 seconds
        // Close the Quick View modal
        await homePage.closeQuickView();
        await page.waitForTimeout(2000); // wait for 2 seconds
        // Assertion Product 2 added to cart by verifying cart view
        await customerPage.openMiniCart();
        await page.waitForTimeout(2000); // wait for 2 seconds
        // Verify Product2 Name matched with cart item name
        const cartItem2Text = await customerPage.getMiniCartItemName(1);
        await expect(cartItem2Text).toContain(product2Text);
        console.log("Product 2 added to cart successfully & verified.");
        
        // Close cart view
        await customerPage.closeMiniCart();
        await page.waitForTimeout(2000); // wait for 2 seconds

        // Product 3 with quantity 2
        const product3Text = await homePage.getProductTitleAt(2);
        await homePage.openProductPageAt(2);
        await page.waitForLoadState("domcontentloaded");
        // page.locator('[name="quantity"]') for quantity input
        const pdp3TitleText = await customerPage.getPDPTitleText();
        await expect(pdp3TitleText).toContain(product3Text);
        // Increase quantity to 2
        const quantityValue2 = await customerPage.increaseQuantityOnPDP();
        productsAdded += 1;
        quantityAdded += quantityValue2;
        // Click Add to Cart button
        await customerPage.addToCartOnPDP();
        await page.waitForLoadState("networkidle");
        // await page.waitForLoadState("domcontentloaded");
        // Assertion Product 3 added to cart by verifying cart view
        await customerPage.openMiniCart();
        await page.waitForTimeout(2000); // wait for 2 seconds
        // Verify Product3 Name matched with cart item name
        const cartItem3Text = await customerPage.getMiniCartItemName(2);
        await expect(cartItem3Text).toContain(product3Text);
        console.log("Product 3 added to cart successfully & verified.");
       
        // Final Cart Items = Product Added count
        const finalCartItems = await customerPage.getMiniCartItemsCount();
        await expect(finalCartItems).toBe(productsAdded);
        console.log(`Total Cart Items: ${finalCartItems}`);
        console.log(`Cart Items count verified successfully.`);
        
        // Final Quantity Count Verification
        const finalQuantityCount = await customerPage.getFinalQuantityCount();
        await expect(finalQuantityCount).toBe(quantityAdded);
        console.log(`Total Quantity count in cart: ${finalQuantityCount}`);
        console.log(`Cart Quantity count verified successfully.`);

        // Global log of products added
        console.log(`Total Products added to cart: ${productsAdded}`);
        // Global log of quantity added
        console.log(`Total Quantity added to cart: ${quantityAdded}`);
        
                
        // Close cart view
        // await cartCloseButton.click();
        // await page.waitForTimeout(2000); // wait for 2 seconds
        
    }); 

    // Navigate to Cart Page, Calculate the Unit Price * Quantity, Subtotal Price, Shipping cost & Total Price Verification 
    test('Test case 3: Navigate to Cart Page, Calculate the Unit Price * Quantity, Subtotal Price, Shipping cost & Total Price Verification', async() => {
        // Navigate to the Cart Page
        await orderPage.goToCartViaViewCartButton();
        await page.waitForTimeout(5000); // wait for 5 seconds
        // await page.waitForLoadState("domcontentloaded");
        // Verify Cart Page loaded by checking the Cart Table
        const cartTable = await page.locator('table.shop_table.cart');
        await expect(cartTable).toBeVisible();
        console.log("Cart Page loaded successfully & all the prodcuts are listed.");
        let calculatedSubtotalAll = 0;
        // Get number of products added in the cart from the mini cart
        const productsLength = productsAdded;

        // Loop through 3 products (0 - 2) via OrderFlowPage helper
        const calcSubtotal = await orderPage.verifyLineItemsAndComputeSubtotal(productsLength);

        // Get the shipping cost with integer value
        const shippingPrice = await orderPage.getShippingPrice();

        // Final Calculation of Total
        const calculatedTotal = calcSubtotal + shippingPrice;

        // Get the displayed total with integer value
        const displayedTotal = await orderPage.getDisplayedTotal();

        // Assert calculated total with displayed total as integer value
        await expect(calculatedTotal).toBe(displayedTotal);

        console.log(`Subtotal (All Products): ${calcSubtotal}`);
        console.log(`Shipping: ${shippingPrice}`);
        console.log(`Calculated Total: ${calculatedTotal}`);
        console.log(`Displayed Total: ${displayedTotal}`);
        console.log("Subtotal, Shipping & Total Price are matched and verified successfully.");
        
        // Global log of total price
        // Store the total price globally
        totalPrice = calculatedTotal;
        console.log(`Total Price stored globally: ${totalPrice}`);
        // Proceed to Checkout

        await orderPage.proceedToCheckout();
        await page.waitForLoadState("domcontentloaded");
        console.log("Navigated to Checkout Page successfully.");
        
    });
    // Provide Shipping & Billing Information, Place the Order, Verify Order Received Page
    test('Test case 4: Provide Shipping & Billing Information, Place the Order', async() => {
        // Verify Checkout Page loaded by checking the Billing Details section
        const billingDetailsSection = await page.locator('h3:has-text("Billing details")');
        await expect(billingDetailsSection).toBeVisible();
        console.log("Checkout Page loaded successfully & Billing Details section is visible.");
        // Fill in Billing Details Form
        await orderPage.fillBillingDetailsIfNeeded();

        // Check if District field "Dhaka" is already filled, if not then Search and select Dhaka
        const districtSelect = await page.locator('#billing_state');
        const currentDistrict = await districtSelect.inputValue();
        console.log(`Current district value: ${currentDistrict}`);
        
        if (currentDistrict !== 'BD-13') { // BD-13 is Dhaka
            console.log("District is not Dhaka. Selecting Dhaka...");
            await districtSelect.selectOption('BD-13'); // Select Dhaka by value
            await page.waitForTimeout(500);
            
            // Verify Dhaka is now selected
            const newDistrict = await districtSelect.inputValue();
            await expect(newDistrict).toBe('BD-13');
            console.log("District changed to Dhaka successfully.");
        } else {
            console.log("District is already set to Dhaka.");
        }
        // Check if Postcode field "1234" is already filled, if not then Delete the existing value and fill them
        const postcodeInput = await page.locator('#billing_postcode');
        const postcodeValue = (await postcodeInput.inputValue()).trim();
        if (postcodeValue !== '1234') {
            await postcodeInput.fill('1234');
        }
        await expect(postcodeInput).toHaveValue('1234');
        // Check if Phone field is already filled, if not then fill them
        const phoneInput = await page.locator('#billing_phone');
        const phoneValue = (await phoneInput.inputValue()).trim();
        if (phoneValue !== '+8801234567890') {
            await phoneInput.fill('+8801234567890');
        }
        await expect(phoneInput).toHaveValue('+8801234567890');
        // Check if Email field is already filled, if not then fill them with "Tanvir@tester1.com"
        const emailInput = await page.locator('#billing_email');
        const emailValue = (await emailInput.inputValue()).trim();
        if (emailValue !== 'Tanvir@tester1.com') {
            await emailInput.fill('Tanvir@tester1.com');
        }
        await expect(emailInput).toHaveValue('Tanvir@tester1.com');
        
        // Check the "Ship to a different address?" is in the view port if not then scroll to it
        // Check the "Ship to a different address?" checkbox status --- Must verify manually
        // const shippingCompanyName = page.locator("#shipping_company")
        const differentAddressCheckbox = await page.locator('span:has-text("Ship to a different address?")');
        const shippingAddressDiv = page.locator('.shipping_address');
        // Used the shipping company name field to scroll to shipping section
        const shippingCompanyName = page.locator('#shipping_company')
        await shippingCompanyName.scrollIntoViewIfNeeded();
        
        // await differentAddressCheckbox.click();
        console.log("Shipping Address & Billing Address are the same.");
        // await page.waitForTimeout(5000);
        // Verify the checkbox status by checking the shipping address div visibility

        const displayStyle = await shippingAddressDiv.evaluate(el => window.getComputedStyle(el).display);
        
        if (displayStyle !== 'none') {
            // Shipping section is visible, so checkbox is checked - uncheck it
            await page.waitForTimeout(3000);
            await differentAddressCheckbox.click();
            console.log("Ship to a different address is checked. Unchecking it...");           
            
            // Verify it's now unchecked by checking display style
            const newDisplayStyle = await shippingAddressDiv.evaluate(el => window.getComputedStyle(el).display);
            await expect(newDisplayStyle).toBe('none');
            console.log('Checkbox unchecked successfully & shipping address hidden.');
        } else {
            // Shipping section is hidden with display: none, so checkbox is already unchecked
            console.log('Ship to different address is already unchecked');
        }
        await page.waitForTimeout(5000);
        // Check page.locator('input[name="tos"]') is in the view port if not then scroll to it
        await orderPage.acceptTerms();
        console.log("Terms & Conditions checkbox is checked successfully.");
        await page.waitForTimeout(5000);
        // Fill the Order Notes
        await orderPage.fillOrderNotes('Please deliver between 9 AM to 5 PM. Leave the package at the front door if no one is home.');
        console.log("Order Notes added successfully.");
        await page.waitForTimeout(5000);
        // Check Cash on Delivery is visible
        const codRadio = await page.locator('label:has-text("Cash on delivery")');
        await expect(codRadio).toBeVisible();
        console.log("Cash on Delivery payment method is available & visible.");
        // Click on Place Order button
        await orderPage.placeOrder();
        await page.waitForLoadState('domcontentloaded');
        console.log("Order placed successfully.");
        // Verify Order Received page by checking the Thank you message
        const thankYouMessage = await page.locator('p.woocommerce-notice.woocommerce-notice--success.woocommerce-thankyou-order-received');
        await expect(thankYouMessage).toBeVisible();
        // Check the order status "Processing" is visible 
        const orderStatusElement = await page.locator(".font-weight-bold.order-status.text-primary.text-uppercase");
        const orderStatusText = await orderStatusElement.textContent();
        await expect(orderStatusText).toBe("Processing");
        console.log("Order status is 'Processing'.");

        // Global log of order status
        // Store order status globally
        orderStatus = orderStatusText.trim();        
        console.log(`Order status captured globally: ${orderStatus}`);

        // Global log of order number
        // Extract and store order number globally
        const orderNumberElement = await page.locator('.order-number');
        const orderNumberText = await orderNumberElement.textContent();
        orderNumber = parseInt(orderNumberText.trim(), 10);
        console.log(`Order Number captured globally: ${orderNumber}`);
        console.log("Order Received page loaded successfully, Thank you message is visible & Order status is 'Processing'.");

    });
    // Verify the Order from the Customer Dashboard
    test('Test case 5: Verify the Order from the Customer Dashboard', async() => {
        // Navigate to the My Account Page
        await page.goto(`${config.WOOCOMMERCE_BASE_URL}my-account/`);
        // Wait for the page to load
        await page.waitForLoadState("domcontentloaded");
        // Verify My Account page loaded by checking the Name
        const myAccountHeading = await page.locator('.account-text-user').first();
        await expect(myAccountHeading).toBeVisible();
        console.log("My Account Page loaded successfully & Customer Name is visible.");


        // Click on Orders link
        const ordersLink = await page.getByRole('heading', { name: 'Orders' });
        await expect(ordersLink).toBeVisible();
        await ordersLink.click();
        // await page.waitForLoadState("domcontentloaded");
        await page.waitForLoadState("networkidle");
        // Verify Orders page loaded by checking the title
        const ordersPageTitle = await page.locator('h3.account-sub-title.d-none.d-md-block.mb-3.mt-2');
        await expect(ordersPageTitle).toContainText('Orders');
        console.log("Navigated to My Account Orders page successfully & title is also visible.");
        // Find the order number in the orders list by using the global orderNumber variable
        const orderRow = await page.locator(`th:has-text("#${orderNumber}")`);
        await expect(orderRow).toBeVisible();
        console.log(`Order Number #${orderNumber} is found in the Orders list successfully.`);
        // Click on the Order Number link
        await orderRow.click();
        await page.waitForLoadState("domcontentloaded");

        // Start verifying the Order Details
        // Verify the Order Details page by checking the title
        const orderDetailsPageTitle = await page.locator('h3.account-sub-title.d-none.d-md-block.mb-3.mt-2');
        await expect(orderDetailsPageTitle).toContainText(`Order #${orderNumber}`);
        console.log("Navigated to Order Details page successfully & title is also visible.");
        // Verify Order Status
        const orderStatusElement = await page.locator(".font-weight-bold.order-status.text-primary.text-uppercase");
        const orderStatusText = await orderStatusElement.textContent();
        await expect(orderStatusText.trim()).toBe(orderStatus);
        console.log(`Order status is '${orderStatus}' and verified successfully.`);
        // Verify Products Added 
        const orderItems = await page.locator('table.shop_table.order_details tbody tr');
        const orderItemsCount = await orderItems.count();
        await expect(orderItemsCount).toBe(productsAdded);
        console.log(`Total Products in the order: ${orderItemsCount} matches with Products Added: ${productsAdded}`);
        // Verify Quantity Added
        let totalQuantityInOrder = 0;
        for (let i = 0; i < orderItemsCount; i++) {
            const quantityText = await orderItems.nth(i).locator('.product-quantity').textContent();
            const quantityValue = parseInt(quantityText.replace(/\D/g, ''), 10);
            totalQuantityInOrder += quantityValue;
        }
        await expect(totalQuantityInOrder).toBe(quantityAdded);
        console.log(`Total Quantity in the order: ${totalQuantityInOrder} matches with Quantity Added: ${quantityAdded}`);

        // Verify Total Price
        const orderTotalPriceElement = await page.locator('span.woocommerce-Price-amount.amount').last();
        const orderTotalPriceText = await orderTotalPriceElement.textContent();
        const orderTotalPrice = parseInt(orderTotalPriceText.replace(/\D/g, ''), 10);
        await expect(orderTotalPrice).toBe(totalPrice);
        console.log(`Total Price: ${orderTotalPrice} matches with Global Total Price: ${totalPrice}`);

        // End of Order Details Verification

        // Logout as Customer
        await customerPage.logoutCustomer();
        // Verify successful logout by checking the Login Title
        const loginTitle = await page.locator('h3:has-text("Login")');
        await expect(loginTitle).toBeVisible();
        console.log("Customer logged out successfully.");


    });
    // Go to WooCommerce Admin Panel, Login & Verify the Order appears in Admin Orders Section
    test('Test case 6: Go to WooCommerce Admin Panel, Login & Verify the Order in Admin Orders Section', async() => {

        // Validate that credentials are available
        if (!config.WOOCOMMERCE_ADMIN_USERNAME || !config.WOOCOMMERCE_ADMIN_PASSWORD) {
            throw new Error(
                "WooCommerce Admin credentials are not set in environment variables"
            );
        }        
        // Go to WooCommerce Admin Panel
        await wooAdminPage.openAdmin();
        // Wait for the page to load
        await page.waitForLoadState("domcontentloaded");
        
        // Login as Admin
        await wooAdminPage.loginAdmin(config.WOOCOMMERCE_ADMIN_USERNAME, config.WOOCOMMERCE_ADMIN_PASSWORD);
        // Wait for navigation after login
        await page.waitForLoadState("networkidle");
        // Verify successful login by checking for the Dashboard heading
        const dashboardHeading = await page.locator("div[class='wrap'] h1");
        await expect(dashboardHeading).toContainText('Dashboard');
        console.log("WooCommerce Admin logged in successfully.");

        // Navigate to WooCommerce Orders section
        await wooAdminPage.openOrdersList();
        // Verify Orders page loaded by checking the title
        const woocommerceOrdersPageTitle = await page.locator('h1.wp-heading-inline');
        await expect(woocommerceOrdersPageTitle).toContainText('Orders');
        console.log("Navigated to WooCommerce Admin Orders page successfully & title is also visible.");
        // Scroll to the bottom to see the orders list
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        // Find the order number in the orders list by using the global orderNumber variable
        await wooAdminPage.openOrderRow(orderNumber, config.WOOCOMMERCE_CUSTOMER_NAME);
        console.log(`Order Number #${orderNumber} for ${config.WOOCOMMERCE_CUSTOMER_NAME} is found in the Orders list successfully.`);
        console.log("Navigated to Order Details page successfully.");

    });
    // Verify the Order Details from the Admin Panel & Change the Order Status to Completed
    test('Test case 7: Verify the Order Details from the Admin Panel', async() => {
        // Verify the Order Details page by checking the title
        await wooAdminPage.verifyOrderDetailsPageOpen();
        await page.waitForTimeout(5000);
        // Scroll into view the order title
        const scrollToOrderTitle = await page.locator("div[id='woocommerce-order-source-data'] h2[class='hndle ui-sortable-handle']");
        await scrollToOrderTitle.scrollIntoViewIfNeeded();
        await page.waitForTimeout(5000);
        // Verify the order title
        await wooAdminPage.verifyOrderTitleContains(orderNumber);
        console.log(`Order #${orderNumber} details is visible.`);
        // Verify the customer name
        await wooAdminPage.verifyCustomerName(config.WOOCOMMERCE_CUSTOMER_NAME);
        console.log(`${config.WOOCOMMERCE_CUSTOMER_NAME} name is visible.`);
        await page.waitForTimeout(5000);
        // Scroll to the order items section
        const scrollToOrderNotesSection = await page.locator('h2:has-text("Order notes")');
        await scrollToOrderNotesSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(3000);
        // Verify the order items count with productsAdded variable
        const orderItemsCount = await wooAdminPage.getOrderItemsCount();
        await expect(orderItemsCount).toBe(productsAdded);
        console.log(`Total Products in the order: ${orderItemsCount} matches with Products Added: ${productsAdded}`);
        // Verify Quantity with quantityAdded variable
        const totalQuantityInOrder = await wooAdminPage.computeTotalQuantityInAdminOrder();
        await expect(totalQuantityInOrder).toBe(quantityAdded);
        console.log(`Total Quantity in the order: ${totalQuantityInOrder} matches with Quantity Added: ${quantityAdded}`);
        await page.waitForTimeout(5000);

        // Scroll to the Order Total section
        const scrollToOrderTotalSection = await page.locator('td:has-text("Order Total:")');
        await scrollToOrderTotalSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(3000);
        // Verify Total Price with global totalPrice variable
        const orderTotalPrice = await wooAdminPage.getOrderTotalPriceInt();
        await expect(orderTotalPrice).toBe(totalPrice);
        console.log(`Total Price: ${orderTotalPrice} matches with Global Total Price: ${totalPrice}`);
        await page.waitForTimeout(5000);

        // Change the Order Status to Completed
        const currentOrderStatusText = await wooAdminPage.changeStatusToCompletedAndSave();
        await expect(currentOrderStatusText).toBe('Completed');
        console.log(`Current Order Status: ${currentOrderStatusText}`);
        // console.log("Order status changed to 'Completed' successfully.");
        await page.waitForTimeout(5000);
        
        // Update the global orderStatus variable
        orderStatus = currentOrderStatusText;
        console.log("Global Order status changed to 'Completed'.");

        // Logout as Admin
        await wooAdminPage.logoutAdmin();
        // Verify successful logout by checking the Login Title
        const logoutMessage = await page.locator("div[id='login-message'] p");
        await expect(logoutMessage).toContainText('You are now logged out.');
        console.log("Admin logged out successfully.");

    });
    // Go to Customer Dashboard to Verify the Order Status is Changed to Completed
    test('Test case 8: Go to Customer Dashboard to Verify the Order Status is Changed to Completed', async() => {
        // Go to My Account Page
        await page.goto(`${config.WOOCOMMERCE_BASE_URL}my-account/`);
        // Wait for the page to load
        await page.waitForLoadState("domcontentloaded");
        // Sign in as Customer
        await customerPage.loginCustomer(config.WOOCOMMERCE_CUSTOMER_USERNAME, config.WOOCOMMERCE_CUSTOMER_PASSWORD);
        // Wait for navigation after login
        await page.waitForLoadState("networkidle");
        // Verify successful login by checking for "My Account" heading
        const myAccountHeading = await page.locator('.account-text-user').first();
        await expect(myAccountHeading).toHaveText(config.WOOCOMMERCE_CUSTOMER_NAME);
        console.log("Customer logged in successfully & Customer Name verified.");
        // Click on Orders link
        const ordersLink = await page.getByRole('heading', { name: 'Orders' });
        await expect(ordersLink).toBeVisible();
        await ordersLink.click();
        await page.waitForLoadState("domcontentloaded");
        // Verify Orders page loaded by checking the title
        const ordersPageTitle = await page.locator('h3.account-sub-title.d-none.d-md-block.mb-3.mt-2');
        await expect(ordersPageTitle).toContainText('Orders');
        console.log("Navigated to My Account Orders page successfully & title is also visible.");
        // Find the order number in the orders list by using the global orderNumber variable
        const orderRow = await page.locator(`th:has-text("#${orderNumber}")`);
        await expect(orderRow).toBeVisible();
        console.log(`Order Number #${orderNumber} is found in the Orders list successfully.`);
        // Click on the Order Number link
        await orderRow.click();
        await page.waitForLoadState("domcontentloaded");
        // Verify the Order Details page by checking the title
        const orderDetailsPageTitle = await page.locator('h3.account-sub-title.d-none.d-md-block.mb-3.mt-2');
        await expect(orderDetailsPageTitle).toContainText(`Order #${orderNumber}`);
        console.log("Navigated to Order Details page successfully & title is also visible.");
        // Verify Order Status is "Completed"
        const orderStatusElement = await page.locator(".font-weight-bold.order-status.text-primary.text-uppercase");
        const orderStatusText = await orderStatusElement.textContent();
        await expect(orderStatusText.trim()).toBe("Completed");
        console.log(`Order status is 'Completed' and verified successfully.`);

        // Logout as Customer
        await customerPage.logoutCustomer();
        // Verify successful logout by checking the Login Title
        const loginTitle = await page.locator('h3:has-text("Login")');
        await expect(loginTitle).toBeVisible();
        console.log("Customer logged out successfully.");

        // Final Log Printout
        console.log("----- Final Test Summary -----");
        console.log(`Customer Name: ${config.WOOCOMMERCE_CUSTOMER_NAME} has successfully placed an order.`);
        console.log(`The Order Number: ${orderNumber}`);
        console.log(`A total of ${productsAdded} were purchased with a combined quantity of ${quantityAdded}`);
        console.log(`The total order value is ${totalPrice}, and the final status of the order is ${orderStatus}`);
        console.log(`The Order Number: ${orderNumber} has been successfully verified in both the Customer Dashboard and the Admin Panel.`);        
        console.log("----- End of Test Summary -----");


    });

});