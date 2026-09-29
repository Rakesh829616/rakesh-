export type ServiceCategory = 
  | 'payment_gateway'
  | 'auth_service'
  | 'product_catalog'
  | 'order_processor'
  | 'notification_mesh'
  | 'recommendation_api';

export type UserRole = 'django_admin' | 'data_engineer' | 'security_auditor' | 'business_analyst';

export interface UserSession {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  token: string;
  lastLogin: string;
  permissions: string[];
}

export interface TelemetryEvent {
  id: string;
  timestamp: number;
  timeString: string;
  service: ServiceCategory;
  endpoint: string;
  latencyMs: number;
  statusCode: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payloadBytes: number;
  clientIp: string;
  region: 'us-east' | 'us-west' | 'eu-west' | 'ap-southeast';
  isAnomaly: boolean;
  anomalyScore: number;
  partitionKey: string; // e.g., '2026_w39'
  userId?: string;
  tags?: Record<string, string>;
}

export interface TimeseriesMetricPoint {
  time: string;
  timestamp: number;
  requestsPerSec: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number; // percentage
  anomalyCount: number;
  activeUsers: number;
  queueDepth: number;
}

export interface CeleryTask {
  id: string;
  name: string;
  queue: string;
  state: 'PENDING' | 'STARTED' | 'SUCCESS' | 'RETRY' | 'FAILURE';
  executionTimeMs: number;
  createdAt: number;
  completedAt?: number;
  worker: string;
  retries: number;
  args: Record<string, any>;
  resultSummary?: string;
}

export interface CeleryWorkerStats {
  workerName: string;
  concurrency: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  uptimeSeconds: number;
  cpuPercent: number;
  memoryMb: number;
}

export interface HistoricalAggregate {
  partition: string;
  date: string;
  totalEvents: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorCount: number;
  storageMb: number;
  brinIndexBlocks: number;
}

export interface SqlQueryResult {
  query: string;
  executionTimeMs: number;
  planningTimeMs: number;
  rowsAffected: number;
  columns: string[];
  rows: Record<string, any>[];
  explainPlan: string[];
}

export interface SystemArchitectureNode {
  id: string;
  name: string;
  framework: string;
  role: string;
  status: 'optimal' | 'warning' | 'busy';
  throughput: string;
  latency: string;
  memory: string;
  techStack: string[];
  description: string;
}
