import type { Config, LogLevel } from '../types';

const logLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;

export const config: Config = {
    coinbase: {
        apiKey: process.env.COINBASE_API_KEY || '',
        apiSecret: process.env.COINBASE_API_SECRET || '',
        baseUrl: process.env.COINBASE_SANDBOX === 'true'
            ? 'https://api-public.sandbox.exchange.coinbase.com'
            : 'https://api.coinbase.com',
    },
    trading: {
        pairs: ['BTC-USD', 'ETH-USD'],
        intervalMs: 60000,
        maxPositionPercent: 0.1,
    },
    sandbox: process.env.COINBASE_SANDBOX === 'true',
    logLevel,
};
