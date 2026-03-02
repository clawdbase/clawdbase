import type { LogLevel } from '../types';

const LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const COLORS = {
    debug: '\x1b[36m',
    info: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m',
    dim: '\x1b[2m',
};

class Logger {
    private level: number;

    constructor() {
        const envLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;
        this.level = LEVELS[envLevel] ?? LEVELS.info;
    }

    private formatTime(): string {
        return new Date().toISOString().slice(11, 19);
    }

    private log(level: LogLevel, ...args: unknown[]): void {
        if (LEVELS[level] >= this.level) {
            const color = COLORS[level];
            const time = `${COLORS.dim}${this.formatTime()}${COLORS.reset}`;
            const tag = `${color}${level.toUpperCase().padEnd(5)}${COLORS.reset}`;
            console.log(`[${time}] [${tag}]`, ...args);
        }
    }

    debug(...args: unknown[]): void {
        this.log('debug', ...args);
    }

    info(...args: unknown[]): void {
        this.log('info', ...args);
    }

    warn(...args: unknown[]): void {
        this.log('warn', ...args);
    }

    error(...args: unknown[]): void {
        this.log('error', ...args);
    }

    setLevel(level: LogLevel): void {
        this.level = LEVELS[level] ?? LEVELS.info;
    }
}

export const logger = new Logger();
