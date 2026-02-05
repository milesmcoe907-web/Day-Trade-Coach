import { NextRequest, NextResponse } from "next/server";
import { getCandles } from "@/lib/market";
import { computeIndicators } from "@/lib/indicators";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "stock") as "stock" | "crypto";
    const symbol = (searchParams.get("symbol") || "AAPL").toUpperCase();
    const candles = await getCandles(type, symbol, 120);
    const indicators = computeIndicators(candles);
    const last = candles.at(-1);
    const prev = candles.at(-2);
    const changePct = prev ? ((last!.close - prev.close) / prev.close) * 100 : 0;
    return NextResponse.json({
      symbol,
      type,
      price: last?.close,
      changePct,
      indicators
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
