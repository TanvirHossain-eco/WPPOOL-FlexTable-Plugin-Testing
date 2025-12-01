WPPOOL FLEXTABLE PLUGIN & WooCommerce Website - Playwright Automation Project
=============================================================================
Prerequisites:
==============
- IDE (VS Code)
- Git Bash Installation
- Node Js Installation
- After installation of Node JS open the command prompt 
- check node & npm version
- To check Node version = node -v
- To check NPM version = npm -v
- Setup a WordPress WooCommerce website environment - on your Localhost / using ngrok / free server like Pantheon.io / your own staging server
- Install the WP Super Cache Plugin for better server performance
- If you are testing with similar environment like mine then must modify a few css to make the visual consistency.


Setup Instructions (Local):
===========================
1. Clone the repository
- Open a terminal from IDE (or Git Bash)
- Navigate to the folder where you want to clone the project: cd /path/to/your/folder
- git clone (Provide URL)
- cd <REPOSITORY_NAME> like: cd Wppool-plugin-testing (You can also rename the folder later)
- Fill out the .env.example accordingly and rename it as .env 

2. Install dependencies
- npm install

3. Install Playwright browsers
- npx playwright install --with-deps

4. Run all tests
- npx playwright test

5. Run a specific task:
# Test-1: 
- npx playwright test tests/(testname1).spec.js

# Test-2:
- npx playwright test tests/(testname2).spec.js

6. Run the specific test in headed mode
- npx playwright test tests/(testname1).spec.js --headed

7. Run the specific test in headed & debug mode
- npx playwright test tests/(testname1).spec.js --headed --debug

8. View HTML report
- npx playwright show-report

In the future, the Allure report can be added for more detailed views. 
