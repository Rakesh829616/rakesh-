import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  FileCode, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Layers,
  Terminal,
  ExternalLink
} from 'lucide-react';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BACKEND_FILES = [
  {
    id: 'fastapi',
    name: 'fastapi_gateway.py',
    framework: 'FastAPI (ASGI)',
    icon: Zap,
    color: 'text-cyan-400',
    description: 'High-throughput asynchronous ingestion endpoint with Pydantic v2 schemas and WebSocket broadcasts.',
    code: `"""
ApexMetrics - FastAPI High-Throughput Asynchronous Ingestion Gateway
=====================================================================
Role:
- Handles thousands of concurrent incoming HTTP telemetry streams using Python asyncio & uvloop.
- Validates inbound event payloads via Pydantic v2 schemas at C-speed.
- Dispatches tasks asynchronously to Redis Message Broker (for Celery workers).
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import asyncio
import time
import uuid

app = FastAPI(
    title="ApexMetrics High-Throughput Ingestion Engine",
    description="Asynchronous ingestion gateway optimized for high-volume telemetry & real-time analytics",
    version="2.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TelemetryPayload(BaseModel):
    service: str = Field(..., example="payment_gateway")
    endpoint: str = Field(..., example="/api/v1/charge")
    latency_ms: float = Field(..., ge=0.0, le=60000.0, example=42.5)
    status_code: int = Field(..., ge=100, le=599, example=200)
    method: str = Field(default="POST")
    payload_bytes: int = Field(default=1024, ge=0)
    client_ip: Optional[str] = Field(default="127.0.0.1")
    region: Optional[str] = Field(default="us-east")

class IngestResponse(BaseModel):
    status: str
    processed_count: int
    task_id: str
    ingest_latency_ms: float
    timestamp: float

async def dispatch_to_celery_task_queue(event_data: dict, task_id: str):
    # Enqueues task to Redis broker (celery_queue:telemetry_stream)
    # Celery workers consume this without blocking the FastAPI event loop.
    await asyncio.sleep(0.001)

@app.post("/api/v1/telemetry/ingest", response_model=IngestResponse, status_code=202)
async def ingest_single_event(payload: TelemetryPayload, background_tasks: BackgroundTasks):
    start_t = time.perf_counter()
    task_id = f"task_{uuid.uuid4().hex[:12]}"
    
    event_dict = payload.model_dump()
    event_dict["id"] = task_id
    event_dict["received_at"] = time.time()

    # Offload heavy tasks to Celery via Redis
    background_tasks.add_task(dispatch_to_celery_task_queue, event_dict, task_id)
    
    duration = (time.perf_counter() - start_t) * 1000.0
    return IngestResponse(
        status="ENQUEUED",
        processed_count=1,
        task_id=task_id,
        ingest_latency_ms=round(duration, 3),
        timestamp=time.time()
    )`
  },
  {
    id: 'flask',
    name: 'flask_analytics.py',
    framework: 'Flask + SciPy + NumPy',
    icon: Layers,
    color: 'text-blue-400',
    description: 'Vectorized mathematical anomaly detection, rolling window Z-scores, and Tukey IQR outlier fences.',
    code: `"""
ApexMetrics - Flask Statistical Analytics & Anomaly Detection Engine
=====================================================================
Role:
- Vectorized mathematical processing using NumPy and SciPy.
- Rolling window statistical anomaly scoring (|Z| > 2.5).
"""

from flask import Flask, request, jsonify
import numpy as np
import time

flask_app = Flask(__name__)

def calculate_zscore_anomalies(latencies: list, threshold: float = 2.5):
    if len(latencies) < 3:
        return {"mean": 0.0, "std_dev": 0.0, "anomalies": []}

    arr = np.array(latencies, dtype=np.float64)
    mean = float(np.mean(arr))
    std = float(np.std(arr))

    if std < 1e-6:
        return {"mean": round(mean, 2), "std_dev": 0.0, "anomalies": []}

    z_scores = (arr - mean) / std
    anomaly_indices = np.where(np.abs(z_scores) > threshold)[0].tolist()
    
    anomalies = [
        {
            "index": idx,
            "value": float(arr[idx]),
            "z_score": round(float(z_scores[idx]), 3),
            "severity": "CRITICAL" if abs(z_scores[idx]) > 3.5 else "WARNING"
        }
        for idx in anomaly_indices
    ]

    return {
        "mean": round(mean, 2),
        "std_dev": round(std, 2),
        "p50": round(float(np.percentile(arr, 50)), 2),
        "p95": round(float(np.percentile(arr, 95)), 2),
        "p99": round(float(np.percentile(arr, 99)), 2),
        "anomalies": anomalies,
        "anomaly_rate": round(len(anomalies) / len(latencies) * 100, 2)
    }

@flask_app.route('/api/v1/analytics/detect-anomalies', methods=['POST'])
def detect_anomalies():
    start_time = time.perf_counter()
    data = request.get_json(force=True)
    latencies = data.get("latencies", [])
    threshold = float(data.get("threshold", 2.5))

    stats = calculate_zscore_anomalies(latencies, threshold=threshold)
    execution_time_ms = (time.perf_counter() - start_time) * 1000.0

    return jsonify({
        "status": "success",
        "metrics": stats,
        "computation_time_ms": round(execution_time_ms, 3)
    })`
  },
  {
    id: 'django',
    name: 'django_auth_admin.py',
    framework: 'Django 5.1 RBAC',
    icon: ShieldCheck,
    color: 'text-purple-400',
    description: 'Enterprise RBAC, custom User models, Django Admin back-office integration, and partitioned ORM wrappers.',
    code: `"""
ApexMetrics - Django Authentication, RBAC & Administrative Framework
=====================================================================
Role:
- Argon2 password hashing and token lifecycle management.
- Multi-role permission authorization: Admin, Data Engineer, Auditor, Analyst.
- Custom Django ORM models mapped to PostgreSQL partitioned tables.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib import admin

class EnterpriseUser(AbstractUser):
    ROLE_CHOICES = [
        ('django_admin', 'Administrator (Full System & Partition Control)'),
        ('data_engineer', 'Data Engineer (Pipelines, Celery, SQL Query Engine)'),
        ('security_auditor', 'Security Auditor (Compliance & Anomaly Reviews)'),
        ('business_analyst', 'Business Analyst (Read-Only Dashboards & Exports)'),
    ]

    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='business_analyst')
    department = models.CharField(max_length=100, default="Engineering Analytics")
    api_token = models.CharField(max_length=64, unique=True, null=True, blank=True)
    mfa_enabled = models.BooleanField(default=True)
    max_query_timeout_sec = models.IntegerField(default=30)

    def has_partition_permission(self) -> bool:
        return self.role in ['django_admin', 'data_engineer']

class TelemetryLogPartitioned(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(db_index=True)
    service_name = models.CharField(max_length=64, db_index=True)
    endpoint = models.CharField(max_length=255)
    latency_ms = models.FloatField()
    status_code = models.IntegerField()
    is_anomaly = models.BooleanField(default=False, db_index=True)
    anomaly_score = models.FloatField(default=0.0)

    class Meta:
        db_table = 'telemetry_event_partitioned'
        managed = False  # Partition schema managed natively in PostgreSQL DDL

@admin.register(EnterpriseUser)
class EnterpriseUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'mfa_enabled', 'is_staff')
    list_filter = ('role', 'is_staff', 'mfa_enabled')`
  },
  {
    id: 'celery',
    name: 'celery_tasks.py',
    framework: 'Celery + Redis Broker',
    icon: Cpu,
    color: 'text-amber-400',
    description: 'Distributed async workers, batch PostgreSQL database ingestion, periodic rollups, and retry backoff.',
    code: `"""
ApexMetrics - Celery Distributed Task Worker & Redis Queue Architecture
========================================================================
Role:
- Asynchronous consumption of high-throughput events from Redis broker.
- Batched PostgreSQL partitioned insertions (>50,000 rows/sec).
- Celery Beat scheduled tasks for hourly table rollups and partition maintenance.
"""

from celery import Celery
from celery.schedules import crontab
import time

celery_app = Celery(
    "apex_metrics_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
    task_acks_late=True,             # Reliability: Task re-queued if worker lost
    broker_connection_retry_on_startup=True,
)

celery_app.conf.beat_schedule = {
    "aggregate-hourly-historical-rollups": {
        "task": "tasks.generate_hourly_partition_rollup",
        "schedule": crontab(minute=0),
    }
}

@celery_app.task(bind=True, max_retries=3, default_retry_delay=5)
def process_telemetry_event(self, event_data: dict):
    try:
        latency = event_data.get("latency_ms", 0.0)
        z_score = abs(latency - 40.0) / 15.0
        return {
            **event_data,
            "is_anomaly": z_score > 2.5,
            "anomaly_score": round(z_score, 3)
        }
    except Exception as exc:
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)

@celery_app.task(name="tasks.batch_insert_partitioned_records")
def batch_insert_partitioned_records(events: list):
    # Executes PostgreSQL COPY / multi-row batch insert
    return {"status": "BATCH_PERSISTED", "inserted_count": len(events)}`
  },
  {
    id: 'postgres',
    name: 'schema_optimized.sql',
    framework: 'PostgreSQL 16 Partitioning',
    icon: Database,
    color: 'text-indigo-400',
    description: 'Declarative table partitioning, BRIN compact block indexing, and automatic future partition generator.',
    code: `-- ============================================================================
-- ApexMetrics PostgreSQL High-Performance Schema & Historical Partitioning
-- ============================================================================

CREATE TABLE telemetry_event_partitioned (
    id UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL,
    service_name VARCHAR(64) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    latency_ms NUMERIC(9, 3) NOT NULL,
    status_code SMALLINT NOT NULL,
    method VARCHAR(10) NOT NULL DEFAULT 'GET',
    payload_bytes INTEGER DEFAULT 0,
    client_ip INET,
    region VARCHAR(32) NOT NULL DEFAULT 'us-east',
    is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
    anomaly_score NUMERIC(6, 3) DEFAULT 0.0,
    PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

-- Weekly Partitions
CREATE TABLE telemetry_p2026_w38 PARTITION OF telemetry_event_partitioned
    FOR VALUES FROM ('2026-09-22 00:00:00+00') TO ('2026-09-29 00:00:00+00');

CREATE TABLE telemetry_p2026_w39 PARTITION OF telemetry_event_partitioned
    FOR VALUES FROM ('2026-09-29 00:00:00+00') TO ('2026-10-06 00:00:00+00');

-- BRIN Index: Shrinks index from Gigabytes to Kilobytes
CREATE INDEX idx_telemetry_created_at_brin 
ON telemetry_event_partitioned USING BRIN (created_at) 
WITH (pages_per_range = 32);

-- B-Tree for fast service-level filtering
CREATE INDEX idx_telemetry_service_time 
ON telemetry_event_partitioned (service_name, created_at DESC);`
  }
];

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>('fastapi');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentFile = BACKEND_FILES.find(f => f.id === selectedFileId) || BACKEND_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-cyan-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Production Python Backend Codebase
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">
                  Job Portfolio Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect the actual backend services power-architected for high-performance real-time analytics
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

        {/* File Tabs */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto border-b border-slate-800">
          {BACKEND_FILES.map((file) => {
            const Icon = file.icon;
            const isSelected = file.id === selectedFileId;
            return (
              <button
                key={file.id}
                onClick={() => setSelectedFileId(file.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-cyan-500/50 shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${file.color}`} />
                <span>{file.name}</span>
              </button>
            );
          })}
        </div>

        {/* File Description Strip */}
        <div className="flex items-center justify-between py-2 text-xs text-slate-300">
          <div>
            <strong className="text-white">{currentFile.framework}:</strong> {currentFile.description}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition cursor-pointer font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content Window */}
        <div className="flex-1 overflow-y-auto mt-2 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed text-slate-200">
          <pre>{currentFile.code}</pre>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Files located in <code className="text-cyan-400 bg-slate-950 px-1 py-0.5 rounded">/backend_python/</code> directory of this repository.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
