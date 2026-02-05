import OpenAI from "openai";
import { Candle } from "./types";
import { computeIndicators } from "./indicators";

export type PlanInput = {
  strategy: "Breakout" | "Pullback" | "Mean Reversion";
  risk: "Low" | "Med" | "High";
  accountSize?: number;
  riskPct: number;
  longOnly: boolean;
};

export async function buildPlan(candles: Candle[], input: PlanInput) {
  const i = computeIndicators(candles);
  const close = candles.at(-1)?.close ?? 0;
  const m = input.risk === "Low" ? 1 : input.risk === "Med" ? 1.5 : 2;
  const stopDistance = i.atr14 * m;
  let entry = close;
  let stop = close - stopDistance;
  let side: "LONG" | "SHORT" = "LONG";
  let targets: number[] = [];

  if (input.strategy === "Breakout") {
    entry = i.resistance * 1.002;
    stop = entry - stopDistance;
    targets = [entry + stopDistance * 1.5, entry + stopDistance * 2.5, entry + stopDistance * 4];
  } else if (input.strategy === "Pullback") {
    const midpoint = (i.ema9 + i.ema21) / 2;
    entry = Math.abs(i.ema21 - close) <= Math.abs(midpoint - close) ? i.ema21 : midpoint;
    stop = entry - stopDistance;
    targets = [entry + stopDistance * 1.2, entry + stopDistance * 2, entry + stopDistance * 3];
  } else {
    if (!input.longOnly && i.rsi14 > 65) {
      side = "SHORT";
      entry = close;
      stop = entry + stopDistance;
      targets = [i.ema21, i.support].sort((a, b) => b - a);
    } else {
      entry = close;
      stop = entry - stopDistance;
      targets = [i.ema21, i.resistance].sort((a, b) => a - b);
    }
  }

  const rr = Math.abs((targets[0] - entry) / (entry - stop));
  const riskDollars = input.accountSize ? input.accountSize * (input.riskPct / 100) : undefined;
  const qty = riskDollars ? Math.max(0, riskDollars / Math.abs(entry - stop)) : undefined;

  return {
    indicators: i,
    entryZone: [entry * 0.999, entry * 1.001],
    stop,
    targets,
    rr,
    qty,
    side,
    explanation: await generateExplanation(input, i, rr)
  };
}

async function generateExplanation(input: PlanInput, indicators: ReturnType<typeof computeIndicators>, rr: number) {
  const disclaimer = "Educational only. Not financial advice. Paper trading only.";
  if (!process.env.OPENAI_API_KEY) {
    return `This ${input.strategy} plan uses ATR-based risk control with ${input.risk} risk and ${input.riskPct.toFixed(2)}% risk per trade. RSI is ${indicators.rsi14.toFixed(1)}, EMA9 is ${indicators.ema9.toFixed(2)}, and EMA21 is ${indicators.ema21.toFixed(2)}. Support is ${indicators.support.toFixed(2)} and resistance is ${indicators.resistance.toFixed(2)}. ATR% is ${indicators.atrPct.toFixed(2)} and setup score is ${indicators.setupScore}/100. Estimated reward-to-risk is ${rr.toFixed(2)}R. This is a deterministic educational simulation and outcomes are uncertain. ${disclaimer}`;
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `Write 6-10 concise sentences explaining a ${input.strategy} paper-trade plan. Mention: RSI ${indicators.rsi14.toFixed(1)}, EMA9 ${indicators.ema9.toFixed(2)}, EMA21 ${indicators.ema21.toFixed(2)}, ATR% ${indicators.atrPct.toFixed(2)}, setup score ${indicators.setupScore}, estimated RR ${rr.toFixed(2)}. Must include uncertainty and this exact phrase: ${disclaimer}. Never guarantee profits.`;
  const r = await client.responses.create({ model: "gpt-4o-mini", input: prompt });
  return r.output_text || `AI explanation unavailable. ${disclaimer}`;
}
