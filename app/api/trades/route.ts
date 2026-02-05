import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLatestPrice } from "@/lib/market";

export async function GET() {
  const trades = await prisma.trade.findMany({ orderBy: { openedAt: "desc" } });
  return NextResponse.json(trades);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const trade = await prisma.trade.create({
    data: {
      assetType: body.assetType,
      symbol: body.symbol.toUpperCase(),
      strategy: body.strategy,
      side: body.side || "LONG",
      entry: Number(body.entry),
      stop: Number(body.stop),
      targetsJson: JSON.stringify(body.targets || []),
      qty: Number(body.qty || 0),
      openPrice: Number(body.openPrice || body.entry)
    }
  });
  return NextResponse.json(trade);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if (body.action === "close") {
    const existing = await prisma.trade.findUnique({ where: { id: Number(body.id) } });
    if (!existing) return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    const closePrice = await getLatestPrice(existing.assetType.toLowerCase() as "stock" | "crypto", existing.symbol);
    const pnl = (closePrice - existing.openPrice) * existing.qty * (existing.side === "SHORT" ? -1 : 1);
    const pnlPct = ((closePrice - existing.openPrice) / existing.openPrice) * 100 * (existing.side === "SHORT" ? -1 : 1);
    const updated = await prisma.trade.update({
      where: { id: existing.id },
      data: { status: "CLOSED", closePrice, closedAt: new Date(), pnl, pnlPct }
    });
    return NextResponse.json(updated);
  }

  const updated = await prisma.trade.update({
    where: { id: Number(body.id) },
    data: {
      strategy: body.strategy,
      stop: body.stop ? Number(body.stop) : undefined,
      qty: body.qty ? Number(body.qty) : undefined
    }
  });
  return NextResponse.json(updated);
}
