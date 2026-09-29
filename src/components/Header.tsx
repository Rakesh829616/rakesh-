import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Layers, 
  Play, 
  Pause, 
  Flame, 
  Code2, 
  HelpCircle, 
  Send, 
  Server, 
  ShieldCheck, 
  Sliders, 
  Download,
  Terminal,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { UserSession, UserRole } from '../types/analytics';
import { INITIAL_USERS } from '../data/mockDatabase';

interface HeaderProps {
  currentUser: UserSession;
  onSelectUser: (user: UserSession) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onRateChange: (rate: number) => void;
  currentRate: number;
  onTriggerAnomaly: () => void;
  onOpenIngestModal: () => void;
  onOpenArchitectureModal: () => void;
  onOpenCodeModal: () => void;
  onOpenInterviewGuide: () => void;
  onExportData: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectUser,
  isPaused,
  onTogglePause,
  onRateChange,
  currentRate,
  onTriggerAnomaly,
  onOpenIngestModal,
  onOpenArchitectureModal,
  onOpenCodeModal,
  onOpenInterviewGuide,
  onExportData,
  activeTab,
  setActiveTab
}) => {
  const [anomalyActive, setAnomalyActive] = useState(false);

  const handleAnomalyClick = () => {
    setAnomalyActive(true);
    onTriggerAnomaly();
    setTimeout(() => setAnomalyActive(false), 6000);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'django_admin':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-900/60 text-purple-200 border border-purple-700/50">Django Admin (Superuser)</span>;
      case 'data_engineer':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-900/60 text-blue-200 border border-blue-700/50">Data Engineer</span>;
      case 'security_auditor':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-900/60 text-amber-200 border border-amber-700/50">Security Auditor</span>;
      case 'business_analyst':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/50">Business Analyst</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      {/* Top Architecture Status Strip */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 text-xs bg-slate-950/80 border-b border-slate-800/80 text-slate-400">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-mono font-medium">FastAPI Ingest:</span>
            <span className="text-emerald-400">uvicorn async (2.1ms p95)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
            <span className="text-slate-300 font-mono font-medium">Flask Analytics:</span>
            <span className="text-cyan-400">NumPy/SciPy Z-Score Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span className="text-slate-300 font-mono font-medium">Celery + Redis:</span>
            <span className="text-amber-400">3 Nodes | 16 Workers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
            <span className="text-slate-300 font-mono font-medium">PostgreSQL 16:</span>
            <span className="text-indigo-300">Partitioned (BRIN Index &lt;1.8ms)</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-500 font-mono">Portfolio Candidate: Full-Stack Python Engineer</span>
          <button
            onClick={onOpenInterviewGuide}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interview Talking Points</span>
          </button>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 text-white flex items-center justify-center">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                ApexMetrics
                <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                  Enterprise Python
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Real-Time High-Throughput Analytics & Partitioned Historical Intelligence
            </p>
          </div>
        </div>

        {/* Stream Controls & Anomaly Trigger */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Pause / Play */}
          <button
            onClick={onTogglePause}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              isPaused 
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60' 
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={isPaused ? "Resume Live Ingestion Stream" : "Pause Live Stream"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Rate Selector */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5 text-xs text-slate-300">
            {[10, 50, 100].map((rate) => (
              <button
                key={rate}
                onClick={() => onRateChange(rate)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                  currentRate === rate 
                    ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rate}/s
              </button>
            ))}
          </div>

          {/* Anomaly Burst Button */}
          <button
            onClick={handleAnomalyClick}
            disabled={anomalyActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              anomalyActive
                ? 'bg-red-600 text-white border-red-500 animate-bounce'
                : 'bg-red-950/40 border-red-800/60 text-red-300 hover:bg-red-900/50 hover:border-red-600'
            }`}
            title="Inject spike of anomalous requests (Z-score > 3.0) to test real-time detection & alert pipeline"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>{anomalyActive ? 'Injecting Anomaly...' : 'Inject Anomaly Spike'}</span>
          </button>

          {/* Ingest User Input Button */}
          <button
            onClick={onOpenIngestModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ingest Custom Event</span>
          </button>
        </div>

        {/* User Session & Role Switcher (Django RBAC) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-200">{currentUser.username}</span>
                {getRoleBadge(currentUser.role)}
              </div>
            </div>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const user = INITIAL_USERS.find(u => u.id === e.target.value);
                if (user) onSelectUser(user);
              }}
              className="bg-slate-900 text-xs text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 focus:outline-none focus:border-cyan-500 cursor-pointer ml-1"
              title="Switch user role in Django RBAC"
            >
              {INITIAL_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  Switch to {u.username} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* View Python Code Modal Button */}
          <button
            onClick={onOpenCodeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title="Inspect backend Python code: FastAPI, Flask, Django, Celery, and PostgreSQL DDL"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Backend Code</span>
          </button>

          {/* Architecture Modal */}
          <button
            onClick={onOpenArchitectureModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title="View system architecture diagram and pipeline breakdown"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Architecture</span>
          </button>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="px-4 lg:px-6 flex items-center gap-2 border-t border-slate-800 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('realtime')}
          className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'realtime'
              ? 'border-cyan-500 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Real-Time Dashboards</span>
        </button>

        <button
          onClick={() => setActiveTab('historical')}
          className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'historical'
              ? 'border-cyan-500 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>PostgreSQL Historical Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('celery_redis')}
          className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'celery_redis'
              ? 'border-cyan-500 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Celery & Redis Worker Pool</span>
        </button>

        <button
          onClick={() => setActiveTab('postgres_sql')}
          className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'postgres_sql'
              ? 'border-cyan-500 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL Schema & SQL Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('django_rbac')}
          className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'django_rbac'
              ? 'border-cyan-500 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Django Auth & Security RBAC</span>
        </button>

        <div className="ml-auto py-1 flex items-center gap-2">
          <button
            onClick={onExportData}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition cursor-pointer"
            title="Export raw telemetry snapshot in CSV or JSON format"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Snapshot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
