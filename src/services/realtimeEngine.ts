import { TelemetryEvent, TimeseriesMetricPoint, CeleryTask, ServiceCategory } from '../types/analytics';

const SERVICES: ServiceCategory[] = [
  'payment_gateway',
  'auth_service',
  'product_catalog',
  'order_processor',
  'notification_mesh',
  'recommendation_api'
];

const SERVICE_ENDPOINTS: Record<ServiceCategory, string[]> = {
  payment_gateway: ['/api/v1/charge', '/api/v1/refund', '/api/v1/webhooks/stripe'],
  auth_service: ['/api/v1/oauth/token', '/api/v1/users/login', '/api/v1/sessions/verify'],
  product_catalog: ['/api/v1/products/search', '/api/v1/categories', '/api/v1/inventory/check'],
  order_processor: ['/api/v1/orders/checkout', '/api/v1/orders/status', '/api/v1/cart/sync'],
  notification_mesh: ['/api/v1/push/dispatch', '/api/v1/email/send', '/api/v1/sms/verify'],
  recommendation_api: ['/api/v1/recommend/personalized', '/api/v1/vector/similarity']
};

const REGIONS: ('us-east' | 'us-west' | 'eu-west' | 'ap-southeast')[] = [
  'us-east',
  'us-west',
  'eu-west',
  'ap-southeast'
];

export class RealtimeEngine {
  private listeners: ((point: TimeseriesMetricPoint, event: TelemetryEvent) => void)[] = [];
  private taskListeners: ((task: CeleryTask) => void)[] = [];
  private isRunning: boolean = true;
  private intervalId: any = null;
  private tickRateMs: number = 1000;
  private anomalyBurstActive: boolean = false;
  private anomalyBurstCount: number = 0;
  
  // Rolling sliding window for Flask Z-score statistical engine
  private rollingLatencies: number[] = [];
  private readonly MAX_WINDOW_SIZE = 120;

  // Recent in-memory buffer for raw events
  public recentEvents: TelemetryEvent[] = [];
  public recentTasks: CeleryTask[] = [];

  constructor() {
    this.seedInitialHistory();
    this.start();
  }

