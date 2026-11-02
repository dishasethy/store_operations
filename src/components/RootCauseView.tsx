import React, { useState } from 'react';
import { AlertTriangle, Users, Navigation, Clock, Store, TrendingUp, CheckCircle, ChevronRight, Info } from 'lucide-react';
import { RootCauseDecomposition, RootCauseSegment } from '../types';

interface RootCauseViewProps {
  decomposition: RootCauseDecomposition;
  onSelectZone?: (zoneName: string) => void;
}

export const RootCauseView: React.FC<RootCauseViewProps> = ({ decomposition, onSelectZone }) => {
  const [activeDimension, setActiveDimension] = useState<'zone' | 'hour' | 'store' | 'category'>('zone');

  const currentSegments = 
    activeDimension === 'zone' ? decomposition.topContributingZones :
    activeDimension === 'hour' ? decomposition.topContributingHours :
    activeDimension === 'store' ? decomposition.topContributingStores :
    decomposition.topContributingCategories;

  return (
    <div className="space-y-6">
      {/* 1. Executive Headline Callout Card */}
      <div className="bg-slate-900 border border-amber-500/40 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-md shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wide uppercase font-mono">
              <span>Root Cause Synthesis & Pareto Analysis</span>
              <span>·</span>
              <span>Evening Peak Congestion (19:00 - 21:00)</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {decomposition.headlineInsight}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              Cross-sectional decomposition indicates that rider supply deficits during the dinner order surge account for 
              <span className="font-semibold text-white"> 68.2% of delivery turnaround variance</span>, while store picking delays contribute 
              19.4% and road congestion contributes 12.4%.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Bhubaneswar Deep Dive Spotlight */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm text-white">Bhubaneswar Dark Store Network Audit</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Tier-2 Ops Diagnostic</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60">
            <span className="text-slate-400 block mb-1">City Late Delivery Rate</span>
            <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              {decomposition.bhubaneswarDeepDive.lateOrdersShareInCity}%
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">+16.4% week-on-week</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60">
            <span className="text-slate-400 block mb-1">Peak Rider Deficit (19-21h)</span>
            <span className="text-xl font-bold font-mono text-red-400 tabular-nums">
              -{decomposition.bhubaneswarDeepDive.avgRiderDeficitEvening} riders
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">42% below target roster</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60">
            <span className="text-slate-400 block mb-1">Primary Bottleneck Zone</span>
            <span className="text-sm font-semibold text-white block truncate">
              {decomposition.bhubaneswarDeepDive.worstZone}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">3.2km radius / 2.7 traffic index</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60">
            <span className="text-slate-400 block mb-1">Peak TAT Surge</span>
            <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              +{decomposition.bhubaneswarDeepDive.tatSpikeVsNormalPct}%
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Surged from 13.8m to 20.2m</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
          <span className="font-semibold text-emerald-400">Why did late deliveries rise? </span>
          {decomposition.bhubaneswarDeepDive.citySummary}
        </p>
      </div>

      {/* 3. Multi-Dimensional Contribution Slicer */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="font-semibold text-sm text-white">Segment Contribution & Attribution Ranking</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rank segments by contribution to delay volume, stockout occurrences, and inventory shrinkage
            </p>
          </div>

          {/* Dimension Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-md">
            <button
              onClick={() => setActiveDimension('zone')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                activeDimension === 'zone' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Delivery Zones
            </button>
            <button
              onClick={() => setActiveDimension('hour')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                activeDimension === 'hour' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hour of Day
            </button>
            <button
              onClick={() => setActiveDimension('store')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                activeDimension === 'store' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark Store Hubs
            </button>
            <button
              onClick={() => setActiveDimension('category')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                activeDimension === 'category' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Product Category
            </button>
          </div>
        </div>

        {/* Data Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-3 py-2.5">Segment</th>
                <th className="px-3 py-2.5 text-right">Late Orders</th>
                <th className="px-3 py-2.5 text-right">% Contribution</th>
                <th className="px-3 py-2.5 text-right">Avg TAT</th>
                {activeDimension === 'zone' && <th className="px-3 py-2.5 text-right">Rider Shortage</th>}
                {activeDimension === 'category' && <th className="px-3 py-2.5 text-right">Wastage Share</th>}
                <th className="px-3 py-2.5">Primary Root Cause Driver</th>
                <th className="px-3 py-2.5">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {currentSegments.map((seg: RootCauseSegment, idx: number) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-white">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-mono text-[11px] w-4">{idx + 1}.</span>
                      <span>{seg.segmentName}</span>
                    </div>
                    {seg.subSegment && (
                      <span className="text-[11px] text-slate-500 block ml-5">{seg.subSegment}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-200">
                    {seg.lateOrdersCount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    <span className={seg.lateOrdersShare > 15 ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                      {seg.lateOrdersShare}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    <span className={seg.avgTAT > 16 ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                      {seg.avgTAT}m
                    </span>
                  </td>
                  {activeDimension === 'zone' && (
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                      <span className={seg.riderShortageAvg > 3 ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                        {seg.riderShortageAvg > 0 ? `-${seg.riderShortageAvg}` : '0'}
                      </span>
                    </td>
                  )}
                  {activeDimension === 'category' && (
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-amber-400">
                      {seg.wastageShare}%
                    </td>
                  )}
                  <td className="px-3 py-2.5 text-slate-300 max-w-xs truncate" title={seg.primaryRootCause}>
                    {seg.primaryRootCause}
                  </td>
                  <td className="px-3 py-2.5 text-emerald-400/90 font-medium max-w-xs truncate" title={seg.recommendedAction}>
                    {seg.recommendedAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
