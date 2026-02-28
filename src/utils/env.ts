const REQUIRED_VARS = ['COINBASE_API_KEY', 'COINBASE_API_SECRET'] as const;

export function validateEnv(): string[] {
    const errors: string[] = [];
    for (const key of REQUIRED_VARS) {
        if (!process.env[key]) {
            errors.push(`Missing: ${key}`);
        }
    }
    return errors;
}

export function getEnv(key: string, fallback?: string): string {
    const value = process.env[key];
    if (!value && fallback === undefined) {
        throw new Error(`Missing: ${key}`);
    }
    return value || fallback || '';
}
