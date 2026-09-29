import React, { useState } from 'react';
import { 
  Zap, 
  Database, 
  Cpu, 
  Flame, 
  ShieldCheck, 
  PieChart, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Info,
  Server,
  Layers
} from 'lucide-react';

interface NodeDetail {
  id: string;
  name: string;
  role: string;
  framework: string;
  tech: string;
  whyChosen: string;
  throughput: string;
  latencySla: string;
  interviewQuestion: string;
  interviewAnswer: string;
}

const ARCHITECTURE_NODES: NodeDetail[] = [
  {
    id: 'user_ingest',
    name: '1. Ingestion Client',
    role: 'Telemetry Producers',
    framework: 'React / Edge SDK',
    tech: 'WebSockets & JSON over HTTP/2',
    whyChosen: 'Simulates microservices, mobile apps, and IoT edge devices dispatching high-velocity performance payloads.',
    throughput: 'Up to 50,000 req/sec',
    latencySla: '< 10ms',
    interviewQuestion: 'Why not write directly from client into PostgreSQL?',
    interviewAnswer: 'Direct DB connections quickly exhaust connection pools and lock table rows. An async gateway + message queue decouples ingestion from storage.'
  },
  {
    id: 'fastapi',
    name: '2. Async Ingestion Gateway',
    role: 'High-Throughput Ingestion',
    framework: 'FastAPI + Uvicorn (ASGI)',
    tech: 'Python 3.10 asyncio, Pydantic v2, uvloop',
    whyChosen: 'FastAPI uses non-blocking asynchronous event loops to accept thousands of concurrent connections and validate schemas in sub-2 milliseconds.',
    throughput: '32,000 req/sec per core',
    latencySla: '< 2.5ms (p95)',
    interviewQuestion: 'Why FastAPI instead of Django or Flask for the gateway?',
    interviewAnswer: 'FastAPI is built natively on ASGI and uvloop, handling concurrent I/O without thread pool blocking. It achieves Node/Go level concurrency while keeping Python ecosystem benefits.'
  },
  {
    id: 'redis_broker',
    name: '3. Message Queue & Broker',
    role: 'Task Decoupling & Buffer',
    framework: 'Redis 7.2 (In-Memory)',
    tech: 'Redis Streams / Lists with persistence',
    whyChosen: 'Provides shock absorption against sudden traffic bursts (DDoS, flash sales) so downstream workers never get overwhelmed.',
    throughput: '100,000 ops/sec',
    latencySla: '< 0.5ms',
    interviewQuestion: 'What happens if Redis restarts or crashes?',
    interviewAnswer: 'We configure Redis with AOF (Append-Only File) sync every second and RDB snapshots, plus Celery task_acks_late so unacknowledged messages are automatically requeued.'
  },
  {
    id: 'celery_workers',
    name: '4. Distributed Task Workers',
    role: 'Asynchronous Heavy Processing',
    framework: 'Celery 5.4',
    tech: 'Prefetch multiplier = 4, gevent/pre-fork pools',
    whyChosen: 'Executes heavy mathematical operations, batched DB writes, and alert notifications outside the web request/response cycle.',
    throughput: '4,500 tasks/sec across pool',
    latencySla: '< 15ms queue wait',
    interviewQuestion: 'How do you handle task failures in Celery?',
    interviewAnswer: 'We implement exponential retry backoff (retry_backoff=True), dead-letter queues (DLQ) for poisoned messages, and task idempotency using event UUIDs.'
  },
  {
    id: 'flask_analytics',
    name: '5. Statistical Analytics Engine',
    role: 'Math, Z-Score & Anomaly ML',
    framework: 'Flask + NumPy + SciPy',
    tech: 'Vectorized C-extensions, pandas rolling windows',
    whyChosen: 'Flask microservice provides lightweight, pure Python scientific computing routines with minimal overhead.',
    throughput: '12,000 evaluations/sec',
    latencySla: '< 3.8ms computation',
    interviewQuestion: 'Why split Flask analytics from FastAPI?',
    interviewAnswer: 'Microservice separation of concerns: FastAPI specializes in high-concurrency async I/O, while the Flask service isolates CPU-bound vector computations.'
  },
  {
    id: 'postgresql',
    name: '6. Optimized Partitioned Storage',
    role: 'Long-Term Storage & SQL Engine',
    framework: 'PostgreSQL 16 + BRIN Indexing',
    tech: 'PARTITION BY RANGE (created_at), BRIN, B-tree, JSONB GIN',
    whyChosen: 'PostgreSQL table partitioning allows instant partition pruning on historical range queries. BRIN indexes shrink time-series index sizes by 99%.',
    throughput: '25,000 batched writes/sec',
    latencySla: '< 2.0ms query execution',
    interviewQuestion: 'Why table partitioning and BRIN indexes for historical logs?',
    interviewAnswer: 'Standard B-tree indexes on 100M rows consume 10GB+ of RAM. BRIN indexes store min/max values per page block, taking only 200KB while partition pruning skips 95% of disk scans.'
  },
  {
    id: 'django_admin',
    name: '7. Auth & Administrative Portal',
    role: 'RBAC Security & Administration',
    framework: 'Django 5.1 Admin & ORM',
    tech: 'Argon2 password hashing, RBAC Groups, Django ORM',
    whyChosen: 'Django provides the worlds most battle-tested user authentication, permission frameworks, and automatic back-office administration out of the box.',
    throughput: 'Standard Admin traffic',
    latencySla: '< 20ms response',
    interviewQuestion: 'Why use Django alongside FastAPI and Flask in one company?',
    interviewAnswer: 'In enterprise tech (e.g. Instagram, Robinhood), Django is used for back-office administration, billing, and auth, while FastAPI/Flask power high-frequency public APIs.'
  }
];

