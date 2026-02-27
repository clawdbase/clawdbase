import 'dotenv/config';
import { logger } from './utils/logger';
import { config } from './config';
import { validateEnv } from './utils/env';
import { CoinbaseClient } from './api/coinbase';
import { formatCurrency } from './utils/format';

const VERSION = '0.2.0';

async function main(): Promise<void> {
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
        logger.info('Copy .env.example to .env and add your credentials');
        process.exit(1);
    }

    if (config.sandbox) {
        logger.warn('SANDBOX MODE - No real trades will execute');
    } else {
        logger.warn('!!! LIVE MODE - Real money at risk !!!');
    }
    logger.info('');

    // Initialize API client
    const client = new CoinbaseClient(config.coinbase);

    try {
        // Test connection and fetch accounts
        logger.info('Connecting to Coinbase...');
        const accounts = await client.getAccounts();

        const nonZeroAccounts = accounts.filter(
            a => parseFloat(a.available_balance.value) > 0
        );

        logger.info(`Connected! Found ${accounts.length} accounts`);
        logger.info('');
        logger.info('Balances:');

        for (const account of nonZeroAccounts.slice(0, 8)) {
            const balance = parseFloat(account.available_balance.value);
            const currency = account.available_balance.currency;
            logger.info(`  ${currency.padEnd(6)} ${formatCurrency(balance, currency)}`);
        }

        // Fetch prices for trading pairs
        logger.info('');
        logger.info('Market Prices:');

        for (const pair of config.trading.pairs) {
            try {
                const ticker = await client.getTicker(pair);
                const price = parseFloat(ticker.price);
                logger.info(`  ${pair.padEnd(10)} ${formatCurrency(price, 'USD')}`);
            } catch {
                logger.debug(`Could not fetch ${pair}`);
            }
        }

    } catch (err) {
        logger.error('Failed to connect:', err instanceof Error ? err.message : err);
        process.exit(1);
    }

    logger.info('');
    logger.info('Startup complete.');
    logger.info('');

    // TODO: Start trading loop
    // TODO: Initialize Clawd AI
    logger.warn('Trading loop not implemented yet - exiting');
}

main().catch(err => {
    logger.error('Fatal:', err);
    process.exit(1);
});
