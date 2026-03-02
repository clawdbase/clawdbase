export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type StrategyType = 'dca' | 'momentum' | 'meanreversion';

export interface Config {
    coinbase: CoinbaseConfig;
    trading: TradingConfig;
    risk: RiskConfig;
    clawd: ClawdConfig;
    ui: UiConfig;
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
    strategy: StrategyType;
    dca: DcaConfig;
}

export interface DcaConfig {
    amountUsd: number;
    intervalHours: number;
}

export interface RiskConfig {
    maxPositionPercent: number;
    stopLossPercent: number;
    maxDailyLossPercent: number;
}

export interface ClawdConfig {
    enabled: boolean;
    apiKey: string;
    baseUrl: string;
    confidenceThreshold: number;
}

export interface UiConfig {
    enabled: boolean;
    refreshMs: number;
}
