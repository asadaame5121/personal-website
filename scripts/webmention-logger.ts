/**
 * Webmention送信自動化のログ機能 - シンプルなファイルベース版
 */

export class WebmentionLogger {
  private logFile: string;

  constructor(logFile: string = 'logs/webmention.log') {
    this.logFile = logFile;
  }

  private async ensureLogDirectory() {
    const logDir = this.logFile.split('/').slice(0, -1).join('/');
    if (logDir) {
      try {
        await Deno.mkdir(logDir, { recursive: true });
      } catch (error) {
        if (!(error instanceof Deno.errors.AlreadyExists)) {
          throw error;
        }
      }
    }
  }

  private async writeLog(level: string, message: string, ...args: any[]) {
    await this.ensureLogDirectory();
    const timestamp = new Date().toISOString();
    const argsStr = args.length > 0 ? ` | ${JSON.stringify(args)}` : '';
    const logEntry = `[${timestamp}] ${level}: ${message}${argsStr}\n`;
    
    try {
      await Deno.writeTextFile(this.logFile, logEntry, { append: true });
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  async info(message: string, ...args: any[]) {
    await this.writeLog('INFO', message, ...args);
    console.log(`ℹ️ ${message}`, ...args);
  }

  async warn(message: string, ...args: any[]) {
    await this.writeLog('WARN', message, ...args);
    console.warn(`⚠️ ${message}`, ...args);
  }

  async error(message: string, ...args: any[]) {
    await this.writeLog('ERROR', message, ...args);
    console.error(`❌ ${message}`, ...args);
  }

  async debug(message: string, ...args: any[]) {
    await this.writeLog('DEBUG', message, ...args);
    console.log(`🔍 ${message}`, ...args);
  }

  async success(message: string, ...args: any[]) {
    await this.writeLog('INFO', `SUCCESS: ${message}`, ...args);
    console.log(`✅ ${message}`, ...args);
  }

  async failure(message: string, ...args: any[]) {
    await this.writeLog('ERROR', `FAILURE: ${message}`, ...args);
    console.error(`❌ ${message}`, ...args);
  }

  // ログファイルの内容を読み取る
  async readLogs(): Promise<string> {
    try {
      return await Deno.readTextFile("logs/webmention.log");
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return '';
      }
      throw error;
    }
  }

  // ログファイルをクリア
  async clearLogs() {
    try {
      await Deno.writeTextFile("logs/webmention.log", '');
    } catch (error) {
      this.error('Failed to clear logs:', error);
    }
  }
}

// デフォルトのロガーインスタンス
export const logger = new WebmentionLogger();
