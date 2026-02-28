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
        intervalMs: parseInt(process.env.TRADING_INTERVAL_MS || '60000', 10),
        maxPositionPercent: parseFloat(process.env.MAX_POSITION_PERCENT || '0.1'),
        minOrderUsd: 10,
        strategy: parseStrategy(process.env.STRATEGY),
        dca: {
            amountUsd: parseFloat(process.env.DCA_AMOUNT_USD || '10'),
            intervalHours: parseFloat(process.env.DCA_INTERVAL_HOURS || '24'),
        },
    },
    risk: {
        maxPositionPercent: parseFloat(process.env.MAX_POSITION_PERCENT || '0.1'),
        stopLossPercent: parseFloat(process.env.STOP_LOSS_PERCENT || '0.05'),
        maxDailyLossPercent: 0.1,
    },
    sandbox: isSandbox,
    logLevel,
};
