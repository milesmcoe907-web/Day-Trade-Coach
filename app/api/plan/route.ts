import { NextRequest, NextResponse } from "next/server";
import { getCandles } from "@/lib/market";
import { buildPlan } from "@/lib/plan";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candles = await getCandles(body.type, body.symbol, 180);
    const plan = await buildPlan(candles, {
      strategy: body.strategy,
      risk: body.risk,
      accountSize: body.accountSize ? Number(body.accountSize) : undefined,
      riskPct: Number(body.riskPct || 1),
      longOnly: body.longOnly !== false
    });
    return NextResponse.json(plan);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
