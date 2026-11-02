import React, { useState } from 'react';
import { DatabaseTables } from '../engine/sqlEngine';
import { computeDemandForecast } from '../engine/forecastingEngine';
import { TrendingUp, AlertCircle, ShieldAlert, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface ForecastingViewProps {
  tables: DatabaseTables;
}

export const ForecastingView: React.FC<ForecastingViewProps> = ({ tables }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Dairy & Bread');
  const [selectedSkuId, setSelectedSkuId] = useState<string>('');

  const forecastData = computeDemandForecast(tables, selectedCategory, selectedSkuId || undefined);
  const { points, metrics, inventoryRecommendations, categorySummaries } = forecastData;

  const categories = Array.from(new Set(tables.skus.map(s => s.category)));
  const categorySkus = tables.skus.filter(s => s.category === selectedCategory);

  // Separate train and test points for summary
  const trainPoints = points.filter(p => !p.isTestSet);
  const testPoints = points.filter(p => p.isTestSet);

  // Peak actual value for scaling chart
  const maxVal = Math.max(...points.map(p => Math.max(p.actual || 0, p.prophetForecast, p.movingAverage || 0)), 50);

  return (
    <div className="space-y-6">
      {/* 1. Header & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Demand Forecasting & Inventory Optimization
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluating 7-Day Moving Average Baseline vs Prophet Additive Model using Out-of-Sample WAPE
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Category Slice</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSkuId('');
                }}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Drill-Down SKU</label>
              <select
                value={selectedSkuId}
                onChange={(e) => setSelectedSkuId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="">Aggregate Category Demand</option>
                {categorySkus.map(s => (
                  <option key={s.sku_id} value={s.sku_id}>{s.sku_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Model Performance Benchmarks: MA Baseline vs Prophet WAPE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-slate-800/60 p-3.5 rounded border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">Moving Average Baseline WAPE</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-slate-300 tabular-nums">
                {metrics.movingAverageWAPE}%
              </span>
              <span className="text-[11px] text-slate-500">7-Day window</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">MAE: {metrics.movingAverageMAE} units</span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded border border-emerald-500/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-emerald-400 font-semibold">Prophet Additive WAPE</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded font-mono">Best Model</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {metrics.prophetWAPE}%
              </span>
              <span className="text-[11px] text-emerald-300">
                ({(metrics.movingAverageWAPE - metrics.prophetWAPE).toFixed(1)}% error reduction)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">MAE: {metrics.prophetMAE} units</span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">Train / Test Split Window</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {metrics.trainSampleSize}d / {metrics.testSampleSize}d
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">75% Train (21d) · 25% Test (7d)</span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">Additive Components</span>
            <span className="text-xs font-semibold text-slate-200 block truncate font-mono">
              g(t) + s(dow) + h(rain)
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">Trend + Day-of-Week Seasonality</span>
          </div>
        </div>
      </div>

      {/* 3. Time Series Forecast Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="font-semibold text-sm text-white">
              Daily Demand Trajectory: Actuals vs Baseline vs Prophet Forecast
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dotted vertical boundary demarcates the time-based Train / Test evaluation split
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono mt-2 sm:mt-0">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 bg-slate-400 rounded-full inline-block"></span>
              Actual Demand
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 bg-slate-400 inline-block"></span>
              MA-7 Baseline
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block"></span>
              Prophet Model
            </span>
          </div>
        </div>

        {/* SVG Time Series Plot */}
        <div className="h-64 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 60, 120, 180].map((y, i) => (
              <line key={i} x1="40" y1={y + 20} x2="780" y2={y + 20} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
            ))}

            {/* Train / Test partition divider at 21st date out of 28 */}
            {/* 28 points: index 21 x = 40 + (21 / 27) * 740 = 615 */}
            <line x1="615" y1="20" x2="615" y2="200" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" />
            <rect x="615" y="20" width="165" height="180" fill="rgba(245, 158, 11, 0.05)" />
            <text x="625" y="36" fill="#f59e0b" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
              Out-of-Sample Test (7d)
            </text>

            {/* Prophet Confidence Corridor Area on Test Set */}
            <polygon
              fill="rgba(16, 185, 129, 0.12)"
              points={
                points.map((p, i) => {
                  const x = 40 + (i / (points.length - 1)) * 740;
                  const y = 200 - (p.upperConfidence / maxVal) * 170;
                  return `${x},${y}`;
                }).join(' ') + ' ' +
                [...points].reverse().map((p, i) => {
                  const originalIdx = points.length - 1 - i;
                  const x = 40 + (originalIdx / (points.length - 1)) * 740;
                  const y = 200 - (p.lowerConfidence / maxVal) * 170;
                  return `${x},${y}`;
                }).join(' ')
              }
            />

            {/* 7-day Moving Average Baseline Line */}
            <polyline
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              points={points.map((p, i) => {
                const x = 40 + (i / (points.length - 1)) * 740;
                const y = 200 - ((p.movingAverage || 0) / maxVal) * 170;
                return `${x},${y}`;
              }).join(' ')}
            />

            {/* Prophet Forecast Line */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              points={points.map((p, i) => {
                const x = 40 + (i / (points.length - 1)) * 740;
                const y = 200 - (p.prophetForecast / maxVal) * 170;
                return `${x},${y}`;
              }).join(' ')}
            />

            {/* Actual Demand Dots */}
            {points.map((p, i) => {
              const x = 40 + (i / (points.length - 1)) * 740;
              const y = 200 - ((p.actual || 0) / maxVal) * 170;
              return (
                <circle
                  key={`dot-${i}`}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill={p.isTestSet ? '#f59e0b' : '#cbd5e1'}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Date ticks on X-axis */}
            {points.filter((_, i) => i % 4 === 0 || i === points.length - 1).map((p, i, arr) => {
              const originalIdx = points.findIndex(pt => pt.date === p.date);
              const x = 40 + (originalIdx / (points.length - 1)) * 740;
              return (
                <text key={`tick-${i}`} x={x} y="222" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">
                  {p.date.slice(5)}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 4. Inventory Optimization Logic & Risk Action Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="pb-3 border-b border-slate-800 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm text-white">
              Inventory Optimization: Dynamic Safety Stock & Reorder Points
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Fed by Prophet 7-day lookahead demand with 95% service level buffer ($SS = Z \times \sigma_L$)
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40 self-start md:self-auto">
            Formula: ROP = (Demand × LeadTime) + Z·√(L·σ_D² + D²·σ_L²)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-3 py-2.5">SKU Name</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5 text-right">Current Stock</th>
                <th className="px-3 py-2.5 text-right">Daily Demand</th>
                <th className="px-3 py-2.5 text-right">Safety Stock</th>
                <th className="px-3 py-2.5 text-right">Reorder Point (ROP)</th>
                <th className="px-3 py-2.5 text-right">Days of Inventory</th>
                <th className="px-3 py-2.5">Status & Action</th>
                <th className="px-3 py-2.5 text-right">Recommended PO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {inventoryRecommendations.map((rec) => {
                const isCritical = rec.status === 'Critical Stockout';
                const isReorder = rec.status === 'Reorder Now';
                const isNearExpiry = rec.status === 'Near Expiry Risk';
                const isSlow = rec.status === 'Slow Moving Drag';

                return (
                  <tr key={rec.sku_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-white">
                      <div>{rec.sku_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{rec.sku_id} · Shelf: {rec.remainingShelfLifeDays}d</div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">
                      {rec.category}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                      <span className={isCritical ? 'text-red-400 font-bold' : isReorder ? 'text-amber-400 font-semibold' : 'text-slate-200'}>
                        {rec.currentStock}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-300">
                      {rec.avgDailyDemand}/d
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-300">
                      {rec.safetyStock}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                      {rec.reorderPoint}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                      <span className={rec.daysOfInventory <= 1 ? 'text-red-400' : 'text-slate-300'}>
                        {rec.daysOfInventory}d
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {isCritical ? (
                        <span className="text-red-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Stockout Hazard
                        </span>
                      ) : isReorder ? (
                        <span className="text-amber-400 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Below ROP
                        </span>
                      ) : isNearExpiry ? (
                        <span className="text-purple-400 font-medium flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Expiry in &le;{rec.remainingShelfLifeDays}d
                        </span>
                      ) : isSlow ? (
                        <span className="text-slate-400">Slow Moving Drag</span>
                      ) : (
                        <span className="text-emerald-400/90 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Optimal
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                      {rec.recommendedOrderQty > 0 ? (
                        <span className="text-emerald-400 font-bold">
                          +{rec.recommendedOrderQty} units
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
