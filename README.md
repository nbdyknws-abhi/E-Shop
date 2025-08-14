# 🛒 E-Shop Application (Chopper Town)

A comprehensive and modern **MERN Stack E-Shop Application** featuring user authentication, product listings, shopping cart functionality, and an administrative dashboard. It utilizes a sleek design with Tailwind CSS, Redux Toolkit for state management, reusable components, and dynamic product image support.

---
## 👀 Live Demo : https://chopper-town.onrender.com/  
PS : might take 1-2min to load server

---

## 🚀 Features

- 🔐 **User Authentication:** Secure signup and login with JWT.
- 🛍️ **Product Browse:** View a comprehensive list of available products with details.
- 🛒 **Shopping Cart:** Add, update, and remove items from the cart, managed with Redux Toolkit.
- 🧑‍💻 **Admin Dashboard:** Dedicated interface for managing products, users, and potentially queries.
- ⬆️ **Product Image Uploads:** Backend support for uploading product images (using Multer).
- 🎨 **Modern UI:** Sleek and responsive interface styled with Tailwind CSS.
- ⚡ **Optimized Performance:** Fast development and build times with Vite + React.

---

## 🛠️ Tech Stack

**Frontend:**
- **React + Vite:** For a fast and efficient single-page application development.
- **Redux Toolkit:** For robust and predictable state management (e.g., cart, user authentication).
- **React Router:** For declarative routing within the application.
- **Axios:** For making HTTP requests to the backend API.
- **Tailwind CSS:** For utility-first CSS styling, enabling rapid UI development.

**Backend:**
- **Node.js:** JavaScript runtime environment.
- **Express.js:** Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB + Mongoose:** NoSQL database and ODM for data persistence.
- **JWT Authentication:** For securing API endpoints.
- **Multer:** Node.js middleware for handling `multipart/form-data`, primarily used for file uploads.
- **Dotenv:** For managing environment variables.

---

## ⚙️ Local Setup Instructions

### 1. Clone the Repository

```
git clone [https://github.com/nbdyknws-abhi/E-Shop.git](https://github.com/nbdyknws-abhi/E-Shop.git)
cd E-Shop
```
### 2. Backend Setup (backend/)
Navigate to the backend directory and install dependencies:
```
cd backend
npm install
```
Create a .env file in the backend/ directory with the following content:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_strong_secret_key_for_jwt_token_encryption
Replace your_mongodb_connection_string with your MongoDB Atlas or local connection string.

Replace a_strong_secret_key_for_jwt_token_encryption with a unique, strong secret for JWT.
```

Start the backend server:
```
npm start
```
### Frontend Setup (frontend/)
Open a new terminal, navigate to the frontend directory, and install dependencies:

```
cd frontend
npm install
```
Create a .env file in your frontend/ directory if your frontend needs to know the backend URL. For Vite, environment variables should be prefixed with VITE_.
```
VITE_BACKEND_API_URL=http://localhost:5000
Adjust the URL if your backend is running on a different port or deployed elsewhere.*
```
Start the frontend development server:
```
npm run dev
```
### 🔐 Authentication Flow: How It Works 🔑
JWT (JSON Web Tokens) are the backbone of our secure API endpoints, ensuring only authenticated users can access protected resources.

Upon successful login, a unique token is issued by the backend and securely managed on the client side (e.g., in localStorage).

Frontend routes that require a user to be logged in will gracefully redirect unauthenticated users to the login page.

### 💡 Customization & Contribution: Make It Your Own! 🎨
Product Images: Easily upload and manage product images, which will be stored in the backend/public/uploads directory.

Fork & Enhance! Feel free to fork this repository, add exciting new features, fix bugs, and contribute back to the project! Your pull requests are highly welcome. 💖

### 📧 Connect With Me! 👋
Built with passion by nbdyknws-abhi 
Have questions, suggestions, or just want to chat about code or anime? Don't hesitate to reach out! I'm always watching for new opportunities and cool tech. 🤖🎬
