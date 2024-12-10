// app/api/logs/view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  metadata?: any;
}

async function readLogFiles(directory: string): Promise<LogEntry[]> {
  try {
    const logPath = path.join(process.cwd(), directory);
    const files = await fs.readdir(logPath);
    const logFiles = files.filter(file => file.endsWith('.log'));

    const allLogs: LogEntry[] = [];

    for (const file of logFiles) {
      const filePath = path.join(logPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Parse setiap baris log
      const logs = content
        .split('\n')
        .filter(Boolean)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      allLogs.push(...logs);
    }

    // Sort berdasarkan timestamp, terbaru di atas
    return allLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  } catch (error) {
    console.error('Error reading log files:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    // Baca logs dari frontend dan backend
    const frontendLogs = await readLogFiles('logs/frontend');
    const backendLogs = await readLogFiles('logs/backend');

    // Gabungkan dan sort semua logs
    const allLogs = [...frontendLogs, ...backendLogs]
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

    return NextResponse.json({ logs: allLogs });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}