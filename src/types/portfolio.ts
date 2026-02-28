export interface Holding {
    currency: string;
    amount: number;
    valueUsd: number;
    priceUsd: number;
}

export interface PortfolioSummary {
    totalValueUsd: number;
    cashUsd: number;
    holdings: Holding[];
    lastUpdated: Date;
}
