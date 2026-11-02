/**
 * QuickPulse Quick-Commerce Operations & Supply Chain Analytics Types
 */

export interface Store {
  store_id: string;
  store_name: string;
  city: string;
  hub_type: 'Hub' | 'Spoke Dark Store';
  capacity_orders_per_hr: number;
  active_since: string;
}

export interface Zone {
  zone_id: string;
  zone_name: string;
  store_id: string;
  city: string;
  avg_distance_km: number;
  traffic_congestion_index: number; // 1.0 (light) to 3.0 (severe)
}

export interface SKU {
  sku_id: string;
  sku_name: string;
  category: 'Dairy & Bread' | 'Fresh Produce' | 'Beverages & Snacks' | 'Instant & Frozen' | 'Personal Care' | 'Cleaning & Household';
  shelf_life_days: number;
  unit_cost: number; // in INR
  unit_price: number; // in INR
  supplier_lead_time_days: number;
  min_batch_qty: number;
}

export interface Order {
  order_id: string;
  timestamp: string;
  date: string;
  hour: number;
  day_of_week: string;
  store_id: string;
  zone_id: string;
  sku_id: string;
  items_ordered: number;
  items_delivered: number;
  promised_delivery_mins: number;
  actual_delivery_mins: number;
  delivery_tat_mins: number;
  is_late: boolean;
  status: 'Delivered' | 'Partially Delivered' | 'Delayed' | 'Cancelled';
  cancelled_reason?: string;
}

export interface InventorySnapshot {
  snapshot_id: string;
  timestamp: string;
  date: string;
  store_id: string;
  sku_id: string;
  stock_on_hand: number;
  safety_stock: number;
  reorder_point: number;
  is_stockout: boolean;
  expired_units: number;
  wastage_cost: number;
}

export interface RiderAvailability {
  record_id: string;
  timestamp: string;
  date: string;
  hour: number;
  store_id: string;
  zone_id: string;
  active_riders: number;
  required_riders: number;
  rider_deficit: number;
  rider_utilization: number; // e.g. 0.85
  avg_batch_size: number;
  weather_condition: 'Clear' | 'Rain' | 'Heavy Rain' | 'Extreme Heat';
}

export interface OperationalKPIs {
  avgDeliveryTAT: number;
  lateOrdersPercent: number;
  fillRatePercent: number;
  stockoutRatePercent: number;
  totalWastageCost: number;
  totalOrders: number;
  totalItemsDelivered: number;
  totalItemsOrdered: number;
  totalLostRevenue: number;
}

export interface RootCauseSegment {
  dimension: 'zone' | 'store' | 'city' | 'category' | 'hour';
  segmentName: string;
  subSegment?: string;
  lateOrdersCount: number;
  lateOrdersShare: number; // percentage of all late orders
  avgTAT: number;
  stockoutShare: number;
  wastageShare: number;
  riderShortageAvg: number;
  primaryRootCause: string;
  recommendedAction: string;
}

export interface RootCauseDecomposition {
  headlineInsight: string;
  topContributingZones: RootCauseSegment[];
  topContributingHours: RootCauseSegment[];
  topContributingStores: RootCauseSegment[];
  topContributingCategories: RootCauseSegment[];
  bhubaneswarDeepDive: {
    citySummary: string;
    lateOrdersShareInCity: number;
    avgRiderDeficitEvening: number;
    worstZone: string;
    tatSpikeVsNormalPct: number;
  };
  paretoSummary: {
    top3ZonesLateShare: number;
    top3ZonesNames: string[];
    peakHoursLateShare: number;
    eveningPeakRange: string;
  };
}

export interface ForecastPoint {
  date: string;
  actual?: number;
  movingAverage?: number;
  prophetForecast: number;
  lowerConfidence: number;
  upperConfidence: number;
  isTestSet: boolean;
}

export interface ModelMetrics {
  movingAverageWAPE: number;
  movingAverageMAE: number;
  prophetWAPE: number;
  prophetMAE: number;
  trainSampleSize: number;
  testSampleSize: number;
}

export interface InventoryRecommendation {
  sku_id: string;
  sku_name: string;
  category: string;
  store_id: string;
  store_name: string;
  currentStock: number;
  avgDailyDemand: number;
  forecastDemandNext7D: number;
  safetyStock: number;
  reorderPoint: number;
  recommendedOrderQty: number;
  status: 'Critical Stockout' | 'Reorder Now' | 'Optimal' | 'Near Expiry Risk' | 'Slow Moving Drag';
  daysOfInventory: number;
  remainingShelfLifeDays: number;
  estimatedWastageRiskCost: number;
}

export interface FilterState {
  city: string;
  storeId: string;
  category: string;
  dateRange: 'all' | 'last7d' | 'last14d' | 'peakHoursOnly';
  peakHoursOnly: boolean;
  searchQuery: string;
}

export interface NLQueryResult {
  query: string;
  generatedSQL: string;
  explanation: string;
  executionTimeMs: number;
  rowCount: number;
  columns: string[];
  rows: Record<string, any>[];
  executiveInsight: string;
  rootCauseAttribution?: string;
  suggestedAction?: string;
}
