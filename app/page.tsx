"use client";
import { useEffect, useMemo, useState } from "react";

type Watch = { id: number; assetType: "STOCK" | "CRYPTO"; symbol: string };

export default function DashboardPage() {
  const [items, setItems] = useState<Watch[]>([]);
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<any>(null);
  const [symbol, setSymbol] = useState("");
  const [assetType, setAssetType] = useState<"STOCK" | "CRYPTO">("STOCK");

  useEffect(() => {
    fetch("/api/watchlist").then((r) => r.json()).then((d) => {
      setItems(d);
      localStorage.setItem("watchlist-cache", JSON.stringify(d));
    }).catch(() => {
      const cache = localStorage.getItem("watchlist-cache");
      if (cache) setItems(JSON.parse(cache));
    });
  }, []);

  useEffect(() => {
    items.forEach((i) => {
      fetch(`/api/indicators?type=${i.assetType.toLowerCase()}&symbol=${i.symbol}`)
        .then((r) => r.json())
        .then((d) => setMetrics((m: any) => ({ ...m, [i.symbol]: d }))
      );
    });
  }, [items]);

  const sorted = useMemo(() => items, [items]);

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap gap-2">
        <select value={assetType} onChange={(e) => setAssetType(e.target.value as any)} className="rounded border bg-transparent p-2">
          <option value="STOCK">Stock</option>
          <option value="CRYPTO">Crypto</option>
        </select>
        <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="AAPL or BTC" className="rounded border bg-transparent p-2" />
        <button
          className="rounded bg-blue-600 px-3 py-2 text-white"
          onClick={async () => {
            if (!symbol) return;
            await fetch("/api/watchlist", { method: "POST", body: JSON.stringify({ assetType, symbol }) });
            setItems((prev) => [...prev, { id: Date.now(), assetType, symbol } as Watch]);
            setSymbol("");
          }}
        >Add</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((item) => {
          const m = metrics[item.symbol];
          return (
            <button key={`${item.symbol}-${item.assetType}`} className="card text-left" onClick={() => setSelected(m)}>
              <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{item.symbol}</h3><span className="text-xs opacity-75">{item.assetType}</span></div>
              <p>Price: {m?.price?.toFixed?.(2) ?? "..."}</p>
              <p>Daily %: {m?.changePct?.toFixed?.(2) ?? "..."}%</p>
              <p>RSI: {m?.indicators?.rsi14?.toFixed?.(1) ?? "..."}</p>
              <p>EMA9 / EMA21: {m?.indicators?.ema9?.toFixed?.(2) ?? "..."} / {m?.indicators?.ema21?.toFixed?.(2) ?? "..."}</p>
              <p>ATR%: {m?.indicators?.atrPct?.toFixed?.(2) ?? "..."}%</p>
              <p>Support/Resistance: {m?.indicators?.support?.toFixed?.(2) ?? "..."} / {m?.indicators?.resistance?.toFixed?.(2) ?? "..."}</p>
              <p>Volume Spike: {m?.indicators?.volumeSpike === null ? "N/A" : String(m?.indicators?.volumeSpike)}</p>
              <p className="mt-2 inline-block rounded bg-emerald-600 px-2 py-1 text-xs text-white">Setup Score {m?.indicators?.setupScore ?? "..."}</p>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-30 bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="mx-auto mt-10 max-w-lg rounded-xl bg-panel p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-xl font-semibold">{selected.symbol} details</h3>
            <pre className="max-h-80 overflow-auto text-xs">{JSON.stringify(selected, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
