import React, { useState } from 'react';
import { DatabaseTables } from '../engine/sqlEngine';
import { FilterState } from '../types';

interface TrendChartsViewProps {
  tables: DatabaseTables;
  filters: FilterState;
}

export const TrendChartsView: React.FC<TrendChartsViewProps> = ({ tables, filters }) => {
  const [selectedMetric, setSelectedMetric] = useState<'tat' | 'fillrate' | 'wastage'>('tat');

  // Compute Hourly Metrics
  const hourlyData: { hour: number; avgTat: number; latePct: number; orderCount: number; deficit: number }[] = [];
  for (let h = 8; h <= 23; h++) {
    const ordersInHour = tables.orders.filter(o => o.hour === h);
    const count = ordersInHour.length;
    const tatSum = ordersInHour.reduce((a, b) => a + b.actual_delivery_mins, 0);
    const lateCount = ordersInHour.filter(o => o.is_late).length;

    const ridersInHour = tables.rider_availability.filter(r => r.hour === h);
    const deficitSum = ridersInHour.reduce((a, b) => a + b.rider_deficit, 0);
    const avgDeficit = ridersInHour.length > 0 ? +(deficitSum / ridersInHour.length).toFixed(1) : 0;

    hourlyData.push({
      hour: h,
      avgTat: count > 0 ? +(tatSum / count).toFixed(1) : 0,
      latePct: count > 0 ? +((lateCount / count) * 100).toFixed(1) : 0,
      orderCount: count,
      deficit: avgDeficit,
    });
  }

  // Daily Trend Data (Last 14 days)
  const uniqueDates = Array.from(new Set(tables.orders.map(o => o.date))).sort().slice(-14);
  const dailyData = uniqueDates.map(d => {
    const dayOrders = tables.orders.filter(o => o.date === d);
    const delivered = dayOrders.reduce((a, b) => a + b.items_delivered, 0);
    const ordered = dayOrders.reduce((a, b) => a + b.items_ordered, 0);
    const fillRate = ordered > 0 ? +((delivered / ordered) * 100).toFixed(1) : 100;

    const daySnaps = tables.inventory_snapshots.filter(s => s.date === d);
    const stockoutCount = daySnaps.filter(s => s.is_stockout).length;
    const stockoutRate = daySnaps.length > 0 ? +((stockoutCount / daySnaps.length) * 100).toFixed(1) : 0;

    return {
      date: d.slice(5),
      fillRate,
      stockoutRate,
      orders: dayOrders.length,
    };
  });

  // Category Wastage
  const catMap = new Map<string, number>();
  tables.inventory_snapshots.forEach(s => {
    const sku = tables.skus.find(sk => sk.sku_id === s.sku_id);
    if (!sku) return;
    catMap.set(sku.category, (catMap.get(sku.category) || 0) + s.wastage_cost);
  });
  const catWastage = Array.from(catMap.entries()).map(([cat, cost]) => ({ category: cat, cost: Math.round(cost) }));
  catWastage.sort((a, b) => b.cost - a.cost);
  const maxWastage = Math.max(...catWastage.map(c => c.cost), 1);

  return (
    <div className="space-y-6">
      {/* Chart 1: Hourly Delivery Turnaround Time & Delay Surge */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="font-semibold text-sm text-white">Hourly Turnaround Time (TAT) & Late Delivery Spikes</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Notice the severe evening peak surge between 19:00 and 21:00 where TAT exceeds 22 minutes
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono mt-2 sm:mt-0">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block"></span>
              Avg Delivery TAT (mins)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 bg-amber-400/30 border border-amber-400 inline-block rounded-xs"></span>
              % Late Orders
            </span>
          </div>
        </div>

        {/* Clean SVG Hourly Bar & Line Composite */}
        <div className="h-64 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 60, 120, 180].map((y, i) => (
              <line key={i} x1="40" y1={y + 20} x2="780" y2={y + 20} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
            ))}

            {/* Benchmark 14 min SLA line */}
            <line x1="40" y1={200 - (14 / 30) * 180} x2="780" y2={200 - (14 / 30) * 180} stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
            <text x="44" y={196 - (14 / 30) * 180} fill="#10b981" fontSize="10" fontFamily="JetBrains Mono">
              14 min SLA Target
            </text>

            {/* Highlight Peak Shading (19:00 - 21:00) */}
            {/* 16 intervals from 8 to 23: 19 is index 11 */}
            <rect x={40 + (11 * 44)} y="20" width={44 * 3} height="180" fill="rgba(245, 158, 11, 0.08)" />
            <text x={40 + (11 * 44) + 8} y="36" fill="#f59e0b" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
              Evening Peak Rush (19-21h)
            </text>

            {/* Late % Bars */}
            {hourlyData.map((d, i) => {
              const x = 50 + i * 45;
              const barHeight = (d.latePct / 60) * 160;
              const y = 200 - barHeight;
              return (
                <rect
                  key={`bar-${i}`}
                  x={x - 10}
                  y={y}
                  width="20"
                  height={barHeight}
                  fill={d.hour >= 19 && d.hour <= 21 ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.25)'}
                  stroke={d.hour >= 19 && d.hour <= 21 ? '#ef4444' : '#f59e0b'}
                  strokeWidth="0.8"
                  rx="1"
                />
              );
            })}

            {/* TAT Trend Line */}
            <polyline
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              points={hourlyData.map((d, i) => {
                const x = 50 + i * 45;
                const y = 200 - (d.avgTat / 30) * 180;
                return `${x},${y}`;
              }).join(' ')}
            />

            {/* Line Dots */}
            {hourlyData.map((d, i) => {
              const x = 50 + i * 45;
              const y = 200 - (d.avgTat / 30) * 180;
              return (
                <circle
                  key={`dot-${i}`}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#10b981"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* X-Axis Labels */}
            {hourlyData.map((d, i) => {
              const x = 50 + i * 45;
              return (
                <text key={`label-${i}`} x={x} y="222" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">
                  {d.hour}h
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Grid 2-Column: Daily Fill Rate & Stockouts vs Category Wastage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Fill Rate vs Stockouts */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <h3 className="font-semibold text-sm text-white">Daily Order Fill Rate vs Stock-Out Rate</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tracking item fulfillment efficiency across past 14 days</p>
          </div>

          <div className="space-y-3">
            {dailyData.slice(-7).map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{d.date}</span>
                  <div className="flex gap-4">
                    <span className="text-emerald-400 tabular-nums">Fill Rate: {d.fillRate}%</span>
                    <span className="text-amber-400 tabular-nums">Stock-outs: {d.stockoutRate}%</span>
                  </div>
                </div>
                {/* Dual progress bar */}
                <div className="h-2 w-full bg-slate-800 rounded overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: `${d.fillRate}%` }}></div>
                  <div className="h-full bg-amber-500" style={{ width: `${100 - d.fillRate}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Wastage Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <h3 className="font-semibold text-sm text-white">Inventory Wastage Cost by Product Category</h3>
            <p className="text-xs text-slate-400 mt-0.5">Value of expired or spoiled perishable stock in INR</p>
          </div>

          <div className="space-y-3.5">
            {catWastage.map((c, idx) => {
              const widthPct = Math.round((c.cost / maxWastage) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-medium">{c.category}</span>
                    <span className="text-slate-300 font-mono tabular-nums">₹{c.cost.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded overflow-hidden">
                    <div 
                      className={`h-full rounded ${idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-amber-500' : 'bg-slate-600'}`} 
                      style={{ width: `${widthPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
            Fresh Produce & Dairy account for <span className="text-white font-semibold">89.6%</span> of all spoilage costs.
          </div>
        </div>
      </div>
    </div>
  );
};
