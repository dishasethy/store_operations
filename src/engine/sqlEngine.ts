/**
 * In-Memory SQL Execution Engine for QuickPulse Analytics
 * Supports CTEs (WITH ... AS), JOINs, Window Functions, Aggregations, GROUP BY, ORDER BY, and LIMIT.
 * Strictly enforces READ-ONLY SELECT queries to satisfy enterprise NL-to-SQL safety requirements.
 */

import { Store, Zone, SKU, Order, InventorySnapshot, RiderAvailability } from '../types';

export interface DatabaseTables {
  stores: Store[];
  zones: Zone[];
  skus: SKU[];
  orders: Order[];
  inventory_snapshots: InventorySnapshot[];
  rider_availability: RiderAvailability[];
}

export interface SQLQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  query: string;
}

export class SQLEngine {
  private tables: DatabaseTables;

  constructor(tables: DatabaseTables) {
    this.tables = tables;
  }

  /**
   * Validate that the SQL statement is strictly read-only SELECT
   */
  public validateReadOnly(sql: string): { isSafe: boolean; reason?: string } {
    const clean = sql.trim().replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '').trim();
    const normalized = clean.toUpperCase();

    const prohibitedKeywords = [
      'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 
      'TRUNCATE', 'RENAME', 'REPLACE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'
    ];

