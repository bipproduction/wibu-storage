// app/admin/logs/page.tsx
"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import styles from "./logs.module.css";


interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  metadata?: any;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "error" | "info" | "warn">(
    "all"
  );

  useEffect(() => {
    fetchLogs();
   
  }, []);

  async function fetchLogs() {
    try {
      const response = await fetch("/api/logs/view");
      if (!response.ok) throw new Error("Failed to fetch logs");

      const data = await response.json();
      setLogs(data.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching logs");
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter((log) =>
    filter === "all" ? true : log.level === filter
  );

  if (loading) return <div className={styles.loading}>Loading logs...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>System Logs</h1>
      

      <div className={styles.filterContainer}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className={styles.select}
        >
          <option value="all">All Logs</option>
          <option value="error">Errors</option>
          <option value="warn">Warnings</option>
          <option value="info">Info</option>
        </select>
      </div>

      <div className={styles.logsContainer}>
        {filteredLogs.map((log, index) => (
          <div
            key={index}
            className={`${styles.logItem} ${
              log.level === "error"
                ? styles.errorLog
                : log.level === "warn"
                ? styles.warnLog
                : styles.infoLog
            }`}
          >
            <div className={styles.logHeader}>
              <span className={styles.timestamp}>
                {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
              </span>
              <span
                className={`${styles.level} ${
                  log.level === "error"
                    ? styles.errorLevel
                    : log.level === "warn"
                    ? styles.warnLevel
                    : styles.infoLevel
                }`}
              >
                {log.level.toUpperCase()}
              </span>
            </div>

            <div className={styles.message}>{log.message}</div>

            {log.metadata && (
              <pre className={styles.metadata}>
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
