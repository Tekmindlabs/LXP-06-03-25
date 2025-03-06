/**
 * Logger Utility
 * Provides standardized logging for the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  message: string;
  level: LogLevel;
  timestamp: string;
  [key: string]: unknown;
}

/**
 * Simple logger implementation
 * In production, this would be replaced with a more robust solution
 * like Winston, Pino, or a cloud logging service
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  /**
   * Log a debug message
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }

  /**
   * Log an info message
   */
  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  /**
   * Log a warning message
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  /**
   * Log an error message
   */
  error(message: string, meta?: Record<string, unknown>): void {
    this.log('error', message, meta);
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    
    const payload: LogPayload = {
      message,
      level,
      timestamp,
      ...meta,
    };

    // In development, log to console
    if (this.isDevelopment) {
      const consoleMethod = this.getConsoleMethod(level);
      consoleMethod(`[${level.toUpperCase()}] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
      return;
    }

    // In production, this would send logs to a proper logging service
    // For now, we'll just use console.log for all levels in production
    console.log(JSON.stringify(payload));
  }

  /**
   * Get the appropriate console method for the log level
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
        return console.error;
      default:
        return console.log;
    }
  }
}

// Export a singleton instance
export const logger = new Logger(); 