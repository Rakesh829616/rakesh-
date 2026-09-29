import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ArchitectureHero } from './components/ArchitectureHero';
import { RealtimeDashboard } from './components/RealtimeDashboard';
import { HistoricalTrendsTab } from './components/HistoricalTrendsTab';
import { CeleryRedisMonitor } from './components/CeleryRedisMonitor';
import { PostgresSchemaStudio } from './components/PostgresSchemaStudio';
import { DjangoAuthManager } from './components/DjangoAuthManager';
import { UserInputIngestModal } from './components/UserInputIngestModal';
import { CodeViewerModal } from './components/CodeViewerModal';
import { InterviewGuideModal } from './components/InterviewGuideModal';
import { 
  UserSession, 
  TimeseriesMetricPoint, 
  TelemetryEvent, 
  CeleryTask 
} from './types/analytics';
import { INITIAL_USERS } from './data/mockDatabase';
import { realtimeEngine } from './services/realtimeEngine';
import { Layers } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession>(INITIAL_USERS[0]);
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesMetricPoint[]>([]);
  const [recentEvents, setRecentEvents] = useState<TelemetryEvent[]>([]);
  const [recentTasks, setRecentTasks] = useState<CeleryTask[]>([]);
  
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentRate, setCurrentRate] = useState<number>(50);
  const [activeTab, setActiveTab] = useState<string>('realtime');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('ALL');

  // Modals
  const [showIngestModal, setShowIngestModal] = useState<boolean>(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [showInterviewGuide, setShowInterviewGuide] = useState<boolean>(false);

  // Subscribe to real-time telemetry engine on mount
  useEffect(() => {
    // Initial batch
    setRecentEvents([...realtimeEngine.recentEvents]);
    setRecentTasks([...realtimeEngine.recentTasks]);

    const unsubscribeMetrics = realtimeEngine.subscribe((point, event) => {
      setTimeseriesData((prev) => {
        const next = [...prev, point];
        return next.length > 30 ? next.slice(next.length - 30) : next;
      });

      setRecentEvents((prev) => {
        const next = [event, ...prev];
        return next.length > 100 ? next.slice(0, 100) : next;
      });
    });

    const unsubscribeTasks = realtimeEngine.subscribeTasks((task) => {
      setRecentTasks((prev) => {
        const next = [task, ...prev];
        return next.length > 50 ? next.slice(0, 50) : next;
      });
    });

    return () => {
      unsubscribeMetrics();
      unsubscribeTasks();
    };
  }, []);

  const handleTogglePause = () => {
    if (isPaused) {
      realtimeEngine.resume();
      setIsPaused(false);
    } else {
      realtimeEngine.pause();
      setIsPaused(true);
    }
  };

  const handleRateChange = (rate: number) => {
    setCurrentRate(rate);
    realtimeEngine.setRate(rate);
    setIsPaused(false);
  };

  const handleTriggerAnomaly = () => {
    realtimeEngine.triggerAnomalyBurst(8);
  };

  const handleTriggerManualTask = (taskName: string, queue: string) => {
    const newTask: CeleryTask = {
      id: `task_${Math.random().toString(36).substr(2, 9)}`,
      name: taskName,
      queue,
      state: 'SUCCESS',
      executionTimeMs: Math.round((8 + Math.random() * 22) * 10) / 10,
      createdAt: Date.now() - 30,
      completedAt: Date.now(),
      worker: queue === 'priority_alerts' ? 'celery@worker-node-beta' : 'celery@worker-node-alpha',
      retries: 0,
      args: { manual_trigger_by: currentUser.username },
      resultSummary: 'Executed and committed'
    };

    setRecentTasks((prev) => [newTask, ...prev]);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      exported_at: new Date().toISOString(),
      user: currentUser.username,
      total_events_captured: recentEvents.length,
      sample_telemetry: recentEvents.slice(0, 50),
      recent_celery_tasks: recentTasks.slice(0, 20)
    }, null, 2));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `apexmetrics_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation & Controls */}
      <Header
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onRateChange={handleRateChange}
        currentRate={currentRate}
        onTriggerAnomaly={handleTriggerAnomaly}
        onOpenIngestModal={() => setShowIngestModal(true)}
        onOpenArchitectureModal={() => setShowArchitectureModal(true)}
        onOpenCodeModal={() => setShowCodeModal(true)}
        onOpenInterviewGuide={() => setShowInterviewGuide(true)}
        onExportData={handleExportData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Interactive Architecture Flow (Prominently featured on all tabs or collapsible) */}
        <ArchitectureHero />

        {/* Tab 1: Real-time Recharts Dashboards */}
        {activeTab === 'realtime' && (
          <RealtimeDashboard
            timeseriesData={timeseriesData}
            recentEvents={recentEvents}
            selectedServiceFilter={selectedServiceFilter}
            setSelectedServiceFilter={setSelectedServiceFilter}
            onOpenIngestModal={() => setShowIngestModal(true)}
          />
        )}

        {/* Tab 2: PostgreSQL Historical Trends & Range Partitioning */}
        {activeTab === 'historical' && (
          <HistoricalTrendsTab />
        )}

        {/* Tab 3: Celery Distributed Task Queue & Redis Broker */}
        {activeTab === 'celery_redis' && (
          <CeleryRedisMonitor
            tasks={recentTasks}
            onTriggerTask={handleTriggerManualTask}
          />
        )}

        {/* Tab 4: PostgreSQL Schema & Live SQL Studio */}
        {activeTab === 'postgres_sql' && (
          <PostgresSchemaStudio />
        )}

        {/* Tab 5: Django Authentication & RBAC */}
        {activeTab === 'django_rbac' && (
          <DjangoAuthManager
            currentUser={currentUser}
            onSelectUser={setCurrentUser}
          />
        )}
      </main>

      {/* Interactive Modals */}
      <UserInputIngestModal
        isOpen={showIngestModal}
        onClose={() => setShowIngestModal(false)}
        onEventIngested={() => {
          // Live refresh
        }}
      />

      <CodeViewerModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />

      <InterviewGuideModal
        isOpen={showInterviewGuide}
        onClose={() => setShowInterviewGuide(false)}
      />

      {/* Architecture Modal (Optional Quick View) */}
      {showArchitectureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                ApexMetrics Enterprise Architecture Summary
              </h3>
              <button
                onClick={() => setShowArchitectureModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
              <p>
                <strong className="text-cyan-400 font-mono">1. Ingestion Layer (FastAPI):</strong> Asynchronous non-blocking endpoints running on ASGI uvicorn. Validates payloads at C-speed using Pydantic v2 and returns HTTP 202 Accepted in &lt;2ms.
              </p>
              <p>
                <strong className="text-amber-400 font-mono">2. Task Broker & Queue (Redis + Celery):</strong> Decouples the ingestion path from heavy operations. Redis holds priority queues while distributed Celery workers pull tasks with <code>task_acks_late=True</code>.
              </p>
              <p>
                <strong className="text-blue-400 font-mono">3. Statistical ML Engine (Flask + NumPy/SciPy):</strong> Isolated vector calculations compute dynamic Z-scores and IQR outlier fences, flagging anomalies above threshold.
              </p>
              <p>
                <strong className="text-indigo-400 font-mono">4. Storage Layer (PostgreSQL 16):</strong> Range-partitioned table <code>telemetry_event_partitioned</code> with weekly rotation and BRIN indexes reducing index memory overhead by 99%.
              </p>
              <p>
                <strong className="text-purple-400 font-mono">5. Administrative & Security Framework (Django):</strong> Centralized user models, Argon2 password hashing, RBAC permissions, and back-office management.
              </p>
              <p>
                <strong className="text-emerald-400 font-mono">6. Real-Time Visualization (React + Recharts):</strong> Dynamic timeseries composed charts, anomaly scatter graphs, and sub-second metrics updates.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowArchitectureModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Strip */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950 py-6 px-4 lg:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">ApexMetrics Enterprise</span>
            <span>—</span>
            <span>Production Real-Time Python & React Analytics Engine</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>FastAPI 0.115</span>
            <span>Flask 3.0</span>
            <span>Django 5.1</span>
            <span>Celery 5.4</span>
            <span>PostgreSQL 16</span>
            <span>React 19 + Recharts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
