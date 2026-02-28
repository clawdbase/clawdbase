import 'dotenv/config';
import { logger } from './utils/logger';
import { config } from './config';
import { validateEnv } from './utils/env';
import { CoinbaseClient } from './api/coinbase';
import { TradingEngine } from './trading/engine';
import { PortfolioService } from './services/portfolio';
import { formatCurrency } from './utils/format';

const VERSION = '0.3.0';

async function displayStartup(client: CoinbaseClient): Promise<void> {
    const portfolio = new PortfolioService(client);
    const summary = await portfolio.getSummary();

    logger.info('');
    logger.info('Portfolio:');
    logger.info(`  Total Value: ${formatCurrency(summary.totalValueUsd, 'USD')}`);
    logger.info(`  Cash:        ${formatCurrency(summary.cashUsd, 'USD')}`);
    logger.info('');
    logger.info('Holdings:');

    for (const holding of summary.holdings.slice(0, 5)) {
        logger.info(
            `  ${holding.currency.padEnd(6)} ${holding.amount.toFixed(6).padStart(14)} ` +
            `(${formatCurrency(holding.valueUsd, 'USD')})`
        );
    }

    logger.info('');
    logger.info('Prices:');

    for (const pair of config.trading.pairs) {
        try {
            const ticker = await client.getTicker(pair);
            logger.info(`  ${pair.padEnd(10)} ${formatCurrency(parseFloat(ticker.price), 'USD')}`);
        } catch {
            logger.debug(`Could not fetch ${pair}`);
        }
    }
}

async function main(): Promise<void> {
    logger.info('==========================================');
    logger.info(`  clawdbase v${VERSION}`);
    logger.info('  AI-Powered Coinbase Trading Terminal');
    logger.info('==========================================');

    const envErrors = validateEnv();
    if (envErrors.length > 0) {
        envErrors.forEach(err => logger.error(err));
        logger.info('');
        logger.info('Copy .env.example to .env and configure');
        process.exit(1);
    }

    if (config.sandbox) {
        logger.warn('SANDBOX MODE');
    } else {
        logger.warn('!!! LIVE TRADING MODE !!!');
    }

    const client = new CoinbaseClient(config.coinbase);

    try {
        logger.info('Connecting...');
        await displayStartup(client);
    } catch (err) {
        logger.error('Connection failed:', err instanceof Error ? err.message : err);
        process.exit(1);
    }

    // Start trading engine
    const engine = new TradingEngine(client, config);

    logger.info('');
    logger.info(`Strategy: ${config.trading.strategy}`);
    logger.info('Starting trading engine...');
    logger.info('');

    // Handle shutdown
    process.on('SIGINT', () => {
        logger.info('');
        logger.info('Shutting down...');
        engine.stop();
        process.exit(0);
    });

    await engine.start();
}

main().catch(err => {
    logger.error('Fatal:', err);
    process.exit(1);
});