  private seedInitialHistory() {
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const timestamp = now - i * 1000;
      const baseLatency = 35 + Math.random() * 20;
      this.rollingLatencies.push(baseLatency);
    }
  }

  public subscribe(fn: (point: TimeseriesMetricPoint, event: TelemetryEvent) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  public subscribeTasks(fn: (task: CeleryTask) => void) {
    this.taskListeners.push(fn);
    return () => {
      this.taskListeners = this.taskListeners.filter(l => l !== fn);
    };
  }

  public setRate(ratePerSecond: number) {
    if (ratePerSecond <= 0) {
      this.stop();
      return;
    }
    this.isRunning = true;
    this.tickRateMs = Math.max(200, Math.floor(1000 / (ratePerSecond / 10)));
    this.restartTimer();
  }

  public pause() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.restartTimer();
    }
  }

  public isPaused(): boolean {
    return !this.isRunning;
  }

  public triggerAnomalyBurst(durationEvents: number = 8) {
    this.anomalyBurstActive = true;
    this.anomalyBurstCount = durationEvents;
  }

  private restartTimer() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.isRunning) {
        this.generateTick();
      }
    }, this.tickRateMs);
  }

  public start() {
    this.isRunning = true;
    this.restartTimer();
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId) clearInterval(this.intervalId);
  }

  // Inject user custom telemetry event through the full pipeline
  public ingestCustomEvent(custom: {
    service: ServiceCategory;
    endpoint?: string;
    latencyMs?: number;
    statusCode?: number;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    forceAnomaly?: boolean;
    region?: 'us-east' | 'us-west' | 'eu-west' | 'ap-southeast';
    payloadBytes?: number;
    userId?: string;
  }): { event: TelemetryEvent; task: CeleryTask; pipelineBreakdown: { fastapiMs: number; redisQueueMs: number; celeryExecutionMs: number; flaskScoringMs: number; postgresWriteMs: number; totalMs: number } } {
    const timestamp = Date.now();
    const service = custom.service;
    const endpoints = SERVICE_ENDPOINTS[service];
    const endpoint = custom.endpoint || endpoints[Math.floor(Math.random() * endpoints.length)];

    let latency = custom.latencyMs !== undefined 
      ? custom.latencyMs 
      : (custom.forceAnomaly ? (320 + Math.random() * 450) : (28 + Math.random() * 32));

    const statusCode = custom.statusCode || (custom.forceAnomaly ? 503 : 200);

    // Compute Flask statistical Z-score
    const mean = this.getMean(this.rollingLatencies);
    const std = this.getStdDev(this.rollingLatencies, mean);
    const zScore = std > 0 ? (latency - mean) / std : 0;
    const isAnomaly = custom.forceAnomaly || Math.abs(zScore) > 2.5;

    // Track in rolling buffer
    this.rollingLatencies.push(latency);
    if (this.rollingLatencies.length > this.MAX_WINDOW_SIZE) {
      this.rollingLatencies.shift();
    }

    const event: TelemetryEvent = {
      id: `evt_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      timeString: new Date(timestamp).toLocaleTimeString(),
      service,
      endpoint,
      latencyMs: Math.round(latency * 10) / 10,
      statusCode,
      method: custom.method || 'POST',
      payloadBytes: custom.payloadBytes || Math.floor(512 + Math.random() * 4096),
      clientIp: `198.51.100.${Math.floor(Math.random() * 250 + 1)}`,
      region: custom.region || 'us-east',
      isAnomaly,
      anomalyScore: Math.round(Math.abs(zScore) * 100) / 100,
      partitionKey: '2026_w39',
      userId: custom.userId || `usr_${Math.random().toString(36).substr(2, 6)}`
    };

    // Create corresponding Celery Task in Redis
    const task: CeleryTask = {
      id: `celery_task_${Math.random().toString(36).substr(2, 10)}`,
      name: isAnomaly ? 'tasks.handle_high_priority_anomaly' : 'tasks.process_telemetry_event',
      queue: isAnomaly ? 'priority_alerts' : 'telemetry_stream',
      state: 'SUCCESS',
      executionTimeMs: Math.round((4 + Math.random() * 14) * 10) / 10,
      createdAt: timestamp - 20,
      completedAt: timestamp,
      worker: isAnomaly ? 'celery@worker-node-beta' : 'celery@worker-node-alpha',
      retries: 0,
      args: { service, latencyMs: event.latencyMs, isAnomaly },
      resultSummary: isAnomaly ? 'Anomaly Alert Triggered & Partition Flushed' : 'Indexed in telemetry_p2026_w39'
    };

    this.recentEvents.unshift(event);
    if (this.recentEvents.length > 200) this.recentEvents.pop();

    this.recentTasks.unshift(task);
    if (this.recentTasks.length > 50) this.recentTasks.pop();

    // High fidelity pipeline timing breakdown
    const fastapiMs = Math.round((0.8 + Math.random() * 0.9) * 100) / 100;
    const redisQueueMs = Math.round((1.2 + Math.random() * 1.5) * 100) / 100;
    const celeryExecutionMs = task.executionTimeMs;
    const flaskScoringMs = Math.round((2.1 + Math.random() * 1.8) * 100) / 100;
    const postgresWriteMs = Math.round((0.6 + Math.random() * 0.7) * 100) / 100;
    const totalMs = Math.round((fastapiMs + redisQueueMs + celeryExecutionMs + flaskScoringMs + postgresWriteMs) * 100) / 100;

    // Notify listeners
    this.notifyTick(event);
    this.taskListeners.forEach(l => l(task));

    return {
      event,
      task,
      pipelineBreakdown: {
        fastapiMs,
        redisQueueMs,
        celeryExecutionMs,
        flaskScoringMs,
        postgresWriteMs,
        totalMs
      }
    };
  }

  private generateTick() {
    const timestamp = Date.now();
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
    const endpoints = SERVICE_ENDPOINTS[service];
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];

    let isAnomaly = false;
    let latency: number;
    let statusCode: number;

    if (this.anomalyBurstActive && this.anomalyBurstCount > 0) {
      this.anomalyBurstCount--;
      isAnomaly = true;
      latency = 280 + Math.random() * 420;
      statusCode = Math.random() > 0.4 ? 504 : 500;
      if (this.anomalyBurstCount <= 0) {
        this.anomalyBurstActive = false;
      }
    } else {
      // Standard distribution with occasional natural jitter
      const naturalSpike = Math.random() < 0.05;
      if (naturalSpike) {
        isAnomaly = true;
        latency = 190 + Math.random() * 260;
        statusCode = Math.random() > 0.5 ? 429 : 502;
      } else {
        // Normal baseline service latencies
        const serviceBase = service === 'payment_gateway' ? 45 : service === 'product_catalog' ? 22 : 35;
        latency = serviceBase + (Math.random() * 24 - 10);
        statusCode = Math.random() < 0.96 ? 200 : (Math.random() < 0.5 ? 201 : 404);
      }
    }

    // Update rolling latencies
    this.rollingLatencies.push(latency);
    if (this.rollingLatencies.length > this.MAX_WINDOW_SIZE) {
      this.rollingLatencies.shift();
    }

    const mean = this.getMean(this.rollingLatencies);
    const std = this.getStdDev(this.rollingLatencies, mean);
    const zScore = std > 0 ? (latency - mean) / std : 0;
    if (Math.abs(zScore) > 2.5) {
      isAnomaly = true;
    }

    const event: TelemetryEvent = {
      id: `evt_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      timeString: new Date(timestamp).toLocaleTimeString(),
      service,
      endpoint,
      latencyMs: Math.round(latency * 10) / 10,
      statusCode,
      method: (statusCode === 201 || service === 'payment_gateway') ? 'POST' : 'GET',
      payloadBytes: Math.floor(800 + Math.random() * 3200),
      clientIp: `172.24.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 250)}`,
      region,
      isAnomaly,
      anomalyScore: Math.round(Math.abs(zScore) * 100) / 100,
      partitionKey: '2026_w39',
      userId: `usr_${Math.random().toString(36).substr(2, 6)}`
    };

    this.recentEvents.unshift(event);
    if (this.recentEvents.length > 200) this.recentEvents.pop();

    // Occasional Celery Task generation
    if (Math.random() < 0.4 || isAnomaly) {
      const task: CeleryTask = {
        id: `celery_${Math.random().toString(36).substr(2, 10)}`,
        name: isAnomaly 
          ? 'tasks.evaluate_anomaly_isolation_forest' 
          : (Math.random() < 0.5 ? 'tasks.process_telemetry_event' : 'tasks.batch_insert_partitioned_records'),
        queue: isAnomaly ? 'priority_alerts' : 'telemetry_stream',
        state: Math.random() < 0.95 ? 'SUCCESS' : 'RETRY',
        executionTimeMs: Math.round((3.2 + Math.random() * 16) * 10) / 10,
        createdAt: timestamp - 35,
        completedAt: timestamp,
        worker: isAnomaly ? 'celery@worker-node-beta' : 'celery@worker-node-alpha',
        retries: Math.random() < 0.05 ? 1 : 0,
        args: { service: event.service, latencyMs: event.latencyMs },
        resultSummary: isAnomaly ? 'Z-score threshold exceeded (Alert logged)' : 'Partition block committed'
      };

      this.recentTasks.unshift(task);
      if (this.recentTasks.length > 50) this.recentTasks.pop();
      this.taskListeners.forEach(l => l(task));
    }

    this.notifyTick(event);
  }

  private notifyTick(event: TelemetryEvent) {
    const now = Date.now();
    const recentSlice = this.rollingLatencies.slice(-30);
    const sorted = [...recentSlice].sort((a, b) => a - b);
    
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 35;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 75;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 110;

    // Requests per second estimation (scaled by burst)
    const baseRps = 180 + Math.floor(Math.random() * 40);
    const rps = this.anomalyBurstActive ? (baseRps * 2.8) : baseRps;

    // Error rate in current window
    const recentWindowEvents = this.recentEvents.slice(0, 30);
    const errorCount = recentWindowEvents.filter(e => e.statusCode >= 400).length;
    const errorRate = recentWindowEvents.length > 0 
      ? Math.round((errorCount / recentWindowEvents.length) * 1000) / 10 
      : 0;

    const point: TimeseriesMetricPoint = {
      time: new Date(now).toLocaleTimeString(),
      timestamp: now,
      requestsPerSec: Math.round(rps),
      p50Latency: Math.round(p50 * 10) / 10,
      p95Latency: Math.round(p95 * 10) / 10,
      p99Latency: Math.round(p99 * 10) / 10,
      errorRate,
      anomalyCount: this.recentEvents.slice(0, 30).filter(e => e.isAnomaly).length,
      activeUsers: 1420 + Math.floor(Math.random() * 80),
      queueDepth: this.recentTasks.filter(t => t.state === 'STARTED' || t.state === 'PENDING').length + Math.floor(Math.random() * 4)
    };

    this.listeners.forEach(fn => fn(point, event));
  }

  private getMean(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  private getStdDev(arr: number[], mean: number): number {
    if (arr.length < 2) return 0;
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (arr.length - 1);
    return Math.sqrt(variance);
  }
}

// Global Singleton Instance
export const realtimeEngine = new RealtimeEngine();
