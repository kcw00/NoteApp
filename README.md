
# Note

this repository starts with its backend part.

1. created 'db.json' file in the root directory
2. install a JSON server globally on your machine using the command `npm install -g json-server`
   1) if permission denied, use this command `sudo npm install -g json-server`
3. After running the JSON server, The JSON server starts running on port 3000 by default; we will now define an alternate port 3001, for the JSON server. The --watch option automatically looks for any saved changes to db.json:
`json-server --port 3001 --watch db.json`
4. From the root directory of your app, we can run the JSON server using the command npx:
`npx json-server --port 3001 --watch db.json`
5. You will be able to see that JSON server serves db.json
7. Install JSON server as a development dependency (only used during development) `npm install json-server --save-dev`
8. add `"server": "json-server -p3001 --watch db.json"` to the scripts part of the package.json file
9. start the json-server from the project root directory `npm run server`


- Install required dependency
Install Express library `npm install express`
Install axios `npm install axios`
Install cors `npm install cors`
Install mongoose `npm install mongoose`
Install dotenv `npm install dotenv`
Install nodemon by by defining it as a development dependency `npm install --save-dev nodemon`

start the app with nodemon `npm run dev`