import 'dotenv/config';
import { logger } from './utils/logger';
import { config } from './config';
import { validateEnv } from './utils/env';

const VERSION = '0.1.0';

async function main(): Promise<void> {
    logger.info('==========================================');
    logger.info(`  clawdbase v${VERSION}`);
    logger.info('  AI-Powered Coinbase Trading Terminal');
    logger.info('==========================================');

    // Validate environment
    const envErrors = validateEnv();
    if (envErrors.length > 0) {
        envErrors.forEach(err => logger.error(err));
        logger.info('Copy .env.example to .env and configure');
        process.exit(1);
    }

    logger.info('Environment validated');
    logger.debug('Config:', config);

    if (config.sandbox) {
        logger.warn('SANDBOX MODE - No real trades');
    }

    // TODO: Initialize Coinbase client
    // TODO: Start trading loop

    logger.info('Setup complete. Trading not yet implemented.');
}

main().catch(err => {
    logger.error('Fatal error:', err);
    process.exit(1);
});
