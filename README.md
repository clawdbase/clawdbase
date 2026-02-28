# clawdbase

[![Version](https://img.shields.io/badge/version-0.3.0-blue)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

AI-powered Coinbase trading terminal managed by Clawd.

## Features

- **Coinbase Advanced Trade API** - Full authenticated integration
- **Automated Trading** - Execute trades with configurable strategies
- **Multiple Strategies** - DCA, Momentum, Mean Reversion
- **CLI Interface** - Easy command-line control
- **Risk Management** - Stop-loss, position limits

## Installation

```bash
git clone https://github.com/yourname/clawdbase.git
cd clawdbase
npm install
```

## Configuration

```bash
cp .env.example .env
```

Edit `.env` with your Coinbase API credentials.

## Usage

```bash
# Build
npm run build

# Run trading bot
npm start

# CLI commands
npm run cli -- balance          # Show balances
npm run cli -- price BTC-USD    # Get price
npm run cli -- trade            # Start trading loop

# Development
npm run dev                     # Watch mode
npm test                        # Run tests
```

## Trading Strategies

| Strategy | Description |
|----------|-------------|
| `dca` | Dollar-cost averaging at intervals |
| `momentum` | Buy on upward momentum |
| `meanreversion` | Buy dips, sell rallies |

Configure strategy in `.env`:

```
STRATEGY=dca
```

## Architecture

```
src/
├── api/              # Coinbase API client
├── cli/              # Command-line interface
├── config/           # Configuration
├── errors/           # Custom error types
├── services/         # Business logic services
├── trading/          # Trading engine
│   └── strategies/   # Trading strategies
├── types/            # TypeScript definitions
└── utils/            # Utilities
```

## Progress

- [x] Coinbase API integration
- [x] Account & balance fetching
- [x] Price data
- [x] Order execution
- [x] Trading strategies
- [x] CLI interface
- [ ] Clawd AI integration
- [ ] Terminal UI
- [ ] Websocket streaming

## License

MIT
