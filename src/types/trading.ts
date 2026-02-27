// Trading engine types

export type TradeSignal = 'BUY' | 'SELL' | 'HOLD';

export interface TradeDecision {
    signal: TradeSignal;
    pair: string;
    confidence: number;
    reason: string;
    suggestedSize?: number;
}

export interface Position {
    pair: string;
    side: 'LONG' | 'SHORT';
    entryPrice: number;
    currentPrice: number;
    size: number;
    unrealizedPnl: number;
    unrealizedPnlPercent: number;
}

export interface Portfolio {
    totalValueUsd: number;
    positions: Position[];
    availableCash: number;
}

// Strategy types - to be expanded
export interface Strategy {
    name: string;
    analyze(data: MarketData): TradeDecision;
}

export interface MarketData {
    pair: string;
    price: number;
    volume24h: number;
    priceChange24h: number;
    timestamp: Date;
}
