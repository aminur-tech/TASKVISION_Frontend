# 🚀 TaskVision Frontend

TaskVision is a modern web application built with **React + TypeScript** that combines **Task Management (Kanban Board)** and **Image Annotation** into a single platform.

## ✨ Features

### 🔐 Authentication
- Login with Email & Password
- Protected Routes

### 📋 Task Management
- Kanban Board
- Date-based Task Filtering
- Add Task
- Edit Task
- Delete Task
- Drag & Drop Tasks
- Task Priority
- Due Date
- Tags
- Persistent Data

### 🖼️ Image Annotation
- Upload Images
- View Multiple Images
- Navigate Between Images
- Draw Polygon Annotations
- Delete Polygon
- Save Annotations
- Persistent Data

---

## 🛠️ Tech Stack

- React
- TypeScript
- Next.js
- Tailwind CSS
- React Router
- Axios
- Zustand
- HTML5 Canvas

---

## 📁 Project Structure

```text
taskvision-frontend/
│
├── public/                    
│
├── src/
│   ├── app/
│   │   ├── annotations/
│   │   │   └── page.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├──page.tsx
│   │   │   
│   │   │
│   │   ├── tasks/
│   │   │   └── page.tsx
│   │   │
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   │
│   ├── components/             # Reusable UI components
│   │
│   ├── libs/
│   │   └── Api.ts              # Axios API configuration
│   │
│   └── store/
│   |      ├── useAuthStore.ts
│   |      └── useTaskStore.ts
│   ├── proxy.ts
├── .env
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
└── README.md
```

## ⚙️ Environment Variables

Create a `.env` file
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/
```

---

## 🚀 Installation

Clone repository

```bash
git clone https://github.com/aminur-tech/TASKVISION_Frontend
```

Go to project

```bash
cd taskvision-frontend
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Build production

```bash
npm run build 
```

Start production server

```bash
npm run start
```

---

## 💻 Node Version

```
Node.js v22.x
npm 10.x
```

---

## ⚔️ Challenges Faced

During development I faced several challenges:

- Synchronizing date state across multiple components.
- Implementing smooth drag-and-drop with backend synchronization.
- Drawing polygon annotations using HTML Canvas.
- Managing annotation persistence after refreshing the page.
- Integrating React frontend with Django backend.
- Handling authentication and protected routes.
- Fixing CORS and API integration issues during deployment.

These challenges were solved by carefully debugging the application, following official documentation, separating reusable components, and using AI-assisted development tools when appropriate.

---

## ▶️ Run Project

1. Clone the repository.
2. Install dependencies.

```
npm install
```

3. Configure `.env`.
4. Start development server.

```
npm run dev
```

---

## 🌐 Live Demo

Frontend:

```
https://taskvision-frontend.vercel.app
```

Backend API

```
https://taskvision-backend.vercel.app
```

---

## 👤 Demo Account

user

```
aminur_pro
```

Password

```
12345678
```

---
