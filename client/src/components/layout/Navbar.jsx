import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, BarChart3, Bot, Shield, LogOut, Menu, X, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';

export const Navbar = () => {
  const { user, profile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-teal-50 text-teal-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
      isActive
        ? 'bg-teal-50 text-teal-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Main nav */}
          <div className="flex items-center gap-8">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Smart<span className="text-teal-600">Learn</span>
              </span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-1">
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/subjects" className={navLinkClass}>
                  Subjects
                </NavLink>
                <NavLink to="/progress" className={navLinkClass}>
                  <BarChart3 className="w-4 h-4" />
                  Progress
                </NavLink>
                <NavLink to="/tutor" className={navLinkClass}>
                  <Bot className="w-4 h-4" />
                  AI Tutor
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-700 font-semibold">Admin</span>
                  </NavLink>
                )}
              </div>
            )}
          </div>

          {/* Right side user menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-right">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800 leading-tight">
                      {profile?.name || user.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-slate-500 capitalize flex items-center gap-1 justify-end">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-amber-500' : 'bg-teal-500'}`}></span>
                      {profile?.role || 'student'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {user ? (
            <>
              <div className="pb-3 border-b border-slate-100 mb-2 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{profile?.name || user.email}</p>
                  <p className="text-xs text-slate-500 capitalize">{profile?.role || 'student'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>

              <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/subjects" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                Subjects
              </NavLink>
              <NavLink to="/progress" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <BarChart3 className="w-5 h-5" />
                Progress
              </NavLink>
              <NavLink to="/tutor" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <Bot className="w-5 h-5" />
                AI Tutor
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                  <Shield className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-700 font-semibold">Admin Panel</span>
                </NavLink>
              )}
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-slate-700 font-medium rounded-lg border border-slate-200"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 bg-teal-600 text-white font-medium rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
