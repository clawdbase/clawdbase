import axios, { AxiosInstance, AxiosError } from 'axios';
import crypto from 'crypto';
import type {
    CoinbaseConfig,
    CoinbaseAccount,
    AccountsResponse,
    Ticker,
    Product,
    ProductsResponse,
} from '../types';
import { logger } from '../utils/logger';
import { CoinbaseApiError } from '../errors';

export class CoinbaseClient {
    private readonly apiKey: string;
    private readonly apiSecret: string;
    private readonly client: AxiosInstance;

    constructor(config: CoinbaseConfig) {
        this.apiKey = config.apiKey;
        this.apiSecret = config.apiSecret;

        this.client = axios.create({
            baseURL: config.baseUrl,
            timeout: config.timeout,
        });

        logger.debug(`CoinbaseClient initialized: ${config.baseUrl}`);
    }

    private sign(
        timestamp: string,
        method: string,
        path: string,
        body: string = ''
    ): string {
        const message = timestamp + method + path + body;
        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(message)
            .digest('hex');
    }

    private getHeaders(method: string, path: string, body: string = ''): Record<string, string> {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signature = this.sign(timestamp, method, path, body);

        return {
            'CB-ACCESS-KEY': this.apiKey,
            'CB-ACCESS-SIGN': signature,
            'CB-ACCESS-TIMESTAMP': timestamp,
            'Content-Type': 'application/json',
        };
    }

    private async request<T>(
        method: 'GET' | 'POST' | 'DELETE',
        path: string,
        data?: unknown
    ): Promise<T> {
        const body = data ? JSON.stringify(data) : '';
        const headers = this.getHeaders(method, path, body);

        try {
            const response = await this.client.request<T>({
                method,
                url: path,
                headers,
                data: data || undefined,
            });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                const msg = error.response.data?.message || error.message;
                throw new CoinbaseApiError(msg, error.response.status);
            }
            throw error;
        }
    }

    async getAccounts(): Promise<CoinbaseAccount[]> {
        const response = await this.request<AccountsResponse>(
            'GET',
            '/api/v3/brokerage/accounts'
        );
        return response.accounts;
    }

    async getAccount(accountId: string): Promise<CoinbaseAccount> {
        const response = await this.request<{ account: CoinbaseAccount }>(
            'GET',
            `/api/v3/brokerage/accounts/${accountId}`
        );
        return response.account;
    }

    async getTicker(productId: string): Promise<Ticker> {
        return this.request<Ticker>(
            'GET',
            `/api/v3/brokerage/products/${productId}/ticker`
        );
    }

    async getProducts(): Promise<Product[]> {
        const response = await this.request<ProductsResponse>(
            'GET',
            '/api/v3/brokerage/products'
        );
        return response.products;
    }

    async getProduct(productId: string): Promise<Product> {
        return this.request<Product>(
            'GET',
            `/api/v3/brokerage/products/${productId}`
        );
    }

    // TODO: Implement order methods
    // async createOrder(order: OrderRequest): Promise<Order> { }
    // async cancelOrder(orderId: string): Promise<void> { }
    // async getOrders(): Promise<Order[]> { }
}
