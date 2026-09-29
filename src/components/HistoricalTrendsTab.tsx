import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { Database, HardDrive, Zap, CheckCircle2, Archive, Layers, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { HISTORICAL_PARTITIONS } from '../data/mockDatabase';
import { HistoricalAggregate } from '../types/analytics';

export const HistoricalTrendsTab: React.FC = () => {
  const [partitions, setPartitions] = useState<HistoricalAggregate[]>(HISTORICAL_PARTITIONS);
  const [provisionMessage, setProvisionMessage] = useState<string | null>(null);

  const totalEventsAll = partitions.reduce((sum, p) => sum + p.totalEvents, 0);
  const totalStorageMb = partitions.reduce((sum, p) => sum + p.storageMb, 0);
  const totalBrinBlocks = partitions.reduce((sum, p) => sum + p.brinIndexBlocks, 0);

  // Approximate B-Tree vs BRIN index calculation:
  // B-tree for 28M rows = ~1,800 MB
  // BRIN for 28M rows = ~0.9 MB (99.95% reduction!)
  const estimatedBtreeMb = (totalEventsAll / 1000000) * 65.0;
  const actualBrinMb = (totalBrinBlocks * 8) / 1024; // 8KB per block in Postgres

  const handleCreateFuturePartition = () => {
    const nextWeekNumber = 40;
    const newPartition: HistoricalAggregate = {
      partition: `telemetry_p2026_w${nextWeekNumber} (PROVISIONED)`,
      date: '2026-10-06 to 2026-10-13',
      totalEvents: 0,
      avgLatencyMs: 0,
      p95LatencyMs: 0,
      errorCount: 0,
      storageMb: 0.1,
      brinIndexBlocks: 1
    };

    setPartitions([...partitions, newPartition]);
    setProvisionMessage(`Successfully executed: CREATE TABLE telemetry_p2026_w${nextWeekNumber} PARTITION OF telemetry_event_partitioned FOR VALUES FROM ('2026-10-06') TO ('2026-10-13');`);
    setTimeout(() => setProvisionMessage(null), 7000);
  };

  const chartData = partitions.map(p => ({
    name: p.partition.split(' ')[0].replace('telemetry_p', ''),
    events: Math.round(p.totalEvents / 1000) / 1000, // Millions
    avgLatency: p.avgLatencyMs,
    p95Latency: p.p95LatencyMs,
    storageMb: p.storageMb
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner / Concept Explainer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">
                PostgreSQL Declarative Partitioning & Long-Term Trend Architecture
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                Zero Full-Table Scans
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              To store years of operational logs without performance degradation, telemetry events are stored in PostgreSQL 
              using <strong className="text-white">RANGE Partitioning</strong> by <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">created_at</code> coupled with <strong className="text-white">BRIN (Block Range Indexes)</strong>. Queries for specific date ranges execute with instant partition pruning.
            </p>
          </div>

          <button
            onClick={handleCreateFuturePartition}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer self-start lg:self-auto"
          >
            <Layers className="w-4 h-4" />
            <span>Proactively Provision Next Partition</span>
          </button>
        </div>

        {provisionMessage && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{provisionMessage}</span>
          </div>
        )}
      </div>

      {/* Storage & Indexing Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium uppercase mb-1">Total Indexed Events</div>
          <div className="text-2xl font-bold font-mono text-white">
            {(totalEventsAll / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-slate-400 mt-1">Across 6 active weekly tables</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium uppercase mb-1">Total Partition Storage</div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {(totalStorageMb / 1024).toFixed(2)} GB
          </div>
          <div className="text-xs text-slate-400 mt-1">Uncompressed raw PostgreSQL heap</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium uppercase mb-1">BRIN Index Size</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {actualBrinMb.toFixed(2)} MB
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-1">
            vs ~{estimatedBtreeMb.toFixed(0)} MB for traditional B-Tree
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium uppercase mb-1">Storage Cost Reduction</div>
          <div className="text-2xl font-bold font-mono text-purple-400">
            99.9%
          </div>
          <div className="text-xs text-slate-400 mt-1">RAM footprint saved on index buffers</div>
        </div>
      </div>

      {/* Historical Long-Term Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Volume Growth per Partition */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="pb-3 mb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              Volume Trend Across Partitions (Millions of Events)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical ingestion growth managed effortlessly via weekly range tables
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="histEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="M" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="events" 
                  name="Events (Millions)" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#histEvents)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Historical Latency Stabilization */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="pb-3 mb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Historical Latency Stability (avg vs p95 ms)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Demonstrates consistent sub-50ms performance as data scales to tens of millions of rows
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="ms" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="avgLatency" name="Average Latency (ms)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="p95Latency" name="p95 Tail Latency (ms)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Partition Catalog Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              PostgreSQL Partition Catalog (<code className="text-xs text-indigo-300">pg_class / pg_inherits</code>)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual partition storage, BRIN block counts, and retention lifecycle
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Partition Table</th>
                <th className="py-2.5 px-3">Date Bounds</th>
                <th className="py-2.5 px-3 text-right">Row Count</th>
                <th className="py-2.5 px-3 text-right">Avg Latency</th>
                <th className="py-2.5 px-3 text-right">p95 Latency</th>
                <th className="py-2.5 px-3 text-right">Disk Size</th>
                <th className="py-2.5 px-3 text-right">BRIN Index Blocks</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {partitions.map((p) => {
                const isActive = p.partition.includes('ACTIVE');
                return (
                  <tr key={p.partition} className={isActive ? 'bg-indigo-950/20 font-semibold' : 'hover:bg-slate-800/40'}>
                    <td className="py-2.5 px-3 text-cyan-300">{p.partition}</td>
                    <td className="py-2.5 px-3 text-slate-400">{p.date}</td>
                    <td className="py-2.5 px-3 text-right text-white">
                      {p.totalEvents.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">{p.avgLatencyMs}ms</td>
                    <td className="py-2.5 px-3 text-right text-amber-300">{p.p95LatencyMs}ms</td>
                    <td className="py-2.5 px-3 text-right">{p.storageMb.toFixed(1)} MB</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">
                      {p.brinIndexBlocks} blks ({(p.brinIndexBlocks * 8)} KB)
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isActive 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {isActive ? 'READ / WRITE' : 'READ ONLY'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
