import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, BookOpen } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-md mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to access your personalized learning path
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg">
          {errorMessage && (
            <div className="mb-6">
              <ErrorMessage title="Sign-in failed" message={errorMessage} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                Email address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              Sign in
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-500">
                Create one now
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
