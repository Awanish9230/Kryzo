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

// Student Components
import StudentDashboard from './pages/student/Dashboard';
import TestAttempt from './pages/student/TestAttempt';
import CustomTestBuilder from './pages/student/CustomTestBuilder';
import Profile from './pages/student/Profile';

import Landing from './pages/Landing';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Student Routes */}
          <Route element={<PrivateRoute role="student" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/test/diagnostic" element={<TestAttempt />} />
            <Route path="/student/test/custom" element={<CustomTestBuilder />} />
            <Route path="/student/test/:testId" element={<TestAttempt />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<PrivateRoute role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<Profile />} />
            <Route path="/admin/questions" element={<QuestionList />} />
            <Route path="/admin/questions/add" element={<AddQuestion />} />
            <Route path="/admin/questions/edit/:id" element={<EditQuestion />} />
            <Route path="/admin/users" element={<UserManagement />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
