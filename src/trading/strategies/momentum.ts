import type { Strategy, MarketData, TradeDecision, StrategyContext, Config } from '../../types';

export class MomentumStrategy implements Strategy {
    readonly name = 'Momentum';
    private readonly maxPositionPercent: number;

    constructor(config: Config) {
        this.maxPositionPercent = config.risk.maxPositionPercent;
    }

    analyze(data: MarketData, context: StrategyContext): TradeDecision {
        const change = data.priceChange24hPercent;

        // Strong upward momentum - buy
        if (change > 5) {
            const sizeUsd = context.portfolio.cashUsd * this.maxPositionPercent;
            return {
                signal: 'BUY',
                pair: data.pair,
                confidence: Math.min(change / 10, 1),
                reason: `Strong momentum: +${change.toFixed(2)}% in 24h`,
                suggestedSizeUsd: sizeUsd,
            };
        }

        // Strong downward momentum - sell if we have position
        if (change < -5) {
            return {
                signal: 'SELL',
                pair: data.pair,
                confidence: Math.min(Math.abs(change) / 10, 1),
                reason: `Negative momentum: ${change.toFixed(2)}% in 24h`,
            };
        }

        return {
            signal: 'HOLD',
            pair: data.pair,
            confidence: 0.5,
            reason: 'No significant momentum',
        };
    }
}
