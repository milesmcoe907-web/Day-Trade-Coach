import { Candle } from "./types";
import { atr, ema, rsi } from "./indicators";

export function runBacktest(candles: Candle[], strategy: "Breakout" | "Pullback" | "Mean Reversion") {
  const closes = candles.map((c) => c.close);
  const ema21 = ema(closes, 21);
  const ema9 = ema(closes, 9);
  const rsi14 = rsi(closes, 14);
  const atr14 = atr(candles, 14);

  let equity = 10000;
  let peak = equity;
  let maxDD = 0;
  const trades: number[] = [];
  const curve = [{ idx: 0, equity }];

  for (let i = 30; i < candles.length - 1; i++) {
    const c = candles[i];
    const next = candles[i + 1];
    const stopDist = atr14[i] * 1.5;
    const high20 = Math.max(...candles.slice(i - 20, i).map((x) => x.high));

    let entry = c.close;
    if (strategy === "Breakout" && c.close <= high20) continue;
    if (strategy === "Pullback") entry = Math.abs(c.close - ema21[i]) < Math.abs(c.close - (ema9[i] + ema21[i]) / 2) ? ema21[i] : (ema9[i] + ema21[i]) / 2;
    if (strategy === "Mean Reversion" && rsi14[i] >= 35) continue;

    const stop = entry - stopDist;
    const target = entry + stopDist * 2;
    let ret = 0;
    if (next.low <= stop) ret = -1;
    else if (next.high >= target) ret = 2;
    else ret = (next.close - entry) / stopDist;

    trades.push(ret);
    equity *= 1 + ret * 0.01;
    peak = Math.max(peak, equity);
    maxDD = Math.max(maxDD, ((peak - equity) / peak) * 100);
    curve.push({ idx: curve.length, equity: Number(equity.toFixed(2)) });
  }

  const wins = trades.filter((t) => t > 0).length;
  const avg = trades.length ? trades.reduce((a, b) => a + b, 0) / trades.length : 0;

  return {
    trades: trades.length,
    winRate: trades.length ? (wins / trades.length) * 100 : 0,
    avgReturn: avg,
    maxDrawdown: maxDD,
    equityCurve: curve
  };
}
