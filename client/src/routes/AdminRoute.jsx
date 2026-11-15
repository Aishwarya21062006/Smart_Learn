import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import Loader from '../components/common/Loader.jsx';

/**
 * Route wrapper that ensures the authenticated user is an administrator.
 * Redirects non-admins to the dashboard.
 */
export const AdminRoute = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying permissions..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
