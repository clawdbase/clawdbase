// Core type definitions for clawdbase

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Config {
    coinbase: CoinbaseConfig;
    trading: TradingConfig;
    sandbox: boolean;
    logLevel: LogLevel;
}

export interface CoinbaseConfig {
    apiKey: string;
    apiSecret: string;
    baseUrl: string;
}

export interface TradingConfig {
    pairs: string[];
    intervalMs: number;
    maxPositionPercent: number;
}

// Will be expanded as we build out the API client
export interface Account {
    id: string;
    currency: string;
    balance: string;
    available: string;
}

export interface Ticker {
    productId: string;
    price: string;
    volume24h: string;
    timestamp: string;
}
