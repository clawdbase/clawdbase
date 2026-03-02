# clawdbase

[![CI](https://github.com/yourname/clawdbase/actions/workflows/ci.yml/badge.svg)](https://github.com/yourname/clawdbase/actions)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**AI-powered Coinbase trading terminal managed by Clawd.**

Clawdbase is an automated cryptocurrency trading terminal that connects to Coinbase Advanced Trade API. It features multiple trading strategies, risk management, and optional AI-powered trading signals through Clawd integration.

## Features

- **Coinbase Integration** - Full Advanced Trade API support
- **Multiple Strategies** - DCA, Momentum, Mean Reversion
- **Clawd AI** - AI-powered trade signal analysis
- **Terminal UI** - Real-time dashboard with portfolio view
- **Risk Management** - Stop-loss, position limits, daily loss limits
- **CLI Tools** - Quick commands for balances and prices

## Quick Start

```bash
# Clone repository
git clone https://github.com/clawdbase/clawdbase.git
cd clawdbase

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Coinbase API credentials

# Build and run
npm run build
npm start
```

## Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `COINBASE_API_KEY` | Coinbase Advanced Trade API key |
| `COINBASE_API_SECRET` | Coinbase API secret |

### Optional Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `COINBASE_SANDBOX` | `true` | Use sandbox for testing |
| `LOG_LEVEL` | `info` | Logging verbosity |
| `STRATEGY` | `dca` | Trading strategy |
| `TRADING_PAIRS` | `BTC-USD,ETH-USD` | Pairs to trade |
| `CLAWD_ENABLED` | `false` | Enable AI signals |
| `CLAWD_API_KEY` | - | Clawd API key |

See [`.env.example`](.env.example) for all options.

## Usage

### Trading Bot

```bash
# Start with terminal UI
npm start

# Start headless (no UI)
npm start -- --headless
```

### CLI Commands

```bash
npm run cli -- balance           # Show portfolio
npm run cli -- price BTC-USD     # Get price
npm run cli -- orders            # List open orders
npm run cli -- trade buy BTC-USD 50  # Manual trade
```

### Development

```bash
npm run dev        # Watch mode
npm run lint       # Lint code
npm run typecheck  # Type check
npm test           # Run tests
npm run test:cov   # With coverage
```

## Trading Strategies

| Strategy | Description | Best For |
|----------|-------------|----------|
| `dca` | Dollar-cost averaging at intervals | Long-term accumulation |
| `momentum` | Follow price trends | Trending markets |
| `meanreversion` | Buy dips, sell rallies | Ranging markets |

## Architecture

```
src/
├── ai/               # Clawd AI integration
├── api/              # Coinbase API client
├── cli/              # Command-line interface
├── config/           # Configuration management
├── errors/           # Custom error types
├── services/         # Business logic
├── trading/          # Trading engine
│   └── strategies/   # Strategy implementations
├── types/            # TypeScript definitions
├── ui/               # Terminal UI
└── utils/            # Utilities
```

## Risk Disclaimer

**USE AT YOUR OWN RISK.** This software trades real cryptocurrency. You can lose money. Always:

- Start with sandbox mode
- Test strategies with small amounts
- Never invest more than you can afford to lose
- Understand the strategies before using them

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT - see [LICENSE](LICENSE)
