// Environment validation utilities

const REQUIRED_VARS = [
    'COINBASE_API_KEY',
    'COINBASE_API_SECRET',
] as const;

export function validateEnv(): string[] {
    const errors: string[] = [];

    for (const varName of REQUIRED_VARS) {
        if (!process.env[varName]) {
            errors.push(`Missing required environment variable: ${varName}`);
        }
    }

    return errors;
}

export function getEnvOrThrow(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
}
