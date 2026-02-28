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

        // Check if enough time has passed
        if (timeSinceLast < this.intervalMs) {
            return {
                signal: 'HOLD',
                pair: data.pair,
                confidence: 1,
                reason: 'Waiting for next DCA interval',
            };
        }

        // Check if we have enough cash
        if (context.portfolio.cashUsd < this.amountUsd) {
            return {
                signal: 'HOLD',
                pair: data.pair,
                confidence: 1,
                reason: 'Insufficient funds for DCA',
            };
        }

        // Time to buy
        this.lastPurchase.set(data.pair, Date.now());

        return {
            signal: 'BUY',
            pair: data.pair,
            confidence: 0.9,
            reason: `DCA scheduled purchase of $${this.amountUsd}`,
            suggestedSizeUsd: this.amountUsd,
        };
    }
}
