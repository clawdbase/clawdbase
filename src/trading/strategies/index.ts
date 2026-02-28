import type { Strategy, StrategyType, Config } from '../../types';
import { DcaStrategy } from './dca';
import { MomentumStrategy } from './momentum';
import { MeanReversionStrategy } from './mean-reversion';

export function createStrategy(type: StrategyType, config: Config): Strategy {
    switch (type) {
        case 'dca':
            return new DcaStrategy(config);
        case 'momentum':
            return new MomentumStrategy(config);
        case 'meanreversion':
            return new MeanReversionStrategy(config);
        default:
            return new DcaStrategy(config);
    }
}

export { DcaStrategy, MomentumStrategy, MeanReversionStrategy };
