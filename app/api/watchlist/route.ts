import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.watchlistItem.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.watchlistItem.create({
    data: { assetType: body.assetType, symbol: body.symbol.toUpperCase() }
  });
  return NextResponse.json(item);
}
