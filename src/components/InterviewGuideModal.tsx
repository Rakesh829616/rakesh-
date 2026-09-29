import React from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  Terminal, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

interface InterviewGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InterviewGuideModal: React.FC<InterviewGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl text-white">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Full-Stack Python Engineer Interview Guide & Portfolio Talking Points
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Key architectural decisions, trade-offs, and metrics to ace senior full-stack Python interviews
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 1. Elevator Pitch */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-800/40 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>30-Second Elevator Pitch for Hiring Managers</span>
          </div>
          <p className="text-slate-200 text-xs leading-relaxed font-sans">
            "I built <strong>ApexMetrics</strong>, an enterprise-grade real-time analytics platform designed to solve the write-bottleneck in high-velocity telemetry pipelines. Instead of naive synchronous database writes, it uses a <strong>FastAPI async gateway</strong> validating payloads via Pydantic v2 in under 2ms, decouples persistence via a <strong>Redis broker and Celery worker pool</strong>, executes statistical Z-score anomaly detection using a <strong>Flask NumPy/SciPy microservice</strong>, stores multi-year historical logs in <strong>PostgreSQL partitioned tables with BRIN indexes</strong> (cutting index RAM by 99%), manages security and RBAC through <strong>Django Admin</strong>, and visualizes live trends with <strong>React and Recharts</strong>."
          </p>
        </div>

        {/* 2. Key Architecture Q&As */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Frequently Asked System Design & Python Questions
          </h4>

          {/* Q1 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">
                  Q1: Why use FastAPI for ingestion, Flask for analytics, and Django for administration instead of just one framework?
                </h5>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  <strong>Answer:</strong> It reflects modern microservice design by matching frameworks to their optimal concurrency models:
                </p>
                <ul className="text-xs text-slate-400 mt-1 space-y-1 list-disc list-inside">
                  <li><strong>FastAPI (ASGI):</strong> Built on <code>uvloop</code> and <code>asyncio</code>, excelling at high-throughput non-blocking I/O (handling 30,000+ incoming requests/sec).</li>
                  <li><strong>Flask + NumPy/SciPy (WSGI/Worker):</strong> Optimized for isolated CPU-bound numerical computing without event loop blocking.</li>
                  <li><strong>Django:</strong> Industry standard for back-office administration, custom user models, Argon2 password hashing, and group-based RBAC permissions.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Q2 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-start gap-2">
              <Database className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">
                  Q2: How is PostgreSQL optimized for storing historical logs for long-term trends?
                </h5>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  <strong>Answer:</strong> We implemented two critical database optimizations:
                </p>
                <ul className="text-xs text-slate-400 mt-1 space-y-1 list-disc list-inside">
                  <li><strong>Declarative Range Partitioning:</strong> Telemetry logs are partitioned weekly (e.g. <code>telemetry_p2026_w39</code>). When querying recent logs, the PostgreSQL query planner utilizes <em>partition pruning</em> to skip scanning past tables entirely.</li>
                  <li><strong>BRIN (Block Range Indexes):</strong> Unlike B-Trees which index every single row, BRIN stores summary ranges (min/max) per 32 disk pages. For 30 million rows, this drops index size from <strong>1.8 GB down to just 0.9 MB (99.9% reduction)</strong>, keeping indexes resident in RAM.</li>
                  <li><strong>Rollup Tables:</strong> A Celery Beat worker downsamples raw records into hourly aggregated percentiles (p50, p95, p99) for fast multi-year reporting.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Q3 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-start gap-2">
              <Cpu className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">
                  Q3: How does Celery and Redis ensure zero data loss during high load or worker failures?
                </h5>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  <strong>Answer:</strong>
                </p>
                <ul className="text-xs text-slate-400 mt-1 space-y-1 list-disc list-inside">
                  <li><strong>Task Acks Late (<code>task_acks_late=True</code>):</strong> The worker only sends an acknowledgment after the database transaction commits. If a worker process crashes mid-execution, Redis re-delivers the task to another worker.</li>
                  <li><strong>Prefetch Multiplier Tuning:</strong> Set <code>worker_prefetch_multiplier=4</code> to prevent any single worker from hoarding tasks while others sit idle.</li>
                  <li><strong>Exponential Retry Backoff:</strong> DB connection timeouts trigger retries with exponential backoff (<code>2 ** retries</code>), preventing database thundering herds.</li>
                  <li><strong>Batch Ingestion:</strong> Celery workers batch events into multi-row PostgreSQL <code>INSERT</code> or binary <code>COPY</code> operations, achieving over 50,000 writes/sec.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Q4 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">
                  Q4: How does Django manage authentication and RBAC in a distributed architecture?
                </h5>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  <strong>Answer:</strong> Django acts as the single source of truth for identity. Users authenticate via Argon2-hashed credentials and receive signed session tokens with associated permission sets (e.g. <code>analytics.execute_ddl</code>, <code>celery.trigger_task</code>). Microservices validate tokens against the Django auth database or cached Redis session keys.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
