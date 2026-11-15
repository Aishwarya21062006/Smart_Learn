import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(email, password, name.trim());
      // Supabase may require email confirmation or sign the user straight in
      if (res?.session) {
        navigate('/dashboard');
      } else {
        setSuccessMessage('Registration successful! If confirmation is required, please check your email, or proceed to log in.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Join SmartLearn and unlock personalized AI study plans
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg">
          {errorMessage && (
            <div className="mb-6">
              <ErrorMessage title="Registration error" message={errorMessage} />
            </div>
          )}

          {successMessage ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-700">{successMessage}</p>
              <Button
                variant="primary"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">
                  Full Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Student"
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={loading}
                  className="w-full"
                >
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Register
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-500">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
