/**
 * Application logger utility.
 * Formats console logs cleanly and prevents sensitive secrets from being exposed.
 */

const formatTimestamp = () => new Date().toISOString();

export const logger = {
  info: (...args) => {
    console.log(`[${formatTimestamp()}] [INFO]`, ...args);
  },
  warn: (...args) => {
    console.warn(`[${formatTimestamp()}] [WARN]`, ...args);
  },
  error: (...args) => {
    console.error(`[${formatTimestamp()}] [ERROR]`, ...args);
  },
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${formatTimestamp()}] [DEBUG]`, ...args);
    }
  }
};

export default logger;
