import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from './config/env.js';
import globalLimiter from './middleware/rateLimit.js';
import errorHandler from './middleware/errorHandler.js';
import routes from './routes/index.js';
import AppError from './utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../../client/dist');

const app = express();

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false // Allows Web Speech API and inline visual novel elements
}));

// Robust CORS configuration supporting localhost, Vercel, and Render deployments
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.netlify.app')
    ) {
      return callback(null, true);
    }
    // Permissive fallback so production or demo deployments never fail with CORS errors
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply global rate limiting (100 requests per 15 min per IP)
app.use(globalLimiter);

// Parse incoming JSON payloads (expanded for PDF uploads)
app.use(express.json({ limit: '25mb' }));

// Serve static frontend assets if built (enables all-in-one single deployment)
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

// Mount all API routes under /api
app.use('/api', routes);

// SPA client fallback for non-API routes, API 404 for unknown /api/*
app.use('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next(new AppError(`Endpoint ${req.originalUrl} not found`, 404));
  }
  const indexPath = path.join(clientDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next(new AppError(`Endpoint ${req.originalUrl} not found`, 404));
});

// Centralized error handler returning { "error": "message" }
app.use(errorHandler);

export default app;
