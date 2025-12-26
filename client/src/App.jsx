import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Components
import AdminDashboard from './pages/admin/Dashboard';
import QuestionList from './pages/admin/QuestionList';
import AddQuestion from './pages/admin/AddQuestion';
import EditQuestion from './pages/admin/EditQuestion';
import UserManagement from './pages/admin/UserManagement';
import ReportedQuestions from './pages/admin/ReportedQuestions';

import AdminDocumentation from './pages/admin/AdminDocumentation';
import AdminProfile from './pages/admin/Profile';
import BulkUpload from './pages/admin/BulkUpload';
import AdminReports from './pages/admin/Reports';

// Student Components
import StudentDashboard from './pages/student/Dashboard';
import TestAttempt from './pages/student/TestAttempt';
import TestResult from './pages/student/TestResult';
import CustomTestBuilder from './pages/student/CustomTestBuilder';
import Profile from './pages/student/Profile';
import StudyDocumentation from './pages/student/StudyDocumentation';
import DailyTest from './pages/student/DailyTest';
import TestReviewList from './pages/student/TestReviewList';
import TestReviewDetail from './pages/student/TestReviewDetail';

import Landing from './pages/Landing';

import About from './pages/general/About';
import Contact from './pages/general/Contact';
import Careers from './pages/general/Careers';
import Blog from './pages/general/Blog';
import Features from './pages/general/Features';
import Pricing from './pages/general/Pricing';
import PrivacyPolicy from './pages/general/PrivacyPolicy';
import TermsOfService from './pages/general/TermsOfService';
import { Integrations, Changelog, HelpCenter, Documentation } from './pages/general/MiscPages';
import NotFound from './pages/NotFound';
import SessionTracker from './components/SessionTracker';

import ErrorBoundary from './components/ErrorBoundary';

import { useLocation } from 'react-router-dom';
import Footer from './components/Footer';

// Layout component to handle Navbar and Footer visibility
const Layout = () => {
  const location = useLocation();

  // Routes where footer should be hidden if needed (e.g. maybe login/register?)
  // For now, user wants it on dashboard, study, profile which was missing.
  // We'll show it everywhere by default, or implement specific logic.
  // Assuming we show it everywhere now since Landing had it and others requested it.
  const showFooter = true;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <SessionTracker />
      <div className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/docs" element={<Documentation />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/dashboard" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/profile" element={<PrivateRoute role="student"><Profile /></PrivateRoute>} />
          <Route path="/student/test/diagnostic" element={<PrivateRoute role="student"><TestAttempt /></PrivateRoute>} />
          <Route path="/student/test/custom" element={<PrivateRoute role="student"><CustomTestBuilder /></PrivateRoute>} />
          <Route path="/student/test/daily/:dayNumber" element={<PrivateRoute role="student"><DailyTest /></PrivateRoute>} />
          <Route path="/student/test/:testId" element={<PrivateRoute role="student"><TestAttempt /></PrivateRoute>} />
          <Route path="/student/test/result" element={<PrivateRoute role="student"><TestResult /></PrivateRoute>} />
          <Route path="/student/reviews" element={<PrivateRoute role="student"><TestReviewList /></PrivateRoute>} />
          <Route path="/student/review/:attemptId" element={<PrivateRoute role="student"><TestReviewDetail /></PrivateRoute>} />
          <Route path="/student/study/:id" element={<PrivateRoute role="student"><StudyDocumentation /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/profile" element={<PrivateRoute role="admin"><AdminProfile /></PrivateRoute>} />
          <Route path="/admin/questions" element={<PrivateRoute role="admin"><QuestionList /></PrivateRoute>} />
          <Route path="/admin/questions/add" element={<PrivateRoute role="admin"><AddQuestion /></PrivateRoute>} />
          <Route path="/admin/questions/edit/:id" element={<PrivateRoute role="admin"><EditQuestion /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute role="admin"><UserManagement /></PrivateRoute>} />
          <Route path="/admin/documentation" element={<PrivateRoute role="admin"><AdminDocumentation /></PrivateRoute>} />
          <Route path="/admin/questions/bulk" element={<PrivateRoute role="admin"><BulkUpload /></PrivateRoute>} />
          <Route path="/admin/reports" element={<PrivateRoute role="admin"><AdminReports /></PrivateRoute>} />
          <Route path="/admin/questions/reports" element={<PrivateRoute role="admin"><ReportedQuestions /></PrivateRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {showFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
          <Layout />
        </Router>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
