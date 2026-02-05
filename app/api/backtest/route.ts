import { NextRequest, NextResponse } from "next/server";
import { getCandles } from "@/lib/market";
import { runBacktest } from "@/lib/backtest";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candles = await getCandles(body.type, body.symbol, Number(body.days || 365));
    const result = runBacktest(candles, body.strategy);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
