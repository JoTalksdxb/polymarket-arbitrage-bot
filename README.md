# Polymarket arbitrage trading bot (TypeScript)

Node.js bot that connects to Polymarket’s CLOB, watches crypto “up/down” markets via WebSockets, and places buy orders when configured entry rules match price movement and time remaining in the window.

**This is not financial advice.** Trading on prediction markets involves risk of loss. Review strategy and credentials before running with real funds.

## Requirements

- **Node.js** 18+ recommended
- A **Polygon** RPC URL (e.g. Alchemy, Infura)
- A **Polymarket** setup that matches your signing model: private key that can sign CLOB orders, and (for typical proxy wallets) the **proxy / funder** address you use on Polymarket

## Quick start

```bash
git clone https://github.com/JoTalksdxb/polymarket-arbitrage-bot.git
cd polymarket-arbitrage-bot
npm install
```

1. Copy `.env.example` to `.env` and fill in required variables (see below).
2. Copy or edit `trade.toml` in the project root (see [Configuration](#configuration)).
3. Run the bot:

```bash
npm run dev
```

For production-style runs after compiling:

```bash
npm run build
npm start
```

To capture console output to a file:

```bash
npm run log
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POLYMARKET_PRIVATE_KEY` | Yes | Hex private key that signs CLOB orders (`0x` optional). |
| `PROXY_WALLET_ADDRESS` | Yes | Polymarket proxy / funder address (`0x` + 40 hex). |
| `RPC_URL` | Yes | Polygon JSON-RPC endpoint. |
| `CLOB_HOST` | No | CLOB REST base (default: `https://clob.polymarket.com`). |
| `CHAIN_ID` | No | Default `137` (Polygon mainnet). |
| `RTDS_WS_URL` | No | Real-time data WebSocket (default: `wss://ws-live-data.polymarket.com`). |
| `POLYMARKET_SIGNATURE_TYPE` | No | `0` EOA, `1` EIP-1271, `2` Gnosis Safe / proxy (default: `2`). |

See `.env.example` for a template.

## Configuration

Settings are loaded from **`trade.toml`** in the working directory when you start the process.

### `[market]`

- **`market_coin`**: `btc` \| `eth` \| `sol` \| `xrp`
- **`market_period`**: `5` \| `15` \| `60` \| `240` \| `1440` (minutes)

The bot resolves the active market slug from the coin and period and loops into the next window when the current one ends.

### `[trade_1].entry`

Array of rules. Each entry has:

- **`min`**, **`max`**: absolute price delta band vs. the reference “price to beat”; a rule matches when `min <= |delta|` and `|delta| < max`
- **`entry_remaining_sec_down`**, **`entry_remaining_sec_up`**: only match when remaining seconds in the window are in `[down, up)`
- **`amount`**: share size for the buy order

The bot buys **UP** when delta ≥ 0 and **DOWN** when delta is negative, and only once per market cycle after a fill flag is set (see `Trade` in `src/trade/trade.ts`).

### `[monitor]` (optional)

Used by the inspect script, not by the main trading loop:

- **`proxy_wallet_address`**: wallet to query on Polymarket’s data API
- **`market_slug`**: market slug to filter trades

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Run `src/index.ts` with `tsx` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run `dist/index.js` |
| `npm run log` | Run dev and append stdout/stderr to `log.txt` |
| `npm run check` | Run `src/inspect.ts` — fetch buy/sell history for `[monitor]` in `trade.toml` |

## How it works (high level)

1. Builds or discovers the market slug, loads market metadata from Polymarket, and constructs a signed **ClobClient**.
2. Opens the **user** WebSocket for order-book updates on the UP/DOWN token IDs.
3. Subscribes to **real-time crypto price** feeds to compute delta vs. a reference price and drive the volatility helper and `Trade.make_trading_decision`.
4. When the market window ends, prints an UP/DOWN outcome banner, closes the socket, waits briefly, and starts the next cycle.

**Note:** The RTDS subscription in `src/index.ts` is wired for **BTC**-style symbols. If you trade non-BTC markets, confirm that price subscriptions and symbol handling in `src/services/ws_rtds.ts` match your asset; otherwise signals may not align with the market you are trading.

## Security

- Never commit `.env` or real private keys.
- Treat `POLYMARKET_PRIVATE_KEY` like full custody of funds that key can move or sign for.

## License

See `package.json` (`license` field).
