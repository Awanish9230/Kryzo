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
- 💻 **Monaco Editor** - Professional-grade code editor integration (VS Code engine)
- ⚡ **Local Code Execution** - Server-side code runner supporting JS, Python, Java, C++
- 🎮 **Battle Arena** - Real-time competitive coding battles with Socket.IO
- 📊 **Pain Point Analytics** - Data-driven insights to identify weak topics and hard questions
- 🎯 **Activity Streaks** - Gamified engagement tracking with daily session goals and heatmaps
- 🚩 **Question Reporting** - Student-driven quality control for the test bank
- 🧠 **AI Question Generation** - Gemini-powered automatic question creation and explanations
- 📚 **7-Day Improvement Plans** - Personalized daily learning paths based on diagnostics
- 🎨 **Premium UI** - BetterStack-inspired dark mode with glassmorphism and smooth animations

---

## ✨ Features

### For Students

- **Diagnostic Tests** - AI-generated tests to identify strengths and weaknesses
- **7-Day Improvement Plans** - Personalized daily learning paths with topic-specific questions
- **Daily Tests** - Scheduled practice tests to maintain consistency
- **Coding Practice** - Dedicated environment with Monaco editor and real-time execution
- **Battle Arena** - Real-time competitive coding battles against other students
- **Custom Test Builder** - Create personalized tests by selecting topics and difficulty
- **Performance Dashboard** - View detailed analytics, topic mastery, and progress tracking
- **Enhanced Profile** - Level progression, percentile ranking, achievements, and activity heatmaps
- **Test History & Review** - Review past attempts with detailed breakdowns and AI explanations
- **Activity Tracker** - Monitor study time, question solving streaks, and daily engagement
- **Study Documentation** - Access learning materials and resources
- **Question Reporting** - Flag problematic questions for admin review
- **Monaco Code Editor** - Professional VS Code-powered editor with syntax highlighting
- **Local Code Execution** - Run code in JS, Python, Java, C++ without external APIs

### For Admins

- **Question Management** - Create, edit, and delete questions (MCQ, Coding, Development)
- **AI Question Generation** - Generate questions using Gemini AI with bulk creation support
- **Bulk Upload** - Import questions from Excel/CSV files with validation
- **Auto-Fill & Standardization** - AI-powered question enhancement and formatting
- **User Management** - View, edit, and manage student accounts with detailed analytics
- **Analytics Dashboard** - Platform-wide statistics, growth metrics, and user activity
- **Global Reports** - Comprehensive pain-point analytics and performance insights
- **Question Bank** - Advanced search, filter, and organize by topic, difficulty, status
- **Report Management** - Review and resolve student-flagged question issues
- **Settings Panel** - 5-pillar configuration (Scoring, Registration, Security, Notifications, System)
- **System Logs** - Track all platform activities and changes with detailed logging
- **Documentation Management** - Create and manage study materials for students
- **Admin Profile** - Personal statistics and contribution tracking

### Question Types

1. **MCQ (Multiple Choice)** - Traditional multiple-choice questions
2. **Coding Problems** - Programming challenges with test cases
3. **Development Projects** - Project-based assessments with deliverables

---

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library with latest features
- **Vite 7** - Next-generation build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Framer Motion** - Production-ready animation library
- **Lucide React** - Beautiful icon library
- **Monaco Editor** - VS Code's powerful code editor
- **React Router DOM v7** - Client-side routing
- **React Resizable Panels** - Split-pane layouts for coding interface
- **React Markdown** - Markdown rendering with GitHub Flavored Markdown
- **React Syntax Highlighter** - Code syntax highlighting
- **React Hot Toast** - Beautiful toast notifications
- **Recharts** - Composable charting library for analytics
- **Socket.IO Client** - Real-time bidirectional communication
- **Axios** - Promise-based HTTP client
- **XLSX** - Excel file parsing and generation

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js 5** - Fast, minimalist web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - Elegant MongoDB ODM
- **JWT** - Secure authentication with JSON Web Tokens
- **bcryptjs** - Password hashing and encryption
- **Socket.IO** - Real-time WebSocket communication for Battle Arena
- **Google Generative AI (Gemini)** - AI-powered question generation and explanations
- **Axios** - HTTP client for external API calls
- **UUID** - Unique identifier generation
- **XLSX** - Server-side Excel processing for bulk uploads
- **Express Async Handler** - Async error handling middleware

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

