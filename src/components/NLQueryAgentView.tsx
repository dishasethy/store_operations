import React, { useState } from 'react';
import { Sparkles, Terminal, ShieldCheck, Play, Copy, Check, AlertCircle, ArrowRight, CornerDownLeft } from 'lucide-react';
import { DatabaseTables, SQLEngine } from '../engine/sqlEngine';
import { processNLQuery, SAMPLE_QUESTIONS } from '../engine/nlSqlAgent';
import { NLQueryResult } from '../types';

interface NLQueryAgentViewProps {
  tables: DatabaseTables;
  sqlEngine: SQLEngine;
  initialQuery?: string;
}

export const NLQueryAgentView: React.FC<NLQueryAgentViewProps> = ({ tables, sqlEngine, initialQuery }) => {
  const [queryInput, setQueryInput] = useState<string>(
    initialQuery || 'Why did late deliveries rise in Bhubaneswar last week?'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<NLQueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleRunQuery = async (queryToRun: string = queryInput) => {
    if (!queryToRun.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await processNLQuery(queryToRun, sqlEngine, tables);
      setResult(res);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySQL = () => {
    if (!result?.generatedSQL) return;
    navigator.clipboard.writeText(result.generatedSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Agent Intent */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                LangChain NL-to-SQL Intelligence Agent
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Ask operational diagnostic questions in natural language. The agent strictly generates read-only 
              <code className="text-emerald-400 font-mono px-1">SELECT</code> queries, executes them against the in-memory database, 
              and derives managerial root-cause attributions.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-800/40 rounded text-[11px] text-emerald-400 font-mono shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Read-Only Guardrails Active</span>
          </div>
        </div>

        {/* Query Input Box */}
        <div className="mt-4">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleRunQuery(); }}
            className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-1.5 focus-within:border-emerald-400 transition-colors"
          >
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="e.g. Why did late deliveries rise in Bhubaneswar last week?"
              className="w-full bg-transparent px-3 py-2 text-sm text-white focus:outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Executing...</span>
              ) : (
                <>
                  <span>Ask Agent</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Sample Manager Questions */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Suggested inquiries:</span>
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQueryInput(q.query);
                  handleRunQuery(q.query);
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] transition-colors cursor-pointer border border-slate-700/60"
              >
                {q.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Card */}
      {error && (
        <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-4 text-xs text-red-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-red-200">Query Execution Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* 2. Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Executive Diagnostic Summary */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-lg p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm text-white">Operations Executive Diagnostic</h3>
              <span className="text-[11px] text-slate-400 font-mono ml-auto">
                Executed in {result.executionTimeMs}ms · {result.rowCount} rows
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {result.executiveInsight}
              </p>

              {result.rootCauseAttribution && (
                <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60 text-xs">
                  <span className="text-amber-400 font-semibold block mb-1">Root Cause Attribution:</span>
                  <span className="text-slate-300 leading-relaxed">{result.rootCauseAttribution}</span>
                </div>
              )}

              {result.suggestedAction && (
                <div className="bg-emerald-950/20 p-3 rounded border border-emerald-800/40 text-xs">
                  <span className="text-emerald-400 font-semibold block mb-1">Recommended Operational Intervention:</span>
                  <span className="text-slate-200 leading-relaxed">{result.suggestedAction}</span>
                </div>
              )}
            </div>
          </div>

          {/* Generated SQL Code Block */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-sm text-white">Generated ANSI SQL Query</h3>
                <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 bg-slate-800 rounded">
                  Validated Read-Only
                </span>
              </div>

              <button
                onClick={handleCopySQL}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-xs text-emerald-400 font-mono overflow-x-auto leading-relaxed">
              {result.generatedSQL}
            </pre>
            <p className="mt-2 text-[11px] text-slate-400">
              {result.explanation}
            </p>
          </div>

          {/* Executed Data Table Result */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-semibold text-sm text-white">Execution Result Set ({result.rowCount} rows)</h3>
              <span className="text-[11px] text-slate-400 font-mono">SQLite In-Memory</span>
            </div>

            {result.rows.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Query executed successfully, returning 0 rows.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      {result.columns.map((col, idx) => (
                        <th key={idx} className="px-3 py-2.5">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {result.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-800/40 transition-colors">
                        {result.columns.map((col, colIdx) => (
                          <td 
                            key={colIdx} 
                            className={`px-3 py-2.5 ${typeof row[col] === 'number' ? 'text-right font-mono tabular-nums text-emerald-400' : 'text-slate-200'}`}
                          >
                            {row[col] !== undefined && row[col] !== null ? String(row[col]) : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
