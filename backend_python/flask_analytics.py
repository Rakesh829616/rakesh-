"""
ApexMetrics - Flask Statistical Analytics & Anomaly Detection Engine
=====================================================================
Role in Architecture:
- Performs real-time statistical data crunching, moving window aggregations,
  and anomaly detection on streaming telemetry datasets using NumPy and SciPy.
- Exposes analytical REST endpoints queried by Celery workers and dashboards.
"""

from flask import Flask, request, jsonify
import numpy as np
import math
import time
from typing import List, Dict, Any

flask_app = Flask(__name__)

def calculate_zscore_anomalies(latencies: List[float], threshold: float = 2.5) -> Dict[str, Any]:
    """
    Computes statistical Z-score: z = (x - mean) / std_dev.
    Flags events exceeding the confidence threshold.
    """
    if len(latencies) < 3:
        return {
            "mean": latencies[0] if latencies else 0.0,
            "std_dev": 0.0,
            "anomalies": [],
            "anomaly_rate": 0.0
        }

    arr = np.array(latencies, dtype=np.float64)
    mean = float(np.mean(arr))
    std = float(np.std(arr))

    if std < 1e-6:
        return {
            "mean": round(mean, 2),
            "std_dev": 0.0,
            "anomalies": [],
            "anomaly_rate": 0.0
        }

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

def calculate_iqr_outliers(values: List[float]) -> Dict[str, Any]:
    """
    Tukey's Fences Interquartile Range (IQR) method for robust outlier detection.
    """
    if len(values) < 4:
        return {"iqr": 0.0, "lower_bound": 0.0, "upper_bound": 0.0, "outliers_count": 0}

    arr = np.array(values, dtype=np.float64)
    q25, q75 = np.percentile(arr, [25, 75])
    iqr = q75 - q25
    lower_bound = q25 - (1.5 * iqr)
    upper_bound = q75 + (1.5 * iqr)
    outliers = arr[(arr < lower_bound) | (arr > upper_bound)]

    return {
        "q25": round(float(q25), 2),
        "q75": round(float(q75), 2),
        "iqr": round(float(iqr), 2),
        "lower_bound": round(float(lower_bound), 2),
        "upper_bound": round(float(upper_bound), 2),
        "outliers_count": len(outliers)
    }

@flask_app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "service": "Flask Statistical Analytics Microservice",
        "engine": "NumPy / SciPy Vectorized Processing",
        "status": "online"
    })

@flask_app.route('/api/v1/analytics/detect-anomalies', methods=['POST'])
def detect_anomalies():
    """
    Consumes a window of latency points, returns Z-score stats & percentiles.
    """
    start_time = time.perf_counter()
    data = request.get_json(force=True)
    
    latencies = data.get("latencies", [])
    threshold = float(data.get("threshold", 2.5))

    if not latencies:
        return jsonify({"error": "No data points provided"}), 400

    stats = calculate_zscore_anomalies(latencies, threshold=threshold)
    iqr_stats = calculate_iqr_outliers(latencies)
    
    execution_time_ms = (time.perf_counter() - start_time) * 1000.0

    return jsonify({
        "status": "success",
        "metrics": stats,
        "iqr_distribution": iqr_stats,
        "sample_size": len(latencies),
        "computation_time_ms": round(execution_time_ms, 3)
    })

@flask_app.route('/api/v1/analytics/rollups', methods=['POST'])
def generate_rollups():
    """
    Calculates downsampled exponential moving averages (EMA) for historical charts.
    """
    data = request.get_json(force=True)
    series = data.get("series", [])
    alpha = float(data.get("alpha", 0.3)) # Smoothing factor

    if not series:
        return jsonify({"smoothed": []})

    arr = np.array(series, dtype=np.float64)
    # Vectorized exponential moving average calculation
    ema = np.zeros_like(arr)
    ema[0] = arr[0]
    for i in range(1, len(arr)):
        ema[i] = alpha * arr[i] + (1 - alpha) * ema[i - 1]

    return jsonify({
        "smoothed": [round(float(x), 2) for x in ema.tolist()],
        "variance_reduction_ratio": round(float(np.var(ema) / (np.var(arr) + 1e-9)), 3)
    })

if __name__ == '__main__':
    flask_app.run(port=5001, debug=False)