Create a `.env` file in the `server` directory (or copy from `.env.example`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/kryzo
# For production (MongoDB Atlas):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/kryzo?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production_min_32_chars

# Google Gemini AI API (for AI question generation and explanations)
GEMINI_API_KEY=your_gemini_api_key_here
# Get your API key from: https://makersuite.google.com/app/apikey

# CORS Configuration (Optional - for production)
# CLIENT_URL=http://localhost:5173
# For production:
# CLIENT_URL=https://your-frontend-domain.com
```

### Client Environment Variables

Create a `.env` file in the `client` directory (or copy from `.env.example`):

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# For production deployment:
# VITE_API_URL=https://your-backend-domain.com/api
```

> **⚠️ Important:** 
> - Never commit `.env` files to version control. They are already included in `.gitignore`.
> - Use `.env.example` files as templates for required environment variables.
> - For Gemini AI features to work, you must obtain an API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

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

## 📁 Project Structure

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
│   │   │   │   ├── BulkUpload.jsx         # [NEW] Excel/CSV import
│   │   │   │   ├── UserManagement.jsx
│   │   │   │   ├── ReportedQuestions.jsx
│   │   │   │   ├── Reports.jsx            # [NEW] Global analytics
│   │   │   │   ├── Settings.jsx           # [NEW] Platform settings
│   │   │   │   ├── SystemLogs.jsx         # [NEW] Activity logging
│   │   │   │   ├── AdminDocumentation.jsx # [NEW] Content management
│   │   │   │   └── Profile.jsx            # [NEW] Admin profile
│   │   │   ├── student/   # Student pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Profile.jsx            # Enhanced with heatmaps
│   │   │   │   ├── TestAttempt.jsx
│   │   │   │   ├── TestResult.jsx
│   │   │   │   ├── TestReviewList.jsx
│   │   │   │   ├── TestReviewDetail.jsx
│   │   │   │   ├── CustomTestBuilder.jsx
│   │   │   │   ├── DailyTest.jsx          # [NEW] Daily practice
│   │   │   │   ├── CodingPractice.jsx     # [NEW] Practice environment
│   │   │   │   ├── BattleLobby.jsx        # [NEW] Battle matchmaking
│   │   │   │   ├── BattleArena.jsx        # [NEW] Real-time battles
│   │   │   │   └── StudyDocumentation.jsx # [NEW] Learning materials
│   │   │   ├── general/   # Public pages
│   │   │   │   ├── About.jsx
│   │   │   │   ├── Contact.jsx
│   │   │   │   ├── Features.jsx
│   │   │   │   ├── Pricing.jsx
│   │   │   │   ├── Careers.jsx
│   │   │   │   ├── Blog.jsx
│   │   │   │   ├── PrivacyPolicy.jsx
│   │   │   │   ├── TermsOfService.jsx
│   │   │   │   └── InfoPageLayout.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── NotFound.jsx
│   │   ├── utils/         # Utility functions
│   │   │   └── api.js
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── .env.example       # Environment template
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
│   │   ├── studentController.js
│   │   ├── compilerController.js  # [NEW] Code execution
│   │   └── settingsController.js  # [NEW] Settings management
│   ├── middleware/       # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── Test.js
│   │   ├── UserAttempt.js
│   │   ├── UserActivity.js        # Activity/Streak tracking
│   │   ├── ReportedQuestion.js    # Student flags
│   │   ├── Documentation.js       # [NEW] Study materials
│   │   ├── Settings.js            # [NEW] Platform config
│   │   └── SystemLog.js           # [NEW] Activity logs
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── studentRoutes.js
│   │   └── compilerRoutes.js      # [NEW] Code execution
│   ├── utils/            # Utility functions
│   │   └── localExecutor.js       # [NEW] Local code runner
│   ├── .env.example      # Environment template
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
| PUT | `/api/student/profile` | Update user profile | Private |
| GET | `/api/student/topics` | Get available topics | Private |
| GET | `/api/student/test/diagnostic` | Generate diagnostic test | Private |
| POST | `/api/student/test/custom` | Create custom test | Private |
| GET | `/api/student/test/:id` | Get test by ID | Private |
| POST | `/api/student/test/submit` | Submit test attempt | Private |
| GET | `/api/student/plan` | Get 7-day improvement plan | Private |
| GET | `/api/student/plan/day/:dayNumber/questions` | Get questions for specific day | Private |
| GET | `/api/student/attempts` | Get user test attempts | Private |
| GET | `/api/student/attempt/:attemptId` | Get detailed attempt results | Private |
| GET | `/api/student/practice/coding` | Get coding practice questions | Private |
| POST | `/api/student/practice/submit` | Submit practice solution | Private |
| POST | `/api/student/question/report` | Report a question issue | Private |
| POST | `/api/student/question/:id/explain` | Generate AI explanation | Private |
| GET | `/api/student/documentation/:id` | Get study documentation | Private |
| POST | `/api/student/activity/update` | Update daily activity stats | Private |
| GET | `/api/student/activity/log` | Get activity heatmap data | Private |
| POST | `/api/student/dsa/advance` | Advance DSA progression | Private |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/stats` | Get platform statistics | Admin |
| GET | `/api/admin/detailed-stats` | Get detailed analytics | Admin |
| GET | `/api/admin/my-stats` | Get admin's question stats | Admin |
| GET | `/api/admin/questions` | Get all questions | Admin |
| POST | `/api/admin/questions` | Create new question | Admin |
| GET | `/api/admin/questions/:id` | Get question by ID | Admin |
| PUT | `/api/admin/questions/:id` | Update question | Admin |
| DELETE | `/api/admin/questions/:id` | Delete question | Admin |
| POST | `/api/admin/questions/bulk` | Bulk upload from Excel/CSV | Admin |
| POST | `/api/admin/questions/generate-ai` | Generate questions with AI | Admin |
| POST | `/api/admin/questions/auto-fill` | Auto-fill question details | Admin |
| POST | `/api/admin/questions/standardize` | Standardize coding questions | Admin |
| GET | `/api/admin/questions/reports` | Get all reported questions | Admin |
| PUT | `/api/admin/questions/reports/:id` | Resolve/Update report | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| PUT | `/api/admin/users/:id` | Update user | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |
| GET | `/api/admin/analytics/users` | Get user activity statistics | Admin |
| GET | `/api/admin/analytics/pain-points` | Get highest failure rates | Admin |
| GET | `/api/admin/documentation` | Get all documentation | Admin |
| POST | `/api/admin/documentation` | Create documentation | Admin |
| DELETE | `/api/admin/documentation/:id` | Delete documentation | Admin |
| GET | `/api/admin/settings` | Get platform settings | Admin |
| PUT | `/api/admin/settings` | Update platform settings | Admin |
| GET | `/api/admin/logs` | Get system logs | Admin |

### Compiler Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/compiler/run` | Execute code locally | Private |

---

## 🎨 Screenshots

### Landing Page
Premium dark mode landing page with glassmorphism effects, smooth animations, and modern gradient design.

### Student Dashboard
Performance analytics dashboard featuring topic mastery visualization, 7-day improvement plans, activity streaks, and personalized recommendations.

### Coding Practice & Battle Arena
- **Monaco Editor Interface**: Professional VS Code-powered editor with syntax highlighting, IntelliSense, and multi-language support
- **Split-Pane Layout**: Resizable panels for question description, code editor, and output console
- **Battle Arena**: Real-time competitive coding with Socket.IO, live opponent tracking, and instant result comparison
- **Local Code Execution**: Run JavaScript, Python, Java, and C++ code directly on the server

### Admin Dashboard
Comprehensive platform statistics including user growth metrics, question bank analytics, pain-point visualizations, and system health monitoring.

### Admin Features
- **Bulk Upload**: Excel/CSV import with validation and error reporting
- **AI Question Generation**: Gemini-powered question creation with customizable parameters
- **Settings Panel**: 5-pillar configuration system (Scoring, Registration, Security, Notifications, System)
- **System Logs**: Real-time activity tracking with filtering and search capabilities
- **Global Reports**: Pain-point analytics showing topic difficulty and highest failure rates

### Student Profile
Enhanced profile page with level progression, percentile ranking, achievement badges, activity heatmaps, and detailed performance analytics across all topics.

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

## 🚀 Deployment

### Production Build

#### Build Frontend

```bash
cd client
npm run build
```

This creates an optimized production build in the `client/dist` directory.

#### Start Backend in Production

```bash
cd server
NODE_ENV=production npm start
```

### Environment Configuration for Production

#### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/kryzo?retryWrites=true&w=majority
JWT_SECRET=your_production_jwt_secret_min_32_characters_long
GEMINI_API_KEY=your_production_gemini_api_key
CLIENT_URL=https://your-frontend-domain.com
```

#### Frontend (.env)

```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Deployment Platforms

#### Recommended Platforms

- **Backend**: [Render](https://render.com), Railway, Heroku, DigitalOcean
- **Frontend**: Render (Static Site), Vercel, Netlify, Cloudflare Pages
- **Database**: MongoDB Atlas (Free tier available)

#### Deployment Notes

1. **MongoDB Atlas**: Create a free cluster and whitelist all IPs (0.0.0.0/0) or specific deployment IPs
2. **Environment Variables**: Set all required environment variables in your deployment platform
3. **CORS**: Update CORS settings in backend to allow your frontend domain
4. **Build Command** (Frontend): `npm run build`
5. **Start Command** (Backend): `npm start`
6. **Node Version**: Ensure deployment platform uses Node.js v16+

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication & User Management
- [ ] User registration and login
- [ ] JWT token authentication
- [ ] Role-based access control (Admin/Student)

#### Admin Features
- [ ] Admin dashboard statistics and analytics
- [ ] Question creation (MCQ, Coding, Development)
- [ ] Question editing and deletion
- [ ] Bulk upload from Excel/CSV
- [ ] AI question generation with Gemini
- [ ] Auto-fill and standardization
- [ ] User management (view, edit, delete)
- [ ] Reported questions review and resolution
- [ ] Global reports and pain-point analytics
- [ ] Settings panel configuration
- [ ] System logs viewing
- [ ] Documentation management

#### Student Features
- [ ] Diagnostic test generation and submission
- [ ] Custom test builder
- [ ] 7-day improvement plan generation
- [ ] Daily test scheduling
- [ ] Coding practice with Monaco editor
- [ ] Local code execution (JS, Python, Java, C++)
- [ ] Battle Arena matchmaking and real-time battles
- [ ] Test history and detailed review
- [ ] AI-powered explanations
- [ ] Question reporting
- [ ] Profile page with analytics and heatmaps
- [ ] Activity tracking and streaks
- [ ] Study documentation access

#### Technical Features
- [ ] Monaco Editor integration
- [ ] Socket.IO real-time communication
- [ ] Code execution in multiple languages
- [ ] Responsive design and mobile compatibility
- [ ] Toast notifications
- [ ] Error handling and validation

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
