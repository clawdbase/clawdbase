#!/usr/bin/env node
import 'dotenv/config';
import { CoinbaseClient } from '../api/coinbase';
import { PortfolioService } from '../services/portfolio';
import { config } from '../config';
import { formatCurrency } from '../utils/format';
import { validateEnv } from '../utils/env';

const commands: Record<string, (args: string[]) => Promise<void>> = {
    balance: balanceCommand,
    price: priceCommand,
    help: helpCommand,
};

async function main(): Promise<void> {
    const [command = 'help', ...args] = process.argv.slice(2);

    const handler = commands[command];
    if (!handler) {
        console.error(`Unknown command: ${command}`);
        await helpCommand([]);
        process.exit(1);
    }

    await handler(args);
}

async function balanceCommand(_args: string[]): Promise<void> {
    const errors = validateEnv();
    if (errors.length > 0) {
        console.error('Missing credentials. Configure .env file.');
        process.exit(1);
    }

    const client = new CoinbaseClient(config.coinbase);
    const portfolio = new PortfolioService(client);

    console.log('Fetching balances...\n');

    const summary = await portfolio.getSummary();

    console.log('PORTFOLIO SUMMARY');
    console.log('─'.repeat(40));
    console.log(`Total Value:  ${formatCurrency(summary.totalValueUsd, 'USD')}`);
    console.log(`Cash (USD):   ${formatCurrency(summary.cashUsd, 'USD')}`);
    console.log('');
    console.log('HOLDINGS');
    console.log('─'.repeat(40));

    for (const holding of summary.holdings) {
        if (holding.currency === 'USD') continue;
        const line = [
            holding.currency.padEnd(8),
            holding.amount.toFixed(8).padStart(16),
            formatCurrency(holding.valueUsd, 'USD').padStart(14),
        ].join('');
        console.log(line);
    }
}

async function priceCommand(args: string[]): Promise<void> {
    const errors = validateEnv();
    if (errors.length > 0) {
        console.error('Missing credentials. Configure .env file.');
        process.exit(1);
    }

    const pairs = args.length > 0 ? args : config.trading.pairs;
    const client = new CoinbaseClient(config.coinbase);

    console.log('PRICES');
    console.log('─'.repeat(30));

    for (const pair of pairs) {
        try {
            const ticker = await client.getTicker(pair);
            const price = parseFloat(ticker.price);
            console.log(`${pair.padEnd(12)} ${formatCurrency(price, 'USD')}`);
        } catch {
            console.log(`${pair.padEnd(12)} Error fetching`);
        }
    }
}

async function helpCommand(_args: string[]): Promise<void> {
    console.log(`
clawdbase CLI

USAGE
  clawdbase <command> [options]

COMMANDS
  balance           Show portfolio balances
  price [PAIRS...]  Show current prices
  help              Show this help

EXAMPLES
  clawdbase balance
  clawdbase price BTC-USD ETH-USD
`);
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
