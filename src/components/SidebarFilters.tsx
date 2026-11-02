import React from 'react';
import { Filter, Clock, MapPin, Store as StoreIcon, Layers, Calendar, AlertTriangle } from 'lucide-react';
import { FilterState, Store } from '../types';

interface SidebarFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  stores: Store[];
  categories: string[];
  totalOrdersCount: number;
  onReset: () => void;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  filters,
  onFilterChange,
  stores,
  categories,
  totalOrdersCount,
  onReset,
}) => {
  const cities = ['All', 'Bhubaneswar', 'Bengaluru', 'Mumbai', 'Delhi-NCR', 'Hyderabad'];

  const filteredStores = filters.city === 'All' 
    ? stores 
    : stores.filter(s => s.city === filters.city);

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col h-full shrink-0 overflow-y-auto p-4 text-xs select-none">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>Streamlit Controls</span>
        </div>
        <button
          onClick={onReset}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px]"
        >
          Reset
        </button>
      </div>

      <div className="space-y-4 flex-1">
        {/* City Filter */}
        <div>
          <label className="flex items-center gap-1.5 font-medium text-slate-300 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Select Market / City</span>
          </label>
          <select
            value={filters.city}
            onChange={(e) => onFilterChange({ ...filters, city: e.target.value, storeId: 'All' })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-400 cursor-pointer"
          >
            {cities.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Operating Cities' : c}</option>
            ))}
          </select>
          {filters.city === 'Bhubaneswar' && (
            <div className="mt-1.5 text-[11px] text-amber-400/90 bg-amber-950/40 border border-amber-800/40 rounded px-2 py-1">
              Active Focus: Tier-2 network with 34% late deliveries spike in Patia.
            </div>
          )}
        </div>

        {/* Store / Dark Store Hub */}
        <div>
          <label className="flex items-center gap-1.5 font-medium text-slate-300 mb-1.5">
            <StoreIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Dark Store Facility</span>
          </label>
          <select
            value={filters.storeId}
            onChange={(e) => onFilterChange({ ...filters, storeId: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="All">All Dark Stores ({filteredStores.length})</option>
            {filteredStores.map(s => (
              <option key={s.store_id} value={s.store_id}>
                {s.store_name} ({s.city})
              </option>
            ))}
          </select>
        </div>

        {/* Product Category */}
        <div>
          <label className="flex items-center gap-1.5 font-medium text-slate-300 mb-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Product Category</span>
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="All">All Categories ({categories.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Date Window */}
        <div>
          <label className="flex items-center gap-1.5 font-medium text-slate-300 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Analysis Timeframe</span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded border border-slate-700/60">
            <button
              onClick={() => onFilterChange({ ...filters, dateRange: 'all' })}
              className={`py-1 text-center rounded transition-colors cursor-pointer ${
                filters.dateRange === 'all' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              28 Days
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, dateRange: 'last14d' })}
              className={`py-1 text-center rounded transition-colors cursor-pointer ${
                filters.dateRange === 'last14d' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, dateRange: 'last7d' })}
              className={`py-1 text-center rounded transition-colors cursor-pointer ${
                filters.dateRange === 'last7d' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
          </div>
        </div>

        {/* Evening Peak Hours Filter (19:00 - 21:00) */}
        <div className="pt-2 border-t border-slate-800">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-semibold text-slate-200 block">Evening Peak Slice</span>
                <span className="text-[11px] text-slate-400">19:00 – 21:00 (Dinner rush)</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={filters.peakHoursOnly}
              onChange={(e) => onFilterChange({ ...filters, peakHoursOnly: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </label>
          {filters.peakHoursOnly && (
            <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/30 border border-amber-900/50 rounded p-2">
              Filtering exclusively to 19:00-21:00. This isolates the high-congestion window responsible for ~62% of delivery delays.
            </div>
          )}
        </div>

        {/* Database Telemetry Stats */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-mono">
          <div className="text-slate-300 font-sans font-medium text-xs mb-1">In-Memory SQL Schema</div>
          <div className="flex justify-between">
            <span>Orders Table:</span>
            <span className="text-emerald-400 tabular-nums">{totalOrdersCount.toLocaleString()} rows</span>
          </div>
          <div className="flex justify-between">
            <span>Dark Stores:</span>
            <span className="text-slate-300 tabular-nums">{stores.length} hubs</span>
          </div>
          <div className="flex justify-between">
            <span>SKU Catalog:</span>
            <span className="text-slate-300 tabular-nums">17 tracked SKUs</span>
          </div>
          <div className="flex justify-between">
            <span>SQL Security:</span>
            <span className="text-slate-300">Read-Only SELECT</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
