import { randomUUID } from 'crypto';
import { CoinbaseClient } from '../api/coinbase';
import { logger } from '../utils/logger';
import type { OrderSide, CreateOrderRequest } from '../types';

export interface OrderResult {
    success: boolean;
    orderId?: string;
    error?: string;
}

export class OrderService {
    private readonly client: CoinbaseClient;

    constructor(client: CoinbaseClient) {
        this.client = client;
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

        logger.debug('Creating order:', order);

        try {
            const response = await this.client.createOrder(order);

            if (response.success && response.success_response) {
                return {
                    success: true,
                    orderId: response.success_response.order_id,
                };
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
            logger.error('Failed to cancel order:', err instanceof Error ? err.message : err);
            return false;
        }
    }
}
