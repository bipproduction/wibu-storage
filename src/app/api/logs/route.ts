// app/api/logs/route.ts
import frontendLogger from '@/util/frontend-logger';
import { NextRequest, NextResponse } from 'next/server';
import winston from 'winston';

interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  timestamp?: string;
}

function logMessage(logger: winston.Logger, entry: LogEntry, metadata: any) {
  switch (entry.level) {
    case 'info':
      logger.info(entry.message, { ...entry.data, ...metadata });
      break;
    case 'warn':
      logger.warn(entry.message, { ...entry.data, ...metadata });
      break;
    case 'error':
      logger.error(entry.message, { ...entry.data, ...metadata });
      break;
    default:
      logger.info(entry.message, { ...entry.data, ...metadata });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const logs: LogEntry[] = Array.isArray(body) ? body : [body];

    logs.forEach((log: LogEntry) => {
      const metadata = {
        timestamp: log.timestamp,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 
            request.ip || 
            request.headers.get('x-real-ip'),
        url: request.headers.get('referer'),
      };

      logMessage(frontendLogger, log, metadata);
    });

    return NextResponse.json(
      { message: 'Logs received' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing logs:', error);
    return NextResponse.json(
      { message: 'Error processing logs' },
      { status: 500 }
    );
  }
}