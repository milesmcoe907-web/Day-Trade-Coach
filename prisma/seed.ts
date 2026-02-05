import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const defaults = [
    { assetType: "STOCK", symbol: "AAPL" },
    { assetType: "STOCK", symbol: "TSLA" },
    { assetType: "STOCK", symbol: "SPY" },
    { assetType: "CRYPTO", symbol: "BTC" },
    { assetType: "CRYPTO", symbol: "ETH" }
  ] as const;

  await prisma.watchlistItem.deleteMany({});
  await prisma.watchlistItem.createMany({ data: defaults.map((d) => ({ ...d })) });
}

main().finally(() => prisma.$disconnect());
