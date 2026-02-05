"use client";
import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function BacktestPage() {
  const [form, setForm] = useState({ type: "stock", symbol: "AAPL", strategy: "Breakout", days: 365 });
  const [result, setResult] = useState<any>(null);
  return (
    <div className="space-y-4">
      <div className="card grid gap-2 md:grid-cols-4">
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded border bg-transparent p-2"><option value="stock">Stock</option><option value="crypto">Crypto</option></select>
        <input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })} className="rounded border bg-transparent p-2" />
        <select value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} className="rounded border bg-transparent p-2"><option>Breakout</option><option>Pullback</option><option>Mean Reversion</option></select>
        <input type="number" value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} className="rounded border bg-transparent p-2" />
        <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={async () => {
          const res = await fetch("/api/backtest", { method: "POST", body: JSON.stringify(form) });
          setResult(await res.json());
        }}>Run Backtest</button>
      </div>
      {result && (
        <>
          <div className="grid gap-2 md:grid-cols-4">
            <div className="card">Trades: {result.trades}</div>
            <div className="card">Win rate: {result.winRate.toFixed(2)}%</div>
            <div className="card">Avg return: {result.avgReturn.toFixed(2)}R</div>
            <div className="card">Max DD: {result.maxDrawdown.toFixed(2)}%</div>
          </div>
          <div className="card h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.equityCurve}>
                <XAxis dataKey="idx" /><YAxis /><Tooltip />
                <Line type="monotone" dataKey="equity" stroke="#3b82f6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
