export function formatCurrency(value: number, currency: string): string {
    if (currency === 'USD' || currency === 'USDC' || currency === 'USDT') {
        return `$${value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }

    const decimals = value < 0.001 ? 8 : value < 1 ? 6 : value < 100 ? 4 : 2;
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function formatPercent(value: number, includeSign = true): string {
    const percent = value * 100;
    const sign = includeSign && percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
}
