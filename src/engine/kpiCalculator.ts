/**
 * Production SQL Queries & KPI Computation Engine
 * Slices delivery TAT, late orders %, fill rate, stockout rate, and inventory wastage
 */

import { SQLEngine } from './sqlEngine';
import { DatabaseTables } from './sqlEngine';
import { OperationalKPIs, FilterState } from '../types';

export const PRODUCTION_SQL_SCRIPTS = {
  OVERALL_KPIS: `-- Compute Core Operational KPIs for Quick-Commerce Dark Stores
WITH OrderMetrics AS (
  SELECT 
    COUNT(*) AS total_orders,
    SUM(CASE WHEN is_late = true THEN 1 ELSE 0 END) AS late_orders,
    AVG(actual_delivery_mins) AS avg_tat_mins,
    SUM(items_delivered) AS sum_items_delivered,
    SUM(items_ordered) AS sum_items_ordered
  FROM orders
),
InventoryMetrics AS (
  SELECT 
    COUNT(*) AS total_snapshots,
    SUM(CASE WHEN is_stockout = true THEN 1 ELSE 0 END) AS stockout_snapshots,
    SUM(wastage_cost) AS total_wastage_inr
  FROM inventory_snapshots
)
SELECT 
  o.total_orders,
  ROUND(o.avg_tat_mins, 1) AS avg_delivery_tat_mins,
  ROUND((o.late_orders * 100.0 / o.total_orders), 1) AS late_order_pct,
  ROUND((o.sum_items_delivered * 100.0 / o.sum_items_ordered), 1) AS item_fill_rate_pct,
  ROUND((i.stockout_snapshots * 100.0 / i.total_snapshots), 1) AS stockout_rate_pct,
  ROUND(i.total_wastage_inr, 0) AS total_wastage_cost_inr
FROM OrderMetrics o
CROSS JOIN InventoryMetrics i;`,

  HOURLY_PEAK_CONGESTION: `-- Hourly Turnaround Time & Rider Bottleneck Analysis
SELECT 
  o.hour,
  COUNT(o.order_id) AS total_orders,
  ROUND(AVG(o.actual_delivery_mins), 1) AS avg_tat_mins,
  ROUND(SUM(CASE WHEN o.is_late = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS late_order_pct,
  ROUND(AVG(r.rider_deficit), 1) AS avg_rider_shortage,
  ROUND(AVG(r.rider_utilization), 2) AS avg_rider_utilization
FROM orders o
JOIN stores s ON o.store_id = s.store_id
JOIN rider_availability r ON o.date = r.date AND o.hour = r.hour AND o.zone_id = r.zone_id
GROUP BY o.hour
ORDER BY o.hour ASC;`,

  BHUBANESWAR_VS_SYSTEM: `-- Root Cause: Bhubaneswar Dark Stores vs Global Benchmark
WITH CityPerformance AS (
  SELECT 
    s.city,
    s.store_name,
    COUNT(o.order_id) AS order_volume,
    ROUND(AVG(o.actual_delivery_mins), 1) AS avg_tat_mins,
    ROUND(SUM(CASE WHEN o.is_late = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS late_pct,
    ROUND(SUM(o.items_delivered) * 100.0 / SUM(o.items_ordered), 1) AS fill_rate_pct
  FROM orders o
  JOIN stores s ON o.store_id = s.store_id
  GROUP BY s.city, s.store_name
)
SELECT 
  city,
  store_name,
  order_volume,
  avg_tat_mins,
  late_pct,
  fill_rate_pct,
  RANK() OVER (ORDER BY late_pct DESC) AS delay_rank
FROM CityPerformance
ORDER BY late_pct DESC;`,

  TOP_STOCKOUT_SKUS: `-- Top 10 Stock-out SKUs dragging down Item Fill Rate
SELECT 
  sk.sku_name,
  sk.category,
  COUNT(o.order_id) AS total_attempts,
  SUM(CASE WHEN o.status = 'Cancelled' THEN 1 ELSE 0 END) AS stockout_drops,
  ROUND(SUM(CASE WHEN o.status = 'Cancelled' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS stockout_rate_pct,
  SUM((o.items_ordered - o.items_delivered) * sk.unit_price) AS lost_gsv_inr
FROM orders o
JOIN skus sk ON o.sku_id = sk.sku_id
GROUP BY sk.sku_name, sk.category
ORDER BY lost_gsv_inr DESC
LIMIT 10;`,

  CATEGORY_WASTAGE: `-- Inventory Wastage and Expiry Cost by Category
SELECT 
  sk.category,
  COUNT(DISTINCT i.sku_id) AS active_skus,
  SUM(i.expired_units) AS total_expired_units,
  ROUND(SUM(i.wastage_cost), 0) AS total_wastage_inr,
  ROUND(SUM(i.wastage_cost) * 100.0 / (SELECT SUM(wastage_cost) FROM inventory_snapshots), 1) AS wastage_share_pct
FROM inventory_snapshots i
JOIN skus sk ON i.sku_id = sk.sku_id
GROUP BY sk.category
ORDER BY total_wastage_inr DESC;`
};

