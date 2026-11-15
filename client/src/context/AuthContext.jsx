import { createContext, useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabaseClient.js';
import authService from '../services/authService.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile from /api/me backend endpoint
  const loadProfile = useCallback(async (sessionUser) => {
    try {
      if (!sessionUser) {
        setProfile(null);
        return null;
      }
      const data = await authService.getMyProfile();
      setProfile(data);
      return data;
    } catch (err) {
      console.warn('Could not load profile from backend /api/me:', err.message);
      // Fallback to basic session metadata if backend is starting or offline
      const fallbackProfile = {
        id: sessionUser.id,
        name: sessionUser.user_metadata?.name || 'Student',
        role: sessionUser.user_metadata?.role || 'student',
        email: sessionUser.email
      };
      setProfile(fallbackProfile);
      return fallbackProfile;
    }
  }, []);

  // Initialize session on mount and listen to auth state changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser(session.user);
          await loadProfile(session.user);
        } else if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error checking active session:', err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for sign-in, sign-out, token refreshed events
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [loadProfile]);

  // Sign up action
  const register = async (email, password, name) => {
    setError(null);
    try {
      const data = await authService.signUp(email, password, name);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in action
  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authService.signIn(email, password);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out action
  const logout = async () => {
    setError(null);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      return await loadProfile(user);
    }
  };

  const value = {
    user,
    profile,
    role: profile?.role || 'student',
    isAdmin: profile?.role === 'admin',
    loading,
    error,
    login,
    register,
    logout,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
