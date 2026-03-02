# 📝 MERN Blog Platform

Full-stack blog platform with authentication, rich text editor, image uploads, and admin dashboard.

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
```

Edit `.env` file with your credentials:
- `MONGO_URI` → MongoDB Atlas connection string
- `JWT_SECRET` → Any random secret string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` → From cloudinary.com

```bash
npm run dev
# Runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Make Yourself Admin
After registering, go to MongoDB Atlas → your database → users collection → find your document → set `role: "admin"`

## 🔑 External Services (Both FREE)

### MongoDB Atlas
1. Visit https://mongodb.com/atlas
2. Create free cluster
3. Create database user
4. Allow access from anywhere (0.0.0.0/0)
5. Copy connection string to MONGO_URI in .env

### Cloudinary
1. Visit https://cloudinary.com
2. Create free account
3. Copy Cloud Name, API Key, API Secret to .env

## ✅ Features
- JWT Authentication (Register/Login/Logout)
- Rich Text Editor (React Quill)
- Image Upload with Cloudinary
- Blog CRUD (Create/Read/Update/Delete)
- Draft & Publish system
- Search, Filter by Category, Sort
- Like / Unlike blogs
- Comments system
- User Dashboard
- Admin Dashboard
- Protected Routes
- Auto read-time calculation
- Responsive design

## 🛠️ Tech Stack
- **Frontend**: React + Vite, React Router, Axios, React Quill, React Hot Toast
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Multer, Cloudinary
