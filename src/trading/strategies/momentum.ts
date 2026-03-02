import type { Strategy, MarketData, TradeDecision, StrategyContext, Config } from '../../types';

export class MomentumStrategy implements Strategy {
    readonly name = 'Momentum';
    private readonly maxPositionPercent: number;
    private readonly buyThreshold = 5;  // Buy when up 5%+
    private readonly sellThreshold = -5; // Sell when down 5%+

    constructor(config: Config) {
        this.maxPositionPercent = config.risk.maxPositionPercent;
    }

    analyze(data: MarketData, context: StrategyContext): TradeDecision {
        const change = data.priceChange24hPercent;

        if (change > this.buyThreshold) {
            const sizeUsd = context.portfolio.cashUsd * this.maxPositionPercent;
            const confidence = Math.min(change / 10, 0.95);

            return {
                signal: 'BUY',
                pair: data.pair,
                confidence,
                reason: `Strong momentum: +${change.toFixed(2)}%`,
                suggestedSizeUsd: sizeUsd,
                source: 'strategy',
            };
        }

        if (change < this.sellThreshold) {
            const confidence = Math.min(Math.abs(change) / 10, 0.95);

            return {
                signal: 'SELL',
                pair: data.pair,
                confidence,
                reason: `Negative momentum: ${change.toFixed(2)}%`,
                source: 'strategy',
            };
        }

        return {
            signal: 'HOLD',
            pair: data.pair,
            confidence: 0.5,
            reason: `Sideways: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
            source: 'strategy',
        };
    }
}
