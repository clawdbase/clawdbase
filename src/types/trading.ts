import type { OrderSide } from './coinbase';

export type TradeSignal = 'BUY' | 'SELL' | 'HOLD';

export interface TradeDecision {
    signal: TradeSignal;
    pair: string;
    confidence: number;
    reason: string;
    suggestedSizeUsd?: number;
}

export interface MarketData {
    pair: string;
    price: number;
    bid: number;
    ask: number;
    volume24h: number;
    priceChange24hPercent: number;
    timestamp: Date;
}

export interface TradeExecution {
    orderId: string;
    pair: string;
    side: OrderSide;
    requestedSizeUsd: number;
    filledSize: number;
    averagePrice: number;
    totalCost: number;
    timestamp: Date;
}

export interface Strategy {
    readonly name: string;
    analyze(data: MarketData, context: StrategyContext): TradeDecision;
}

export interface StrategyContext {
    portfolio: {
        cashUsd: number;
        totalValueUsd: number;
    };
    lastTrade?: TradeExecution;
    currentPosition?: {
        size: number;
        averageEntryPrice: number;
    };
}
