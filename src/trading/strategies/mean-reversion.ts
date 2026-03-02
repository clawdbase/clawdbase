import type { Strategy, MarketData, TradeDecision, StrategyContext, Config } from '../../types';

export class MeanReversionStrategy implements Strategy {
    readonly name = 'Mean Reversion';
    private readonly maxPositionPercent: number;
    private readonly buyThreshold = -3;
    private readonly sellThreshold = 3;

    constructor(config: Config) {
        this.maxPositionPercent = config.risk.maxPositionPercent;
    }

    analyze(data: MarketData, context: StrategyContext): TradeDecision {
        const change = data.priceChange24hPercent;

        if (change < this.buyThreshold) {
            const sizeUsd = context.portfolio.cashUsd * this.maxPositionPercent;
            const confidence = Math.min(Math.abs(change) / 10, 0.9);

            return {
                signal: 'BUY',
                pair: data.pair,
                confidence,
                reason: `Oversold: ${change.toFixed(2)}%`,
                suggestedSizeUsd: sizeUsd,
                source: 'strategy',
            };
        }

        if (change > this.sellThreshold) {
            const confidence = Math.min(change / 10, 0.9);

            return {
                signal: 'SELL',
                pair: data.pair,
                confidence,
                reason: `Overbought: +${change.toFixed(2)}%`,
                source: 'strategy',
            };
        }

        return {
            signal: 'HOLD',
            pair: data.pair,
            confidence: 0.7,
            reason: 'Within normal range',
            source: 'strategy',
        };
    }
}
