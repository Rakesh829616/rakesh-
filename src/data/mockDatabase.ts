import { HistoricalAggregate, UserSession, CeleryWorkerStats } from '../types/analytics';

export const INITIAL_USERS: UserSession[] = [
  {
    id: 'usr_0192a8b',
    username: 'alex_admin',
    email: 'alex.chen@enterprise.io',
    role: 'django_admin',
    token: 'djt_live_89f0293da82bc19',
    lastLogin: '2026-09-29 16:32:10 UTC',
    permissions: [
      'auth.view_user',
      'auth.change_user',
      'analytics.execute_ddl',
      'analytics.purge_partitions',
      'celery.kill_worker',
      'fastapi.manage_ratelimits'
    ]
  },
  {
    id: 'usr_0284f11',
    username: 'priya_dataeng',
    email: 'priya.sharma@enterprise.io',
    role: 'data_engineer',
    token: 'djt_live_144ab99c38e12d',
    lastLogin: '2026-09-29 15:45:00 UTC',
    permissions: [
      'analytics.query_raw_logs',
      'analytics.create_partitions',
      'celery.trigger_task',
      'flask.retrain_isolation_forest'
    ]
  },
  {
    id: 'usr_0399d24',
    username: 'marcus_auditor',
    email: 'marcus.vance@security.org',
    role: 'security_auditor',
    token: 'djt_live_55a90d81ef34c9',
    lastLogin: '2026-09-29 14:10:22 UTC',
    permissions: [
      'audit.view_compliance_logs',
      'analytics.view_anomalies',
      'auth.view_session_history'
    ]
  },
  {
    id: 'usr_0411e77',
    username: 'elena_analyst',
    email: 'elena.rostova@analytics.co',
    role: 'business_analyst',
    token: 'djt_live_77e01b44c892fa',
    lastLogin: '2026-09-29 16:01:45 UTC',
    permissions: [
      'analytics.view_dashboards',
      'analytics.export_reports',
      'recharts.custom_filters'
    ]
  }
];

export const INITIAL_CELERY_WORKERS: CeleryWorkerStats[] = [
  {
    workerName: 'celery@worker-node-alpha (FastAPI Stream Consumer)',
    concurrency: 8,
    activeTasks: 3,
    completedTasks: 14820,
    failedTasks: 12,
    uptimeSeconds: 86400 * 3,
    cpuPercent: 32.4,
    memoryMb: 418.2
  },
  {
    workerName: 'celery@worker-node-beta (Flask Analytics & ML Scorer)',
    concurrency: 4,
    activeTasks: 2,
    completedTasks: 8450,
    failedTasks: 5,
    uptimeSeconds: 86400 * 3,
    cpuPercent: 48.7,
    memoryMb: 890.5
  },
  {
    workerName: 'celery@worker-node-gamma (PostgreSQL Partition Aggregator)',
    concurrency: 4,
    activeTasks: 1,
    completedTasks: 4210,
    failedTasks: 1,
    uptimeSeconds: 86400 * 2,
    cpuPercent: 21.0,
    memoryMb: 350.1
  }
];

export const HISTORICAL_PARTITIONS: HistoricalAggregate[] = [
  {
    partition: 'telemetry_p2026_w34',
    date: '2026-08-25 to 2026-08-31',
    totalEvents: 4280190,
    avgLatencyMs: 44.2,
    p95LatencyMs: 142.0,
    errorCount: 890,
    storageMb: 1240.5,
    brinIndexBlocks: 16
  },
  {
    partition: 'telemetry_p2026_w35',
    date: '2026-09-01 to 2026-09-07',
    totalEvents: 4892400,
    avgLatencyMs: 42.8,
    p95LatencyMs: 138.5,
    errorCount: 712,
    storageMb: 1412.0,
    brinIndexBlocks: 18
  },
  {
    partition: 'telemetry_p2026_w36',
    date: '2026-09-08 to 2026-09-14',
    totalEvents: 5120300,
    avgLatencyMs: 46.1,
    p95LatencyMs: 149.8,
    errorCount: 1104,
    storageMb: 1495.2,
    brinIndexBlocks: 19
  },
  {
    partition: 'telemetry_p2026_w37',
    date: '2026-09-15 to 2026-09-21',
    totalEvents: 5890120,
    avgLatencyMs: 41.5,
    p95LatencyMs: 134.2,
    errorCount: 654,
    storageMb: 1680.4,
    brinIndexBlocks: 21
  },
  {
    partition: 'telemetry_p2026_w38',
    date: '2026-09-22 to 2026-09-28',
    totalEvents: 6410900,
    avgLatencyMs: 39.8,
    p95LatencyMs: 128.4,
    errorCount: 540,
    storageMb: 1845.8,
    brinIndexBlocks: 23
  },
  {
    partition: 'telemetry_p2026_w39 (ACTIVE)',
    date: '2026-09-29 to PRESENT',
    totalEvents: 1782340,
    avgLatencyMs: 38.6,
    p95LatencyMs: 122.9,
    errorCount: 188,
    storageMb: 520.1,
    brinIndexBlocks: 7
  }
];

