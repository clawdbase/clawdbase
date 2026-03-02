import type { TradeSignal } from './trading';

export interface ClawdAnalysis {
    pair: string;
    signal: TradeSignal;
    confidence: number;
    reasoning: string;
    factors: ClawdFactor[];
    timestamp: Date;
}

export interface ClawdFactor {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    description: string;
}

export interface ClawdRequest {
    pairs: string[];
    marketData: ClawdMarketInput[];
    portfolioContext?: {
        totalValueUsd: number;
        cashUsd: number;
        positions: ClawdPosition[];
    };
}

export interface ClawdMarketInput {
    pair: string;
    price: number;
    volume24h: number;
    priceChange24h: number;
    priceChange7d?: number;
}

export interface ClawdPosition {
    pair: string;
    size: number;
    entryPrice: number;
    currentPrice: number;
}

export interface ClawdResponse {
    analyses: ClawdAnalysis[];
    modelVersion: string;
    processingTimeMs: number;
}
