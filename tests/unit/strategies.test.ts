import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DcaStrategy, MomentumStrategy, MeanReversionStrategy } from '../../src/trading/strategies';
import type { MarketData, StrategyContext, Config } from '../../src/types';

const mockConfig: Config = {
    coinbase: {
        apiKey: 'test',
        apiSecret: 'test',
        baseUrl: 'https://test.com',
        timeout: 30000,
    },
    trading: {
        pairs: ['BTC-USD'],
        intervalMs: 60000,
        maxPositionPercent: 0.1,
        minOrderUsd: 10,
        strategy: 'dca',
        dca: {
            amountUsd: 50,
            intervalHours: 24,
        },
    },
    risk: {
        maxPositionPercent: 0.1,
        stopLossPercent: 0.05,
        maxDailyLossPercent: 0.1,
    },
    clawd: {
        enabled: false,
        apiKey: '',
        baseUrl: '',
        confidenceThreshold: 0.75,
    },
    ui: {
        enabled: false,
        refreshMs: 1000,
    },
    sandbox: true,
    logLevel: 'error',
};

function createMarketData(overrides: Partial<MarketData> = {}): MarketData {
    return {
        pair: 'BTC-USD',
        price: 50000,
        bid: 49990,
        ask: 50010,
        volume24h: 1000000,
        priceChange24hPercent: 0,
        timestamp: new Date(),
        ...overrides,
    };
}

function createContext(overrides: Partial<StrategyContext> = {}): StrategyContext {
    return {
        portfolio: {
            cashUsd: 10000,
            totalValueUsd: 15000,
        },
        ...overrides,
    };
}

describe('DcaStrategy', () => {
    it('should return BUY on first call with sufficient funds', () => {
        const strategy = new DcaStrategy(mockConfig);
        const data = createMarketData();
        const context = createContext();

        const decision = strategy.analyze(data, context);

        assert.strictEqual(decision.signal, 'BUY');
        assert.strictEqual(decision.suggestedSizeUsd, 50);
        assert.ok(decision.confidence > 0.8);
    });

    it('should return HOLD when insufficient funds', () => {
        const strategy = new DcaStrategy(mockConfig);
        const data = createMarketData();
        const context = createContext({ portfolio: { cashUsd: 10, totalValueUsd: 10 } });

        const decision = strategy.analyze(data, context);

        assert.strictEqual(decision.signal, 'HOLD');
        assert.ok(decision.reason.includes('Insufficient'));
    });

    it('should return HOLD when interval not passed', () => {
        const strategy = new DcaStrategy(mockConfig);
        const data = createMarketData();
        const context = createContext();

        // First call should BUY
        strategy.analyze(data, context);

        // Second call should HOLD
        const decision = strategy.analyze(data, context);

        assert.strictEqual(decision.signal, 'HOLD');
        assert.ok(decision.reason.includes('DCA'));
    });
});

describe('MomentumStrategy', () => {
    it('should return BUY on strong upward momentum', () => {
        const strategy = new MomentumStrategy(mockConfig);
        const data = createMarketData({ priceChange24hPercent: 8 });
        const context = createContext();

        const decision = strategy.analyze(data, context);

        assert.strictEqual(decision.signal, 'BUY');
        assert.ok(decision.confidence > 0.5);
        assert.ok(decision.reason.includes('momentum'));
    });

    it('should return SELL on strong downward momentum', () => {
        const strategy = new MomentumStrategy(mockConfig);
        const data = createMarketData({ priceChange24hPercent: -8 });
        const context = createContext();

        const decision = strategy.analyze(data, context);

        assert.strictEqual(decision.signal, 'SELL');
        assert.ok(decision.reason.includes('momentum'));
    });

    it('should return HOLD on sideways movement', () => {
        const strategy = new MomentumStrategy(mockConfig);
        const data = createMarketData({ priceChange24hPercent: 2 });
        const context = createContext();

        const decision = strategy.analyze(data, context);

        assert.strictEqual(decision.signal, 'HOLD');
    });
});

describe('MeanReversionStrategy', () => {
    it('should return BUY when oversold', () => {
        const strategy = new MeanReversionStrategy(mockConfig);
        const data = createMarketData({ priceChange24hPercent: -5 });
        const context = createContext();

        const decision = strategy.analyze(data, context);

        assert.strictEqual(decision.signal, 'BUY');
        assert.ok(decision.reason.includes('Oversold'));
    });

    it('should return SELL when overbought', () => {
        const strategy = new MeanReversionStrategy(mockConfig);
        const data = createMarketData({ priceChange24hPercent: 5 });
        const context = createContext();

        const decision = strategy.analyze(data, context);

        assert.strictEqual(decision.signal, 'SELL');
        assert.ok(decision.reason.includes('Overbought'));
    });

    it('should return HOLD when in normal range', () => {
        const strategy = new MeanReversionStrategy(mockConfig);
        const data = createMarketData({ priceChange24hPercent: 1 });
        const context = createContext();

        const decision = strategy.analyze(data, context);

        assert.strictEqual(decision.signal, 'HOLD');
        assert.ok(decision.reason.includes('normal range'));
    });
});
