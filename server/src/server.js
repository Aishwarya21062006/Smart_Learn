import app from './app.js';
import config from './config/env.js';
import logger from './utils/logger.js';

const server = app.listen(config.port, () => {
  logger.info(`SmartLearn API Server listening on port ${config.port}`);
  logger.info(`Configured CORS client URL: ${config.clientUrl}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

export default server;
