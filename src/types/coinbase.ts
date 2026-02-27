// Coinbase Advanced Trade API types

export interface CoinbaseAccount {
    uuid: string;
    name: string;
    currency: string;
    available_balance: {
        value: string;
        currency: string;
    };
    default: boolean;
    active: boolean;
    created_at: string;
    updated_at: string;
    type: 'ACCOUNT_TYPE_CRYPTO' | 'ACCOUNT_TYPE_FIAT';
}

export interface AccountsResponse {
    accounts: CoinbaseAccount[];
    has_next: boolean;
    cursor: string;
    size: number;
}

export interface Ticker {
    trades: TickerTrade[];
    best_bid: string;
    best_ask: string;
    price: string;
}

export interface TickerTrade {
    trade_id: string;
    product_id: string;
    price: string;
    size: string;
    time: string;
    side: 'BUY' | 'SELL';
}

export interface Product {
    product_id: string;
    price: string;
    price_percentage_change_24h: string;
    volume_24h: string;
    base_currency_id: string;
    quote_currency_id: string;
    base_min_size: string;
    base_max_size: string;
    quote_min_size: string;
    quote_max_size: string;
    status: string;
}

export interface ProductsResponse {
    products: Product[];
    num_products: number;
}

// Order types - not fully used yet
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';

export interface OrderRequest {
    client_order_id: string;
    product_id: string;
    side: OrderSide;
    order_configuration: MarketOrderConfig | LimitOrderConfig;
}

export interface MarketOrderConfig {
    market_market_ioc: {
        quote_size?: string;
        base_size?: string;
    };
}

export interface LimitOrderConfig {
    limit_limit_gtc: {
        base_size: string;
        limit_price: string;
        post_only: boolean;
    };
}

export interface Order {
    order_id: string;
    product_id: string;
    side: OrderSide;
    status: string;
    created_time: string;
    filled_size: string;
    average_filled_price: string;
}
