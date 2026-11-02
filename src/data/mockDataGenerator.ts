/**
 * Quick-Commerce Synthetic Dataset Generator
 * Mimics a real 10-20 minute dark store network (Blinkit / Zepto / Instacart model)
 * with seeded operational bottlenecks:
 *  - 19:00-21:00 evening peak hour congestion & order surges
 *  - Under-staffed zones (Bhubaneswar - Saheed Nagar & Patia, Bengaluru - Bellandur)
 *  - Fast-moving SKUs stocking out (Milk, Eggs, Tomatoes, Coconut)
 *  - Perishable inventory wastage and near-expiry spoilage
 */

import { Store, Zone, SKU, Order, InventorySnapshot, RiderAvailability } from '../types';

export const STORES: Store[] = [
  { store_id: 'DS-BBI-01', store_name: 'Saheed Nagar Dark Store', city: 'Bhubaneswar', hub_type: 'Hub', capacity_orders_per_hr: 180, active_since: '2025-01-15' },
  { store_id: 'DS-BBI-02', store_name: 'Patia Silicon Dark Store', city: 'Bhubaneswar', hub_type: 'Spoke Dark Store', capacity_orders_per_hr: 140, active_since: '2025-06-10' },
  { store_id: 'DS-BBI-03', store_name: 'Khandagiri Square DS', city: 'Bhubaneswar', hub_type: 'Spoke Dark Store', capacity_orders_per_hr: 120, active_since: '2025-08-01' },
  { store_id: 'DS-BLR-01', store_name: 'Koramangala 4th Block DS', city: 'Bengaluru', hub_type: 'Hub', capacity_orders_per_hr: 250, active_since: '2024-03-01' },
  { store_id: 'DS-BLR-02', store_name: 'Bellandur Tech Corridor DS', city: 'Bengaluru', hub_type: 'Spoke Dark Store', capacity_orders_per_hr: 220, active_since: '2024-07-20' },
  { store_id: 'DS-BLR-03', store_name: 'Indiranagar 100ft DS', city: 'Bengaluru', hub_type: 'Spoke Dark Store', capacity_orders_per_hr: 190, active_since: '2024-04-12' },
  { store_id: 'DS-BOM-01', store_name: 'Bandra Linking Road DS', city: 'Mumbai', hub_type: 'Hub', capacity_orders_per_hr: 260, active_since: '2023-11-05' },
  { store_id: 'DS-DEL-01', store_name: 'Gurgaon Cyber City DS', city: 'Delhi-NCR', hub_type: 'Hub', capacity_orders_per_hr: 240, active_since: '2024-01-10' },
  { store_id: 'DS-HYD-01', store_name: 'Hitec City Mindspace DS', city: 'Hyderabad', hub_type: 'Hub', capacity_orders_per_hr: 210, active_since: '2024-09-01' },
];

