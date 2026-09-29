import React, { useState } from 'react';
import { 
  Send, 
  Database, 
  CheckCircle2, 
  Flame, 
  AlertTriangle, 
  Cpu, 
  Clock, 
  Layers,
  ArrowRight,
  Code
} from 'lucide-react';
import { ServiceCategory } from '../types/analytics';
import { realtimeEngine } from '../services/realtimeEngine';

interface UserInputIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventIngested?: () => void;
}

export const UserInputIngestModal: React.FC<UserInputIngestModalProps> = ({
  isOpen,
  onClose,
  onEventIngested
}) => {
  const [service, setService] = useState<ServiceCategory>('payment_gateway');
  const [endpoint, setEndpoint] = useState('/api/v1/charge');
  const [latencyMs, setLatencyMs] = useState<number>(45);
  const [statusCode, setStatusCode] = useState<number>(200);
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('POST');
  const [region, setRegion] = useState<'us-east' | 'us-west' | 'eu-west' | 'ap-southeast'>('us-east');
  const [forceAnomaly, setForceAnomaly] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('usr_fin_8829');
  
  // Pipeline Trace Execution Result
  const [pipelineResult, setPipelineResult] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleServiceChange = (s: ServiceCategory) => {
    setService(s);
    if (s === 'payment_gateway') setEndpoint('/api/v1/charge');
    else if (s === 'auth_service') setEndpoint('/api/v1/oauth/token');
    else if (s === 'product_catalog') setEndpoint('/api/v1/products/search');
    else if (s === 'order_processor') setEndpoint('/api/v1/orders/checkout');
    else if (s === 'notification_mesh') setEndpoint('/api/v1/push/dispatch');
    else if (s === 'recommendation_api') setEndpoint('/api/v1/recommend/personalized');
  };

  const handleIngest = () => {
    setIsProcessing(true);
    setPipelineResult(null);

    setTimeout(() => {
      const res = realtimeEngine.ingestCustomEvent({
        service,
        endpoint,
        latencyMs: Number(latencyMs),
        statusCode: Number(statusCode),
        method,
        region,
        forceAnomaly,
        userId
      });

      setPipelineResult(res);
      setIsProcessing(false);
      if (onEventIngested) onEventIngested();
    }, 350);
  };

  const handleQuickAnomalyPreset = () => {
    setForceAnomaly(true);
    setLatencyMs(485);
    setStatusCode(504);
    setService('payment_gateway');
    setEndpoint('/api/v1/charge');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                Live End-User Telemetry Ingestion Console
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Input custom performance payloads to trace real-time execution across the Python stack
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Service Selector */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Microservice</label>
            <select
              value={service}
              onChange={(e) => handleServiceChange(e.target.value as ServiceCategory)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="payment_gateway">Payment Gateway</option>
              <option value="auth_service">Auth Service (Django RBAC)</option>
              <option value="product_catalog">Product Catalog</option>
              <option value="order_processor">Order Processor</option>
              <option value="notification_mesh">Notification Mesh</option>
              <option value="recommendation_api">Recommendation API</option>
            </select>
          </div>

          {/* Endpoint */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">HTTP Endpoint</label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Latency Input */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
              <span>Response Latency (ms)</span>
              <span className="text-slate-400 font-mono">{latencyMs}ms</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="800"
                step="5"
                value={latencyMs}
                onChange={(e) => setLatencyMs(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <input
                type="number"
                value={latencyMs}
                onChange={(e) => setLatencyMs(Number(e.target.value))}
                className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-center"
              />
            </div>
          </div>

          {/* HTTP Status Code */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">HTTP Status Code</label>
            <select
              value={statusCode}
              onChange={(e) => setStatusCode(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="200">200 OK (Success)</option>
              <option value="201">201 Created</option>
              <option value="400">400 Bad Request</option>
              <option value="401">401 Unauthorized</option>
              <option value="429">429 Rate Limited (Too Many Requests)</option>
              <option value="500">500 Internal Server Error</option>
              <option value="502">502 Bad Gateway</option>
              <option value="504">504 Gateway Timeout</option>
            </select>
          </div>

          {/* HTTP Method & Region */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">HTTP Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="POST">POST</option>
              <option value="GET">GET</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Client Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="us-east">us-east (N. Virginia)</option>
              <option value="us-west">us-west (Oregon)</option>
              <option value="eu-west">eu-west (Frankfurt)</option>
              <option value="ap-southeast">ap-southeast (Singapore)</option>
            </select>
          </div>
        </div>

        {/* Anomaly Checkbox & Preset Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forceAnomaly}
              onChange={(e) => setForceAnomaly(e.target.checked)}
              className="rounded accent-red-500"
            />
            <span className="text-slate-300 font-medium">Force Statistical Anomaly (|Z| &gt; 2.5)</span>
          </label>

          <button
            onClick={handleQuickAnomalyPreset}
            className="flex items-center gap-1 px-2.5 py-1 text-red-300 bg-red-950/40 border border-red-800/60 rounded hover:bg-red-900/40 transition cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Preset: Payment Latency Outlier</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-slate-400 font-mono">
            Async Non-Blocking Pipeline: FastAPI → Redis → Celery → Flask → PostgreSQL
          </div>
          <button
            onClick={handleIngest}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Pipeline...' : 'Ingest & Trigger Pipeline'}</span>
          </button>
        </div>

        {/* Live Pipeline Trace Result */}
        {pipelineResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-cyan-800/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  Telemetry Ingest Completed ({pipelineResult.pipelineBreakdown.totalMs}ms Total)
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                pipelineResult.event.isAnomaly
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {pipelineResult.event.isAnomaly ? `ANOMALY (Z = ${pipelineResult.event.anomalyScore})` : 'NORMAL TRAFFIC'}
              </span>
            </div>

            {/* Microservice Step Trace */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">1. FastAPI</div>
                <div className="text-emerald-400 font-bold">{pipelineResult.pipelineBreakdown.fastapiMs}ms</div>
                <div className="text-[9px] text-slate-500">Pydantic v2 Valid</div>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">2. Redis Broker</div>
                <div className="text-cyan-400 font-bold">{pipelineResult.pipelineBreakdown.redisQueueMs}ms</div>
                <div className="text-[9px] text-slate-500">Queue: {pipelineResult.task.queue}</div>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">3. Celery Task</div>
                <div className="text-indigo-400 font-bold">{pipelineResult.pipelineBreakdown.celeryExecutionMs}ms</div>
                <div className="text-[9px] text-slate-500">{pipelineResult.task.worker.split('@')[1]}</div>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">4. Flask SciPy</div>
                <div className="text-amber-400 font-bold">{pipelineResult.pipelineBreakdown.flaskScoringMs}ms</div>
                <div className="text-[9px] text-slate-500">Z-Score: {pipelineResult.event.anomalyScore}</div>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">5. PostgreSQL</div>
                <div className="text-purple-400 font-bold">{pipelineResult.pipelineBreakdown.postgresWriteMs}ms</div>
                <div className="text-[9px] text-slate-500">Table: {pipelineResult.event.partitionKey}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/80">
              <strong className="text-slate-200">Result:</strong> Event <code className="text-cyan-400">{pipelineResult.event.id}</code> has been indexed into PostgreSQL and broadcasted to the React Recharts dashboard.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
