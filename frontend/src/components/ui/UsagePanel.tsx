import React, { useEffect, useState } from 'react';
import { BarChart2, DollarSign, Activity, Zap, RefreshCw } from 'lucide-react';
import { UsageMetrics } from '../../lib/types';
import { api } from '../../lib/api';

export const UsagePanel: React.FC = () => {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getUsage();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading && !metrics) {
    return (
      <div className="p-8 text-center font-mono text-xs text-svizz-muted">
        [FETCHING TELEMETRY & TOKEN LOGS...]
      </div>
    );
  }

  const summary = metrics?.summary || {
    total_requests: 0,
    total_input_tokens: 0,
    total_output_tokens: 0,
    total_tokens: 0,
    total_estimated_cost_usd: 0
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-svizz-muted uppercase tracking-wider">
          SYSTEM USAGE & COST TELEMETRY
        </div>
        <button
          onClick={fetchMetrics}
          className="flex items-center gap-1 text-[10px] text-svizz-accent hover:underline"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-black border border-svizz-border">
          <div className="text-[10px] text-svizz-muted uppercase flex items-center gap-1">
            <Activity className="w-3 h-3 text-svizz-accent" />
            <span>REQUESTS</span>
          </div>
          <div className="text-xl font-bold text-svizz-text mt-1">
            {summary.total_requests}
          </div>
        </div>

        <div className="p-3 bg-black border border-svizz-border">
          <div className="text-[10px] text-svizz-muted uppercase flex items-center gap-1">
            <Zap className="w-3 h-3 text-svizz-accent" />
            <span>TOTAL TOKENS</span>
          </div>
          <div className="text-xl font-bold text-svizz-text mt-1">
            {summary.total_tokens.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-black border border-svizz-border">
          <div className="text-[10px] text-svizz-muted uppercase flex items-center gap-1">
            <Zap className="w-3 h-3 text-svizz-accent" />
            <span>IN / OUT</span>
          </div>
          <div className="text-xs font-bold text-svizz-text mt-1">
            {summary.total_input_tokens.toLocaleString()} / {summary.total_output_tokens.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-black border border-svizz-border">
          <div className="text-[10px] text-svizz-muted uppercase flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span>EST. COST</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            ${summary.total_estimated_cost_usd.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Model Breakdown */}
      {metrics?.model_breakdown && Object.keys(metrics.model_breakdown).length > 0 && (
        <div>
          <div className="text-[10px] text-svizz-muted uppercase mb-2">
            MODEL BREAKDOWN
          </div>
          <div className="border border-svizz-border overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-zinc-950 border-b border-svizz-border text-svizz-muted">
                <tr>
                  <th className="p-2">MODEL</th>
                  <th className="p-2">REQS</th>
                  <th className="p-2">TOTAL TOKENS</th>
                  <th className="p-2 text-right">COST (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-svizz-border/30 bg-black">
                {Object.entries(metrics.model_breakdown).map(([mName, data]) => (
                  <tr key={mName}>
                    <td className="p-2 font-bold text-svizz-text">{mName}</td>
                    <td className="p-2">{data.requests}</td>
                    <td className="p-2">{data.total_tokens.toLocaleString()}</td>
                    <td className="p-2 text-right text-emerald-400">${data.cost.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity Log */}
      {metrics?.recent_logs && metrics.recent_logs.length > 0 && (
        <div>
          <div className="text-[10px] text-svizz-muted uppercase mb-2">
            RECENT ACTIVITY
          </div>
          <div className="border border-svizz-border max-h-48 overflow-y-auto bg-black">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-zinc-950 border-b border-svizz-border text-svizz-muted sticky top-0">
                <tr>
                  <th className="p-1.5">TIME</th>
                  <th className="p-1.5">MODEL</th>
                  <th className="p-1.5">ACTION</th>
                  <th className="p-1.5">TOKENS</th>
                  <th className="p-1.5 text-right">COST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-svizz-border/20">
                {metrics.recent_logs.slice().reverse().map((log) => (
                  <tr key={log.id}>
                    <td className="p-1.5 text-svizz-muted">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="p-1.5 text-svizz-text">{log.model}</td>
                    <td className="p-1.5 uppercase">{log.action}</td>
                    <td className="p-1.5">{log.input_tokens + log.output_tokens}</td>
                    <td className="p-1.5 text-right text-emerald-400">${log.cost.toFixed(5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
