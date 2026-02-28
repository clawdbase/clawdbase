import type { Strategy, MarketData, TradeDecision, StrategyContext, Config } from '../../types';

export class MeanReversionStrategy implements Strategy {
    readonly name = 'Mean Reversion';
    private readonly maxPositionPercent: number;
    private readonly buyThreshold = -3; // Buy when down 3%+
    private readonly sellThreshold = 3;  // Sell when up 3%+

    constructor(config: Config) {
        this.maxPositionPercent = config.risk.maxPositionPercent;
    }

    analyze(data: MarketData, context: StrategyContext): TradeDecision {
        const change = data.priceChange24hPercent;

        // Price dropped - buying opportunity (mean reversion up expected)
        if (change < this.buyThreshold) {
            const sizeUsd = context.portfolio.cashUsd * this.maxPositionPercent;
            const confidence = Math.min(Math.abs(change) / 10, 0.9);

            return {
                signal: 'BUY',
                pair: data.pair,
                confidence,
                reason: `Oversold: ${change.toFixed(2)}%, expecting reversion`,
                suggestedSizeUsd: sizeUsd,
            };
        }

        // Price spiked - selling opportunity (mean reversion down expected)
        if (change > this.sellThreshold) {
            const confidence = Math.min(change / 10, 0.9);

            return {
                signal: 'SELL',
                pair: data.pair,
                confidence,
                reason: `Overbought: +${change.toFixed(2)}%, expecting reversion`,
            };
        }

        return {
            signal: 'HOLD',
            pair: data.pair,
            confidence: 0.7,
            reason: 'Price within normal range',
        };
    }
}
