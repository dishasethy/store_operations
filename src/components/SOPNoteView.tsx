import React, { useState } from 'react';
import { FileText, CheckSquare, Square, Download, Printer, ShieldAlert, Zap, Truck, Layers } from 'lucide-react';

export const SOPNoteView: React.FC = () => {
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({
    'ops-1': false,
    'ops-2': false,
    'ops-3': false,
    'cat-1': false,
    'cat-2': false,
    'cat-3': false,
    'sc-1': false,
    'sc-2': false,
    'sc-3': false,
  });

  const toggleAction = (id: string) => {
    setCompletedActions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(completedActions).filter(Boolean).length;
  const progressPct = Math.round((completedCount / 9) * 100);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const content = `# STANDARD OPERATING PROCEDURE (SOP): QUICK-COMMERCE OPS RECOVERY
Document Ref: SOP-QC-2026-R4
Effective Date: November 2, 2026
Target SLA: 92% On-Time Delivery (<14 min TAT), Fill Rate >98%, Perishable Spoilage <2%

## 1. OPERATIONS (OPS) TEAM MANDATE
- [ ] OPS-01: Split-Shift Fleet Rostering (18:30 - 21:30)
  Deploy 6 dedicated evening peak riders to Patia Infocity (DS-BBI-02) and Bellandur (DS-BLR-02) to close the 42% rider deficit.
- [ ] OPS-02: Peak Order Batching Restriction
  Cap dispatch batch size to maximum 2 orders per rider during 19:00 - 21:00 to prevent multi-drop delay cascades.
- [ ] OPS-03: Monsoon / Rain Surge Dynamic Radius Throttling
  Contract geofenced delivery radius by 0.8km when rainfall exceeds 5mm/hr and activate Rs. 40/drop incentive.

## 2. CATEGORY TEAM MANDATE
- [ ] CAT-01: Safety Stock Recalibration for Fast Movers
  Increase safety buffers from 35% to 50% for Amul Taaza Milk 500ml, Farm Eggs 6pk, and Farm Tomatoes.
- [ ] CAT-02: Near-Expiry Dynamic Markdown Automation
  Auto-apply 30% discount at T-12h before shelf-life expiration on Fresh Produce and Dairy to eliminate Rs. 45,000+ spoilage.
- [ ] CAT-03: Dual-Sourcing Vendor Contracts
  Onboard backup dairy cooperative suppliers in Bhubaneswar and Bengaluru to eliminate 19:30 stockout outages.

## 3. SUPPLY CHAIN & REPLENISHMENT MANDATE
- [ ] SC-01: Transition to 2x Daily Dark Store Replenishment
  Split single morning delivery into 06:00 AM Breakfast Drop and 15:30 PM Dinner Rush Inflow.
- [ ] SC-02: Supplier Fill Rate SLA Enforcement
  Enforce 98.5% supplier fill rate with 2% invoice penalty on short shipments.
- [ ] SC-03: Spoke-to-Spoke Dark Store Inventory Balancing
  Enable cross-dock transfers between DS-BBI-01 (Saheed Nagar) and DS-BBI-02 (Patia) by 16:00.
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOP_QuickCommerce_Ops_2026.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-white">One-Page Standard Operating Procedure (SOP)</h2>
            <span className="text-xs text-slate-400">Actionable Remediation Protocol for Ops, Category & Supply Chain</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-300">
            Progress: <span className="text-emerald-400 font-semibold">{completedCount}/9 actions ({progressPct}%)</span>
          </div>
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors cursor-pointer border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .MD</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print SOP</span>
          </button>
        </div>
      </div>

      {/* The Printable SOP Document Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 sm:p-8 space-y-6 text-slate-200 print:bg-white print:text-black print:border-none">
        {/* Document Header Lockup */}
        <div className="border-b border-slate-800 pb-5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
            <span>DOC-ID: SOP-QC-2026-R4</span>
            <span>CLASSIFICATION: OPERATIONAL PLAYBOOK</span>
            <span>EFFECTIVE: NOVEMBER 2, 2026</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Root Cause Operational Remediation: 10–20 Minute Delivery SLA Restoration
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Derived from empirical quick-commerce telemetry: addressing the 62.4% late delivery concentration 
            between 19:00 and 21:00, 34% Bhubaneswar delay spikes, fast-moving dairy stockouts, and fresh produce shrinkage.
          </p>
        </div>

        {/* Section 1: Operations Team */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 border-b border-slate-800 pb-2">
            <Truck className="w-4 h-4" />
            <h3>1. Operations (Ops) Fleet & Dark Store Dispatch Mandate</h3>
          </div>

          <div className="space-y-2.5">
            {/* Action 1 */}
            <div 
              onClick={() => toggleAction('ops-1')}
              className="flex items-start gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
            >
              <div className="mt-0.5 text-emerald-400">
                {completedActions['ops-1'] ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span>OPS-01: Split-Shift Peak Fleet Scheduling (18:30 – 21:30)</span>
                  <span className="text-[10px] text-amber-400 font-mono">High Urgency</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Stage 6 flex riders at Patia Silicon Hub (DS-BBI-02) and Bellandur (DS-BLR-02) to bridge the 42% rider deficit. 
                  Offer a ₹45 guaranteed dinner-rush drop differential to eliminate delivery TAT spikes from 24.8m back down to &le;14m.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">Owner: Regional City Fleet Lead · Target: 100% Roster Compliance by T+3 Days</div>
              </div>
            </div>

            {/* Action 2 */}
            <div 
              onClick={() => toggleAction('ops-2')}
              className="flex items-start gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
            >
              <div className="mt-0.5 text-emerald-400">
                {completedActions['ops-2'] ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-white">
                  OPS-02: Peak Order Batching Restriction (Max 2 Orders / Rider)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Enforce an algorithmic hard-cap on order batching during 19:00 - 21:00. Orders exceeding 2 per trip cause a 
                  7.2 min delivery delay on the second customer drop, which drove 48% of late feedback.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">Owner: Dispatch Algorithm Team · Target: Zero 3-drop dispatches in peak</div>
              </div>
            </div>

            {/* Action 3 */}
            <div 
              onClick={() => toggleAction('ops-3')}
              className="flex items-start gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
            >
              <div className="mt-0.5 text-emerald-400">
                {completedActions['ops-3'] ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-white">
                  OPS-03: Rain-Mode Geofence Radius Contraction
                </div>
                <p className="text-slate-300 leading-relaxed">
                  During monsoon rain alerts, automatically contract dark store delivery radius from 3.5km down to 2.2km. 
                  Prevents severe rider transit delays in Patia and Saheed Nagar.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">Owner: Dark Store Facility Managers · Target: Immediate trigger on rain &gt; 5mm</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Category Team */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-400 border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4" />
            <h3>2. Category & Merchandising Mandate</h3>
          </div>

          <div className="space-y-2.5">
            {/* Action 1 */}
            <div 
              onClick={() => toggleAction('cat-1')}
              className="flex items-start gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
            >
              <div className="mt-0.5 text-amber-400">
                {completedActions['cat-1'] ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-white">
                  CAT-01: Fast-Moving SKU Safety Buffer Elevation (+35%)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Increase dynamic safety stock thresholds for Amul Taaza Milk 500ml, Farm Fresh Eggs, and Tomatoes. 
                  Currently, 74% of stockouts occur after 19:30 due to undershooting dinner-hour cooking demand.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">Owner: Dairy & Produce Category Manager · Target: Fill rate &ge; 98.5%</div>
              </div>
            </div>

            {/* Action 2 */}
            <div 
              onClick={() => toggleAction('cat-2')}
              className="flex items-start gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
            >
              <div className="mt-0.5 text-amber-400">
                {completedActions['cat-2'] ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-white">
                  CAT-02: Automated Dynamic Markdowns at T-12 Hours
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Implement automated 30% markdown pricing on Baby Spinach, Paneer, and Bananas with &le; 12 hours remaining shelf life. 
                  Recovers ₹45,000+ monthly in avoided dump and write-off costs.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">Owner: Pricing & Revenue Optimization · Target: Spoilage cost reduction by 55%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Supply Chain & Replenishment */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400 border-b border-slate-800 pb-2">
            <Zap className="w-4 h-4" />
            <h3>3. Supply Chain & Dark Store Replenishment Mandate</h3>
          </div>

          <div className="space-y-2.5">
            {/* Action 1 */}
            <div 
              onClick={() => toggleAction('sc-1')}
              className="flex items-start gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
            >
              <div className="mt-0.5 text-cyan-400">
                {completedActions['sc-1'] ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-white">
                  SC-01: Two-Wave Replenishment Cadence (06:00 & 15:30)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Discontinue single-drop morning replenishment. Shift to a 60/40 two-wave cross-dock schedule: Wave 1 at 06:00 for morning milk/breakfast items, 
                  and Wave 2 at 15:30 to prime evening peak dinner surge.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">Owner: Logistics Operations Director · Target: 100% spoke replenishment by 16:30</div>
              </div>
            </div>

            {/* Action 2 */}
            <div 
              onClick={() => toggleAction('sc-2')}
              className="flex items-start gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
            >
              <div className="mt-0.5 text-cyan-400">
                {completedActions['sc-2'] ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-white">
                  SC-02: Supplier Fill Rate SLA & Lead Time Enforcement
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Audit dairy and produce vendors against 98.5% fulfillment SLA. Enforce contractual short-delivery clawbacks for 
                  unfulfilled morning purchase orders.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">Owner: Vendor Management · Target: Vendor On-Time In-Full (OTIF) &gt; 98%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
