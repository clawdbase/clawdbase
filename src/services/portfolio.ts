import type { CoinbaseClient } from '../api/coinbase';
import type { PortfolioSummary, Holding } from '../types';
import { logger } from '../utils/logger';

export class PortfolioService {
    private readonly client: CoinbaseClient;
    private cache: PortfolioSummary | null = null;
    private cacheTime = 0;
    private readonly cacheTtlMs = 5000;

    constructor(client: CoinbaseClient) {
        this.client = client;
    }

    async getSummary(forceRefresh = false): Promise<PortfolioSummary> {
        const now = Date.now();
        if (!forceRefresh && this.cache && now - this.cacheTime < this.cacheTtlMs) {
            return this.cache;
        }

        const accounts = await this.client.getAccounts();
        const holdings: Holding[] = [];
        let cashUsd = 0;

        for (const account of accounts) {
            const amount = parseFloat(account.available_balance.value);
            if (amount <= 0) continue;

            const currency = account.available_balance.currency;

            if (currency === 'USD') {
                cashUsd = amount;
                holdings.push({
                    currency: 'USD',
                    amount,
                    valueUsd: amount,
                    priceUsd: 1,
                });
                continue;
            }

            try {
                const ticker = await this.client.getTicker(`${currency}-USD`);
                const product = await this.client.getProduct(`${currency}-USD`);
                const priceUsd = parseFloat(ticker.price);
                const valueUsd = amount * priceUsd;
                const change24h = parseFloat(product.price_percentage_change_24h);

                holdings.push({
                    currency,
                    amount,
                    valueUsd,
                    priceUsd,
                    change24hPercent: change24h,
                });
            } catch {
                logger.debug(`Could not price ${currency}`);
            }
        }

        holdings.sort((a, b) => b.valueUsd - a.valueUsd);

        const totalValueUsd = holdings.reduce((sum, h) => sum + h.valueUsd, 0);

        // Calculate 24h change (weighted average)
        let change24hUsd = 0;
        for (const h of holdings) {
            if (h.change24hPercent !== undefined) {
                const yesterdayValue = h.valueUsd / (1 + h.change24hPercent / 100);
                change24hUsd += h.valueUsd - yesterdayValue;
            }
        }
        const change24hPercent = totalValueUsd > 0 ? (change24hUsd / (totalValueUsd - change24hUsd)) * 100 : 0;

        this.cache = {
            totalValueUsd,
            cashUsd,
            holdings,
            change24hUsd,
            change24hPercent,
            lastUpdated: new Date(),
        };
        this.cacheTime = now;

        return this.cache;
    }
}
