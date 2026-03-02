import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

// Integration tests require actual API connection
// These tests are skipped by default unless COINBASE_API_KEY is set

const hasCredentials = !!(process.env.COINBASE_API_KEY && process.env.COINBASE_API_SECRET);

describe('Coinbase API Integration', { skip: !hasCredentials }, () => {
    it('should connect and fetch accounts', async () => {
        // Dynamic import to avoid loading when skipped
        const { CoinbaseClient } = await import('../../src/api/coinbase');
        const { config } = await import('../../src/config');

        const client = new CoinbaseClient(config.coinbase);
        const accounts = await client.getAccounts();

        assert.ok(Array.isArray(accounts));
        assert.ok(accounts.length > 0);
    });

    it('should fetch product ticker', async () => {
        const { CoinbaseClient } = await import('../../src/api/coinbase');
        const { config } = await import('../../src/config');

        const client = new CoinbaseClient(config.coinbase);
        const ticker = await client.getTicker('BTC-USD');

        assert.ok(ticker.price);
        assert.ok(parseFloat(ticker.price) > 0);
    });

    it('should fetch products list', async () => {
        const { CoinbaseClient } = await import('../../src/api/coinbase');
        const { config } = await import('../../src/config');

        const client = new CoinbaseClient(config.coinbase);
        const products = await client.getProducts();

        assert.ok(Array.isArray(products));
        assert.ok(products.length > 0);
        assert.ok(products.some(p => p.product_id === 'BTC-USD'));
    });
});

describe('Portfolio Service Integration', { skip: !hasCredentials }, () => {
    it('should calculate portfolio summary', async () => {
        const { CoinbaseClient } = await import('../../src/api/coinbase');
        const { PortfolioService } = await import('../../src/services/portfolio');
        const { config } = await import('../../src/config');

        const client = new CoinbaseClient(config.coinbase);
        const portfolio = new PortfolioService(client);

        const summary = await portfolio.getSummary();

        assert.ok(typeof summary.totalValueUsd === 'number');
        assert.ok(typeof summary.cashUsd === 'number');
        assert.ok(Array.isArray(summary.holdings));
        assert.ok(summary.lastUpdated instanceof Date);
    });
});
