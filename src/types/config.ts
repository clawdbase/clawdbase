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
    timeout: number;
}

export interface TradingConfig {
    pairs: string[];
    intervalMs: number;
    maxPositionPercent: number;
    minOrderUsd: number;
}
