import { GoogleGenAI } from '@google/genai';
import config from './env.js';
import logger from '../utils/logger.js';

let aiInstance = null;

if (!config.gemini.apiKey) {
  logger.warn('GEMINI_API_KEY is not configured in server/.env. AI features will fallback to deterministic templates.');
} else {
  try {
    aiInstance = new GoogleGenAI({ apiKey: config.gemini.apiKey });
  } catch (err) {
    logger.error('Failed to initialize Google GenAI SDK:', err.message);
  }
}

export const getGeminiClient = () => {
  if (!aiInstance && config.gemini.apiKey) {
    aiInstance = new GoogleGenAI({ apiKey: config.gemini.apiKey });
  }
  return aiInstance;
};

export default getGeminiClient;
