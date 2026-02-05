"use client";
import { useState } from "react";

export default function PlanPage() {
  const [form, setForm] = useState({ type: "stock", symbol: "AAPL", strategy: "Breakout", risk: "Med", accountSize: "", riskPct: "1", longOnly: true });
  const [plan, setPlan] = useState<any>(null);

  return (
    <div className="space-y-4">
      <div className="card grid gap-2 md:grid-cols-3">
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded border bg-transparent p-2"><option value="stock">Stock</option><option value="crypto">Crypto</option></select>
        <input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })} className="rounded border bg-transparent p-2" />
        <select value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} className="rounded border bg-transparent p-2"><option>Breakout</option><option>Pullback</option><option>Mean Reversion</option></select>
        <select value={form.risk} onChange={(e) => setForm({ ...form, risk: e.target.value })} className="rounded border bg-transparent p-2"><option>Low</option><option>Med</option><option>High</option></select>
        <input placeholder="Account Size" value={form.accountSize} onChange={(e) => setForm({ ...form, accountSize: e.target.value })} className="rounded border bg-transparent p-2" />
        <input placeholder="Risk %" value={form.riskPct} onChange={(e) => setForm({ ...form, riskPct: e.target.value })} className="rounded border bg-transparent p-2" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.longOnly} onChange={(e) => setForm({ ...form, longOnly: e.target.checked })} />Long-only mode</label>
        <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={async () => {
          const res = await fetch("/api/plan", { method: "POST", body: JSON.stringify(form) });
          setPlan(await res.json());
        }}>Generate Plan</button>
      </div>

      {plan && (
        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">Trade Plan</h2>
          <p>Entry zone: {plan.entryZone[0].toFixed(2)} - {plan.entryZone[1].toFixed(2)}</p>
          <p>Stop loss: {plan.stop.toFixed(2)}</p>
          <p>Targets: {plan.targets.map((t: number) => t.toFixed(2)).join(", ")}</p>
          <p>Estimated R:R: {plan.rr.toFixed(2)}</p>
          <p>Suggested qty: {plan.qty ? plan.qty.toFixed(2) : "N/A"}</p>
          <p className="text-sm opacity-90">{plan.explanation}</p>
          <button className="rounded bg-emerald-600 px-3 py-2 text-white" onClick={async () => {
            await fetch("/api/trades", { method: "POST", body: JSON.stringify({
              assetType: form.type.toUpperCase(),
              symbol: form.symbol,
              strategy: form.strategy,
              side: plan.side,
              entry: plan.entryZone[1],
              stop: plan.stop,
              targets: plan.targets,
              qty: plan.qty || 1,
              openPrice: plan.entryZone[1]
            })});
            alert("Paper trade created");
          }}>Create Paper Trade</button>
        </div>
      )}
    </div>
  );
}
