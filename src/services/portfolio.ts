import type { CoinbaseClient } from '../api/coinbase';
import type { PortfolioSummary, Holding } from '../types';
import { logger } from '../utils/logger';

export class PortfolioService {
    private readonly client: CoinbaseClient;

    constructor(client: CoinbaseClient) {
        this.client = client;
    }

    async getSummary(): Promise<PortfolioSummary> {
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
            } else {
                // Try to get price for this asset
                try {
                    const ticker = await this.client.getTicker(`${currency}-USD`);
                    const priceUsd = parseFloat(ticker.price);
                    const valueUsd = amount * priceUsd;

                    holdings.push({
                        currency,
                        amount,
                        valueUsd,
                        priceUsd,
                    });
                } catch {
                    logger.debug(`Could not get price for ${currency}`);
                    // Skip assets we can't price
                }
            }
        }

        // Sort by value descending
        holdings.sort((a, b) => b.valueUsd - a.valueUsd);

        const totalValueUsd = holdings.reduce((sum, h) => sum + h.valueUsd, 0);

        return {
            totalValueUsd,
            cashUsd,
            holdings,
            lastUpdated: new Date(),
        };
    }
}
