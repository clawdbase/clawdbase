export function formatCurrency(value: number, currency: string): string {
    if (currency === 'USD' || currency === 'USDC' || currency === 'USDT') {
        return `$${value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }

    // Crypto - show more decimals for small values
    const decimals = value < 1 ? 8 : value < 100 ? 4 : 2;
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function formatPercent(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(2)}%`;
}