export const ArchitectureHero: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<NodeDetail>(ARCHITECTURE_NODES[1]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Interactive Microservice Architecture Flow
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/40">
              Click any node to inspect role & interview talking points
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Production-grade pipeline integrating FastAPI, Flask, Django, Celery, Redis, PostgreSQL, and React.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> E2E Latency: ~18ms
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> Zero Data Loss (ACKs Late)
          </span>
        </div>
      </div>

      {/* Architecture Flow Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {ARCHITECTURE_NODES.map((node, idx) => {
          const isSelected = selectedNode.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`p-2.5 rounded-lg border text-left transition-all relative cursor-pointer ${
                isSelected
                  ? 'bg-blue-950/80 border-cyan-500 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                  Step {idx + 1}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                )}
              </div>
              <h3 className="text-xs font-bold text-slate-100 truncate">
                {node.name.split('. ')[1] || node.name}
              </h3>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                {node.framework.split(' ')[0]}
              </p>
              <div className="mt-2 pt-1 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>{node.throughput.split(' ')[0]}</span>
                <span className="text-emerald-400 font-medium">{node.latencySla}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Node Deep Dive Drawer */}
      <div className="mt-4 p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                {selectedNode.framework}
              </span>
              <h4 className="text-sm font-bold text-white">{selectedNode.name}</h4>
              <span className="text-slate-400">— {selectedNode.role}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {selectedNode.whyChosen}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-slate-400 text-[11px]">
              <div><strong className="text-slate-200">Tech:</strong> {selectedNode.tech}</div>
              <div><strong className="text-slate-200">Peak Capacity:</strong> {selectedNode.throughput}</div>
              <div><strong className="text-slate-200">SLA:</strong> {selectedNode.latencySla}</div>
            </div>
          </div>

          {/* Recruiter / Interview Q&A Highlight */}
          <div className="md:w-5/12 bg-slate-900/90 border border-cyan-900/40 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
              <Info className="w-3.5 h-3.5" />
              <span>Full-Stack Python Interview Point</span>
            </div>
            <p className="font-medium text-slate-200">
              Q: "{selectedNode.interviewQuestion}"
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              A: {selectedNode.interviewAnswer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
