"use client";
import { useEffect, useMemo, useState } from "react";

export default function PaperPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");

  const load = () => fetch("/api/trades").then((r) => r.json()).then(setTrades);
  useEffect(() => { load(); }, []);

  const filtered = trades.filter((t) => (status === "ALL" || t.status === status) && (type === "ALL" || t.assetType === type));
  const stats = useMemo(() => {
    const closed = trades.filter((t) => t.status === "CLOSED");
    const wins = closed.filter((t) => (t.pnl || 0) > 0);
    const losses = closed.filter((t) => (t.pnl || 0) <= 0);
    const sum = (arr: any[], key: string) => arr.reduce((a, b) => a + (b[key] || 0), 0);
    return {
      winRate: closed.length ? (wins.length / closed.length) * 100 : 0,
      avgWin: wins.length ? sum(wins, "pnl") / wins.length : 0,
      avgLoss: losses.length ? sum(losses, "pnl") / losses.length : 0,
      total: sum(closed, "pnl"),
      best: Math.max(0, ...closed.map((c) => c.pnl || 0)),
      worst: Math.min(0, ...closed.map((c) => c.pnl || 0))
    };
  }, [trades]);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-6">
        {Object.entries(stats).map(([k, v]) => <div key={k} className="card"><p className="text-xs uppercase">{k}</p><p className="text-lg font-semibold">{typeof v === "number" ? v.toFixed(2) : v}</p></div>)}
      </div>
      <div className="card flex gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border bg-transparent p-2"><option>ALL</option><option>OPEN</option><option>CLOSED</option></select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded border bg-transparent p-2"><option>ALL</option><option>STOCK</option><option>CRYPTO</option></select>
      </div>
      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>Symbol</th><th>Type</th><th>Status</th><th>Entry</th><th>Qty</th><th>P/L</th><th /></tr></thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-zinc-800/20">
                <td>{t.symbol}</td><td>{t.assetType}</td><td>{t.status}</td><td>{t.entry.toFixed(2)}</td><td>{t.qty}</td><td>{(t.pnl ?? 0).toFixed(2)} ({(t.pnlPct ?? 0).toFixed(2)}%)</td>
                <td>{t.status === "OPEN" && <button className="rounded bg-blue-600 px-2 py-1 text-white" onClick={async () => { await fetch("/api/trades", { method: "PATCH", body: JSON.stringify({ id: t.id, action: "close" }) }); load(); }}>Close</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
