import type { CoinbaseClient } from '../api/coinbase';
import type { TradingEngine } from '../trading/engine';
import type { Config } from '../types';
import { PortfolioService } from '../services/portfolio';
import { formatCurrency, formatPercent } from '../utils/format';
import { logger } from '../utils/logger';

export class TerminalUI {
    private readonly client: CoinbaseClient;
    private readonly engine: TradingEngine;
    private readonly portfolio: PortfolioService;
    private readonly refreshMs: number;
    private intervalId: NodeJS.Timeout | null = null;

    constructor(client: CoinbaseClient, engine: TradingEngine, config: Config) {
        this.client = client;
        this.engine = engine;
        this.portfolio = new PortfolioService(client);
        this.refreshMs = config.ui.refreshMs;
    }

    async start(): Promise<void> {
        // Start trading engine
        await this.engine.start();

        // Start UI refresh loop
        this.intervalId = setInterval(() => {
            this.render().catch(() => {});
        }, this.refreshMs);

        // Initial render
        await this.render();

        // Handle input
        process.stdin.setRawMode?.(true);
        process.stdin.resume();
        process.stdin.on('data', (data) => {
            const key = data.toString();
            if (key === 'q' || key === '\u0003') { // q or Ctrl+C
                this.stop();
                process.exit(0);
            }
        });
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.engine.stop();
    }

    private async render(): Promise<void> {
        const summary = await this.portfolio.getSummary();
        const state = this.engine.state;

        // Clear screen and move cursor to top
        process.stdout.write('\x1b[2J\x1b[H');

        const lines: string[] = [];

        // Header
        lines.push('\x1b[1;36m┌─────────────────────────────────────────┐\x1b[0m');
        lines.push('\x1b[1;36m│\x1b[0m       \x1b[1mclawdbase\x1b[0m Trading Terminal       \x1b[1;36m│\x1b[0m');
        lines.push('\x1b[1;36m└─────────────────────────────────────────┘\x1b[0m');
        lines.push('');

        // Portfolio summary
        lines.push('\x1b[1mPORTFOLIO\x1b[0m');
        lines.push('─'.repeat(42));

        const changeColor = summary.change24hPercent >= 0 ? '\x1b[32m' : '\x1b[31m';
        lines.push(`Total Value:  ${formatCurrency(summary.totalValueUsd, 'USD').padStart(20)}`);
        lines.push(`Cash (USD):   ${formatCurrency(summary.cashUsd, 'USD').padStart(20)}`);
        lines.push(`24h Change:   ${changeColor}${formatPercent(summary.change24hPercent / 100).padStart(20)}\x1b[0m`);
        lines.push('');

        // Holdings
        lines.push('\x1b[1mHOLDINGS\x1b[0m');
        lines.push('─'.repeat(42));

        for (const h of summary.holdings.slice(0, 6)) {
            if (h.currency === 'USD') continue;
            const change = h.change24hPercent !== undefined
                ? (h.change24hPercent >= 0 ? '\x1b[32m' : '\x1b[31m') + formatPercent(h.change24hPercent / 100) + '\x1b[0m'
                : '';
            const line = `${h.currency.padEnd(6)} ${h.amount.toFixed(6).padStart(14)} ${formatCurrency(h.valueUsd, 'USD').padStart(12)} ${change}`;
            lines.push(line);
        }
        lines.push('');

        // Engine status
        lines.push('\x1b[1mENGINE\x1b[0m');
        lines.push('─'.repeat(42));

        const statusColor = state.running ? '\x1b[32m' : '\x1b[31m';
        const statusText = state.running ? 'RUNNING' : 'STOPPED';
        lines.push(`Status:       ${statusColor}${statusText.padStart(20)}\x1b[0m`);
        lines.push(`Ticks:        ${state.tickCount.toString().padStart(20)}`);
        lines.push(`Trades:       ${state.tradesExecuted.toString().padStart(20)}`);
        lines.push(`Errors:       ${state.errors.toString().padStart(20)}`);

        if (state.lastTick) {
            const ago = Math.floor((Date.now() - state.lastTick.getTime()) / 1000);
            lines.push(`Last Tick:    ${(ago + 's ago').padStart(20)}`);
        }
        lines.push('');

        // Footer
        lines.push('\x1b[2mPress q to quit\x1b[0m');

        console.log(lines.join('\n'));
    }
}
