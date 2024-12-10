// src/utils/clientLogger.ts
interface LogEntry {
  level: "info" | "warn" | "error";
  message: string;
  data?: any;
  timestamp?: string;
}

class ClientLogger {
  private queue: LogEntry[] = [];
  private readonly maxQueueSize: number = 10;
  private readonly apiEndpoint: string = "/api/logs";
  private isSending: boolean = false;

  private async sendLogs(): Promise<void> {
    if (this.isSending || this.queue.length === 0) return;

    this.isSending = true;
    const logsToSend = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(logsToSend)
      });

      if (!response.ok) {
        console.error("Failed to send logs:", response.statusText);
        // Restore logs to queue if send failed
        this.queue = [...logsToSend, ...this.queue];
      }
    } catch (error) {
      console.error("Error sending logs:", error);
      // Restore logs to queue if send failed
      this.queue = [...logsToSend, ...this.queue];
    } finally {
      this.isSending = false;
    }
  }

  private addToQueue(entry: LogEntry): void {
    this.queue.push({
      ...entry,
      timestamp: new Date().toISOString()
    });

    if (this.queue.length >= this.maxQueueSize) {
      this.sendLogs();
    }
  }

  public info(message: string, data?: any): void {
    this.addToQueue({ level: "info", message, data });
  }

  public warn(message: string, data?: any): void {
    this.addToQueue({ level: "warn", message, data });
    // Send immediately for warnings
    this.sendLogs();
  }

  public error(message: string, error?: Error | any): void {
    const errorData =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        : error;

    this.addToQueue({ level: "error", message, data: errorData });
    // Send immediately for errors
    this.sendLogs();
  }

  // Flush remaining logs (useful when page is about to unload)
  public flush(): void {
    this.sendLogs();
  }
}

export const clientLogger = new ClientLogger();
