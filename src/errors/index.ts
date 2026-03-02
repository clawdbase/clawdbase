export class ClawdbaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ClawdbaseError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export class CoinbaseApiError extends ClawdbaseError {
    readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(`Coinbase API: ${message}`);
        this.name = 'CoinbaseApiError';
        this.statusCode = statusCode;
    }

    get isRateLimited(): boolean {
        return this.statusCode === 429;
    }

    get isUnauthorized(): boolean {
        return this.statusCode === 401;
    }

    get isNotFound(): boolean {
        return this.statusCode === 404;
    }
}

export class ConfigError extends ClawdbaseError {
    constructor(message: string) {
        super(`Config: ${message}`);
        this.name = 'ConfigError';
    }
}

export class TradingError extends ClawdbaseError {
    constructor(message: string) {
        super(`Trading: ${message}`);
        this.name = 'TradingError';
    }
}

export class InsufficientFundsError extends TradingError {
    readonly required: number;
    readonly available: number;

    constructor(required: number, available: number) {
        super(`Insufficient funds: need $${required.toFixed(2)}, have $${available.toFixed(2)}`);
        this.name = 'InsufficientFundsError';
        this.required = required;
        this.available = available;
    }
}

export class OrderError extends TradingError {
    readonly orderId?: string;

    constructor(message: string, orderId?: string) {
        super(message);
        this.name = 'OrderError';
        this.orderId = orderId;
    }
}
