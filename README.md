# 📝 Real-Time Collaborative Notes App

A full-stack real-time note-taking application built with **React**, **Redux**, **TipTap**, and **Hocuspocus**, supporting live multi-user editing, shared notes, and role-based access.

> This is frontend repo. If you want to clone the whole project, go to `noteapp-backend` repo and clone it.

---

## 🚀 Features

- 🧠 **Live collaboration** using [TipTap](https://tiptap.dev) + [Hocuspocus](https://tiptap.dev/docs/hocuspocus)
- 🧩 **Shared notes** between users with `viewer` and `editor` roles
- 🗂️ Organize notes into favorites, others, and shared sections
- 🧑‍🤝‍🧑 **Presence indicators** (active users)
- 🌙 **Dark/light theme** toggle
- 🔒 JWT-based **authentication**
- 🧠 **Rich-text formatting**: headings, lists, bold/italic/code, etc.
- 🧵 **Slash command menu** (type `/` for inline actions)
- 🧼 Clean, responsive UI with custom styles and Bootstrap modals

---

## 🏗️ Tech Stack

**Frontend**
- React
- Redux Toolkit
- TipTap (with collaboration extensions)
- Socket.IO Client
- Bootstrap / Custom CSS

**Backend**
- Node.js / Express
- MongoDB (with Mongoose)
- Socket.IO
- Hocuspocus server (for Yjs-based collaboration)
- JWT authentication

---

## 🛠️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-username/realtime-notes-app.git
cd realtime-notes-app
```

### 2. Install dependencies

```bash
cd frontend
npm install
```
```
cd backend
npm install
```

### 3. Set up environment variables

`backend/.env`
```bash
PORT=your-port
SERVER_ADDRESS=your-backend-address
MONGODB_URI=mongodb+srv://your-db-uri
SECRET=your_jwt_secret
COLLAB_SECRET=your_collab_secret  # this is for tiptap token
```

`frontend/.env`
```bash
VITE_BACKEND_URL=backend-url
VITE_BACKEND_ADDRESS=backend-address
```

### 4. Start servers
```bash
cd frontend && npm run dev
```
```bash
cd backend && npm run dev
```

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
