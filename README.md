# 📝 Real-Time Collaborative Notes App

A full-stack real-time note-taking application built with **React**, **Redux**, **TipTap**, and **Hocuspocus**, supporting live multi-user editing, shared notes, and role-based access.

> This is the frontend client. For server-side logic, visit [noteapp-backend](https://github.com/kcw00/noteapp-backend) repository

---
## 📷 Live Demo and Screenshots

Try it here: https://note-app-woad-five.vercel.app/


**1. Slash Command Menu**  
![ScreenRecording2025-05-22at01 23 55-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/c35f20e7-a039-4e1b-847d-ec0053a6c6b4)

**2. Shared & Logout Modal**  
![ScreenRecording2025-05-22at02 46 30-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/a98db14c-58f3-4e49-9d93-43c141d485fe)

**3. Collaboration**  
![ezgif com-video-to-gif-converter (1)](https://github.com/user-attachments/assets/e4589180-3951-4d1e-9481-53149fe8d0e9)

**4. Theme Mode Change**  
![ScreenRecording2025-05-21at14 32 06-ezgif com-crop](https://github.com/user-attachments/assets/0bc99c4e-c303-4c41-aefc-cca96da480f8)

**5. Resizable Sidebar**  
![ezgif com-video-to-gif-converter (2)](https://github.com/user-attachments/assets/ab6a2773-0c49-4234-9c5a-ed14fba5b0a2)

---

## 🛠️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-username/NoteApp.git
cd noteapp
```

### 2. Install dependencies

```bash
cd frontend
npm install
```

### 3. Set up environment variables

Create `.env` file in root directory

`frontend/.env`
```bash
#BACKEND_URL
VITE_BACKEND_URL=backend-url
#BACKEND_COLLAB_URL
VITE_BACKEND_COLLAB_URL=backend-url-for-collab
```

### 4. Start servers
```bash
cd frontend && npm run dev
```
---
## 🚀 Features

- 🧠 **Live collaboration** using [TipTap](https://tiptap.dev) + [Hocuspocus](https://tiptap.dev/docs/hocuspocus)
- 🌐 Backend hosted on **DigitalOcean**, frontend on **Vercel**
- 🧩 **Shared notes** between users with `viewer` and `editor` roles
- 🔄 **Real-time updates** via Socket.IO:
  - Collaborators added/removed in real-time
  - Sidebar updates live as note access change
- 🗂️ Organize notes into favorites, others, and shared sections
- 🧑‍🤝‍🧑 **Presence indicators** (active collaborators)
- 🌙 **Dark/light theme** toggle
- 🔒 JWT-based **authentication**
- 🧠 **Rich-text formatting**: headings, lists, bold/italic/code, etc.
- 🧵 **Slash command menu** (type `/` for inline actions)
- 🧼 Clean, responsive UI with custom styles and **Bootstrap** modals
- ⚙️ Automated CI/CD pipeline using GitHub Actions for seamless deployment

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
## 💡 Real-time Collaboration Architecture

This app uses **Socket.IO** and **Hocuspocus(Websocket)** to maintain real-time state consistency across users. Events are emitted to specific users when:

**via Socket.IO**
- 📝 A note is created or deleted
- 👥 A collaborator is added or removed from a note

**via Hocuspocus(Websocket)**
- 🔄 Notes are updated (e.g. content, title)
- ✏️ Collaborators' cursors are displayed on the shared notes

These events ensure that:
- Users see instant changes in their sidebar and note list
- Removed users immediately lose access to notes
- New collaborators receive shared notes without refreshing
  
---
## 🧪 Real-Time Socket Events

This app connects to a Socket.IO backend to respond to collaboration events.

### Handled Events:

| Event Name            | When it triggers                              |
| --------------------- | --------------------------------------------- |
| `collaboratorAdded`   | When a collaborator is added to a shared note |
| `collaboratorRemoved` | When a user is removed from a note            |
| `noteDeleted`         | When a shared note is deleted                 |
| `activeUsers`         | When users connect or disconnect              |

The frontend listens to these events via a `useSocketListeners()` hook and updates Redux state accordingly.

---
## CI/CD Pipeline

This project is fully automated with a secure and reliable CI/CD setup using **GitHub Actions**.

### Workflow Overview
- **Frontend Deployment**: Automatically deployed to [Vercel](https://vercel.com/) on every pushed commits.
- **Backend Deployment**: Automatically deployed to a [DigitalOcean](https://www.digitalocean.com/) droplet using SSH and `pm2` after merging to `main`.


### Required Check
- `deploy.yml` must succeed before merging to `main`

This ensures every change is reviewed, tested, and deployed automatically — keeping production up-to-date and safe.

---

## Testing

### Integration Testing with Vitest

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


### End-to-End testing

**Testing with Playwright**
Go to the "playwright" repo and follow the instructions

**Testing with Cypress**
Go to the "cypress" repo and follow the instructions
