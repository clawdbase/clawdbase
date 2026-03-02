export interface Holding {
    currency: string;
    amount: number;
    valueUsd: number;
    priceUsd: number;
    change24hPercent?: number;
}

export interface PortfolioSummary {
    totalValueUsd: number;
    cashUsd: number;
    holdings: Holding[];
    change24hUsd: number;
    change24hPercent: number;
    lastUpdated: Date;
}
