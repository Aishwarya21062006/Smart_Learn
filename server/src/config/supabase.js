import { createClient } from '@supabase/supabase-js';
import config from './env.js';
import logger from '../utils/logger.js';

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  logger.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Database operations will fail until set in server/.env');
}

/**
 * Supabase client initialized with the SERVICE_ROLE_KEY.
 * This client bypasses Row Level Security (RLS) on the server.
 */
export const supabase = createClient(
  config.supabase.url || 'https://placeholder.supabase.co',
  config.supabase.serviceRoleKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

export default supabase;
