import type { Config, LogLevel, StrategyType } from '../types';

function parsePairs(envValue: string | undefined, fallback: string[]): string[] {
    if (!envValue) return fallback;
    return envValue.split(',').map(p => p.trim().toUpperCase());
}

function parseStrategy(envValue: string | undefined): StrategyType {
    const valid: StrategyType[] = ['dca', 'momentum', 'meanreversion'];
    const value = (envValue || 'dca').toLowerCase() as StrategyType;
    return valid.includes(value) ? value : 'dca';
}

function parseFloat(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function parseInt(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

const logLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;
const isSandbox = process.env.COINBASE_SANDBOX !== 'false';

export const config: Config = {
    coinbase: {
        apiKey: process.env.COINBASE_API_KEY || '',
        apiSecret: process.env.COINBASE_API_SECRET || '',
        baseUrl: isSandbox
            ? 'https://api-public.sandbox.exchange.coinbase.com'
            : 'https://api.coinbase.com',
        timeout: 30000,
    },
    trading: {
        pairs: parsePairs(process.env.TRADING_PAIRS, ['BTC-USD', 'ETH-USD']),
        intervalMs: parseInt(process.env.TRADING_INTERVAL_MS, 60000),
        maxPositionPercent: parseFloat(process.env.MAX_POSITION_PERCENT, 0.1),
        minOrderUsd: 10,
        strategy: parseStrategy(process.env.STRATEGY),
        dca: {
            amountUsd: parseFloat(process.env.DCA_AMOUNT_USD, 10),
            intervalHours: parseFloat(process.env.DCA_INTERVAL_HOURS, 24),
        },
    },
    risk: {
        maxPositionPercent: parseFloat(process.env.MAX_POSITION_PERCENT, 0.1),
        stopLossPercent: parseFloat(process.env.STOP_LOSS_PERCENT, 0.05),
        maxDailyLossPercent: parseFloat(process.env.MAX_DAILY_LOSS_PERCENT, 0.1),
    },
    clawd: {
        enabled: process.env.CLAWD_ENABLED === 'true',
        apiKey: process.env.CLAWD_API_KEY || '',
        baseUrl: process.env.CLAWD_API_URL || 'https://api.clawd.ai',
        confidenceThreshold: parseFloat(process.env.CLAWD_CONFIDENCE_THRESHOLD, 0.75),
    },
    ui: {
        enabled: process.env.UI_ENABLED !== 'false',
        refreshMs: parseInt(process.env.UI_REFRESH_MS, 1000),
    },
    sandbox: isSandbox,
    logLevel,
};
