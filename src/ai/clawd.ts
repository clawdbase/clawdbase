import axios, { AxiosInstance } from 'axios';
import type {
    ClawdConfig,
    ClawdRequest,
    ClawdResponse,
    ClawdAnalysis,
    MarketData,
} from '../types';
import { logger } from '../utils/logger';

export class ClawdClient {
    private readonly client: AxiosInstance;
    private readonly confidenceThreshold: number;

    constructor(config: ClawdConfig) {
        this.confidenceThreshold = config.confidenceThreshold;

        this.client = axios.create({
            baseURL: config.baseUrl,
            timeout: 30000,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        logger.debug('ClawdClient initialized');
    }

    async analyze(marketData: MarketData[]): Promise<ClawdAnalysis[]> {
        const request: ClawdRequest = {
            pairs: marketData.map(m => m.pair),
            marketData: marketData.map(m => ({
                pair: m.pair,
                price: m.price,
                volume24h: m.volume24h,
                priceChange24h: m.priceChange24hPercent,
            })),
        };

        try {
            const response = await this.client.post<ClawdResponse>('/v1/analyze', request);

            logger.debug(`Clawd analysis completed in ${response.data.processingTimeMs}ms`);

            // Filter by confidence threshold
            return response.data.analyses.filter(
                a => a.confidence >= this.confidenceThreshold
            );
        } catch (error) {
            logger.error('Clawd analysis failed:', error instanceof Error ? error.message : error);
            return [];
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            await this.client.get('/health');
            return true;
        } catch {
            return false;
        }
    }
}
