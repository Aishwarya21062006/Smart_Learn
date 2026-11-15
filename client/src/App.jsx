import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AdminRoute from './routes/AdminRoute.jsx';

// Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Subjects from './pages/Subjects.jsx';
import SubjectDetail from './pages/SubjectDetail.jsx';
import TopicPage from './pages/TopicPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import ExplainerPage from './pages/ExplainerPage.jsx';
import TutorPage from './pages/TutorPage.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageSubjects from './pages/admin/ManageSubjects.jsx';
import ManageTopics from './pages/admin/ManageTopics.jsx';
import ManageQuestions from './pages/admin/ManageQuestions.jsx';

export const App = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes inside Layout */}
      <Route element={<Layout />}>
        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:id" element={<SubjectDetail />} />
          <Route path="/topics/:id" element={<TopicPage />} />
          <Route path="/topics/:id/quiz" element={<QuizPage />} />
          <Route path="/progress" element={<ProgressPage />} />

          {/* Placeholders for subsequent phases */}
          <Route path="/explainer/:topicId" element={<ExplainerPage />} />
          <Route path="/tutor" element={<TutorPage />} />

          {/* Admin Protected Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/subjects" element={<ManageSubjects />} />
            <Route path="/admin/topics" element={<ManageTopics />} />
            <Route path="/admin/questions" element={<ManageQuestions />} />
          </Route>
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