export const ZONES: Zone[] = [
  // Bhubaneswar
  { zone_id: 'ZN-BBI-01', zone_name: 'Saheed Nagar Commercial & Residential', store_id: 'DS-BBI-01', city: 'Bhubaneswar', avg_distance_km: 2.1, traffic_congestion_index: 2.4 },
  { zone_id: 'ZN-BBI-02', zone_name: 'Vani Vihar & Utkal University', store_id: 'DS-BBI-01', city: 'Bhubaneswar', avg_distance_km: 2.8, traffic_congestion_index: 1.8 },
  { zone_id: 'ZN-BBI-03', zone_name: 'Patia Infocity Tech Corridor', store_id: 'DS-BBI-02', city: 'Bhubaneswar', avg_distance_km: 3.2, traffic_congestion_index: 2.7 },
  { zone_id: 'ZN-BBI-04', zone_name: 'KIIT Campus & Residential Highrises', store_id: 'DS-BBI-02', city: 'Bhubaneswar', avg_distance_km: 2.4, traffic_congestion_index: 2.1 },
  { zone_id: 'ZN-BBI-05', zone_name: 'Khandagiri & Jagamara Hills', store_id: 'DS-BBI-03', city: 'Bhubaneswar', avg_distance_km: 3.5, traffic_congestion_index: 1.6 },
  
  // Bengaluru
  { zone_id: 'ZN-BLR-01', zone_name: 'Koramangala 4th & 5th Block', store_id: 'DS-BLR-01', city: 'Bengaluru', avg_distance_km: 1.8, traffic_congestion_index: 2.2 },
  { zone_id: 'ZN-BLR-02', zone_name: 'Bellandur EcoSpace Outer Ring Road', store_id: 'DS-BLR-02', city: 'Bengaluru', avg_distance_km: 3.6, traffic_congestion_index: 2.9 },
  { zone_id: 'ZN-BLR-03', zone_name: 'Sarjapur Main Road Junction', store_id: 'DS-BLR-02', city: 'Bengaluru', avg_distance_km: 3.9, traffic_congestion_index: 2.8 },
  { zone_id: 'ZN-BLR-04', zone_name: 'Indiranagar 12th Main & Defense Colony', store_id: 'DS-BLR-03', city: 'Bengaluru', avg_distance_km: 2.2, traffic_congestion_index: 2.0 },

  // Mumbai, Delhi, Hyderabad
  { zone_id: 'ZN-BOM-01', zone_name: 'Bandra West Pali Hill & Carter Road', store_id: 'DS-BOM-01', city: 'Mumbai', avg_distance_km: 2.5, traffic_congestion_index: 2.5 },
  { zone_id: 'ZN-DEL-01', zone_name: 'Cyber City DLF Phase 2 & 3', store_id: 'DS-DEL-01', city: 'Delhi-NCR', avg_distance_km: 2.7, traffic_congestion_index: 2.3 },
  { zone_id: 'ZN-HYD-01', zone_name: 'Hitec City Madhapur Sector', store_id: 'DS-HYD-01', city: 'Hyderabad', avg_distance_km: 2.9, traffic_congestion_index: 2.2 },
];

