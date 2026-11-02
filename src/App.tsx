/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { generateSyntheticDataset } from './data/mockDataGenerator';
import { SQLEngine, DatabaseTables } from './engine/sqlEngine';
import { calculateOperationalKPIs } from './engine/kpiCalculator';
import { computeRootCauseDecomposition } from './engine/rootCauseEngine';
import { FilterState } from './types';

import { TopNav } from './components/TopNav';
import { SidebarFilters } from './components/SidebarFilters';
import { KPITiles } from './components/KPITiles';
import { RootCauseView } from './components/RootCauseView';
import { TrendChartsView } from './components/TrendChartsView';
import { ForecastingView } from './components/ForecastingView';
import { NLQueryAgentView } from './components/NLQueryAgentView';
import { SQLExplorerView } from './components/SQLExplorerView';
import { SOPNoteView } from './components/SOPNoteView';
import { GitHubPackageView } from './components/GitHubPackageView';

export default function App() {
  // 1. Synthetic Dataset Initialization
  const [datasetSeed, setDatasetSeed] = useState<number>(1);
  const rawTables: DatabaseTables = useMemo(() => {
    return generateSyntheticDataset(28);
  }, [datasetSeed]);

  // In-memory SQL execution engine
  const sqlEngine = useMemo(() => {
    return new SQLEngine(rawTables);
  }, [rawTables]);

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // 3. Operational Filters (Streamlit style)
  const [filters, setFilters] = useState<FilterState>({
    city: 'All',
    storeId: 'All',
    category: 'All',
    dateRange: 'all',
    peakHoursOnly: false,
    searchQuery: '',
  });

  // Unique product categories
  const categories = useMemo(() => {
    return Array.from(new Set(rawTables.skus.map(s => s.category)));
  }, [rawTables]);

  // Computed Operational KPIs
  const kpis = useMemo(() => {
    return calculateOperationalKPIs(rawTables, filters);
  }, [rawTables, filters]);

  // Root Cause Decomposition
  const rootCauseData = useMemo(() => {
    return computeRootCauseDecomposition(rawTables);
  }, [rawTables]);

  const handleResetFilters = () => {
    setFilters({
      city: 'All',
      storeId: 'All',
      category: 'All',
      dateRange: 'all',
      peakHoursOnly: false,
      searchQuery: '',
    });
  };

  const handleRefreshData = () => {
    setDatasetSeed(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Bar adhering to 3-zone contract */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onRefreshData={handleRefreshData}
        onOpenDiagnostic={() => setActiveTab('nlsql')}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Streamlit-Style Operational Sidebar */}
        <SidebarFilters
          filters={filters}
          onFilterChange={setFilters}
          stores={rawTables.stores}
          categories={categories}
          totalOrdersCount={rawTables.orders.length}
          onReset={handleResetFilters}
        />

        {/* Main Analytical Viewport */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Dashboard Tab: KPIs + Trend Charts */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    Quick-Commerce Operations Command Center
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live telemetry across {rawTables.stores.length} dark stores · Delivery SLA benchmark: 14 mins · 28-day historical baseline
                  </p>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Market: <span className="text-emerald-400">{filters.city}</span> · Window: <span className="text-emerald-400">{filters.dateRange}</span>
                </div>
              </div>

              {/* KPI Strip */}
              <KPITiles kpis={kpis} isPeakHoursActive={filters.peakHoursOnly} />

              {/* Trend Charts */}
              <TrendChartsView tables={rawTables} filters={filters} />
            </div>
          )}

          {/* Root Cause Layer Tab */}
          {activeTab === 'rootcause' && (
            <RootCauseView 
              decomposition={rootCauseData} 
              onSelectZone={(zone) => {
                setFilters(prev => ({ ...prev, searchQuery: zone }));
              }}
            />
          )}

          {/* Forecasting Tab */}
          {activeTab === 'forecasting' && (
            <ForecastingView tables={rawTables} />
          )}

          {/* NL-to-SQL Agent Tab */}
          {activeTab === 'nlsql' && (
            <NLQueryAgentView 
              tables={rawTables} 
              sqlEngine={sqlEngine} 
            />
          )}

          {/* SQL Console Tab */}
          {activeTab === 'sql' && (
            <SQLExplorerView 
              tables={rawTables} 
              sqlEngine={sqlEngine} 
            />
          )}

          {/* SOP Note Tab */}
          {activeTab === 'sop' && (
            <SOPNoteView />
          )}

          {/* GitHub & Code Package Tab */}
          {activeTab === 'github' && (
            <GitHubPackageView />
          )}
        </main>
      </div>
    </div>
  );
}
