// src/utils/backendLogger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const backendLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Error logs
    new DailyRotateFile({
      filename: path.join('logs/backend/error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // Combined logs
    new DailyRotateFile({
      filename: path.join('logs/backend/combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // Console output in development
    ...(process.env.NODE_ENV !== 'production' 
      ? [new winston.transports.Console()] 
      : [])
  ]
});

export default backendLogger;