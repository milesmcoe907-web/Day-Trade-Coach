import { Candle, Indicators } from "./types";

export function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = values[0];
  for (let i = 0; i < values.length; i++) {
    prev = i === 0 ? values[0] : values[i] * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

export function rsi(values: number[], period = 14): number[] {
  const out = new Array(values.length).fill(50);
  if (values.length <= period) return out;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    gains += Math.max(diff, 0);
    losses += Math.max(-diff, 0);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

export function atr(candles: Candle[], period = 14): number[] {
  if (!candles.length) return [];
  const tr: number[] = [candles[0].high - candles[0].low];
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    const prevClose = candles[i - 1].close;
    tr.push(Math.max(c.high - c.low, Math.abs(c.high - prevClose), Math.abs(c.low - prevClose)));
  }
  const out = new Array(candles.length).fill(tr[0]);
  let first = tr.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out[period - 1] = first;
  for (let i = period; i < tr.length; i++) {
    first = (first * (period - 1) + tr[i]) / period;
    out[i] = first;
  }
  return out;
}

export function computeIndicators(candles: Candle[]): Indicators {
  if (candles.length < 30) throw new Error("Need at least 30 candles");
  const closes = candles.map((c) => c.close);
  const ema9 = ema(closes, 9).at(-1) ?? closes.at(-1) ?? 0;
  const ema21 = ema(closes, 21).at(-1) ?? closes.at(-1) ?? 0;
  const rsi14 = rsi(closes, 14).at(-1) ?? 50;
  const atr14 = atr(candles, 14).at(-1) ?? 0;
  const close = closes.at(-1) ?? 0;
  const atrPct = close ? (atr14 / close) * 100 : 0;

  const recent20 = candles.slice(-20);
  const support = Math.min(...recent20.map((c) => c.low));
  const resistance = Math.max(...recent20.map((c) => c.high));
  const nearLevel = Math.abs(close - support) / close <= 0.005 || Math.abs(close - resistance) / close <= 0.005;

  const todayVol = candles.at(-1)?.volume;
  const vol20 = recent20.map((c) => c.volume).filter((v): v is number => typeof v === "number");
  const volumeSpike = typeof todayVol === "number" && vol20.length >= 15
    ? todayVol > (vol20.reduce((a, b) => a + b, 0) / vol20.length) * 1.5
    : null;

  const prev20 = candles.slice(-21, -1);
  const prevHigh = Math.max(...prev20.map((c) => c.high));
  const prevLow = Math.min(...prev20.map((c) => c.low));
  const breakout = close > prevHigh;
  const breakdown = close < prevLow;

  let setupScore = 0;
  if (ema9 > ema21 || ema9 < ema21) setupScore += 20;
  if (rsi14 >= 40 && rsi14 <= 60) setupScore += 15;
  if (volumeSpike === true) setupScore += 15;
  if (breakout || breakdown) setupScore += 20;
  if (atrPct >= 0.8 && atrPct <= 3.5) setupScore += 15;
  if (nearLevel) setupScore += 15;

  return { rsi14, ema9, ema21, atr14, atrPct, support, resistance, nearLevel, volumeSpike, breakout, breakdown, setupScore };
}