export const SKUS: SKU[] = [
  // Dairy & Bread (Perishable, high velocity)
  { sku_id: 'SKU-001', sku_name: 'Amul Taaza Fresh Toned Milk 500ml', category: 'Dairy & Bread', shelf_life_days: 2, unit_cost: 26, unit_price: 29, supplier_lead_time_days: 1, min_batch_qty: 120 },
  { sku_id: 'SKU-002', sku_name: 'Britannia 100% Whole Wheat Bread 400g', category: 'Dairy & Bread', shelf_life_days: 4, unit_cost: 40, unit_price: 50, supplier_lead_time_days: 1, min_batch_qty: 60 },
  { sku_id: 'SKU-003', sku_name: 'Fresh Farm Brown Eggs (Pack of 6)', category: 'Dairy & Bread', shelf_life_days: 10, unit_cost: 48, unit_price: 65, supplier_lead_time_days: 2, min_batch_qty: 80 },
  { sku_id: 'SKU-004', sku_name: 'Milky Mist Fresh Malai Paneer 200g', category: 'Dairy & Bread', shelf_life_days: 15, unit_cost: 85, unit_price: 115, supplier_lead_time_days: 2, min_batch_qty: 50 },
  
  // Fresh Produce (Ultra perishable, high stockout & wastage risk)
  { sku_id: 'SKU-005', sku_name: 'Organic Hybrid Tomatoes 500g', category: 'Fresh Produce', shelf_life_days: 4, unit_cost: 22, unit_price: 35, supplier_lead_time_days: 1, min_batch_qty: 100 },
  { sku_id: 'SKU-006', sku_name: 'Cavendish Fresh Bananas 1kg', category: 'Fresh Produce', shelf_life_days: 3, unit_cost: 38, unit_price: 58, supplier_lead_time_days: 1, min_batch_qty: 70 },
  { sku_id: 'SKU-007', sku_name: 'Tender Green Coconut (1 pc)', category: 'Fresh Produce', shelf_life_days: 6, unit_cost: 42, unit_price: 65, supplier_lead_time_days: 2, min_batch_qty: 60 },
  { sku_id: 'SKU-008', sku_name: 'Hydroponic Baby Spinach 250g', category: 'Fresh Produce', shelf_life_days: 3, unit_cost: 32, unit_price: 55, supplier_lead_time_days: 1, min_batch_qty: 40 },
  { sku_id: 'SKU-009', sku_name: 'Nashik Red Onions 1kg', category: 'Fresh Produce', shelf_life_days: 20, unit_cost: 28, unit_price: 42, supplier_lead_time_days: 2, min_batch_qty: 120 },

  // Beverages & Snacks (High velocity, steady shelf life)
  { sku_id: 'SKU-010', sku_name: 'Epigamia Greek Yogurt Berry 90g', category: 'Beverages & Snacks', shelf_life_days: 14, unit_cost: 42, unit_price: 60, supplier_lead_time_days: 3, min_batch_qty: 40 },
  { sku_id: 'SKU-011', sku_name: 'Coca-Cola Zero Can 300ml', category: 'Beverages & Snacks', shelf_life_days: 180, unit_cost: 28, unit_price: 40, supplier_lead_time_days: 3, min_batch_qty: 96 },
  { sku_id: 'SKU-012', sku_name: 'Lays West Indies Hot n Sweet Chilli 50g', category: 'Beverages & Snacks', shelf_life_days: 120, unit_cost: 14, unit_price: 20, supplier_lead_time_days: 3, min_batch_qty: 100 },
  { sku_id: 'SKU-013', sku_name: 'Red Bull Energy Drink 250ml', category: 'Beverages & Snacks', shelf_life_days: 360, unit_cost: 92, unit_price: 125, supplier_lead_time_days: 4, min_batch_qty: 48 },

  // Instant & Frozen
  { sku_id: 'SKU-014', sku_name: 'Maggi 2-Minute Special Masala 4-Pack', category: 'Instant & Frozen', shelf_life_days: 240, unit_cost: 54, unit_price: 70, supplier_lead_time_days: 3, min_batch_qty: 80 },
  { sku_id: 'SKU-015', sku_name: 'McCain French Fries Crispy 450g', category: 'Instant & Frozen', shelf_life_days: 360, unit_cost: 110, unit_price: 155, supplier_lead_time_days: 3, min_batch_qty: 40 },
  
  // Personal Care & Household
  { sku_id: 'SKU-016', sku_name: 'Dettol Original Liquid Handwash 200ml', category: 'Personal Care', shelf_life_days: 720, unit_cost: 72, unit_price: 99, supplier_lead_time_days: 5, min_batch_qty: 36 },
  { sku_id: 'SKU-017', sku_name: 'Surf Excel Matic Front Load Liquid 1L', category: 'Cleaning & Household', shelf_life_days: 720, unit_cost: 175, unit_price: 235, supplier_lead_time_days: 5, min_batch_qty: 24 }
];