export const PRESET_SQL_QUERIES = [
  {
    name: 'Partition Pruning & BRIN Index Scan (Sub-2ms)',
    category: 'PostgreSQL Performance',
    sql: `EXPLAIN ANALYZE
SELECT 
    time_bucket('5 minutes', created_at) AS window_interval,
    service_name,
    COUNT(*) AS request_count,
    ROUND(AVG(latency_ms)::numeric, 2) AS avg_latency,
    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)::numeric, 2) AS p95_latency,
    COUNT(*) FILTER (WHERE status_code >= 500) AS server_errors
FROM telemetry_event_partitioned
WHERE created_at >= NOW() - INTERVAL '1 hour'
  AND service_name IN ('payment_gateway', 'order_processor')
GROUP BY 1, 2
ORDER BY 1 DESC;`,
    description: 'Uses PostgreSQL range partition pruning to scan ONLY telemetry_p2026_w39, skipping 25GB of historical logs.'
  },
  {
    name: 'Historical Anomaly Trend Analysis (Z-score > 2.5)',
    category: 'Flask ML Analytics',
    sql: `SELECT 
    DATE_TRUNC('day', created_at) AS day_bucket,
    service_name,
    COUNT(*) AS total_anomalies,
    ROUND(AVG(anomaly_score)::numeric, 3) AS mean_zscore,
    ROUND(MAX(latency_ms)::numeric, 1) AS peak_spike_ms
FROM telemetry_event_partitioned
WHERE is_anomaly = TRUE
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY 1, 2
ORDER BY total_anomalies DESC;`,
    description: 'Aggregates anomalies detected by the Flask SciPy microservice and persisted asynchronously via Celery.'
  },
  {
    name: 'Celery Task Execution & Queue Latency Rollup',
    category: 'Celery & Redis Metrics',
    sql: `SELECT 
    task_name,
    status,
    COUNT(*) as task_volume,
    ROUND(AVG(runtime_ms)::numeric, 2) as avg_runtime_ms,
    ROUND(MAX(runtime_ms)::numeric, 2) as max_runtime_ms,
    ROUND(AVG(retries)::numeric, 1) as avg_retries
FROM django_celery_results_taskresult
WHERE date_created >= NOW() - INTERVAL '24 hours'
GROUP BY task_name, status
ORDER BY avg_runtime_ms DESC;`,
    description: 'Monitors Celery distributed worker performance stored in django-celery-results database backend.'
  },
  {
    name: 'Django RBAC User Audit & Access Security Logs',
    category: 'Django Security Framework',
    sql: `SELECT 
    u.username,
    g.name AS role_group,
    COUNT(a.id) AS total_actions,
    MAX(a.action_time) AS last_activity,
    COUNT(*) FILTER (WHERE a.status = 'SUSPICIOUS_THROTTLED') AS threat_triggers
FROM auth_user u
JOIN auth_user_groups ug ON u.id = ug.user_id
JOIN auth_group g ON ug.group_id = g.id
LEFT JOIN security_audit_log a ON u.id = a.user_id
GROUP BY u.username, g.name
ORDER BY total_actions DESC;`,
    description: 'Tracks Django auth sessions, role permissions, and API key rate-limiting events.'
  }
];
