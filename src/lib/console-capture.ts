interface LogEntry {
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: string;
}

class ConsoleCapture {
  private logs: LogEntry[] = [];
  private maxLogs = 50; // Keep last 50 logs
  
  constructor() {
    this.interceptConsole();
  }
  
  private interceptConsole() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;
    
    console.log = (...args: any[]) => {
      this.addLog('log', args);
      originalLog.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      this.addLog('warn', args);
      originalWarn.apply(console, args);
    };
    
    console.error = (...args: any[]) => {
      this.addLog('error', args);
      originalError.apply(console, args);
    };
    
    console.info = (...args: any[]) => {
      this.addLog('info', args);
      originalInfo.apply(console, args);
    };
  }
  
  private addLog(level: LogEntry['level'], args: any[]) {
    const message = args.map(arg => {
      try {
        return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');
    
    this.logs.push({
      level,
      message: message.slice(0, 500), // Truncate long messages
      timestamp: new Date().toISOString(),
    });
    
    // Keep only last 50 logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }
  
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  getAuthLogs(): LogEntry[] {
    // Filter logs related to authentication
    return this.logs.filter(log => {
      const lowerMsg = log.message.toLowerCase();
      return (
        lowerMsg.includes('auth') ||
        lowerMsg.includes('login') ||
        lowerMsg.includes('sign') ||
        lowerMsg.includes('password') ||
        lowerMsg.includes('email') ||
        lowerMsg.includes('otp') ||
        lowerMsg.includes('magic') ||
        lowerMsg.includes('supabase') ||
        lowerMsg.includes('session') ||
        lowerMsg.includes('token')
      );
    });
  }
  
  clear() {
    this.logs = [];
  }
}

// Singleton instance
export const consoleCapture = new ConsoleCapture();
