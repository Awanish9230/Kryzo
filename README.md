# 🎯 KRYZO - AI-Powered Test Series Platform

<div align="center">

![KRYZO](https://img.shields.io/badge/KRYZO-Test%20Series%20Platform-blue?style=for-the-badge)
![MERN](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A modern, AI-powered assessment platform for engineering colleges with adaptive diagnostics and real-time performance tracking.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)..
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**KRYZO** is a comprehensive test-series platform built with the MERN stack, designed specifically for engineering colleges. It features AI-powered diagnostics, adaptive learning paths, and real-time performance analytics to help students excel in their assessments.

### Key Highlights

- 🤖 **AI-Powered Diagnostics** - Adaptive engine analyzing 20+ performance parameters
- 💻 **Monaco Editor** - Professional-grade code editor integration (VS-Code engine)
- 📊 **Pain Point Analytics** - Data-driven insights to identify weak topics and hard questions
- 🎯 **Activity Streaks** - Gamified engagement tracking with daily session goals
- 🚩 **Question Reporting** - Student-driven quality control for the test bank
- 🎨 **Premium UI** - BetterStack-inspired dark mode with glassmorphism

---

## ✨ Features

### For Students

- **Diagnostic Tests** - AI-generated tests to identify strengths and weaknesses
- **Custom Test Builder** - Create personalized tests by selecting topics and difficulty
- **Performance Dashboard** - View detailed analytics, topic mastery, and progress
- **User Profile** - Track level progression, percentile ranking, and achievements
- **Improvement Plans** - Daily tasks and recommendations based on weak areas
- **Activity Tracker** - Monitor study time and question solving streaks
- **Question Reporting** - Flag problematic questions for admin review
- **Monaco Code Editor** - Multi-language support (JS, Python, Java, C++)
- **Test History** - Review past attempts with detailed breakdowns

### For Admins

- **Question Management** - Create, edit, and delete questions (MCQ, Coding, Development)
- **User Management** - View, edit, and manage student accounts
- **Analytics Dashboard** - Platform-wide statistics and growth metrics
- **Question Bank** - Organize questions by topic, difficulty, and status
- **Report Management** - Review and resolve student-flagged question issues
- **Pain Point Analytics** - Visualize topic accuracy and highest failure rates
- **Bulk Operations** - Search, filter, and manage questions efficiently

### Question Types

1. **MCQ (Multiple Choice)** - Traditional multiple-choice questions
2. **Coding Problems** - Programming challenges with test cases
3. **Development Projects** - Project-based assessments with deliverables

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Monaco Editor** - Professional code editor engine
- **React Router DOM** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### DevOps
- **Nodemon** - Auto-restart server
- **Concurrently** - Run multiple commands
- **dotenv** - Environment variables

---

## � Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)
- **npm** or **yarn** - Comes with Node.js

### Check Installations

```bash
node --version   # Should be v16+
npm --version    # Should be 8+
mongod --version # Should be v5+
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Awanish9230/Kryzo.git
cd Kryzo
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Install Client Dependencies

```bash
cd client
npm install
cd ..
```

### 4. Install Server Dependencies

```bash
cd server
npm install
cd ..
```

---

## 🔐 Environment Variables

### Server Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/kryzo

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
```

### Client Environment Variables (Optional)

Create a `.env` file in the `client` directory if needed:

```env
VITE_API_URL=http://localhost:5000/api
```

> **⚠️ Important:** Never commit `.env` files to version control. They are already included in `.gitignore`.

---

## ▶️ Running the Application

### Option 1: Run Everything Concurrently (Recommended)

From the **root directory**:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend dev server on `http://localhost:5173`

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

---

## � Project Structure

```
Kryzo/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/       # React context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── admin/     # Admin pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── QuestionList.jsx
│   │   │   │   ├── AddQuestion.jsx
│   │   │   │   ├── EditQuestion.jsx
│   │   │   │   ├── UserManagement.jsx
│   │   │   │   └── ReportedQuestions.jsx # [NEW] Report management
│   │   │   ├── student/   # Student pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── TestAttempt.jsx
│   │   │   │   └── CustomTestBuilder.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/         # Utility functions
│   │   │   └── api.js
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Node.js backend
│   ├── config/           # Configuration
│   │   └── db.js         # MongoDB connection
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   └── studentController.js
│   ├── middleware/       # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── Test.js
│   │   ├── UserAttempt.js
│   │   ├── UserActivity.js # [NEW] Activity/Streak tracking
│   │   └── ReportedQuestion.js # [NEW] Student flags
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   └── studentRoutes.js
│   ├── .env              # Environment variables (not in repo)
│   ├── .gitignore
│   ├── index.js          # Server entry point
│   └── package.json
│
├── .gitignore            # Root gitignore
├── package.json          # Root package.json
└── README.md             # This file
```

---

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |

### Student Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/student/profile` | Get user profile with stats | Private |
| GET | `/api/student/topics` | Get available topics | Private |
| GET | `/api/student/test/diagnostic` | Generate diagnostic test | Private |
| POST | `/api/student/test/custom` | Create custom test | Private |
| GET | `/api/student/test/:id` | Get test by ID | Private |
| POST | `/api/student/test/submit` | Submit test attempt | Private |
| GET | `/api/student/plan` | Get improvement plan | Private |
| POST | `/api/student/question/report` | Report a question issue | Private |
| POST | `/api/student/activity/update` | Update daily activity stats | Private |
| GET | `/api/student/activity/log` | Get activity heatmap data | Private |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/stats` | Get platform statistics | Admin |
| GET | `/api/admin/questions` | Get all questions | Admin |
| POST | `/api/admin/questions` | Create new question | Admin |
| GET | `/api/admin/questions/:id` | Get question by ID | Admin |
| PUT | `/api/admin/questions/:id` | Update question | Admin |
| DELETE | `/api/admin/questions/:id` | Delete question | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| PUT | `/api/admin/users/:id` | Update user | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |
| GET | `/api/admin/questions/reports` | Get all reported questions | Admin |
| PUT | `/api/admin/questions/reports/:id` | Resolve/Update report | Admin |
| GET | `/api/admin/analytics/pain-points` | Get highest failure rates | Admin |

---

## 🎨 Screenshots

### Landing Page
Premium dark mode landing page with glassmorphism effects.

### Student Dashboard
Performance analytics with topic mastery and improvement plans.

### Admin Dashboard
Platform statistics and question management interface.

### Test Interface
Split-pane layout for coding questions with real-time feedback.

---

## 👥 Default Accounts

### Admin Account
- **Email:** admin@kryzo.com
- **Password:** admin123
- **Role:** Admin

### Student Account
- **Email:** student@kryzo.com
- **Password:** student123
- **Role:** Student

> **Note:** Change these credentials in production!

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Admin dashboard statistics
- [ ] Question creation (MCQ, Coding, Development)
- [ ] Question editing and deletion
- [ ] User management (edit, delete)
- [ ] Diagnostic test generation
- [ ] Custom test builder
- [ ] Test submission and scoring
- [ ] Profile page with analytics
- [ ] Improvement plan generation

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service (Windows)
net start MongoDB

# Start MongoDB service (Mac/Linux)
sudo systemctl start mongod
```

### Port Already in Use

```bash
# Kill process on port 5000 (Backend)
npx kill-port 5000

# Kill process on port 5173 (Frontend)
npx kill-port 5173
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Awanish Verma**

- GitHub: [@Awanish9230](https://github.com/Awanish9230)
- Email: awanish@kryzo.com

---

## 🤝 Question Contributors

Special thanks to the following individuals for their contributions to the question bank:

- **Awanish Kumar Verma**
- **Shantanu Raj**
- **Manikant Verma**
- **Avshesh Kushwaha**
- **Utkarsh Maheshwari**

---

## 🙏 Acknowledgments

- Design inspiration from [BetterStack](https://betterstack.com)
- Icons from [Lucide](https://lucide.dev)
- UI components styled with [Tailwind CSS](https://tailwindcss.com)

---

## 📞 Support

For support, email awanish@kryzo.com or open an issue on GitHub.

---

<div align="center">

**Made with ❤️ by Awanish Verma**

⭐ Star this repo if you find it helpful!

</div>
