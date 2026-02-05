export type AssetType = "stock" | "crypto";

export type Candle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type Indicators = {
  rsi14: number;
  ema9: number;
  ema21: number;
  atr14: number;
  atrPct: number;
  support: number;
  resistance: number;
  nearLevel: boolean;
  volumeSpike: boolean | null;
  breakout: boolean;
  breakdown: boolean;
  setupScore: number;
};
