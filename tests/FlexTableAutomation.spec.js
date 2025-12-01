const { test, expect } = require('@playwright/test');
const LoginPage = require('../pom/flextable/LoginPage');
const PluginPage = require('../pom/flextable/PluginPage');
const FlexTablePage = require('../pom/flextable/FlexTablePage');
const PageEditorPage = require('../pom/flextable/PageEditorPage');
const FrontendPage = require('../pom/flextable/FrontendPage');

// Store credentials in environment variables or separate config
const config = {
  BASE_URL: process.env.BASE_URL,
  WORDPRESS_URL: process.env.WORDPRESS_URL,
  WORDPRESS_USERNAME: process.env.WORDPRESS_USERNAME,
  WORDPRESS_PASSWORD: process.env.WORDPRESS_PASSWORD,
  GOOGLE_SHEET_URL: process.env.GOOGLE_SHEET_URL,
  TABLE_TITLE: process.env.TABLE_TITLE,
  TABLE_DESCRIPTION: process.env.TABLE_DESCRIPTION,
  PAGE_TITLE: process.env.PAGE_TITLE,
  ROWS_PER_PAGE: process.env.ROWS_PER_PAGE,
  TABLE_HEIGHT: process.env.TABLE_HEIGHT
};

test.describe.serial('WPPOOL FlexTable Plugin Testing', () => {
  let page;
  let loginPage, pluginPage, flexTablePage, pageEditorPage, frontendPage;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Initialize all page objects
    loginPage = new LoginPage(page);
    pluginPage = new PluginPage(page);
    flexTablePage = new FlexTablePage(page);
    pageEditorPage = new PageEditorPage(page);
    frontendPage = new FrontendPage(page, config.BASE_URL);
  });

  test.afterAll(async () => {
    if (page) {
      await page.close();
    }
  });

  // Verify WordPress Login Functionality with Sandbox
  test("Test case 1: WordPress Login Testing", async () => {
    
    // Validate that credentials are available
    if (!config.WORDPRESS_USERNAME || !config.WORDPRESS_PASSWORD) {
      throw new Error(
        "WordPress credentials are not set in environment variables"
      );
    }

    await loginPage.navigateToLogin(config.WORDPRESS_URL);
    await loginPage.handleSandboxContinue();
    await loginPage.login(config.WORDPRESS_USERNAME, config.WORDPRESS_PASSWORD);
    
    // Verify successful login
    await loginPage.verifyLoginSuccess();
    console.log("WordPress login successful.");
    
  });

  // Verify FlexTable Plugin Activation Status
  test("Test case 2: Verify FlexTable Plugin Activation Status", async () => {
    
    // 1. Navigate to the Installed Plugin Page
    await pluginPage.navigateToPlugins();

    // 2. Search FlexTable Plugin (Installed Plugins Page)
    await pluginPage.searchPlugin("FlexTable");

    // Check if plugin is found in installed plugins
    const searchResult1 = await pluginPage.getSearchResult();
    // If searchResult1 includes ('0 items')
    if (searchResult1.includes('0 items')) {
      console.log("Plugin not installed - proceeding with installation");

      // Go to Plugin Repository Page for Adding FlexTable Plugin
      await pluginPage.navigateToAddPlugins();

      // Search FlexTable Plugin at Repository
      await pluginPage.searchPluginInRepository("FlexTable");

      // Verify Plugin Title & Author
      await pluginPage.verifyPluginTitle();
      await pluginPage.verifyAuthor();

      // Install Plugin
      await pluginPage.installPlugin();

      // Wait for Activate Button
      await pluginPage.waitForActivateButton();

      // Activate Plugin
      await pluginPage.activatePlugin();

      // Navigate to Installed Plugins Page (after activation)
      await pluginPage.navigateToInstalledPlugins();

      // Search FlexTable Plugin at Installed Plugins Page (after activation)
      await pluginPage.searchInstalledPlugin("FlexTable");

      // Verify plugin is installed & activated
      await pluginPage.verifyPluginActivated();
      console.log("Plugin is now Installed & Activated.");

    } else {
      console.log("Checking Plugin is remain Activated or Deactivated");
      // If plugin is found in installed plugins
      // Check & Verify "FlexTable Deactivate" is visible
      const isDeactivateVisible = await pluginPage.isPluginDeactivated();
      if (isDeactivateVisible) {
        // If "FlexTable Deactivate" is visible
        await pluginPage.verifyPluginDeactivateVisible();
        console.log("Plugin is already Installed & Activated");
      } else {
        await pluginPage.activatePluginIfInactive();
        // Navigate to Installed Plugins Page
        await pluginPage.navigateToInstalledPlugins();
        // Search for the FlexTable Plugin at Installed Plugins Page
        await pluginPage.searchInstalledPlugin("FlexTable");
        // Confirm "FlexTable Deactivate" is visible
        await pluginPage.verifyPluginActivated();
        console.log("Plugin was installed before & Activated Now");
      }
      
    }
    // Finally Navigate to WordPress Dashboard
    await pluginPage.navigateToDashboard();
    
    // Assertion Return to WordPress Dashboard
    await pluginPage.verifyDashboardLoaded();
    console.log("WordPress Dashboard Loaded");
    
  });

  // Navigate to FlexTable Dashboard
  test("Test case 3: Navigate to FlexTable Dashboard", async () => {
    
    // Navigate to FlexTable Dashboard
    await flexTablePage.navigateToDashboard();

    // Assertion FlexTable Dashboard Loaded
    const isDashboardLoaded = await flexTablePage.verifyDashboardLoaded();
    expect(isDashboardLoaded).toBeTruthy();
    console.log("FlexTable Dashboard Loaded");
    
  });

  // Create a New Table Using Google Sheet Input
  test("Test case 4: Create a New Table Using Google Sheet Input", async () => {
    
    // On FlexTable Dashboard, click Create New Table.
    await flexTablePage.clickCreateNewTable();

    // Enter the Google Sheet URL, Table Title, and Table Description.
    // Provide Google Sheet URL & Click "Create table from URL"
    await flexTablePage.fillGoogleSheetUrl(config.GOOGLE_SHEET_URL);
    await flexTablePage.createTableFromUrl();

    // Provide Table Title & Table Description
    await flexTablePage.fillTableDetails(config.TABLE_TITLE, config.TABLE_DESCRIPTION);

    // Click on the Save changes Button
    await flexTablePage.saveChanges();
    // Assertion Setting Saved Successfully
    await flexTablePage.verifySavedSuccessfully();
    console.log("Settings Saved Successfully.");

    // Return to FlexTable Dashboard
    await flexTablePage.returnToDashboard();

    // Assertion A new table entry appears in the FlexTable Dashboard list.
    // Assertion Dashboard Table Name is matching with Table Title
    await flexTablePage.verifyTableTitle(config.TABLE_TITLE);
    console.log("A new table entry appears in the FlexTable Dashboard list & Table Name is displayed as expected.");
    await page.waitForTimeout(5000);
    
  });

  // Verify Table Display Using Shortcode
  test("Test case 5: Verify Table Display Using Shortcode", async () => {
    
    // Copy the shortcode
    const shortValue = await flexTablePage.getShortcodeValue();
    console.log(shortValue);

    // Navigate to the Pages Menu
    await pageEditorPage.navigateToPages();
    
    // Go to Add New Page
    await pageEditorPage.addNewPage();
    
    // Add Page Title
    await pageEditorPage.fillPageTitle(config.PAGE_TITLE);
    
    // Add Page Block
    // Search the required block
    await pageEditorPage.addFlexTableBlock();
    
    // Connect the Required table
    // Select the table from the dropdown option
    await pageEditorPage.selectTable(shortValue);

    // Save & Publish
    await pageEditorPage.publishPage();
    
    // Return to Pages Menu from Page Editor
    await pageEditorPage.returnToPages();
    
    // Assertion Page is published
    // need to create logic so that check if there are any page were before and if does then must able to edit and modified accordingly also need to ensure there is only one page with the same title.
    const publishedPage = await pageEditorPage.getPublishedPageTitle();
    await expect(publishedPage).toHaveText(config.PAGE_TITLE); 
    console.log("Page is Published Successfully.");
    await page.waitForTimeout(5000);

    // Navigate to the Published Page
    // Open the Page
    await pageEditorPage.openPublishedPage();

    // Assertion
    await pageEditorPage.verifyFrontPageTitle(config.PAGE_TITLE);

    // verify that 6 table cells match with the Google Sheet data.
    // Keep the Google Sheet Data in an array
    const googleSheetData = [
      { Name: 'Tahsin', ID: '10', Subject: 'CSE' },
      { Name: 'Arafat', ID: '11', Subject: 'EEE' }
    ];

    try {
      const { row1Data, row2Data } = await pageEditorPage.extractTableData(shortValue);

      // Compare with Google Sheet data
      expect(row1Data).toEqual(googleSheetData[0]);
      expect(row2Data).toEqual(googleSheetData[1]);

      console.log("All data matched successfully!");
    } catch (error) {
      console.error('Data comparison failed:', error.message);
      throw error;
    }

    await page.waitForTimeout(2000);
    
  });

  // Enable 'Show Table Title' and 'Show Table Description Below Table
  test("Test case 6: Enable Show Table Title & Show Table Description Below Table", async () => {
    
    // Navigate to Wordpress Dashboard
    await page.goto(config.WORDPRESS_URL);
    await page.waitForLoadState("networkidle");

    // Navigate to FlexTable All Tables Page
    await flexTablePage.navigateToAllTables();

    // Assertion FlexTable All Tables Page Loaded
    const isAllTablesLoaded = await flexTablePage.verifyAllTablesPageLoaded();
    expect(isAllTablesLoaded).toBeTruthy();
    console.log("FlexTable All Tables Page Loaded");

    // Navigate to TABLE_TITLE edit page
    await flexTablePage.navigateToTableEditPage();
    
    // Navigate to Table Customization Tab
    await flexTablePage.navigateToTableCustomization();

    // Enable 'Show Table Title' and 'Show Table Description Below the Table
    await flexTablePage.enableShowTableTitle();
    await flexTablePage.enableShowTableDescription();
    await flexTablePage.setDescriptionPositionBelow();
    await flexTablePage.saveChanges();

    // Assertion Setting Saved Successfully
    await flexTablePage.verifySavedSuccessfully();
    console.log("Settings Saved Successfully.");
    await page.waitForTimeout(5000);

    // Visit the table on the frontend
    await frontendPage.navigateToTablePage();

    // Assertion Table Title is displayed above the table
    await frontendPage.verifyTableTitleVisible();
    await frontendPage.verifyTableTitleAboveTable();
    console.log("Table Title is displayed above the table.");
    await page.waitForTimeout(5000);

    // Assertion Table Description is displayed below the table
    await frontendPage.verifyTableDescriptionBelowTable();
    console.log("Table Description is displayed below the table.");
    await page.waitForTimeout(5000);
    
  });

  // Enable Entry Info & Pagination
  test("Test case 7: Enable Entry Info & Pagination", async () => {
    
    // Navigate to Wordpress Dashboard
    await page.goto(config.WORDPRESS_URL);
    await page.waitForLoadState("networkidle");

    // Navigate to FlexTable All Tables Page
    await flexTablePage.navigateToAllTables();

    // Assertion FlexTable All Tables Page Loaded
    const isAllTablesLoaded = await flexTablePage.verifyAllTablesPageLoaded();
    expect(isAllTablesLoaded).toBeTruthy();
    console.log("FlexTable All Tables Page Loaded");

    // Navigate to TABLE_TITLE edit page
    await flexTablePage.navigateToTableEditPage();

    // Navigate to Table Customization Tab
    await flexTablePage.navigateToTableCustomization();

    // Assertion Table Bottom Elements are displayed
    await flexTablePage.verifyTableBottomElements();
    console.log("Table Bottom Elements are displayed.");
    await page.waitForTimeout(2000);

    // Enable Show Entry Info and Show Pagination
    await flexTablePage.enableEntryInfo();
    await flexTablePage.enablePagination();
    await flexTablePage.saveChanges();

    await page.waitForTimeout(2000);
    // Assertion Setting Saved Successfully
    await flexTablePage.verifySavedSuccessfully();
    console.log("Settings Saved Successfully.");
    await page.waitForTimeout(5000);

    // Visit the frontend table page 
    await frontendPage.navigateToTablePage();

    // Scroll into View and Assertion Entry Info displays correctly
    await frontendPage.verifyEntryInfoVisible();
    console.log("Entry Info is displayed correctly Under the Table.");

    // Assertion Pagination is visible 
    await frontendPage.verifyPaginationVisible();
    console.log("Pagination is displayed correctly Under the Table.");
    await page.waitForTimeout(5000);

    // Assertion Pagination is functional if the Entry Info is text is changed
    await frontendPage.verifyEntryInfoText('Showing 1 to 10 of 15 entries');
    await frontendPage.clickPaginationNext();

    // Assertion Pagination Next Button is functional
    console.log("Pagination Next Button is functional.");
    await page.waitForTimeout(2000);

    // Assertion Pagination Previous Button is functional
    await frontendPage.clickPaginationPrevious();
    console.log("Pagination Previous Button is functional.");
    await page.waitForTimeout(2000);

    // Assertion Pagination 2 Button is functional
    await frontendPage.clickPaginationPage('2');
    console.log("Pagination 2 Button is functional.");
    await page.waitForTimeout(2000);

    // Assertion Pagination 1 Button is functional
    await frontendPage.clickPaginationPageLink('1');
    console.log("Pagination 1 Button is functional.");
    await page.waitForTimeout(2000);
    
  });

  // Update 'Rows Per Page & Table Height'
  test('Test case 8: Update Rows Per Page & Table Height', async () => {
    
    // Navigate to Wordpress Dashboard
    await page.goto(config.WORDPRESS_URL);
    await page.waitForLoadState("networkidle");

    // Navigate to FlexTable All Tables Page
    await flexTablePage.navigateToAllTables();

    // Assertion FlexTable All Tables Page Loaded
    const isAllTablesLoaded = await flexTablePage.verifyAllTablesPageLoaded();
    expect(isAllTablesLoaded).toBeTruthy();
    console.log("FlexTable All Tables Page Loaded");

    // Navigate to TABLE_TITLE edit page
    await flexTablePage.navigateToTableEditPage();

    // Navigate to Table Customization Tab
    await flexTablePage.navigateToTableCustomization();

    // Navigate to Styling Tab
    await flexTablePage.navigateToStylingTab();

    // Select any value from Rows Per Page
    await flexTablePage.setRowsPerPage(config.ROWS_PER_PAGE);
    // Select a value for Table height.
    await flexTablePage.setTableHeight(config.TABLE_HEIGHT);
    
    // Save changes
    await flexTablePage.saveChanges();
    // Assertion Setting Saved Successfully
    await flexTablePage.verifySavedSuccessfully();
    console.log("Settings Saved Successfully.");
    await page.waitForTimeout(5000);

    // Visit the frontend table page 
    await frontendPage.navigateToTablePage();
    await page.waitForLoadState("networkidle");

    // Assertion Rows per page matches selected value
    await frontendPage.verifyRowsPerPage(config.ROWS_PER_PAGE);
    console.log("Rows per page matches selected value.");
    await page.waitForTimeout(2000);

    // Assertion Table height matches selected value
    await frontendPage.verifyTableHeight(config.TABLE_HEIGHT);
    console.log("Table height matches selected value.");
    await page.waitForTimeout(2000);      

  });

  // Delete the Table and Verify Frontend Removal
  test('Test case 9: Delete the Table and Verify Frontend Removal', async () => {
    
    // Navigate to Wordpress Dashboard
    await page.goto(config.WORDPRESS_URL);
    await page.waitForLoadState("networkidle");

    // Navigate to FlexTable All Tables Page
    await flexTablePage.navigateToAllTables();

    // Assertion FlexTable All Tables Page Loaded
    const isAllTablesLoaded = await flexTablePage.verifyAllTablesPageLoaded();
    expect(isAllTablesLoaded).toBeTruthy();
    console.log("FlexTable All Tables Page Loaded");

    // Delete the table
    await flexTablePage.deleteTable();

    // Handling Delete Popup
    await flexTablePage.confirmDelete();

    // Assertion Table Deleted Successfully
    await flexTablePage.verifyTableDeletedFromBackend();
    console.log("Table Deleted Successfully From Backend.");
    await page.waitForTimeout(5000);

    // Visit the frontend table page 
    await frontendPage.navigateToTablePage();
    await page.waitForLoadState("networkidle");

    // Assertion Table Deleted Successfully from frontend
    await frontendPage.verifyTableDeletedFromFrontend();
    console.log("Table Deleted Successfully From Frontend.");
    await page.waitForTimeout(5000);

    // Navigate to Wordpress Dashboard 
    await page.goto(config.WORDPRESS_URL);
    await page.waitForTimeout(2000);

    // Navigate to the Pages Menu
    await pageEditorPage.navigateToPages();

    // Delete the Page from the Backend
    await pageEditorPage.deletePage();
    console.log("Page Deleted Successfully From Backend.");
    await page.waitForTimeout(2000);

    // Go to Trash Page
    await pageEditorPage.goToTrash();

    // Delete the Page Permanently
    await pageEditorPage.permanentlyDeletePage();

    // Assertion The text
    await pageEditorPage.verifyPageDeletedFromTrash();
    console.log("Page Permanently Deleted Successfully From Backend.");
    await page.waitForTimeout(5000);
  });

});