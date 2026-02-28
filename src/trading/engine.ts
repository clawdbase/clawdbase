import { CoinbaseClient } from '../api/coinbase';
import { logger } from '../utils/logger';
import { createStrategy } from './strategies';
import { OrderService } from '../services/order';
import { PortfolioService } from '../services/portfolio';
import type { Config, MarketData, TradeDecision, Strategy, StrategyContext } from '../types';

export class TradingEngine {
    private readonly client: CoinbaseClient;
    private readonly config: Config;
    private readonly strategy: Strategy;
    private readonly orderService: OrderService;
    private readonly portfolioService: PortfolioService;
    private running = false;
    private intervalId: NodeJS.Timeout | null = null;

    constructor(client: CoinbaseClient, config: Config) {
        this.client = client;
        this.config = config;
        this.strategy = createStrategy(config.trading.strategy, config);
        this.orderService = new OrderService(client);
        this.portfolioService = new PortfolioService(client);

        logger.debug(`TradingEngine initialized with strategy: ${this.strategy.name}`);
    }

    async start(): Promise<void> {
        if (this.running) {
            logger.warn('Trading engine already running');
            return;
        }

        this.running = true;
        logger.info('Trading engine started');

        // Run immediately
        await this.tick();

        // Then on interval
        this.intervalId = setInterval(() => {
            this.tick().catch(err => {
                logger.error('Tick error:', err instanceof Error ? err.message : err);
            });
        }, this.config.trading.intervalMs);
    }

    stop(): void {
        this.running = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        logger.info('Trading engine stopped');
    }

    private async tick(): Promise<void> {
        logger.debug('--- Tick ---');

        const summary = await this.portfolioService.getSummary();
        const context: StrategyContext = {
            portfolio: {
                cashUsd: summary.cashUsd,
                totalValueUsd: summary.totalValueUsd,
            },
        };

        for (const pair of this.config.trading.pairs) {
            try {
                const marketData = await this.getMarketData(pair);
                const decision = this.strategy.analyze(marketData, context);

                logger.debug(`${pair}: ${decision.signal} (${(decision.confidence * 100).toFixed(0)}%)`);

                if (decision.signal !== 'HOLD' && decision.confidence > 0.6) {
                    await this.executeDecision(decision);
                }
            } catch (err) {
                logger.error(`Error processing ${pair}:`, err instanceof Error ? err.message : err);
            }
        }
    }

    private async getMarketData(pair: string): Promise<MarketData> {
        const ticker = await this.client.getTicker(pair);
        const product = await this.client.getProduct(pair);

        return {
            pair,
            price: parseFloat(ticker.price),
            bid: parseFloat(ticker.best_bid),
            ask: parseFloat(ticker.best_ask),
            volume24h: parseFloat(product.volume_24h),
            priceChange24hPercent: parseFloat(product.price_percentage_change_24h),
            timestamp: new Date(),
        };
    }

    private async executeDecision(decision: TradeDecision): Promise<void> {
        if (!decision.suggestedSizeUsd || decision.suggestedSizeUsd < this.config.trading.minOrderUsd) {
            logger.debug('Order size too small, skipping');
            return;
        }

        logger.info(`Executing ${decision.signal} for ${decision.pair}: $${decision.suggestedSizeUsd.toFixed(2)}`);
        logger.info(`Reason: ${decision.reason}`);

        try {
            const result = await this.orderService.executeMarketOrder(
                decision.pair,
                decision.signal as 'BUY' | 'SELL',
                decision.suggestedSizeUsd
            );

            if (result.success) {
                logger.info(`Order filled: ${result.orderId}`);
            } else {
                logger.error(`Order failed: ${result.error}`);
            }
        } catch (err) {
            logger.error('Order execution error:', err instanceof Error ? err.message : err);
        }
    }
}
