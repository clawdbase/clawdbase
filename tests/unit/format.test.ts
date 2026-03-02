import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatCurrency, formatPercent, formatDuration } from '../../src/utils/format';

describe('formatCurrency', () => {
    it('should format USD values with $ prefix', () => {
        assert.strictEqual(formatCurrency(1234.56, 'USD'), '$1,234.56');
        assert.strictEqual(formatCurrency(0.5, 'USD'), '$0.50');
        assert.strictEqual(formatCurrency(1000000, 'USD'), '$1,000,000.00');
    });

    it('should format USDC like USD', () => {
        assert.strictEqual(formatCurrency(100, 'USDC'), '$100.00');
    });

    it('should format crypto with appropriate decimals', () => {
        const btc = formatCurrency(0.00012345, 'BTC');
        assert.ok(btc.includes('0.00012345'));

        const eth = formatCurrency(1.5, 'ETH');
        assert.ok(eth.includes('1.5'));
    });
});

describe('formatPercent', () => {
    it('should format positive percentages with + sign', () => {
        assert.strictEqual(formatPercent(0.05), '+5.00%');
        assert.strictEqual(formatPercent(0.1234), '+12.34%');
    });

    it('should format negative percentages without + sign', () => {
        assert.strictEqual(formatPercent(-0.05), '-5.00%');
    });

    it('should handle zero', () => {
        assert.strictEqual(formatPercent(0), '+0.00%');
    });

    it('should omit sign when specified', () => {
        assert.strictEqual(formatPercent(0.05, false), '5.00%');
        assert.strictEqual(formatPercent(-0.05, false), '-5.00%');
    });
});

describe('formatDuration', () => {
    it('should format milliseconds', () => {
        assert.strictEqual(formatDuration(500), '500ms');
    });

    it('should format seconds', () => {
        assert.strictEqual(formatDuration(5000), '5.0s');
        assert.strictEqual(formatDuration(30000), '30.0s');
    });

    it('should format minutes', () => {
        assert.strictEqual(formatDuration(90000), '1.5m');
    });

    it('should format hours', () => {
        assert.strictEqual(formatDuration(7200000), '2.0h');
    });
});
