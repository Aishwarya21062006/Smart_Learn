import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import Loader from '../components/common/Loader.jsx';

/**
 * Route wrapper that ensures the user is authenticated.
 * If authentication is loading, shows a centered Loader.
 * If not authenticated, redirects to /login while preserving destination path in state.
 */
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader message="Verifying session..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
