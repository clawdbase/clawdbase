export function formatCurrency(value: number, currency: string): string {
    if (currency === 'USD' || currency === 'USDC' || currency === 'USDT') {
        return `$${value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }

    const decimals = value < 1 ? 8 : value < 100 ? 4 : 2;
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function formatPercent(value: number, includeSign = true): string {
    const sign = includeSign && value >= 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(2)}%`;
}

export function formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}
