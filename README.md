# Cook Mate 🍳  
**Learn, Share, and Master the Art of Cooking**

Cook Mate is a full-featured, community-driven web application for cooking enthusiasts to share recipes, follow learning plans, and grow their kitchen skills through interactive features and social engagement.

## 🌐 Live Demo  
to do

## 🛠️ Tech Stack

### 🔧 Backend
- **Spring Boot** – RESTful API and secure backend services
- **MongoDB** – Flexible NoSQL database for storing users, posts, and learning plans

### 🎨 Frontend
- **React (Vite)** – Fast, modern frontend framework
- **Tailwind CSS** – Utility-first CSS for sleek, responsive design

### 🔐 Authentication
- **OAuth 2.0** – Login with Google and Facebook

---

## ✨ Features

### 👤 User Authentication & Profile
- Sign up / log in via **Google or Facebook (OAuth 2.0)**
- Secure logout and session management
- Profile customization (bio, profile picture)
- Account deletion

### 📝 Post & Share Content
- Create rich posts with:
  - Up to 3 photos or a 30-second video
  - Cooking tips, recipes, or techniques
  - Hashtags (e.g., #Baking, #Italian)
- Edit or delete your posts anytime
- Like and comment on other users’ posts

### 📚 Learning Plans & Progress Tracking
- Create structured cooking plans (e.g., "Learn Italian Cooking")
- Organize by weekly topics (Week 1: Pasta, Week 2: Risotto...)
- Track progress and mark topics as complete
- Share learning updates with followers

### 🔍 Search Functionality
- Search for users, posts, and learning plans
- Apply filters like cuisine type, user popularity, or tags

### 🔔 Notifications System
- Real-time notifications for:
  - New followers
  - Likes and comments on posts
- View notifications in a notification center

### 🧑‍🤝‍🧑 Follow & Interact
- Follow/unfollow users to stay updated
- Like, comment, and support other cooks
- Delete your own comments or remove comments from your posts

---

## 👨‍💻 My Contributions

- Implemented **OAuth 2.0 login** and logout functionality
- Built the **Learning Plans** module (create, update, delete)
- Developed **progress tracking** and sharing functionality
- Designed and implemented **search functionality** with filters

---

## 📂 Project Structure

```bash
PAF-web/
├── backend/               # Spring Boot project
│   ├── src/
│   └── pom.xml
├── frontend/              # React + Vite + Tailwind CSS
│   ├── src/
│   └── vite.config.js
└── README.md
