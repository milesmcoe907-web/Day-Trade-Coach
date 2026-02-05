import { NextRequest, NextResponse } from "next/server";
import { getCandles } from "@/lib/market";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "stock") as "stock" | "crypto";
    const symbol = (searchParams.get("symbol") || "AAPL").toUpperCase();
    const days = Number(searchParams.get("days") || "120");
    const candles = await getCandles(type, symbol, days);
    return NextResponse.json({ candles });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
