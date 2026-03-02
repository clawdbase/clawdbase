import type { Strategy, MarketData, TradeDecision, StrategyContext, Config } from '../../types';

export class DcaStrategy implements Strategy {
    readonly name = 'DCA (Dollar Cost Averaging)';
    private readonly amountUsd: number;
    private readonly intervalMs: number;
    private lastPurchase: Map<string, number> = new Map();

    constructor(config: Config) {
        this.amountUsd = config.trading.dca.amountUsd;
        this.intervalMs = config.trading.dca.intervalHours * 60 * 60 * 1000;
    }

    analyze(data: MarketData, context: StrategyContext): TradeDecision {
        const lastTime = this.lastPurchase.get(data.pair) || 0;
        const timeSinceLast = Date.now() - lastTime;

        if (timeSinceLast < this.intervalMs) {
            const hoursRemaining = ((this.intervalMs - timeSinceLast) / (1000 * 60 * 60)).toFixed(1);
            return {
                signal: 'HOLD',
                pair: data.pair,
                confidence: 1,
                reason: `Next DCA in ${hoursRemaining}h`,
                source: 'strategy',
            };
        }

        if (context.portfolio.cashUsd < this.amountUsd) {
            return {
                signal: 'HOLD',
                pair: data.pair,
                confidence: 1,
                reason: 'Insufficient funds',
                source: 'strategy',
            };
        }

        this.lastPurchase.set(data.pair, Date.now());

        return {
            signal: 'BUY',
            pair: data.pair,
            confidence: 0.9,
            reason: `Scheduled DCA: $${this.amountUsd}`,
            suggestedSizeUsd: this.amountUsd,
            source: 'strategy',
        };
    }
}
