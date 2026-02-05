import { Candle, AssetType } from "./types";

const COIN_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana"
};

async function getStockCandles(symbol: string, days: number): Promise<Candle[]> {
  const key = process.env.ALPHAVANTAGE_API_KEY;
  if (!key) throw new Error("Missing ALPHAVANTAGE_API_KEY");
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${key}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  const series = data["Time Series (Daily)"] ?? {};
  return Object.entries(series)
    .map(([date, v]: [string, any]) => ({
      date,
      open: Number(v["1. open"]),
      high: Number(v["2. high"]),
      low: Number(v["3. low"]),
      close: Number(v["4. close"]),
      volume: Number(v["5. volume"])
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days);
}

async function getCryptoCandles(symbol: string, days: number): Promise<Candle[]> {
  const id = COIN_MAP[symbol.toUpperCase()] ?? symbol.toLowerCase();
  const ohlcUrl = `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${Math.min(days, 365)}`;
  const volUrl = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${Math.min(days, 365)}&interval=daily`;
  const [ohlcRes, volRes] = await Promise.all([fetch(ohlcUrl), fetch(volUrl)]);
  if (!ohlcRes.ok) throw new Error("CoinGecko OHLC fetch failed");
  const [ohlc, vol] = await Promise.all([ohlcRes.json(), volRes.ok ? volRes.json() : Promise.resolve({ total_volumes: [] })]);
  const volMap = new Map<string, number>((vol.total_volumes ?? []).map((row: [number, number]) => [new Date(row[0]).toISOString().slice(0, 10), row[1]]));
  return (ohlc as [number, number, number, number, number][])
    .map(([ts, open, high, low, close]) => {
      const date = new Date(ts).toISOString().slice(0, 10);
      return { date, open, high, low, close, volume: volMap.get(date) };
    })
    .slice(-days);
}

export async function getCandles(type: AssetType, symbol: string, days = 120): Promise<Candle[]> {
  const normalized = symbol.toUpperCase();
  return type === "stock" ? getStockCandles(normalized, days) : getCryptoCandles(normalized, days);
}

export async function getLatestPrice(type: AssetType, symbol: string): Promise<number> {
  const candles = await getCandles(type, symbol, 2);
  const latest = candles.at(-1);
  if (!latest) throw new Error("No price data");
  return latest.close;
}
