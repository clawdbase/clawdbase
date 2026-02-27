import type { Config, LogLevel } from '../types';

function parsePairs(envValue: string | undefined, fallback: string[]): string[] {
    if (!envValue) return fallback;
    return envValue.split(',').map(p => p.trim().toUpperCase());
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
        pairs: parsePairs(process.env.TRADING_PAIRS, ['BTC-USD', 'ETH-USD', 'SOL-USD']),
        intervalMs: parseInt(process.env.TRADING_INTERVAL_MS || '60000', 10),
        maxPositionPercent: 0.1,
        minOrderUsd: 10,
    },
    sandbox: isSandbox,
    logLevel,
};
