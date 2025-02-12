
# Note

---


---


1. created 'db.json' file in the root directory
2. install a JSON server globally on your machine using the command `npm install -g json-server`
   1) if permission denied, use this command `sudo npm install -g json-server`
3. After running the JSON server, The JSON server starts running on port 3000 by default; we will now define an alternate port 3001, for the JSON server. The --watch option automatically looks for any saved changes to db.json:
`json-server --port 3001 --watch db.json`
1. From the root directory of your app, we can run the JSON server using the command npx:
`npx json-server --port 3001 --watch db.json`
1. You will be able to see that JSON server serves db.json
2. Install JSON server as a development dependency (only used during development) `npm install json-server --save-dev`
3. add `"server": "json-server -p3001 --watch db.json"` to the scripts part of the package.json file
4. start the json-server from the project root directory `npm run server`

## Installation

- Install required dependency
   Install Express library `npm install express`
   Install axios `npm install axios`
   Install cors `npm install cors`
   Install mongoose `npm install mongoose`
   Install dotenv `npm install dotenv`
   Install nodemon by by defining it as a development dependency `npm install --save-dev nodemon`

---

## Usage

Start the app with nodemon `npm run dev`

---

## Integration Testing

- Testing with Vitest
Install Vitest and jsdom library `npm install --save-dev vitest jsdom`
Install jest-dom to test redering components `npm install --save-dev @testing-library/react @testing-library/jest-dom`

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

Test the app with `npm test`

- Test coverage
   To find the coverage of tests, run this command
      `npm test -- --coverage`
      install `@vitest/coverage-v8` by answering `yes` after running the command above
      run the command again

   To see the HTML report of the coverage, run this command `open coverage/index.html`
   this report will tell us the lines of untested code in each components

---
## Unit testing

### Testing with Playwright
Go to the "playwright" repo and follow the instructions

### Testing with Cypress
Go to the "cypress" repo and follow the instructions