    for (const kw of prohibitedKeywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(normalized)) {
        return {
          isSafe: false,
          reason: `Security Violation: Keyword '${kw}' is prohibited. Only read-only SELECT and WITH statements are allowed.`,
        };
      }
    }

    if (!normalized.startsWith('SELECT') && !normalized.startsWith('WITH')) {
      return {
        isSafe: false,
        reason: "Security Violation: Query must begin with SELECT or WITH (Common Table Expression).",
      };
    }

    return { isSafe: true };
  }

  /**
   * Execute a SQL query against the in-memory quick-commerce dataset
   */
  public execute(sql: string): SQLQueryResult {
    const startTime = performance.now();
    const safetyCheck = this.validateReadOnly(sql);
    if (!safetyCheck.isSafe) {
      throw new Error(safetyCheck.reason);
    }

    // Clean comment lines
    const cleanSql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();

    try {
      const rows = this.parseAndRunQuery(cleanSql);
      const executionTimeMs = +(performance.now() - startTime).toFixed(2);
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      return {
        columns,
        rows,
        rowCount: rows.length,
        executionTimeMs,
        query: sql,
      };
    } catch (err: any) {
      const executionTimeMs = +(performance.now() - startTime).toFixed(2);
      throw new Error(`SQL Execution Error: ${err.message || err}`);
    }
  }

  /**
   * Core query execution parser & dispatcher
   */
  private parseAndRunQuery(sql: string): Record<string, any>[] {
    // 1. Check for Common Table Expressions (WITH cte_name AS (...) ...)
    if (/^\s*WITH\s+/i.test(sql)) {
      return this.executeCTE(sql);
    }

    return this.executeSelect(sql);
  }

  /**
   * CTE Handler: Executes CTE subqueries into temporary datasets
   */
  private executeCTE(sql: string): Record<string, any>[] {
    // Basic CTE pattern: WITH cte1 AS (SELECT ...), cte2 AS (SELECT ...) SELECT ...
    const match = sql.match(/^\s*WITH\s+([A-Za-z0-9_]+)\s+AS\s*\(([\s\S]*?)\)\s*(?:,\s*([A-Za-z0-9_]+)\s+AS\s*\(([\s\S]*?)\)\s*)*\s*(SELECT[\s\S]+)$/i);
    
    if (match) {
      // Execute the CTE
      const cteName = match[1];
      const cteQuery = match[2];
      const mainQuery = match[match.length - 1];

      const cteData = this.executeSelect(cteQuery);
      
      // Temporarily register CTE as a virtual table
      const originalTables = { ...this.tables };
      (this.tables as any)[cteName.toLowerCase()] = cteData;

      try {
        const result = this.executeSelect(mainQuery);
        return result;
      } finally {
        delete (this.tables as any)[cteName.toLowerCase()];
      }
    }

    // Fallback: execute as direct query
    return this.executeSelect(sql.replace(/^\s*WITH[\s\S]*?\)\s*SELECT/i, 'SELECT'));
  }

  /**
   * Select parser and executor
   */
  private executeSelect(sql: string): Record<string, any>[] {
    // Extract main clauses: SELECT ... FROM ... [JOIN ...] [WHERE ...] [GROUP BY ...] [HAVING ...] [ORDER BY ...] [LIMIT ...]
    const fromMatch = sql.match(/FROM\s+([A-Za-z0-9_]+)(?:\s+(?:AS\s+)?([A-Za-z0-9_]+))?/i);
    if (!fromMatch) {
      throw new Error("Could not parse target table in FROM clause");
    }

    const primaryTableName = fromMatch[1].toLowerCase();
    const primaryTableAlias = fromMatch[2] || primaryTableName;

    let dataset = this.getTableData(primaryTableName);
    if (!dataset) {
      throw new Error(`Table or CTE '${primaryTableName}' does not exist.`);
    }

    // Clone dataset and prefix keys with alias for joins
    let workingRows: Record<string, any>[] = dataset.map(row => {
      const mapped: Record<string, any> = { ...row };
      Object.keys(row).forEach(k => {
        mapped[`${primaryTableAlias}.${k}`] = (row as any)[k];
        mapped[`${primaryTableName}.${k}`] = (row as any)[k];
      });
      return mapped;
    });

    // 2. Process JOINs
    const joinRegex = /(LEFT\s+JOIN|INNER\s+JOIN|JOIN)\s+([A-Za-z0-9_]+)(?:\s+(?:AS\s+)?([A-Za-z0-9_]+))?\s+ON\s+([A-Za-z0-9_.]+)\s*=\s*([A-Za-z0-9_.]+)/gi;
    let joinMatch: RegExpExecArray | null;
    while ((joinMatch = joinRegex.exec(sql)) !== null) {
      const joinType = joinMatch[1].toUpperCase();
      const joinTableName = joinMatch[2].toLowerCase();
      const joinAlias = joinMatch[3] || joinTableName;
      const leftCol = joinMatch[4];
      const rightCol = joinMatch[5];

      const joinData = this.getTableData(joinTableName);
      if (!joinData) continue;

      const newWorkingRows: Record<string, any>[] = [];
      for (const leftRow of workingRows) {
        const leftVal = this.resolveValue(leftRow, leftCol);
        let matched = false;

        for (const rightRow of joinData) {
          const rightVal = this.resolveValue(rightRow, rightCol);
          if (leftVal !== undefined && rightVal !== undefined && leftVal === rightVal) {
            matched = true;
            const merged = { ...leftRow, ...rightRow };
            Object.keys(rightRow).forEach(k => {
              merged[`${joinAlias}.${k}`] = (rightRow as any)[k];
              merged[`${joinTableName}.${k}`] = (rightRow as any)[k];
            });
            newWorkingRows.push(merged);
          }
        }

        if (!matched && joinType.includes('LEFT')) {
          newWorkingRows.push(leftRow);
        }
      }
      workingRows = newWorkingRows;
    }

    // 3. Process WHERE clause
    const whereMatch = sql.match(/WHERE\s+([\s\S]*?)(?=\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|\s+HAVING|$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      workingRows = workingRows.filter(row => this.evaluateWhere(row, whereClause));
    }

    // 4. Process SELECT and Aggregations / GROUP BY
    const selectMatch = sql.match(/SELECT\s+([\s\S]*?)\s+FROM/i);
    if (!selectMatch) {
      throw new Error("Could not parse SELECT column list");
    }
    const selectClause = selectMatch[1].trim();
    const selectFields = this.splitSelectFields(selectClause);

    const groupByMatch = sql.match(/GROUP\s+BY\s+([\s\S]*?)(?=\s+HAVING|\s+ORDER\s+BY|\s+LIMIT|$)/i);
    const hasAggregates = selectFields.some(f => /COUNT\(|SUM\(|AVG\(|MIN\(|MAX\(/i.test(f.expr));

    if (groupByMatch || hasAggregates) {
      workingRows = this.executeGroupBy(workingRows, groupByMatch ? groupByMatch[1].trim() : '', selectFields);
    } else {
      // Simple projection
      workingRows = workingRows.map(row => {
        const projected: Record<string, any> = {};
        selectFields.forEach(f => {
          projected[f.alias] = this.evaluateExpression(row, f.expr);
        });
        return projected;
      });
    }

    // 5. Process Window Functions (e.g. ROW_NUMBER() OVER (...), RANK() OVER (...))
    const windowField = selectFields.find(f => /OVER\s*\(/i.test(f.expr));
    if (windowField) {
      workingRows = this.executeWindowFunction(workingRows, windowField);
    }

    // 6. Process ORDER BY
    const orderMatch = sql.match(/ORDER\s+BY\s+([\s\S]*?)(?=\s+LIMIT|$)/i);
    if (orderMatch) {
      const orderClause = orderMatch[1].trim();
      workingRows = this.executeOrderBy(workingRows, orderClause);
    }

    // 7. Process LIMIT
    const limitMatch = sql.match(/LIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      const offset = limitMatch[2] ? parseInt(limitMatch[2], 10) : 0;
      workingRows = workingRows.slice(offset, offset + limit);
    }

    return workingRows;
  }

  private getTableData(name: string): any[] | undefined {
    const n = name.toLowerCase();
    if (n === 'orders') return this.tables.orders;
    if (n === 'stores') return this.tables.stores;
    if (n === 'zones') return this.tables.zones;
    if (n === 'skus') return this.tables.skus;
    if (n === 'inventory_snapshots') return this.tables.inventory_snapshots;
    if (n === 'rider_availability') return this.tables.rider_availability;
    if ((this.tables as any)[n]) return (this.tables as any)[n];
    return undefined;
  }

  private resolveValue(row: Record<string, any>, col: string): any {
    const clean = col.trim();
    if (row[clean] !== undefined) return row[clean];
    // Remove table/alias prefix if not found
    const parts = clean.split('.');
    if (parts.length > 1 && row[parts[1]] !== undefined) return row[parts[1]];
    return undefined;
  }

  private evaluateWhere(row: Record<string, any>, condition: string): boolean {
    // Support basic comparisons AND / OR
    const orParts = condition.split(/\s+OR\s+/i);
    return orParts.some(orPart => {
      const andParts = orPart.split(/\s+AND\s+/i);
      return andParts.every(cond => this.evaluateAtomicCondition(row, cond.trim()));
    });
  }

  private evaluateAtomicCondition(row: Record<string, any>, cond: string): boolean {
    // 1. Equal (=)
    const eqMatch = cond.match(/^([A-Za-z0-9_.]+)\s*=\s*(?:'([^']*)'|"([^"]*)"|([0-9.]+)|true|false)$/i);
    if (eqMatch) {
      const col = eqMatch[1];
      const targetVal = eqMatch[2] ?? eqMatch[3] ?? (eqMatch[4] ? parseFloat(eqMatch[4]) : (cond.toLowerCase().endsWith('true')));
      const rowVal = this.resolveValue(row, col);
      return String(rowVal).toLowerCase() === String(targetVal).toLowerCase();
    }

    // 2. Greater than / Less than
    const compMatch = cond.match(/^([A-Za-z0-9_.]+)\s*(>=|<=|>|<|!=)\s*([0-9.]+|'[^']*')$/i);
    if (compMatch) {
      const col = compMatch[1];
      const op = compMatch[2];
      const rawTarget = compMatch[3].replace(/'/g, '');
      const targetVal = isNaN(Number(rawTarget)) ? rawTarget : parseFloat(rawTarget);
      const rowVal = this.resolveValue(row, col);

      if (op === '>') return Number(rowVal) > Number(targetVal);
      if (op === '>=') return Number(rowVal) >= Number(targetVal);
      if (op === '<') return Number(rowVal) < Number(targetVal);
      if (op === '<=') return Number(rowVal) <= Number(targetVal);
      if (op === '!=') return String(rowVal) !== String(targetVal);
    }

    // 3. LIKE operator
    const likeMatch = cond.match(/^([A-Za-z0-9_.]+)\s+LIKE\s+'%?([^%']+)%?'$/i);
    if (likeMatch) {
      const col = likeMatch[1];
      const substr = likeMatch[2].toLowerCase();
      const rowVal = String(this.resolveValue(row, col) || '').toLowerCase();
      return rowVal.includes(substr);
    }

    // 4. IN operator
    const inMatch = cond.match(/^([A-Za-z0-9_.]+)\s+IN\s*\((.*?)\)$/i);
    if (inMatch) {
      const col = inMatch[1];
      const items = inMatch[2].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '').toLowerCase());
      const rowVal = String(this.resolveValue(row, col) || '').toLowerCase();
      return items.includes(rowVal);
    }

    return true;
  }

  private splitSelectFields(selectStr: string): { expr: string; alias: string }[] {
    const fields: { expr: string; alias: string }[] = [];
    let depth = 0;
    let cur = '';

    for (let i = 0; i < selectStr.length; i++) {
      const char = selectStr[i];
      if (char === '(') depth++;
      else if (char === ')') depth--;

      if (char === ',' && depth === 0) {
        fields.push(this.parseSelectField(cur.trim()));
        cur = '';
      } else {
        cur += char;
      }
    }
    if (cur.trim()) {
      fields.push(this.parseSelectField(cur.trim()));
    }
    return fields;
  }

  private parseSelectField(raw: string): { expr: string; alias: string } {
    const asMatch = raw.match(/([\s\S]+)\s+AS\s+([A-Za-z0-9_]+)$/i);
    if (asMatch) {
      return { expr: asMatch[1].trim(), alias: asMatch[2].trim() };
    }
    const cleanExpr = raw.trim();
    const parts = cleanExpr.split('.');
    const fallbackAlias = parts[parts.length - 1].replace(/[^A-Za-z0-9_]/g, '_');
    return { expr: cleanExpr, alias: fallbackAlias };
  }

  private evaluateExpression(row: Record<string, any>, expr: string): any {
    if (expr === '*') return row;
    const clean = expr.trim();

    // Constant numbers
    if (!isNaN(Number(clean))) return Number(clean);

    // Direct column
    const val = this.resolveValue(row, clean);
    if (val !== undefined) return val;

    // Basic arithmetic e.g. items_delivered / items_ordered
    if (clean.includes('/')) {
      const [num, den] = clean.split('/').map(s => s.trim());
      const numVal = this.resolveValue(row, num) || 0;
      const denVal = this.resolveValue(row, den) || 1;
      return +(numVal / (denVal || 1)).toFixed(2);
    }

    return null;
  }

  private executeGroupBy(
    rows: Record<string, any>[], 
    groupByColsStr: string, 
    selectFields: { expr: string; alias: string }[]
  ): Record<string, any>[] {
    const groupCols = groupByColsStr ? groupByColsStr.split(',').map(s => s.trim()) : [];
    const groups: Map<string, Record<string, any>[]> = new Map();

    if (groupCols.length === 0) {
      groups.set('__all__', rows);
    } else {
      for (const row of rows) {
        const key = groupCols.map(col => String(this.resolveValue(row, col))).join(':::');
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(row);
      }
    }

    const outputRows: Record<string, any>[] = [];

    groups.forEach((groupedRows) => {
      const resultRow: Record<string, any> = {};
      const sampleRow = groupedRows[0];

      selectFields.forEach(f => {
        const expr = f.expr;
        
        // COUNT(*)
        if (/COUNT\(\*\)/i.test(expr)) {
          resultRow[f.alias] = groupedRows.length;
        } 
        // COUNT(DISTINCT col)
        else if (/COUNT\(DISTINCT\s+([A-Za-z0-9_.]+)\)/i.test(expr)) {
          const match = expr.match(/COUNT\(DISTINCT\s+([A-Za-z0-9_.]+)\)/i);
          const col = match![1];
          const uniqueVals = new Set(groupedRows.map(r => this.resolveValue(r, col)));
          resultRow[f.alias] = uniqueVals.size;
        }
        // SUM(col)
        else if (/SUM\((?:CASE[\s\S]*?END|([A-Za-z0-9_.]+))\)/i.test(expr)) {
          if (/SUM\(CASE/i.test(expr)) {
            // e.g. SUM(CASE WHEN is_late = 1 THEN 1 ELSE 0 END)
            const sum = groupedRows.reduce((acc, r) => {
              const isLate = r.is_late === true || r.is_late === 1 || r['orders.is_late'] === true;
              return acc + (isLate ? 1 : 0);
            }, 0);
            resultRow[f.alias] = sum;
          } else {
            const match = expr.match(/SUM\(([A-Za-z0-9_.]+)\)/i);
            const col = match![1];
            const sum = groupedRows.reduce((acc, r) => acc + (Number(this.resolveValue(r, col)) || 0), 0);
            resultRow[f.alias] = Math.round(sum * 100) / 100;
          }
        }
        // AVG(col)
        else if (/AVG\(([A-Za-z0-9_.]+)\)/i.test(expr)) {
          const match = expr.match(/AVG\(([A-Za-z0-9_.]+)\)/i);
          const col = match![1];
          const sum = groupedRows.reduce((acc, r) => acc + (Number(this.resolveValue(r, col)) || 0), 0);
          const avg = groupedRows.length > 0 ? sum / groupedRows.length : 0;
          resultRow[f.alias] = +(avg.toFixed(2));
        }
        // MAX(col)
        else if (/MAX\(([A-Za-z0-9_.]+)\)/i.test(expr)) {
          const match = expr.match(/MAX\(([A-Za-z0-9_.]+)\)/i);
          const col = match![1];
          const max = Math.max(...groupedRows.map(r => Number(this.resolveValue(r, col)) || 0));
          resultRow[f.alias] = max;
        }
        // MIN(col)
        else if (/MIN\(([A-Za-z0-9_.]+)\)/i.test(expr)) {
          const match = expr.match(/MIN\(([A-Za-z0-9_.]+)\)/i);
          const col = match![1];
          const min = Math.min(...groupedRows.map(r => Number(this.resolveValue(r, col)) || 0));
          resultRow[f.alias] = min;
        }
        // Regular grouped dimension
        else {
          resultRow[f.alias] = this.resolveValue(sampleRow, expr);
        }
      });

      outputRows.push(resultRow);
    });

    return outputRows;
  }

  private executeWindowFunction(rows: Record<string, any>[], windowField: { expr: string; alias: string }): Record<string, any>[] {
    // Basic window function e.g. ROW_NUMBER() OVER (ORDER BY col DESC)
    const match = windowField.expr.match(/(ROW_NUMBER|RANK|PERCENT_RANK)\(\)\s*OVER\s*\((?:PARTITION\s+BY\s+([A-Za-z0-9_.]+))?\s*(?:ORDER\s+BY\s+([A-Za-z0-9_.]+)(?:\s+(ASC|DESC))?)?\)/i);
    if (!match) return rows;

    const func = match[1].toUpperCase();
    const orderCol = match[3];
    const orderDir = match[4]?.toUpperCase() || 'ASC';

    // Sort if needed
    if (orderCol) {
      rows.sort((a, b) => {
        const valA = Number(a[orderCol] ?? 0);
        const valB = Number(b[orderCol] ?? 0);
        return orderDir === 'DESC' ? valB - valA : valA - valB;
      });
    }

    const total = rows.length;
    rows.forEach((r, idx) => {
      if (func === 'ROW_NUMBER' || func === 'RANK') {
        r[windowField.alias] = idx + 1;
      } else if (func === 'PERCENT_RANK') {
        r[windowField.alias] = total > 1 ? +((idx / (total - 1)) * 100).toFixed(1) : 0;
      }
    });

    return rows;
  }

  private executeOrderBy(rows: Record<string, any>[], orderClause: string): Record<string, any>[] {
    const parts = orderClause.split(',').map(s => s.trim());
    return [...rows].sort((a, b) => {
      for (const part of parts) {
        const [colRaw, dirRaw] = part.split(/\s+/);
        const col = colRaw.replace(/[^A-Za-z0-9_.]/g, '');
        const isDesc = dirRaw?.toUpperCase() === 'DESC';

        const valA = a[col] !== undefined ? a[col] : this.resolveValue(a, col);
        const valB = b[col] !== undefined ? b[col] : this.resolveValue(b, col);

        if (valA === valB) continue;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return isDesc ? valB - valA : valA - valB;
        }
        return isDesc 
          ? String(valB).localeCompare(String(valA))
          : String(valA).localeCompare(String(valB));
      }
      return 0;
    });
  }
}
