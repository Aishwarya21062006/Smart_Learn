import supabase from '../lib/supabaseClient.js';
import api from './api.js';

export const authService = {
  /**
   * Registers a new user with Supabase Auth.
   * Passes the student's name in user_metadata so the Postgres trigger populates profiles.
   */
  async signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || 'Student'
        }
      }
    });
    if (error) throw error;
    return data;
  },

  /**
   * Signs in an existing user with email and password.
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  /**
   * Signs out the currently authenticated user.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Gets the current session from Supabase.
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Fetches the user profile and role from the backend /api/me endpoint.
   */
  async getMyProfile() {
    const response = await api.get('/me');
    return response.data;
  }
};

export default authService;
