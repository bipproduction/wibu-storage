// utils/frontend-logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log levels and their priorities
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define interface for log entries
export interface LogEntry {
  level: keyof typeof levels;
  message: string;
  data?: any;
  timestamp?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
}

// Custom format for log entries
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.json()
);

// Create the logger instance
const frontendLogger: winston.Logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Daily Rotate File for errors
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'logs/frontend/error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
      format: logFormat,
    }),

    // Daily Rotate File for all logs
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'logs/frontend/combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    }),
  ],
  // Handle errors from the logger itself
  exitOnError: false,
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  frontendLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Helper functions for type-safe logging
export function logError(message: string, data?: any) {
  frontendLogger.error(message, { data });
}

export function logWarn(message: string, data?: any) {
  frontendLogger.warn(message, { data });
}

export function logInfo(message: string, data?: any) {
  frontendLogger.info(message, { data });
}

export function logDebug(message: string, data?: any) {
  frontendLogger.debug(message, { data });
}

// Helper function for dynamic logging
export function log(entry: LogEntry) {
  const { level, message, ...metadata } = entry;
  frontendLogger[level](message, metadata);
}

// Export the logger instance as default
export default frontendLogger;