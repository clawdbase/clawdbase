# clawdbase

[![Version](https://img.shields.io/badge/version-0.2.0-blue)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

AI-powered Coinbase trading terminal managed by Clawd.

## Features

- **Coinbase Advanced Trade API** - Full integration
- **Real-time Price Data** - Live market prices
- **Account Management** - View balances and positions
- **Automated Trading** *(in progress)* - Strategy-based execution

## Quick Start

```bash
# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your Coinbase API credentials

# Build and run
npm run build
npm start

# Development
npm run dev
```

## Requirements

- Node.js 18+
- Coinbase Advanced Trade API credentials

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `COINBASE_API_KEY` | API Key | *required* |
| `COINBASE_API_SECRET` | API Secret | *required* |
| `COINBASE_SANDBOX` | Use sandbox | `true` |
| `LOG_LEVEL` | Logging level | `info` |

## Architecture

```
src/
├── api/          # Coinbase API client
├── config/       # Configuration
├── errors/       # Custom error types
├── trading/      # Trading engine (WIP)
├── types/        # TypeScript definitions
└── utils/        # Utilities
```

## Progress

- [x] Project setup
- [x] TypeScript config
- [x] Coinbase API client
- [x] Authentication
- [x] Account fetching
- [x] Price data
- [ ] Order execution
- [ ] Trading strategies
- [ ] Clawd AI integration

## License

MIT
