import { randomUUID } from 'crypto';
import { CoinbaseClient } from '../api/coinbase';
import { logger } from '../utils/logger';
import type { OrderSide, CreateOrderRequest, TradeExecution } from '../types';

export interface OrderResult {
    success: boolean;
    orderId?: string;
    error?: string;
}

export class OrderService {
    private readonly client: CoinbaseClient;
    private readonly recentTrades: TradeExecution[] = [];

    constructor(client: CoinbaseClient) {
        this.client = client;
    }

    get trades(): TradeExecution[] {
        return [...this.recentTrades];
    }

    async executeMarketOrder(
        productId: string,
        side: OrderSide,
        quoteSize: number
    ): Promise<OrderResult> {
        const clientOrderId = randomUUID();

        const order: CreateOrderRequest = {
            client_order_id: clientOrderId,
            product_id: productId,
            side,
            order_configuration: {
                market_market_ioc: {
                    quote_size: quoteSize.toFixed(2),
                },
            },
        };

        logger.debug('Creating order:', JSON.stringify(order));

        try {
            const response = await this.client.createOrder(order);

            if (response.success && response.success_response) {
                const orderId = response.success_response.order_id;

                // Record trade
                this.recentTrades.push({
                    orderId,
                    pair: productId,
                    side,
                    requestedSizeUsd: quoteSize,
                    filledSize: 0, // Would need to fetch order details
                    averagePrice: 0,
                    totalCost: quoteSize,
                    timestamp: new Date(),
                    success: true,
                });

                // Keep last 100 trades
                if (this.recentTrades.length > 100) {
                    this.recentTrades.shift();
                }

                return { success: true, orderId };
            }

            return {
                success: false,
                error: response.error_response?.message || 'Unknown error',
            };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }
    }

    async cancelOrder(orderId: string): Promise<boolean> {
        try {
            await this.client.cancelOrder(orderId);
            return true;
        } catch (err) {
            logger.error('Cancel failed:', err instanceof Error ? err.message : err);
            return false;
        }
    }
}
