import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { validateEnv, getEnv, requireEnv } from '../../src/utils/env';

describe('validateEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should return empty array when all required vars are set', () => {
        process.env.COINBASE_API_KEY = 'test-key';
        process.env.COINBASE_API_SECRET = 'test-secret';

        const errors = validateEnv();

        assert.strictEqual(errors.length, 0);
    });

    it('should return errors for missing vars', () => {
        delete process.env.COINBASE_API_KEY;
        delete process.env.COINBASE_API_SECRET;

        const errors = validateEnv();

        assert.strictEqual(errors.length, 2);
        assert.ok(errors.some(e => e.includes('COINBASE_API_KEY')));
        assert.ok(errors.some(e => e.includes('COINBASE_API_SECRET')));
    });
});

describe('getEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should return env value when set', () => {
        process.env.TEST_VAR = 'test-value';

        const value = getEnv('TEST_VAR');

        assert.strictEqual(value, 'test-value');
    });

    it('should return fallback when not set', () => {
        delete process.env.TEST_VAR;

        const value = getEnv('TEST_VAR', 'default');

        assert.strictEqual(value, 'default');
    });

    it('should throw when not set and no fallback', () => {
        delete process.env.TEST_VAR;

        assert.throws(() => getEnv('TEST_VAR'), /Missing/);
    });
});

describe('requireEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should return value when set', () => {
        process.env.TEST_VAR = 'value';

        assert.strictEqual(requireEnv('TEST_VAR'), 'value');
    });

    it('should throw when not set', () => {
        delete process.env.TEST_VAR;

        assert.throws(() => requireEnv('TEST_VAR'), /Required/);
    });
});
