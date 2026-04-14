import pino from 'pino';

// Create logger instance - avoid pino-pretty transport with Turbopack
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

// Request logger helper
export function createRequestLogger(requestId: string) {
  return logger.child({ requestId });
}

// API middleware logger
export function logRequest(method: string, path: string, statusCode?: number, duration?: number) {
  logger.info({
    method,
    path,
    statusCode,
    duration,
    timestamp: new Date().toISOString(),
  }, 'API Request');
}

// Error logger
export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error({
    err: {
      message: error.message,
      stack: error.stack,
    },
    context,
    timestamp: new Date().toISOString(),
  }, 'Error occurred');
}

// Database query logger
export function logQuery(query: string, duration: number) {
  logger.debug({
    query,
    duration,
    timestamp: new Date().toISOString(),
  }, 'Database query');
}