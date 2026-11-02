import React, { useState } from 'react';
import { DatabaseTables, SQLEngine, SQLQueryResult } from '../engine/sqlEngine';
import { PRODUCTION_SQL_SCRIPTS } from '../engine/kpiCalculator';
import { Terminal, Play, Download, Copy, Check, Database, AlertCircle } from 'lucide-react';

interface SQLExplorerViewProps {
  tables: DatabaseTables;
  sqlEngine: SQLEngine;
}

export const SQLExplorerView: React.FC<SQLExplorerViewProps> = ({ tables, sqlEngine }) => {
  const [activeTab, setActiveTab] = useState<'console' | 'schema'>('console');
  const [selectedScriptKey, setSelectedScriptKey] = useState<string>('OVERALL_KPIS');
  const [sqlQuery, setSqlQuery] = useState<string>(PRODUCTION_SQL_SCRIPTS.OVERALL_KPIS);
  const [queryResult, setQueryResult] = useState<SQLQueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleRunSQL = () => {
    setError(null);
    try {
      const res = sqlEngine.execute(sqlQuery);
      setQueryResult(res);
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  const handleSelectPrebuilt = (key: string) => {
    setSelectedScriptKey(key);
    const script = (PRODUCTION_SQL_SCRIPTS as any)[key];
    if (script) {
      setSqlQuery(script);
      setError(null);
      try {
        const res = sqlEngine.execute(script);
        setQueryResult(res);
      } catch (err: any) {
        setError(err.message || String(err));
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    if (!queryResult || queryResult.rows.length === 0) return;
    const cols = queryResult.columns;
    const header = cols.join(',');
    const body = queryResult.rows.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(',')).join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Quick-Commerce SQL Engine & CTE KPI Computations
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute ANSI SQL queries with Common Table Expressions (CTEs), multi-table JOINs, and Window Functions
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-md text-xs">
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1 font-medium rounded transition-colors cursor-pointer ${
                activeTab === 'console' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              SQL Editor
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1 font-medium rounded transition-colors cursor-pointer ${
                activeTab === 'schema' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Schema Inspector (6 Tables)
            </button>
          </div>
        </div>

        {activeTab === 'console' && (
          <div className="mt-4 space-y-3">
            {/* Prebuilt KPI Query Buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-mono mr-1">Pre-built KPI Queries:</span>
              <button
                onClick={() => handleSelectPrebuilt('OVERALL_KPIS')}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer border ${
                  selectedScriptKey === 'OVERALL_KPIS' 
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Core Operational KPIs (CTE)
              </button>
              <button
                onClick={() => handleSelectPrebuilt('HOURLY_PEAK_CONGESTION')}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer border ${
                  selectedScriptKey === 'HOURLY_PEAK_CONGESTION' 
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Hourly TAT & Rider Deficit
              </button>
              <button
                onClick={() => handleSelectPrebuilt('BHUBANESWAR_VS_SYSTEM')}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer border ${
                  selectedScriptKey === 'BHUBANESWAR_VS_SYSTEM' 
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Bhubaneswar Benchmark (Window Rank)
              </button>
              <button
                onClick={() => handleSelectPrebuilt('TOP_STOCKOUT_SKUS')}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer border ${
                  selectedScriptKey === 'TOP_STOCKOUT_SKUS' 
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Top 10 Stockout SKUs
              </button>
              <button
                onClick={() => handleSelectPrebuilt('CATEGORY_WASTAGE')}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer border ${
                  selectedScriptKey === 'CATEGORY_WASTAGE' 
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Category Wastage Cost
              </button>
            </div>

            {/* SQL Editor Area */}
            <div className="relative border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
                <span className="font-mono text-[11px]">sqlite3 · read_only_mode=true</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopy}
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleRunSQL}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>

              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={9}
                className="w-full bg-slate-950 p-3 text-xs font-mono text-emerald-400 focus:outline-none resize-y leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Schema Inspector Tab */}
        {activeTab === 'schema' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Table: orders */}
            <div className="bg-slate-800/60 p-3.5 rounded border border-slate-700/60">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700 mb-2">
                <span className="font-mono font-semibold text-white">orders</span>
                <span className="text-[10px] text-emerald-400 font-mono">{tables.orders.length.toLocaleString()} rows</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-400">
                <li>order_id: <span className="text-slate-300">TEXT (PK)</span></li>
                <li>store_id: <span className="text-slate-300">TEXT (FK)</span></li>
                <li>zone_id: <span className="text-slate-300">TEXT (FK)</span></li>
                <li>sku_id: <span className="text-slate-300">TEXT (FK)</span></li>
                <li>hour: <span className="text-slate-300">INTEGER (8..23)</span></li>
                <li>items_ordered: <span className="text-slate-300">INTEGER</span></li>
                <li>items_delivered: <span className="text-slate-300">INTEGER</span></li>
                <li>actual_delivery_mins: <span className="text-slate-300">REAL (TAT)</span></li>
                <li>is_late: <span className="text-slate-300">BOOLEAN</span></li>
                <li>status: <span className="text-slate-300">TEXT</span></li>
              </ul>
            </div>

            {/* Table: stores */}
            <div className="bg-slate-800/60 p-3.5 rounded border border-slate-700/60">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700 mb-2">
                <span className="font-mono font-semibold text-white">stores</span>
                <span className="text-[10px] text-emerald-400 font-mono">{tables.stores.length} rows</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-400">
                <li>store_id: <span className="text-slate-300">TEXT (PK)</span></li>
                <li>store_name: <span className="text-slate-300">TEXT</span></li>
                <li>city: <span className="text-slate-300">TEXT ('Bhubaneswar', etc.)</span></li>
                <li>hub_type: <span className="text-slate-300">TEXT</span></li>
                <li>capacity_orders_per_hr: <span className="text-slate-300">INTEGER</span></li>
              </ul>
            </div>

            {/* Table: zones */}
            <div className="bg-slate-800/60 p-3.5 rounded border border-slate-700/60">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700 mb-2">
                <span className="font-mono font-semibold text-white">zones</span>
                <span className="text-[10px] text-emerald-400 font-mono">{tables.zones.length} rows</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-400">
                <li>zone_id: <span className="text-slate-300">TEXT (PK)</span></li>
                <li>zone_name: <span className="text-slate-300">TEXT</span></li>
                <li>store_id: <span className="text-slate-300">TEXT (FK)</span></li>
                <li>avg_distance_km: <span className="text-slate-300">REAL</span></li>
                <li>traffic_congestion_index: <span className="text-slate-300">REAL</span></li>
              </ul>
            </div>

            {/* Table: skus */}
            <div className="bg-slate-800/60 p-3.5 rounded border border-slate-700/60">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700 mb-2">
                <span className="font-mono font-semibold text-white">skus</span>
                <span className="text-[10px] text-emerald-400 font-mono">{tables.skus.length} rows</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-400">
                <li>sku_id: <span className="text-slate-300">TEXT (PK)</span></li>
                <li>sku_name: <span className="text-slate-300">TEXT</span></li>
                <li>category: <span className="text-slate-300">TEXT</span></li>
                <li>shelf_life_days: <span className="text-slate-300">INTEGER</span></li>
                <li>unit_cost: <span className="text-slate-300">REAL (INR)</span></li>
                <li>unit_price: <span className="text-slate-300">REAL (INR)</span></li>
                <li>supplier_lead_time_days: <span className="text-slate-300">INTEGER</span></li>
              </ul>
            </div>

            {/* Table: inventory_snapshots */}
            <div className="bg-slate-800/60 p-3.5 rounded border border-slate-700/60">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700 mb-2">
                <span className="font-mono font-semibold text-white">inventory_snapshots</span>
                <span className="text-[10px] text-emerald-400 font-mono">{tables.inventory_snapshots.length.toLocaleString()} rows</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-400">
                <li>snapshot_id: <span className="text-slate-300">TEXT (PK)</span></li>
                <li>date: <span className="text-slate-300">TEXT (YYYY-MM-DD)</span></li>
                <li>store_id: <span className="text-slate-300">TEXT (FK)</span></li>
                <li>sku_id: <span className="text-slate-300">TEXT (FK)</span></li>
                <li>stock_on_hand: <span className="text-slate-300">INTEGER</span></li>
                <li>safety_stock: <span className="text-slate-300">INTEGER</span></li>
                <li>reorder_point: <span className="text-slate-300">INTEGER</span></li>
                <li>is_stockout: <span className="text-slate-300">BOOLEAN</span></li>
                <li>wastage_cost: <span className="text-slate-300">REAL</span></li>
              </ul>
            </div>

            {/* Table: rider_availability */}
            <div className="bg-slate-800/60 p-3.5 rounded border border-slate-700/60">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700 mb-2">
                <span className="font-mono font-semibold text-white">rider_availability</span>
                <span className="text-[10px] text-emerald-400 font-mono">{tables.rider_availability.length.toLocaleString()} rows</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-400">
                <li>record_id: <span className="text-slate-300">TEXT (PK)</span></li>
                <li>date: <span className="text-slate-300">TEXT</span></li>
                <li>hour: <span className="text-slate-300">INTEGER (8..23)</span></li>
                <li>zone_id: <span className="text-slate-300">TEXT (FK)</span></li>
                <li>active_riders: <span className="text-slate-300">INTEGER</span></li>
                <li>required_riders: <span className="text-slate-300">INTEGER</span></li>
                <li>rider_deficit: <span className="text-slate-300">INTEGER</span></li>
                <li>rider_utilization: <span className="text-slate-300">REAL</span></li>
                <li>weather_condition: <span className="text-slate-300">TEXT</span></li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Error Card */}
      {error && (
        <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-4 text-xs text-red-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-200">Execution Error</div>
            <div className="font-mono mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Query Result Grid */}
      {queryResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-sm text-white">Query Result Set</h3>
              <span className="text-[11px] text-emerald-400 font-mono">
                {queryResult.rowCount} rows · {queryResult.executionTimeMs}ms
              </span>
            </div>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors cursor-pointer border border-slate-700/60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-700 sticky top-0">
                <tr>
                  {queryResult.columns.map((col, idx) => (
                    <th key={idx} className="px-3 py-2.5">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {queryResult.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                    {queryResult.columns.map((col, cIdx) => (
                      <td 
                        key={cIdx} 
                        className={`px-3 py-2 ${typeof row[col] === 'number' ? 'text-right font-mono tabular-nums text-emerald-400' : 'text-slate-200'}`}
                      >
                        {row[col] !== undefined && row[col] !== null ? String(row[col]) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
