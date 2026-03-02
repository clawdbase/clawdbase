#!/usr/bin/env node
import 'dotenv/config';
import { CoinbaseClient } from '../api/coinbase';
import { PortfolioService } from '../services/portfolio';
import { OrderService } from '../services/order';
import { config } from '../config';
import { formatCurrency, formatPercent } from '../utils/format';
import { validateEnv } from '../utils/env';

type CommandHandler = (args: string[]) => Promise<void>;

const commands: Record<string, CommandHandler> = {
    balance: balanceCommand,
    price: priceCommand,
    orders: ordersCommand,
    trade: tradeCommand,
    help: helpCommand,
};

async function main(): Promise<void> {
    const [command = 'help', ...args] = process.argv.slice(2);

    const handler = commands[command];
    if (!handler) {
        console.error(`Unknown command: ${command}\n`);
        await helpCommand([]);
        process.exit(1);
    }

    await handler(args);
}

function requireAuth(): CoinbaseClient {
    const errors = validateEnv();
    if (errors.length > 0) {
        console.error('Missing credentials. Configure .env file.');
        process.exit(1);
    }
    return new CoinbaseClient(config.coinbase);
}

async function balanceCommand(_args: string[]): Promise<void> {
    const client = requireAuth();
    const portfolio = new PortfolioService(client);

    console.log('Fetching portfolio...\n');

    const summary = await portfolio.getSummary();

    console.log('PORTFOLIO');
    console.log('─'.repeat(50));
    console.log(`Total Value:    ${formatCurrency(summary.totalValueUsd, 'USD')}`);
    console.log(`Cash (USD):     ${formatCurrency(summary.cashUsd, 'USD')}`);

    const changeColor = summary.change24hPercent >= 0 ? '\x1b[32m' : '\x1b[31m';
    console.log(`24h Change:     ${changeColor}${formatPercent(summary.change24hPercent / 100)}\x1b[0m`);
    console.log('');

    console.log('HOLDINGS');
    console.log('─'.repeat(50));
    console.log('Asset     Amount              Value         24h');
    console.log('─'.repeat(50));

    for (const h of summary.holdings) {
        if (h.currency === 'USD') continue;
        const change = h.change24hPercent !== undefined
            ? formatPercent(h.change24hPercent / 100)
            : '-';
        console.log(
            `${h.currency.padEnd(8)} ${h.amount.toFixed(8).padStart(18)} ` +
            `${formatCurrency(h.valueUsd, 'USD').padStart(12)} ${change.padStart(8)}`
        );
    }
}

async function priceCommand(args: string[]): Promise<void> {
    const client = requireAuth();
    const pairs = args.length > 0 ? args.map(p => p.toUpperCase()) : config.trading.pairs;

    console.log('PRICES');
    console.log('─'.repeat(40));

    for (const pair of pairs) {
        try {
            const ticker = await client.getTicker(pair);
            const product = await client.getProduct(pair);
            const price = parseFloat(ticker.price);
            const change = parseFloat(product.price_percentage_change_24h);
            const changeColor = change >= 0 ? '\x1b[32m' : '\x1b[31m';

            console.log(
                `${pair.padEnd(12)} ${formatCurrency(price, 'USD').padStart(14)} ` +
                `${changeColor}${formatPercent(change / 100).padStart(10)}\x1b[0m`
            );
        } catch {
            console.log(`${pair.padEnd(12)} Error`);
        }
    }
}

async function ordersCommand(_args: string[]): Promise<void> {
    const client = requireAuth();

    console.log('Fetching orders...\n');

    const orders = await client.getOrders('OPEN');

    if (orders.length === 0) {
        console.log('No open orders.');
        return;
    }

    console.log('OPEN ORDERS');
    console.log('─'.repeat(60));

    for (const order of orders) {
        console.log(`${order.order_id.slice(0, 8)}  ${order.side.padEnd(4)}  ${order.product_id.padEnd(10)}  ${order.status}`);
    }
}

async function tradeCommand(args: string[]): Promise<void> {
    const [side, pair, amount] = args;

    if (!side || !pair || !amount) {
        console.log('Usage: clawdbase trade <buy|sell> <PAIR> <USD_AMOUNT>');
        console.log('Example: clawdbase trade buy BTC-USD 50');
        return;
    }

    const sideUpper = side.toUpperCase();
    if (sideUpper !== 'BUY' && sideUpper !== 'SELL') {
        console.error('Side must be buy or sell');
        return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
        console.error('Amount must be a positive number');
        return;
    }

    const client = requireAuth();
    const orderService = new OrderService(client);

    console.log(`Placing ${sideUpper} order for ${pair}: $${amountNum.toFixed(2)}...`);

    const result = await orderService.executeMarketOrder(pair.toUpperCase(), sideUpper as 'BUY' | 'SELL', amountNum);

    if (result.success) {
        console.log(`Order placed successfully: ${result.orderId}`);
    } else {
        console.error(`Order failed: ${result.error}`);
    }
}

async function helpCommand(_args: string[]): Promise<void> {
    console.log(`
clawdbase CLI v1.0.0

USAGE
  clawdbase <command> [options]

COMMANDS
  balance             Show portfolio balances
  price [PAIRS...]    Show current prices
  orders              List open orders
  trade <side> <pair> <amount>
                      Execute a trade
  help                Show this help

EXAMPLES
  clawdbase balance
  clawdbase price BTC-USD ETH-USD
  clawdbase trade buy BTC-USD 50
  clawdbase orders
`);
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
