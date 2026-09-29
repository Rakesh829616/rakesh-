import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts';
import { 
  TelemetryEvent, 
  TimeseriesMetricPoint, 
  ServiceCategory 
} from '../types/analytics';
import { 
  Activity, 
  AlertTriangle, 
  Zap, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Filter, 
  Eye, 
  Hash,
  Database
} from 'lucide-react';

interface RealtimeDashboardProps {
  timeseriesData: TimeseriesMetricPoint[];
  recentEvents: TelemetryEvent[];
  selectedServiceFilter: string;
  setSelectedServiceFilter: (service: string) => void;
  onOpenIngestModal: () => void;
}

export const RealtimeDashboard: React.FC<RealtimeDashboardProps> = ({
  timeseriesData,
  recentEvents,
  selectedServiceFilter,
  setSelectedServiceFilter,
  onOpenIngestModal
}) => {
  const [selectedEventModal, setSelectedEventModal] = useState<TelemetryEvent | null>(null);

  // Filtered events
  const filteredEvents = selectedServiceFilter === 'ALL'
    ? recentEvents
    : recentEvents.filter(e => e.service === selectedServiceFilter);

  // Latest snapshot metrics
  const latestPoint = timeseriesData[timeseriesData.length - 1] || {
    requestsPerSec: 210,
    p50Latency: 34.2,
    p95Latency: 82.5,
    p99Latency: 145.0,
    errorRate: 1.2,
    anomalyCount: 2,
    activeUsers: 1450,
    queueDepth: 4
  };

  // Compute service throughput distribution
  const serviceCounts: Record<string, number> = {};
  filteredEvents.slice(0, 80).forEach(e => {
    serviceCounts[e.service] = (serviceCounts[e.service] || 0) + 1;
  });

  const serviceChartData = Object.keys(serviceCounts).map(service => ({
    name: service.replace('_', ' '),
    count: serviceCounts[service],
    serviceKey: service
  }));

  // Z-Score distribution data for Flask statistical panel
  const zScoreData = recentEvents.slice(0, 40).map((e, idx) => ({
    index: idx,
    id: e.id,
    zScore: e.anomalyScore,
    latency: e.latencyMs,
    service: e.service,
    isAnomaly: e.isAnomaly,
    statusCode: e.statusCode
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* KPI 1: Ingestion Throughput */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">FastAPI Ingest</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">
              {latestPoint.requestsPerSec}
            </span>
            <span className="text-xs text-slate-400 font-mono">req/sec</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <span>↑ Non-blocking uvloop</span>
          </div>
        </div>

        {/* KPI 2: Median p50 Latency */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">p50 Latency</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">
              {latestPoint.p50Latency}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Standard baseline
          </div>
        </div>

        {/* KPI 3: p95 Tail Latency */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">p95 Latency</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${latestPoint.p95Latency > 120 ? 'text-amber-400' : 'text-white'}`}>
              {latestPoint.p95Latency}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Target SLA &lt; 150ms
          </div>
        </div>

        {/* KPI 4: Flask Anomaly Count */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Flask Outliers</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${latestPoint.anomalyCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {latestPoint.anomalyCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">detected</span>
          </div>
          <div className="text-[11px] text-amber-400/90 mt-1">
            SciPy |Z| &gt; 2.5
          </div>
        </div>

        {/* KPI 5: Error Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Error Rate</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${latestPoint.errorRate > 5 ? 'text-rose-400' : 'text-white'}`}>
              {latestPoint.errorRate}%
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            4xx & 5xx responses
          </div>
        </div>

        {/* KPI 6: Active Redis Queue Depth */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Celery Queue</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">
              {latestPoint.queueDepth}
            </span>
            <span className="text-xs text-slate-400 font-mono">tasks</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Optimal worker drain
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Real-time Ingestion & Latency Percentiles (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Live Ingestion Throughput & Latency (p50 / p95 / p99)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time 60-second rolling window rendered via Recharts ComposedChart
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                Window: 30 ticks
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeseriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rpsArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#06b6d4" 
                  fontSize={10} 
                  tickLine={false} 
                  label={{ value: 'req/sec', angle: -90, position: 'insideLeft', fill: '#06b6d4', fontSize: 10 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#a855f7" 
                  fontSize={10} 
                  tickLine={false} 
                  label={{ value: 'ms', angle: 90, position: 'insideRight', fill: '#a855f7', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                
                {/* SLA Threshold Reference */}
                <ReferenceLine yAxisId="right" y={150} label={{ value: 'SLA Limit (150ms)', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="4 4" />

                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="requestsPerSec" 
                  name="Requests/sec" 
                  stroke="#06b6d4" 
                  fillOpacity={1} 
                  fill="url(#rpsArea)" 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="p50Latency" 
                  name="p50 (Median) ms" 
                  stroke="#3b82f6" 
                  strokeWidth={1.5} 
                  dot={false}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="p95Latency" 
                  name="p95 Tail ms" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  dot={false}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="p99Latency" 
                  name="p99 Spike ms" 
                  stroke="#a855f7" 
                  strokeWidth={2} 
                  strokeDasharray="3 3"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flask SciPy Anomaly Detection & Z-Score Chart (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-lg flex flex-col">
          <div className="pb-3 mb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Flask Statistical Anomaly Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Z-score evaluations [ z = (x - μ) / σ ] across recent events
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zScoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="index" stroke="#64748b" fontSize={9} tickLine={false} label={{ value: 'Event Index', position: 'insideBottom', fontSize: 10, fill: '#64748b' }} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 6]} label={{ value: '|Z-Score|', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: any, name: any, item: any) => [
                    `|Z| = ${val} (Latency: ${item.payload.latency}ms)`,
                    item.payload.isAnomaly ? 'ANOMALY DETECTED' : 'NORMAL'
                  ]}
                />
                <ReferenceLine y={2.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Z > 2.5 Outlier Threshold', fill: '#ef4444', fontSize: 9 }} />
                <Bar dataKey="zScore" name="Z-Score">
                  {zScoreData.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`} 
                      fill={entry.zScore > 2.5 ? '#ef4444' : entry.zScore > 1.8 ? '#f59e0b' : '#06b6d4'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded border border-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Anomaly (&gt;2.5)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Warning (&gt;1.8)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Baseline
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Row: Service Throughput & Live Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Volume Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-400" />
                Throughput per Microservice
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribution across 6 active services
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceChartData} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Streaming Event Table (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-lg flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Ingested Telemetry Feed
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Streaming directly from FastAPI async socket buffer
              </p>
            </div>

            {/* Service Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedServiceFilter}
                onChange={(e) => setSelectedServiceFilter(e.target.value)}
                className="bg-slate-800 text-xs text-slate-300 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="ALL">All Services</option>
                <option value="payment_gateway">payment_gateway</option>
                <option value="auth_service">auth_service</option>
                <option value="product_catalog">product_catalog</option>
                <option value="order_processor">order_processor</option>
                <option value="notification_mesh">notification_mesh</option>
                <option value="recommendation_api">recommendation_api</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto max-h-64 flex-1">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-slate-950/90 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-2.5">Time</th>
                  <th className="py-2 px-2.5">Service</th>
                  <th className="py-2 px-2.5">Endpoint</th>
                  <th className="py-2 px-2.5">Latency</th>
                  <th className="py-2 px-2.5">Status</th>
                  <th className="py-2 px-2.5">Z-Score</th>
                  <th className="py-2 px-2.5">Partition</th>
                  <th className="py-2 px-2.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredEvents.slice(0, 15).map((evt) => {
                  const isErr = evt.statusCode >= 400;
                  return (
                    <tr 
                      key={evt.id} 
                      className={`hover:bg-slate-800/50 transition ${
                        evt.isAnomaly ? 'bg-red-950/20' : ''
                      }`}
                    >
                      <td className="py-1.5 px-2.5 text-slate-400">{evt.timeString}</td>
                      <td className="py-1.5 px-2.5">
                        <span className="text-cyan-300">{evt.service}</span>
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-400 truncate max-w-[140px]" title={evt.endpoint}>
                        {evt.endpoint}
                      </td>
                      <td className="py-1.5 px-2.5 font-bold">
                        <span className={evt.latencyMs > 150 ? 'text-amber-400' : 'text-slate-200'}>
                          {evt.latencyMs}ms
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isErr 
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60' 
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        }`}>
                          {evt.statusCode}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5">
                        <span className={evt.isAnomaly ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {evt.anomalyScore}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-500 text-[10px]">
                        {evt.partitionKey}
                      </td>
                      <td className="py-1.5 px-2.5 text-right">
                        <button
                          onClick={() => setSelectedEventModal(evt)}
                          className="text-slate-400 hover:text-cyan-400 p-1 rounded transition cursor-pointer"
                          title="Inspect raw event JSON"
                        >
                          <Eye className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Raw Event Detail Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Raw Telemetry Event Inspector
              </h4>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800 font-mono">
                <span className="text-slate-400">PostgreSQL Target:</span>
                <span className="text-cyan-400">telemetry_event_partitioned ({selectedEventModal.partitionKey})</span>
              </div>

              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-60">
                {JSON.stringify(selectedEventModal, null, 2)}
              </pre>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                Indexed with <strong className="text-slate-200">BRIN(created_at)</strong> for long-term storage efficiency and partitioned by weekly intervals.
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
