export class ClawdbaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ClawdbaseError';
    }
}

export class CoinbaseApiError extends ClawdbaseError {
    readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(`Coinbase API Error: ${message}`);
        this.name = 'CoinbaseApiError';
        this.statusCode = statusCode;
    }
}

export class ConfigError extends ClawdbaseError {
    constructor(message: string) {
        super(`Configuration Error: ${message}`);
        this.name = 'ConfigError';
    }
}

export class TradingError extends ClawdbaseError {
    constructor(message: string) {
        super(`Trading Error: ${message}`);
        this.name = 'TradingError';
    }
}
