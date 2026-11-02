/**
 * QuickPulse Server Entry Point
 * Hosts Express API routes including server-side Gemini NL-to-SQL Agent
 * and mounts Vite development middleware.
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System prompt describing the Quick-Commerce Database Schema
const QUICK_COMMERCE_DB_PROMPT = `
You are an expert Quick-Commerce Data Engineer and Operations Analyst (like Blinkit / Zepto / Instacart).
Given a user's natural language question, generate a strictly READ-ONLY ANSI SQL query for SQLite,
and an Operations Executive Diagnostic Summary.

Database Schema:
1. orders (
     order_id TEXT, timestamp TEXT, date TEXT, hour INTEGER (8 to 23), day_of_week TEXT,
     store_id TEXT, zone_id TEXT, sku_id TEXT, items_ordered INTEGER, items_delivered INTEGER,
     promised_delivery_mins REAL, actual_delivery_mins REAL, delivery_tat_mins REAL,
     is_late BOOLEAN (1/0 or true/false), status TEXT ('Delivered', 'Partially Delivered', 'Delayed', 'Cancelled')
   )
2. stores (
     store_id TEXT, store_name TEXT, city TEXT ('Bhubaneswar', 'Bengaluru', 'Mumbai', 'Delhi-NCR', 'Hyderabad'),
     hub_type TEXT, capacity_orders_per_hr INTEGER, active_since TEXT
   )
3. zones (
     zone_id TEXT, zone_name TEXT, store_id TEXT, city TEXT,
     avg_distance_km REAL, traffic_congestion_index REAL
   )
4. skus (
     sku_id TEXT, sku_name TEXT, category TEXT ('Dairy & Bread', 'Fresh Produce', 'Beverages & Snacks', 'Instant & Frozen', 'Personal Care', 'Cleaning & Household'),
     shelf_life_days INTEGER, unit_cost REAL, unit_price REAL, supplier_lead_time_days INTEGER, min_batch_qty INTEGER
   )
5. inventory_snapshots (
     snapshot_id TEXT, timestamp TEXT, date TEXT, store_id TEXT, sku_id TEXT,
     stock_on_hand INTEGER, safety_stock INTEGER, reorder_point INTEGER,
     is_stockout BOOLEAN, expired_units INTEGER, wastage_cost REAL
   )
6. rider_availability (
     record_id TEXT, timestamp TEXT, date TEXT, hour INTEGER, store_id TEXT, zone_id TEXT,
     active_riders INTEGER, required_riders INTEGER, rider_deficit INTEGER,
     rider_utilization REAL, avg_batch_size REAL, weather_condition TEXT
   )

SAFETY RULES:
- ONLY generate read-only SELECT or WITH statements.
- NEVER generate INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, or any mutation statements.
- Use CTEs, JOINs, GROUP BY, and aggregates (COUNT, SUM, AVG, ROUND) appropriately.

Return a valid JSON object matching this schema:
{
  "generatedSQL": "SELECT ...",
  "explanation": "Short 1-2 sentence explanation of what the query calculates",
  "executiveInsight": "Executive diagnostic answering the user's question with operational root cause",
  "rootCauseAttribution": "Key root cause breakdown (e.g., rider deficit, stockout surge)",
  "suggestedAction": "Concrete immediate operational action for Ops/Category/Supply Chain"
}
`;

/**
 * Endpoint: /api/nl-to-sql
 * Accepts { query: string }
 * Returns structured JSON with safe read-only SQL and root-cause analysis
 */
app.post('/api/nl-to-sql', async (req: Request, res: Response): Promise<void> => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    res.status(400).json({ error: 'Query parameter is required' });
    return;
  }

  // Security check before calling model
  const uppercase = query.toUpperCase();
  if (['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER'].some(w => uppercase.includes(` ${w} `))) {
    res.status(400).json({ error: 'Modification statements are strictly prohibited.' });
    return;
  }

  if (!aiClient) {
    // If API key is not configured, send empty so client fallback takes over
    res.status(503).json({ 
      error: 'Gemini API key not configured on server', 
      fallbackNeeded: true 
    });
    return;
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `User Query: "${query}"`,
      config: {
        systemInstruction: QUICK_COMMERCE_DB_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);

    // Double verify generated SQL is strictly read-only
    const sqlUpper = (parsed.generatedSQL || '').toUpperCase();
    if (['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE'].some(w => sqlUpper.includes(w))) {
      res.status(400).json({ error: 'Generated SQL contains prohibited mutating keywords.' });
      return;
    }

    res.json(parsed);
  } catch (err: any) {
    console.error('Error generating NL-to-SQL via Gemini:', err);
    res.status(500).json({ 
      error: 'Failed to process natural language query with Gemini API',
      message: err.message || String(err),
      fallbackNeeded: true
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Dynamically create and mount Vite server
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`QuickPulse server listening on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