// Pseudo-random deterministic generator with seed
class PRNG {
  private s: number;
  constructor(seed: number = 42) {
    this.s = seed % 2147483647;
    if (this.s <= 0) this.s += 2147483646;
  }
  next(): number {
    this.s = (this.s * 16807) % 2147483647;
    return (this.s - 1) / 2147483646;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  intRange(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

export function generateSyntheticDataset(days: number = 28) {
  const prng = new PRNG(1337);
  const orders: Order[] = [];
  const inventorySnapshots: InventorySnapshot[] = [];
  const riderAvailability: RiderAvailability[] = [];

  const baseDate = new Date('2026-11-02T00:00:00Z');
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let orderCounter = 10001;
  let snapshotCounter = 50001;
  let riderCounter = 80001;

  // Track inventory state across days
  // key: `${store_id}_${sku_id}` -> current stock
  const currentStockMap: Map<string, number> = new Map();
  STORES.forEach(s => {
    SKUS.forEach(sku => {
      currentStockMap.set(`${s.store_id}_${sku.sku_id}`, sku.min_batch_qty * 1.5);
    });
  });

  for (let d = days - 1; d >= 0; d--) {
    const curDate = new Date(baseDate.getTime() - d * 24 * 3600 * 1000);
    const dateStr = curDate.toISOString().split('T')[0];
    const dayOfWeek = dayNames[curDate.getUTCDay()];
    const isWeekend = curDate.getUTCDay() === 0 || curDate.getUTCDay() === 6;

    // Daily morning replenishment
    STORES.forEach(s => {
      SKUS.forEach(sku => {
        const key = `${s.store_id}_${sku.sku_id}`;
        let stock = currentStockMap.get(key) || 0;
        
        // Fast moving SKUs are replenished daily, but often under-allocated for evening surges
        const replenishment = sku.min_batch_qty * (isWeekend ? 1.4 : 1.1);
        stock += replenishment;

        // Spoilage calculation for short shelf life (bananas, milk, spinach)
        let expiredUnits = 0;
        if (sku.shelf_life_days <= 4 && stock > sku.min_batch_qty * 1.8) {
          expiredUnits = Math.floor(stock * 0.08); // 8% spoilage if overstocked
          stock -= expiredUnits;
        }

        const wastageCost = Math.round(expiredUnits * sku.unit_cost);
        const safetyStock = Math.round(sku.min_batch_qty * 0.35);
        const reorderPoint = Math.round(safetyStock + (sku.min_batch_qty * 0.6 * sku.supplier_lead_time_days));
        const isStockout = stock <= 0;

        currentStockMap.set(key, Math.max(0, stock));

        inventorySnapshots.push({
          snapshot_id: `SNAP-${snapshotCounter++}`,
          timestamp: `${dateStr}T23:59:00Z`,
          date: dateStr,
          store_id: s.store_id,
          sku_id: sku.sku_id,
          stock_on_hand: Math.max(0, Math.round(stock)),
          safety_stock: safetyStock,
          reorder_point: reorderPoint,
          is_stockout: isStockout,
          expired_units: expiredUnits,
          wastage_cost: wastageCost,
        });
      });
    });

    // Generate Hourly Rider Availability & Orders (08:00 to 23:00)
    for (let hour = 8; hour <= 23; hour++) {
      const isEveningPeak = hour >= 19 && hour <= 21; // 7 PM - 9 PM peak
      const isLunchPeak = hour >= 12 && hour <= 14;

      // Weather shock seeded on some days
      const isRainDay = (d % 7 === 2 || d % 7 === 5);
      const weather = isRainDay ? (hour >= 18 ? 'Heavy Rain' : 'Rain') : 'Clear';

      // For each store and zone
      ZONES.forEach(zone => {
        const store = STORES.find(s => s.store_id === zone.store_id)!;
        
        // Base required riders
        let baseRiders = 6;
        if (isLunchPeak) baseRiders = 11;
        if (isEveningPeak) baseRiders = 19;
        if (isWeekend) baseRiders += 3;

        // Bottleneck zones have severe rider shortages:
        // ZN-BBI-01 (Saheed Nagar), ZN-BBI-03 (Patia Infocity), ZN-BLR-02 (Bellandur)
        const isChronicShortageZone = 
          zone.zone_id === 'ZN-BBI-01' || 
          zone.zone_id === 'ZN-BBI-03' || 
          zone.zone_id === 'ZN-BLR-02';

        let activeRiders = baseRiders;
        if (isChronicShortageZone && isEveningPeak) {
          // Significant shortage in evening peak (up to 45% deficit)
          activeRiders = Math.max(5, Math.round(baseRiders * 0.58));
        } else if (isRainDay && hour >= 18) {
          // Riders log off during heavy rain
          activeRiders = Math.max(4, Math.round(baseRiders * 0.65));
        } else {
          activeRiders = Math.max(4, Math.round(baseRiders * prng.range(0.85, 1.05)));
        }

        const requiredRiders = baseRiders;
        const riderDeficit = Math.max(0, requiredRiders - activeRiders);
        const riderUtilization = Math.min(1.2, +(requiredRiders / Math.max(1, activeRiders)).toFixed(2));
        const avgBatchSize = isEveningPeak ? 2.4 : 1.3;

        riderAvailability.push({
          record_id: `RD-${riderCounter++}`,
          timestamp: `${dateStr}T${hour.toString().padStart(2, '0')}:00:00Z`,
          date: dateStr,
          hour,
          store_id: store.store_id,
          zone_id: zone.zone_id,
          active_riders: activeRiders,
          required_riders: requiredRiders,
          rider_deficit: riderDeficit,
          rider_utilization: riderUtilization,
          avg_batch_size: avgBatchSize,
          weather_condition: weather,
        });

        // Determine number of orders for this hour & zone
        let orderCount = prng.intRange(3, 8);
        if (isLunchPeak) orderCount = prng.intRange(8, 14);
        if (isEveningPeak) orderCount = prng.intRange(16, 28);
        if (isWeekend && isEveningPeak) orderCount = prng.intRange(22, 36);

        // Generate individual orders
        for (let i = 0; i < orderCount; i++) {
          const minute = prng.intRange(0, 59);
          const second = prng.intRange(0, 59);
          const timestamp = `${dateStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}Z`;
          
          // Fast-moving SKUs ordered more frequently
          let sku: SKU;
          const roll = prng.next();
          if (roll < 0.28) {
            sku = SKUS[0]; // Amul Taaza Milk
          } else if (roll < 0.44) {
            sku = SKUS[2]; // Brown Eggs
          } else if (roll < 0.58) {
            sku = SKUS[4]; // Farm Tomatoes
          } else if (roll < 0.70) {
            sku = SKUS[6]; // Tender Coconut
          } else {
            sku = prng.choice(SKUS);
          }

          const itemsOrdered = prng.intRange(1, 4);
          const key = `${store.store_id}_${sku.sku_id}`;
          const currentStock = currentStockMap.get(key) || 0;

          let itemsDelivered = itemsOrdered;
          let status: Order['status'] = 'Delivered';

          if (currentStock <= 0) {
            // Out of stock
            itemsDelivered = 0;
            status = 'Cancelled';
          } else if (currentStock < itemsOrdered) {
            // Partial fulfillment
            itemsDelivered = currentStock;
            currentStockMap.set(key, 0);
            status = 'Partially Delivered';
          } else {
            // Fulfilled
            currentStockMap.set(key, currentStock - itemsOrdered);
          }

          // Promised delivery time in quick-commerce: 12 to 15 mins
          const promisedDeliveryMins = 14;

          // Delivery TAT (Turnaround Time) calculation
          // Base TAT: 9 - 13 mins
          let actualDeliveryMins = prng.range(8.5, 12.8);

          // Impact of traffic index and distance
          actualDeliveryMins += (zone.avg_distance_km * 1.5) + (zone.traffic_congestion_index * 1.8);

          // Impact of evening peak congestion
          if (isEveningPeak) {
            actualDeliveryMins += prng.range(5.0, 9.5);
          }

          // Impact of rider deficit in understaffed zone
          if (riderDeficit > 0) {
            actualDeliveryMins += (riderDeficit * 2.3);
          }

          // Impact of weather
          if (weather === 'Rain') actualDeliveryMins += 4.5;
          if (weather === 'Heavy Rain') actualDeliveryMins += 8.2;

          // Round to 1 decimal
          actualDeliveryMins = +actualDeliveryMins.toFixed(1);
          const isLate = actualDeliveryMins > promisedDeliveryMins;

          if (isLate && status === 'Delivered') {
            status = 'Delayed';
          }

          orders.push({
            order_id: `ORD-${orderCounter++}`,
            timestamp,
            date: dateStr,
            hour,
            day_of_week: dayOfWeek,
            store_id: store.store_id,
            zone_id: zone.zone_id,
            sku_id: sku.sku_id,
            items_ordered: itemsOrdered,
            items_delivered: itemsDelivered,
            promised_delivery_mins: promisedDeliveryMins,
            actual_delivery_mins: actualDeliveryMins,
            delivery_tat_mins: actualDeliveryMins,
            is_late: isLate,
            status,
            cancelled_reason: status === 'Cancelled' ? 'SKU Stockout at Dark Store' : undefined,
          });
        }
      });
    }
  }

  return {
    stores: STORES,
    zones: ZONES,
    skus: SKUS,
    orders,
    inventory_snapshots: inventorySnapshots,
    rider_availability: riderAvailability,
  };
}
