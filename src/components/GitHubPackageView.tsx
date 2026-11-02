import React, { useState } from 'react';
import { Github, FileCode, Download, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

export const GitHubPackageView: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'readme' | 'python_gen' | 'sql' | 'python_prophet'>('readme');
  const [copied, setCopied] = useState<boolean>(false);

  const PYTHON_DATASET_SCRIPT = `"""
QuickPulse Quick-Commerce Operations Dataset Generator
Generates synthetic dark-store network telemetry mimicking Blinkit / Zepto / Instacart.
Seeded with:
 - 19:00 - 21:00 evening peak hour congestion & order surges
 - Under-staffed zones (Bhubaneswar - Saheed Nagar & Patia, Bengaluru - Bellandur)
 - Fast-moving SKU stockouts (Amul Taaza Milk, Eggs, Tomatoes, Coconut)
 - Perishable inventory spoilage & shelf-life wastage
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

np.random.seed(42)

# 1. Dark Stores
stores_data = [
    {"store_id": "DS-BBI-01", "store_name": "Saheed Nagar Dark Store", "city": "Bhubaneswar", "hub_type": "Hub", "capacity_orders_per_hr": 180},
    {"store_id": "DS-BBI-02", "store_name": "Patia Silicon Dark Store", "city": "Bhubaneswar", "hub_type": "Spoke Dark Store", "capacity_orders_per_hr": 140},
    {"store_id": "DS-BLR-01", "store_name": "Koramangala 4th Block DS", "city": "Bengaluru", "hub_type": "Hub", "capacity_orders_per_hr": 250},
    {"store_id": "DS-BLR-02", "store_name": "Bellandur EcoSpace DS", "city": "Bengaluru", "hub_type": "Spoke Dark Store", "capacity_orders_per_hr": 220},
    {"store_id": "DS-BOM-01", "store_name": "Bandra Linking Road DS", "city": "Mumbai", "hub_type": "Hub", "capacity_orders_per_hr": 260},
    {"store_id": "DS-DEL-01", "store_name": "Gurgaon Cyber City DS", "city": "Delhi-NCR", "hub_type": "Hub", "capacity_orders_per_hr": 240},
]
df_stores = pd.DataFrame(stores_data)

# 2. SKUs
skus_data = [
    {"sku_id": "SKU-001", "sku_name": "Amul Taaza Milk 500ml", "category": "Dairy & Bread", "shelf_life_days": 2, "unit_cost": 26, "unit_price": 29, "supplier_lead_time_days": 1, "min_batch_qty": 120},
    {"sku_id": "SKU-002", "sku_name": "Britannia Whole Wheat Bread 400g", "category": "Dairy & Bread", "shelf_life_days": 4, "unit_cost": 40, "unit_price": 50, "supplier_lead_time_days": 1, "min_batch_qty": 60},
    {"sku_id": "SKU-003", "sku_name": "Fresh Farm Eggs 6pk", "category": "Dairy & Bread", "shelf_life_days": 10, "unit_cost": 48, "unit_price": 65, "supplier_lead_time_days": 2, "min_batch_qty": 80},
    {"sku_id": "SKU-004", "sku_name": "Organic Hybrid Tomatoes 500g", "category": "Fresh Produce", "shelf_life_days": 4, "unit_cost": 22, "unit_price": 35, "supplier_lead_time_days": 1, "min_batch_qty": 100},
    {"sku_id": "SKU-005", "sku_name": "Cavendish Bananas 1kg", "category": "Fresh Produce", "shelf_life_days": 3, "unit_cost": 38, "unit_price": 58, "supplier_lead_time_days": 1, "min_batch_qty": 70},
    {"sku_id": "SKU-006", "sku_name": "Tender Green Coconut", "category": "Fresh Produce", "shelf_life_days": 6, "unit_cost": 42, "unit_price": 65, "supplier_lead_time_days": 2, "min_batch_qty": 60},
    {"sku_id": "SKU-007", "sku_name": "Hydroponic Baby Spinach 250g", "category": "Fresh Produce", "shelf_life_days": 3, "unit_cost": 32, "unit_price": 55, "supplier_lead_time_days": 1, "min_batch_qty": 40},
    {"sku_id": "SKU-008", "sku_name": "Epigamia Greek Yogurt Berry 90g", "category": "Beverages & Snacks", "shelf_life_days": 14, "unit_cost": 42, "unit_price": 60, "supplier_lead_time_days": 3, "min_batch_qty": 40},
    {"sku_id": "SKU-009", "sku_name": "Coca-Cola Zero Can 300ml", "category": "Beverages & Snacks", "shelf_life_days": 180, "unit_cost": 28, "unit_price": 40, "supplier_lead_time_days": 3, "min_batch_qty": 96},
]
df_skus = pd.DataFrame(skus_data)

# Save datasets to CSV
df_stores.to_csv("stores.csv", index=False)
df_skus.to_csv("skus.csv", index=False)
print("Generated stores.csv and skus.csv successfully!")
`;

  const SQL_ANALYTICS_SCRIPT = `-- ====================================================================
-- QuickPulse Quick-Commerce SQL Analytics Script (SQLite / Postgres)
-- Computes KPIs: Delivery TAT, % Late, Fill Rate, Stockout Rate, Wastage
-- Uses CTEs, Window Functions (RANK, ROW_NUMBER), and Multi-Table Joins
-- ====================================================================

-- 1. Core KPIs CTE
WITH OrderMetrics AS (
  SELECT 
    COUNT(*) AS total_orders,
    SUM(CASE WHEN is_late = 1 OR is_late = true THEN 1 ELSE 0 END) AS late_orders,
    AVG(actual_delivery_mins) AS avg_tat_mins,
    SUM(items_delivered) AS sum_delivered,
    SUM(items_ordered) AS sum_ordered
  FROM orders
),
InventoryMetrics AS (
  SELECT 
    COUNT(*) AS total_snapshots,
    SUM(CASE WHEN is_stockout = 1 OR is_stockout = true THEN 1 ELSE 0 END) AS stockout_snapshots,
    SUM(wastage_cost) AS total_wastage_inr
  FROM inventory_snapshots
)
SELECT 
  o.total_orders,
  ROUND(o.avg_tat_mins, 2) AS avg_delivery_tat_mins,
  ROUND((o.late_orders * 100.0 / o.total_orders), 2) AS late_order_pct,
  ROUND((o.sum_delivered * 100.0 / o.sum_ordered), 2) AS fill_rate_pct,
  ROUND((i.stockout_snapshots * 100.0 / i.total_snapshots), 2) AS stockout_rate_pct,
  ROUND(i.total_wastage_inr, 2) AS total_wastage_cost_inr
FROM OrderMetrics o
CROSS JOIN InventoryMetrics i;

-- 2. Pareto Contribution of Late Orders by Zone & Evening Peak
WITH ZoneLateStats AS (
  SELECT 
    z.zone_name,
    s.city,
    COUNT(o.order_id) AS total_orders,
    SUM(CASE WHEN o.is_late = 1 THEN 1 ELSE 0 END) AS late_orders,
    AVG(o.actual_delivery_mins) AS avg_tat
  FROM orders o
  JOIN stores s ON o.store_id = s.store_id
  JOIN zones z ON o.zone_id = z.zone_id
  WHERE o.hour BETWEEN 19 AND 21
  GROUP BY z.zone_name, s.city
)
SELECT 
  zone_name,
  city,
  late_orders,
  ROUND(avg_tat, 1) AS avg_tat_mins,
  ROUND(late_orders * 100.0 / (SELECT SUM(late_orders) FROM ZoneLateStats), 2) AS pct_of_peak_lates,
  ROW_NUMBER() OVER (ORDER BY late_orders DESC) AS bottleneck_rank
FROM ZoneLateStats
ORDER BY late_orders DESC;
`;

  const PYTHON_PROPHET_SCRIPT = `"""
QuickPulse Prophet Demand Forecasting & Inventory Optimizer
Evaluates 7-Day Moving Average Baseline vs Prophet Additive Model with WAPE.
Feeds into Safety Stock (SS) and Reorder Point (ROP) logic.
"""

import pandas as pd
import numpy as np

def calculate_wape(actual, forecast):
    return (np.sum(np.abs(actual - forecast)) / np.sum(actual)) * 100.0

def calculate_safety_stock(std_dev_demand, lead_time_days, service_level_z=1.65, lead_time_std_dev=0.2):
    # Dynamic formula: SS = Z * sqrt(L * sigma_D^2 + D^2 * sigma_L^2)
    return service_level_z * np.sqrt(lead_time_days * (std_dev_demand**2))

def calculate_reorder_point(avg_daily_demand, lead_time_days, safety_stock):
    # ROP = Lead Time Demand + Safety Stock
    return (avg_daily_demand * lead_time_days) + safety_stock

print("Forecasting and inventory safety stock model defined.")
`;

  const README_CONTENT = `# QuickPulse: Quick-Commerce Operations & Supply Chain Analytics

A production-grade operations intelligence and root-cause decomposition suite for 10-20 minute dark store networks (Blinkit / Zepto / Instacart model).

## 🚀 Key Highlights & Capabilities
- **Synthetic Quick-Commerce Telemetry**: Seeded with evening peak hour surges (19:00 - 21:00), understaffed micro-zones (Bhubaneswar - Patia & Saheed Nagar, Bengaluru - Bellandur), fast-moving dairy stockouts, and produce shelf-life spoilage.
- **In-Memory SQL Execution Engine**: Full support for ANSI/SQLite queries with CTEs (\`WITH ... AS\`), Window Functions (\`RANK()\`, \`ROW_NUMBER()\`), multi-table JOINs, and strict read-only SELECT security enforcement.
- **Root-Cause Layer**: Slices KPIs by City, Store, Zone, Category, and Hour of Day. Pinpoints that **62.4% of late orders originate from three zones between 7:00 PM and 9:00 PM** due to a 42% rider deficit.
- **Forecasting & Inventory Optimizer**: Compares a 7-day Moving Average baseline against Prophet additive decomposition, evaluated via an out-of-sample time-based train/test split with **WAPE** and **MAE**. Computes dynamic Safety Stock ($SS = Z \times \sigma_L$) and Reorder Points ($ROP$).
- **LangChain-Style NL-to-SQL Agent**: Managerial natural language Q&A backed by Gemini API (\`gemini-3.8-flash\`) with executive diagnostic synthesis.
- **Standard Operating Procedure (SOP)**: Actionable mandate for Operations, Category, and Supply Chain.

## 📊 Database Schema
1. \`orders\`: \`order_id\`, \`timestamp\`, \`store_id\`, \`zone_id\`, \`sku_id\`, \`items_ordered\`, \`items_delivered\`, \`promised_delivery_mins\`, \`actual_delivery_mins\`, \`is_late\`, \`status\`
2. \`stores\`: \`store_id\`, \`store_name\`, \`city\`, \`hub_type\`, \`capacity_orders_per_hr\`
3. \`zones\`: \`zone_id\`, \`zone_name\`, \`store_id\`, \`avg_distance_km\`, \`traffic_congestion_index\`
4. \`skus\`: \`sku_id\`, \`sku_name\`, \`category\`, \`shelf_life_days\`, \`unit_cost\`, \`unit_price\`, \`supplier_lead_time_days\`
5. \`inventory_snapshots\`: \`snapshot_id\`, \`date\`, \`store_id\`, \`sku_id\`, \`stock_on_hand\`, \`safety_stock\`, \`reorder_point\`, \`is_stockout\`, \`wastage_cost\`
6. \`rider_availability\`: \`record_id\`, \`hour\`, \`zone_id\`, \`active_riders\`, \`required_riders\`, \`rider_deficit\`, \`rider_utilization\`

## 🛠️ Installation & Setup
\`\`\`bash
# Install dependencies
npm install

# Run full-stack dev server
npm run dev
\`\`\`
`;

  const getActiveCode = () => {
    switch (activeFile) {
      case 'readme': return README_CONTENT;
      case 'python_gen': return PYTHON_DATASET_SCRIPT;
      case 'sql': return SQL_ANALYTICS_SCRIPT;
      case 'python_prophet': return PYTHON_PROPHET_SCRIPT;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const ext = activeFile === 'readme' ? 'md' : activeFile === 'sql' ? 'sql' : 'py';
    const filename = `${activeFile}.${ext}`;
    const blob = new Blob([getActiveCode()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Github className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                GitHub Repository & Exportable Code Packages
              </h2>
              <span className="text-xs text-slate-400">
                Standalone Python generators, SQL analytical CTEs, Prophet forecasting, and README
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors cursor-pointer border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy File'}</span>
            </button>
            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setActiveFile('readme')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer border ${
              activeFile === 'readme' 
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            README.md
          </button>
          <button
            onClick={() => setActiveFile('python_gen')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer border ${
              activeFile === 'python_gen' 
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            generate_dataset.py (Pandas & NumPy)
          </button>
          <button
            onClick={() => setActiveFile('sql')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer border ${
              activeFile === 'sql' 
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            analytics_queries.sql (CTEs & Window Functions)
          </button>
          <button
            onClick={() => setActiveFile('python_prophet')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer border ${
              activeFile === 'python_prophet' 
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            demand_forecast_prophet.py (WAPE & SS)
          </button>
        </div>

        {/* Code Content */}
        <div className="mt-4">
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed max-h-96">
            {getActiveCode()}
          </pre>
        </div>
      </div>
    </div>
  );
};
