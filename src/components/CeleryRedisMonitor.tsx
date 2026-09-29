import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Activity, 
  Play, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Server,
  Layers,
  Terminal,
  Zap
} from 'lucide-react';
import { CeleryTask, CeleryWorkerStats } from '../types/analytics';
import { INITIAL_CELERY_WORKERS } from '../data/mockDatabase';

interface CeleryRedisMonitorProps {
  tasks: CeleryTask[];
  onTriggerTask: (taskName: string, queue: string) => void;
}

export const CeleryRedisMonitor: React.FC<CeleryRedisMonitorProps> = ({
  tasks,
  onTriggerTask
}) => {
  const [workers, setWorkers] = useState<CeleryWorkerStats[]>(INITIAL_CELERY_WORKERS);
  const [activeQueueFilter, setActiveQueueFilter] = useState<string>('ALL');
  const [dispatchAlert, setDispatchAlert] = useState<string | null>(null);

  const handleManualDispatch = (taskName: string, queue: string) => {
    onTriggerTask(taskName, queue);
    setDispatchAlert(`Task ${taskName} dispatched to Redis broker queue [${queue}]. Celery worker executing asynchronously.`);
    setTimeout(() => setDispatchAlert(null), 5000);
  };

  const filteredTasks = activeQueueFilter === 'ALL'
    ? tasks
    : tasks.filter(t => t.queue === activeQueueFilter);

  const totalCompleted = workers.reduce((acc, w) => acc + w.completedTasks, 0) + tasks.filter(t => t.state === 'SUCCESS').length;
  const totalFailed = workers.reduce((acc, w) => acc + w.failedTasks, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                Celery Distributed Task Queue & Redis Broker Architecture
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">
                Prefetch Multiplier = 4
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Decouples high-volume HTTP ingestion from heavy database writes and ML computations. 
              Tasks are persisted to Redis with <strong className="text-white">task_acks_late=True</strong>, ensuring zero data loss even during node reboots.
            </p>
          </div>

          {/* Quick Task Dispatchers */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => handleManualDispatch('tasks.retrain_isolation_forest', 'priority_alerts')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Retrain Anomaly Model</span>
            </button>
            <button
              onClick={() => handleManualDispatch('tasks.generate_hourly_partition_rollup', 'telemetry_stream')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run Hourly Rollup</span>
            </button>
          </div>
        </div>

        {dispatchAlert && (
          <div className="mt-4 p-3 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-200 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{dispatchAlert}</span>
          </div>
        )}
      </div>

      {/* Redis Broker Metrics & Celery Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium uppercase mb-1">Redis Broker Status</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center gap-2">
            CONNECTED
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-xs text-slate-400 mt-1">redis://localhost:6379/0 (AOF Enabled)</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium uppercase mb-1">Active Celery Workers</div>
          <div className="text-2xl font-bold font-mono text-white">
            3 Nodes (16 Cores)
          </div>
          <div className="text-xs text-slate-400 mt-1">Concurrency pool: pre-fork</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium uppercase mb-1">Tasks Completed</div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {totalCompleted.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Stored in django-celery-results</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium uppercase mb-1">Worker Error Rate</div>
          <div className="text-2xl font-bold font-mono text-slate-200">
            {((totalFailed / (totalCompleted + 1)) * 100).toFixed(2)}%
          </div>
          <div className="text-xs text-slate-400 mt-1">Auto-retried with exponential backoff</div>
        </div>
      </div>

      {/* Worker Pool Status Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="pb-3 mb-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            Active Celery Worker Nodes
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitored in real time via Celery Inspect API & Redis broker heartbeat
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workers.map((worker) => (
            <div key={worker.workerName} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">{worker.workerName.split(' ')[0]}</h4>
                  <p className="text-[11px] text-cyan-400 mt-0.5">{worker.workerName.split('(')[1]?.replace(')', '')}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ONLINE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Concurrency</div>
                  <div className="text-slate-200 font-bold">{worker.concurrency} processes</div>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Active Tasks</div>
                  <div className="text-amber-400 font-bold">{worker.activeTasks} running</div>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <div className="text-slate-500 text-[10px]">CPU Usage</div>
                  <div className="text-slate-200">{worker.cpuPercent}%</div>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Memory (RSS)</div>
                  <div className="text-slate-200">{worker.memoryMb} MB</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Celery Task Execution Feed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Live Celery Task Execution Log
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time tasks consumed from Redis lists and executed by Celery workers
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Queue:</span>
            <select
              value={activeQueueFilter}
              onChange={(e) => setActiveQueueFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs cursor-pointer focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Queues</option>
              <option value="telemetry_stream">telemetry_stream</option>
              <option value="priority_alerts">priority_alerts</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
              <tr>
                <th className="py-2 px-3">Task ID</th>
                <th className="py-2 px-3">Task Name</th>
                <th className="py-2 px-3">Queue</th>
                <th className="py-2 px-3">Worker Node</th>
                <th className="py-2 px-3">Runtime</th>
                <th className="py-2 px-3">State</th>
                <th className="py-2 px-3">Result Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredTasks.slice(0, 15).map((task) => (
                <tr key={task.id} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-400 truncate max-w-[120px]">{task.id}</td>
                  <td className="py-2 px-3 text-cyan-300 font-bold">{task.name}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                      {task.queue}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">{task.worker.split('@')[1]}</td>
                  <td className="py-2 px-3 font-semibold text-amber-300">{task.executionTimeMs}ms</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.state === 'SUCCESS' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : task.state === 'RETRY'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {task.state}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400 text-[11px] truncate max-w-[200px]">
                    {task.resultSummary || 'Committed successfully'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
