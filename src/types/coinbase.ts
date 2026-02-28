export interface CoinbaseAccount {
    uuid: string;
    name: string;
    currency: string;
    available_balance: {
        value: string;
        currency: string;
    };
    hold: {
        value: string;
        currency: string;
    };
    default: boolean;
    active: boolean;
    created_at: string;
    updated_at: string;
    type: AccountType;
}

export type AccountType = 'ACCOUNT_TYPE_CRYPTO' | 'ACCOUNT_TYPE_FIAT';

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
    side: OrderSide;
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

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
export type OrderStatus = 'PENDING' | 'OPEN' | 'FILLED' | 'CANCELLED' | 'EXPIRED' | 'FAILED';

export interface CreateOrderRequest {
    client_order_id: string;
    product_id: string;
    side: OrderSide;
    order_configuration: OrderConfiguration;
}

export type OrderConfiguration =
    | { market_market_ioc: MarketOrderParams }
    | { limit_limit_gtc: LimitOrderParams };

export interface MarketOrderParams {
    quote_size?: string;
    base_size?: string;
}

export interface LimitOrderParams {
    base_size: string;
    limit_price: string;
    post_only: boolean;
}

export interface CreateOrderResponse {
    success: boolean;
    order_id: string;
    success_response?: {
        order_id: string;
        product_id: string;
        side: OrderSide;
        client_order_id: string;
    };
    error_response?: {
        error: string;
        message: string;
        error_details: string;
    };
}

export interface Order {
    order_id: string;
    product_id: string;
    side: OrderSide;
    status: OrderStatus;
    created_time: string;
    completion_percentage: string;
    filled_size: string;
    average_filled_price: string;
    total_value_after_fees: string;
}

export interface OrdersResponse {
    orders: Order[];
    has_next: boolean;
    cursor: string;
}
