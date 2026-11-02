import React from 'react';
import { Clock, AlertCircle, CheckCircle, PackageX, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { OperationalKPIs } from '../types';

interface KPITilesProps {
  kpis: OperationalKPIs;
  isPeakHoursActive: boolean;
}

export const KPITiles: React.FC<KPITilesProps> = ({ kpis, isPeakHoursActive }) => {
  // Target benchmarks in Quick-Commerce operations
  const BENCHMARKS = {
    tatTarget: 14.0, // minutes
    lateRateTarget: 15.0, // %
    fillRateTarget: 97.5, // %
    stockoutTarget: 5.0, // %
  };

  const isTatBreached = kpis.avgDeliveryTAT > BENCHMARKS.tatTarget;
  const isLateRateBreached = kpis.lateOrdersPercent > BENCHMARKS.lateRateTarget;
  const isFillRateBreached = kpis.fillRatePercent < BENCHMARKS.fillRateTarget;
  const isStockoutBreached = kpis.stockoutRatePercent > BENCHMARKS.stockoutTarget;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Delivery TAT */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Delivery TAT</span>
          <Clock className={`w-3.5 h-3.5 ${isTatBreached ? 'text-amber-400' : 'text-emerald-400'}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-white">
            {kpis.avgDeliveryTAT}
          </span>
          <span className="text-xs text-slate-400">mins</span>
        </div>
        <div className="mt-2 text-xs flex items-center justify-between border-t border-slate-800/80 pt-2 text-slate-400">
          <span>Target: &le; {BENCHMARKS.tatTarget}m</span>
          <span className={`font-medium ${isTatBreached ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isTatBreached ? `+${(kpis.avgDeliveryTAT - BENCHMARKS.tatTarget).toFixed(1)}m gap` : 'Nominal'}
          </span>
        </div>
      </div>

      {/* 2. % Late Orders */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Late Orders</span>
          <AlertCircle className={`w-3.5 h-3.5 ${isLateRateBreached ? 'text-red-400' : 'text-emerald-400'}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-white">
            {kpis.lateOrdersPercent}%
          </span>
        </div>
        <div className="mt-2 text-xs flex items-center justify-between border-t border-slate-800/80 pt-2 text-slate-400">
          <span>SLA: &le; {BENCHMARKS.lateRateTarget}%</span>
          <span className={`font-medium ${isLateRateBreached ? 'text-red-400' : 'text-emerald-400'}`}>
            {isLateRateBreached ? `${kpis.lateOrdersPercent}% breached` : 'Within SLA'}
          </span>
        </div>
      </div>

      {/* 3. Item Fill Rate */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Item Fill Rate</span>
          <CheckCircle className={`w-3.5 h-3.5 ${isFillRateBreached ? 'text-amber-400' : 'text-emerald-400'}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-white">
            {kpis.fillRatePercent}%
          </span>
        </div>
        <div className="mt-2 text-xs flex items-center justify-between border-t border-slate-800/80 pt-2 text-slate-400">
          <span>Delivered / Ordered</span>
          <span className="font-mono text-[11px] text-slate-300">
            {kpis.totalItemsDelivered.toLocaleString()} / {kpis.totalItemsOrdered.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 4. Stock-Out Rate */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Stock-Out Rate</span>
          <PackageX className={`w-3.5 h-3.5 ${isStockoutBreached ? 'text-red-400' : 'text-emerald-400'}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-white">
            {kpis.stockoutRatePercent}%
          </span>
        </div>
        <div className="mt-2 text-xs flex items-center justify-between border-t border-slate-800/80 pt-2 text-slate-400">
          <span>Lost Revenue (GSV)</span>
          <span className="font-mono text-[11px] text-amber-400">
            ₹{kpis.totalLostRevenue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 5. Wastage Cost */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Wastage Cost</span>
          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-white">
            ₹{kpis.totalWastageCost.toLocaleString()}
          </span>
        </div>
        <div className="mt-2 text-xs flex items-center justify-between border-t border-slate-800/80 pt-2 text-slate-400">
          <span>Expired / Unsold</span>
          <span className="text-[11px] text-slate-300">Perishables</span>
        </div>
      </div>
    </div>
  );
};
