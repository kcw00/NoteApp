
# Note

---


---

## Installation

### Install required dependency
   - Install Express library `npm install express`   
   - Install a JSON server globally on your machine  
      `npm install -g json-server`  
       - if permission denied, use this command `sudo npm install -g json-server`  
   - Install JSON server as a development dependency (only used during development)  
      `npm install json-server --save-dev`  
   - Install axios `npm install axios`  
   - Install cors `npm install cors`  
   - Install mongoose `npm install mongoose`  
   - Install dotenv `npm install dotenv`  
   - Install nodemon by by defining it as a development dependency  
      `npm install --save-dev nodemon`  

---

## Usage

- Start the app with nodemon  
   `npm run dev`  

- Start the json-server from the project root directory  
   `npm run server`

---

## Integration Testing

### Testing with Vitest

- Install Vitest and jsdom library  
   `npm install --save-dev vitest jsdom`
  
- Install jest-dom to test redering components  
   `npm install --save-dev @testing-library/react @testing-library/jest-dom`

   ### Before running tests with Vitest
   - Handling eslint errors
      If you see the eslint errors in your file,
      1. install eslint-plugin-vitest  
            `npm install --save-dev eslint-plugin-vitest-globals`

      2. enable the plugin by editing the `.eslintrc.cjs` file  
            add `"vitest-globals/env": true` into the `"env"` section  
            add `'plugin:vitest-globals/recommended'` into the `"extends"` section

   - Simulating user input
      Install user-event library  
      `npm install --save-dev @testing-library/user-event`

   ### Testing project with Vitest
   Test the app with `npm test`

### Test coverage
   To find the coverage of tests, run this command  
      `npm test -- --coverage`  
   - install `@vitest/coverage-v8` by answering `yes` after running the command above
      run the command again

   To see the HTML report of the coverage, run this command  
   `open coverage/index.html`  
   - this report will tell us the lines of untested code in each components

---
## Unit testing

### Testing with Playwright
Go to the "playwright" repo and follow the instructions

### Testing with Cypress
Go to the "cypress" repo and follow the instructions
