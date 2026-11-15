import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory reliably regardless of process.cwd()
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Also load root .env if it exists as a fallback
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    embedModel: process.env.GEMINI_EMBED_MODEL || 'text-embedding-004'
  },
  tutorDailyLimit: parseInt(process.env.TUTOR_DAILY_LIMIT || '20', 10),
  useLlmForReason: process.env.USE_LLM_FOR_REASON === 'true'
};

export default config;
