# DayTrade Coach

Educational-only, paper-trading assistant for **stocks + crypto** built with Next.js App Router, Prisma SQLite, and Recharts.

## Features
- Mixed watchlist (stock + crypto) on dashboard
- Indicators: RSI(14), EMA(9/21), ATR(14), support/resistance, volume spike, deterministic setup score
- Trade plan generator with optional AI explanation fallback to deterministic explanation
- Paper trade journal with open/close workflow, P/L metrics and filters
- Deterministic daily-candle backtest + equity curve chart
- Mobile-first responsive layout with bottom nav + desktop sidebar
- PWA manifest + install prompt + service worker generation in production

## Quick start
1. Install deps:
   ```bash
   npm install
   ```
2. Configure env:
   ```bash
   cp .env.example .env
   ```
3. Generate Prisma client + DB:
   ```bash
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Env vars
- `DATABASE_URL` (SQLite path)
- `ALPHAVANTAGE_API_KEY` (required for stock data)
- `OPENAI_API_KEY` (optional for plan explanations)

## Disclaimer
**Educational only. Not financial advice. Paper trading only.**
