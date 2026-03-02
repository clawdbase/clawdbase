import 'dotenv/config';
import { logger } from './utils/logger';
import { config } from './config';
import { validateEnv } from './utils/env';
import { CoinbaseClient } from './api/coinbase';
import { TradingEngine } from './trading/engine';
import { ClawdClient } from './ai/clawd';
import { TerminalUI } from './ui/terminal';

const VERSION = '1.0.0';

async function main(): Promise<void> {
    const headless = process.argv.includes('--headless');

    logger.info('==========================================');
    logger.info(`  clawdbase v${VERSION}`);
    logger.info('  AI-Powered Coinbase Trading Terminal');
    logger.info('==========================================');
    logger.info('');

    // Validate environment
    const envErrors = validateEnv();
    if (envErrors.length > 0) {
        envErrors.forEach(err => logger.error(err));
        logger.info('');
        logger.info('Copy .env.example to .env and configure');
        process.exit(1);
    }

    if (config.sandbox) {
        logger.warn('SANDBOX MODE - No real trades');
    } else {
        logger.warn('!!! LIVE TRADING MODE !!!');
    }

    // Initialize clients
    const coinbase = new CoinbaseClient(config.coinbase);

    let clawd: ClawdClient | undefined;
    if (config.clawd.enabled) {
        clawd = new ClawdClient(config.clawd);
        logger.info('Clawd AI enabled');
    }

    // Test connection
    try {
        logger.info('Connecting to Coinbase...');
        const accounts = await coinbase.getAccounts();
        logger.info(`Connected - ${accounts.length} accounts found`);
    } catch (err) {
        logger.error('Connection failed:', err instanceof Error ? err.message : err);
        process.exit(1);
    }

    // Initialize trading engine
    const engine = new TradingEngine(coinbase, config, clawd);

    // Handle shutdown
    const shutdown = (): void => {
        logger.info('');
        logger.info('Shutting down...');
        engine.stop();
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Start UI or headless
    if (!headless && config.ui.enabled) {
        const ui = new TerminalUI(coinbase, engine, config);
        await ui.start();
    } else {
        logger.info(`Strategy: ${config.trading.strategy}`);
        logger.info('Starting trading engine (headless)...');
        logger.info('');
        await engine.start();
    }
}

main().catch(err => {
    logger.error('Fatal:', err);
    process.exit(1);
});
