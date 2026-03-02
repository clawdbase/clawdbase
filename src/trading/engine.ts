import { CoinbaseClient } from '../api/coinbase';
import { ClawdClient } from '../ai/clawd';
import { logger } from '../utils/logger';
import { createStrategy } from './strategies';
import { OrderService } from '../services/order';
import { PortfolioService } from '../services/portfolio';
import type {
    Config,
    MarketData,
    TradeDecision,
    Strategy,
    StrategyContext,
    EngineState,
    ClawdAnalysis,
} from '../types';

export class TradingEngine {
    private readonly client: CoinbaseClient;
    private readonly config: Config;
    private readonly strategy: Strategy;
    private readonly orderService: OrderService;
    private readonly portfolioService: PortfolioService;
    private readonly clawd?: ClawdClient;

    private running = false;
    private intervalId: NodeJS.Timeout | null = null;
    private tickCount = 0;
    private tradesExecuted = 0;
    private errors = 0;
    private lastTick: Date | null = null;

    constructor(client: CoinbaseClient, config: Config, clawd?: ClawdClient) {
        this.client = client;
        this.config = config;
        this.clawd = clawd;
        this.strategy = createStrategy(config.trading.strategy, config);
        this.orderService = new OrderService(client);
        this.portfolioService = new PortfolioService(client);

        logger.debug(`TradingEngine: strategy=${this.strategy.name}, clawd=${!!clawd}`);
    }

    get state(): EngineState {
        return {
            running: this.running,
            lastTick: this.lastTick,
            tickCount: this.tickCount,
            tradesExecuted: this.tradesExecuted,
            errors: this.errors,
        };
    }

    async start(): Promise<void> {
        if (this.running) {
            logger.warn('Engine already running');
            return;
        }

        this.running = true;
        logger.info('Trading engine started');

        await this.tick();

        this.intervalId = setInterval(() => {
            this.tick().catch(err => {
                this.errors++;
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

    async tick(): Promise<void> {
        this.tickCount++;
        this.lastTick = new Date();
        logger.debug(`--- Tick #${this.tickCount} ---`);

        const summary = await this.portfolioService.getSummary();
        const context: StrategyContext = {
            portfolio: {
                cashUsd: summary.cashUsd,
                totalValueUsd: summary.totalValueUsd,
            },
        };

        // Gather market data for all pairs
        const marketDataList: MarketData[] = [];
        for (const pair of this.config.trading.pairs) {
            try {
                const data = await this.getMarketData(pair);
                marketDataList.push(data);
            } catch (err) {
                logger.debug(`Could not fetch ${pair}:`, err instanceof Error ? err.message : err);
            }
        }

        // Get Clawd AI signals if enabled
        let clawdSignals: ClawdAnalysis[] = [];
        if (this.clawd && marketDataList.length > 0) {
            clawdSignals = await this.clawd.analyze(marketDataList);
        }

        // Process each pair
        for (const data of marketDataList) {
            try {
                // Check for Clawd signal first
                const clawdSignal = clawdSignals.find(s => s.pair === data.pair);
                let decision: TradeDecision;

                if (clawdSignal && clawdSignal.confidence >= this.config.clawd.confidenceThreshold) {
                    decision = {
                        signal: clawdSignal.signal,
                        pair: data.pair,
                        confidence: clawdSignal.confidence,
                        reason: clawdSignal.reasoning,
                        suggestedSizeUsd: context.portfolio.cashUsd * this.config.trading.maxPositionPercent,
                        source: 'clawd',
                    };
                    logger.info(`Clawd signal for ${data.pair}: ${decision.signal}`);
                } else {
                    // Fallback to strategy
                    decision = this.strategy.analyze(data, context);
                    decision.source = 'strategy';
                }

                logger.debug(`${data.pair}: ${decision.signal} (${(decision.confidence * 100).toFixed(0)}%)`);

                if (decision.signal !== 'HOLD' && decision.confidence > 0.6) {
                    await this.executeDecision(decision);
                }
            } catch (err) {
                this.errors++;
                logger.error(`Error processing ${data.pair}:`, err instanceof Error ? err.message : err);
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
            logger.debug('Order size too small');
            return;
        }

        logger.info(`Executing ${decision.signal} ${decision.pair}: $${decision.suggestedSizeUsd.toFixed(2)}`);
        logger.info(`Source: ${decision.source} | Reason: ${decision.reason}`);

        try {
            const result = await this.orderService.executeMarketOrder(
                decision.pair,
                decision.signal as 'BUY' | 'SELL',
                decision.suggestedSizeUsd
            );

            if (result.success) {
                this.tradesExecuted++;
                logger.info(`Order filled: ${result.orderId}`);
            } else {
                this.errors++;
                logger.error(`Order failed: ${result.error}`);
            }
        } catch (err) {
            this.errors++;
            logger.error('Order error:', err instanceof Error ? err.message : err);
        }
    }
}
