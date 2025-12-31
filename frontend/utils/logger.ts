/* eslint-disable no-console */

const isProd = process.env.NODE_ENV === 'production';

const logger = {
  debug: (...args: unknown[]) => { if (!isProd) console.debug(...args); },
  log: (...args: unknown[]) => { if (!isProd) console.log(...args); },
  info: (...args: unknown[]) => { if (!isProd) console.info(...args); },
  warn: (...args: unknown[]) => { if (!isProd) console.warn(...args); },
  error: (...args: unknown[]) => { console.error(...args); }
};

export default logger;