export function calculateOperationalKPIs(tables: DatabaseTables, filters: FilterState): OperationalKPIs {
  let filteredOrders = tables.orders;
  let filteredSnapshots = tables.inventory_snapshots;

  // Filter by City
  if (filters.city && filters.city !== 'All') {
    const storeIdsInCity = tables.stores.filter(s => s.city === filters.city).map(s => s.store_id);
    filteredOrders = filteredOrders.filter(o => storeIdsInCity.includes(o.store_id));
    filteredSnapshots = filteredSnapshots.filter(i => storeIdsInCity.includes(i.store_id));
  }

  // Filter by Store
  if (filters.storeId && filters.storeId !== 'All') {
    filteredOrders = filteredOrders.filter(o => o.store_id === filters.storeId);
    filteredSnapshots = filteredSnapshots.filter(i => i.store_id === filters.storeId);
  }

  // Filter by Category
  if (filters.category && filters.category !== 'All') {
    const skuIdsInCategory = tables.skus.filter(s => s.category === filters.category).map(s => s.sku_id);
    filteredOrders = filteredOrders.filter(o => skuIdsInCategory.includes(o.sku_id));
    filteredSnapshots = filteredSnapshots.filter(i => skuIdsInCategory.includes(i.sku_id));
  }

  // Peak Hours Filter
  if (filters.peakHoursOnly) {
    filteredOrders = filteredOrders.filter(o => o.hour >= 19 && o.hour <= 21);
  }

  // Date Range filter
  if (filters.dateRange === 'last7d') {
    const cutoff = new Date('2026-10-26T00:00:00Z').toISOString().split('T')[0];
    filteredOrders = filteredOrders.filter(o => o.date >= cutoff);
    filteredSnapshots = filteredSnapshots.filter(i => i.date >= cutoff);
  } else if (filters.dateRange === 'last14d') {
    const cutoff = new Date('2026-10-19T00:00:00Z').toISOString().split('T')[0];
    filteredOrders = filteredOrders.filter(o => o.date >= cutoff);
    filteredSnapshots = filteredSnapshots.filter(i => i.date >= cutoff);
  }

  const totalOrders = filteredOrders.length;
  if (totalOrders === 0) {
    return {
      avgDeliveryTAT: 0,
      lateOrdersPercent: 0,
      fillRatePercent: 100,
      stockoutRatePercent: 0,
      totalWastageCost: 0,
      totalOrders: 0,
      totalItemsDelivered: 0,
      totalItemsOrdered: 0,
      totalLostRevenue: 0,
    };
  }

  const lateOrdersCount = filteredOrders.filter(o => o.is_late).length;
  const totalTat = filteredOrders.reduce((acc, o) => acc + o.actual_delivery_mins, 0);
  const totalDelivered = filteredOrders.reduce((acc, o) => acc + o.items_delivered, 0);
  const totalOrdered = filteredOrders.reduce((acc, o) => acc + o.items_ordered, 0);

  const totalSnapshots = filteredSnapshots.length;
  const stockoutSnapshots = filteredSnapshots.filter(s => s.is_stockout).length;
  const totalWastage = filteredSnapshots.reduce((acc, s) => acc + s.wastage_cost, 0);

  // Lost revenue from unfulfilled items
  let totalLostRevenue = 0;
  const skuMap = new Map(tables.skus.map(s => [s.sku_id, s]));
  filteredOrders.forEach(o => {
    const shortfall = o.items_ordered - o.items_delivered;
    if (shortfall > 0) {
      const sku = skuMap.get(o.sku_id);
      if (sku) {
        totalLostRevenue += (shortfall * sku.unit_price);
      }
    }
  });

  return {
    avgDeliveryTAT: +(totalTat / totalOrders).toFixed(1),
    lateOrdersPercent: +((lateOrdersCount / totalOrders) * 100).toFixed(1),
    fillRatePercent: totalOrdered > 0 ? +((totalDelivered / totalOrdered) * 100).toFixed(1) : 100,
    stockoutRatePercent: totalSnapshots > 0 ? +((stockoutSnapshots / totalSnapshots) * 100).toFixed(1) : 0,
    totalWastageCost: Math.round(totalWastage),
    totalOrders,
    totalItemsDelivered: totalDelivered,
    totalItemsOrdered: totalOrdered,
    totalLostRevenue: Math.round(totalLostRevenue),
  };
}
