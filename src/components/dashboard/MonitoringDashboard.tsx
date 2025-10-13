import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Shield,
  BarChart3,
  Clock
} from 'lucide-react';

interface MonitoringMetrics {
  drift_score: number;
  drift_detected: boolean;
  model_accuracy: number;
  cost_today: number;
  cost_budget: number;
  cache_hit_rate: number;
  avg_latency_ms: number;
  privacy_compliance_score: number;
}

interface DriftAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  created_at: string;
}

const MonitoringDashboard: React.FC<{ tenantId: string }> = ({ tenantId }) => {
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [alerts, setAlerts] = useState<DriftAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [tenantId]);

  const fetchMonitoringData = async () => {
    try {
      // TODO: Replace with actual API calls when endpoints are implemented
      // const response = await fetch(`/api/v1/monitoring/metrics/${tenantId}`);
      // const data = await response.json();
      
      // Mock data for now
      setMetrics({
        drift_score: 0.23,
        drift_detected: false,
        model_accuracy: 0.87,
        cost_today: 12.45,
        cost_budget: 50.00,
        cache_hit_rate: 0.73,
        avg_latency_ms: 245,
        privacy_compliance_score: 98
      });

      setAlerts([]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center p-8 text-gray-500">
        No monitoring data available
      </div>
    );
  }

  const getDriftColor = (score: number) => {
    if (score > 0.7) return 'text-red-600 bg-red-50';
    if (score > 0.4) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getCostColor = (used: number, budget: number) => {
    const percentage = (used / budget) * 100;
    if (percentage > 95) return 'text-red-600 bg-red-50';
    if (percentage > 80) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">System Monitoring</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-900 mb-2">Active Alerts</h3>
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div key={alert.id} className="text-sm text-yellow-800">
                    <span className="font-medium">[{alert.severity.toUpperCase()}]</span> {alert.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Model Drift */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Model Drift</h3>
            </div>
            {metrics.drift_detected ? (
              <TrendingUp className="h-5 w-5 text-red-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-green-600" />
            )}
          </div>
          <div className={`text-3xl font-bold ${getDriftColor(metrics.drift_score)} rounded-lg p-2 text-center`}>
            {(metrics.drift_score * 100).toFixed(1)}%
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {metrics.drift_detected ? 'Drift Detected' : 'No Drift'}
          </p>
        </div>

        {/* Model Accuracy */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Model Accuracy</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600 text-center">
            {(metrics.model_accuracy * 100).toFixed(1)}%
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.model_accuracy * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Cost Tracking */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Daily Cost</h3>
          </div>
          <div className={`text-3xl font-bold ${getCostColor(metrics.cost_today, metrics.cost_budget)} rounded-lg p-2 text-center`}>
            ${metrics.cost_today.toFixed(2)}
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            of ${metrics.cost_budget.toFixed(2)} budget
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  (metrics.cost_today / metrics.cost_budget) > 0.95 ? 'bg-red-600' :
                  (metrics.cost_today / metrics.cost_budget) > 0.80 ? 'bg-orange-600' :
                  'bg-green-600'
                }`}
                style={{ width: `${Math.min((metrics.cost_today / metrics.cost_budget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Privacy Compliance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Privacy Score</h3>
          </div>
          <div className="text-3xl font-bold text-green-600 text-center">
            {metrics.privacy_compliance_score}%
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            GDPR Compliant
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cache Hit Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Cache Hit Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {(metrics.cache_hit_rate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.cache_hit_rate * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Average Latency */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Latency</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics.avg_latency_ms}ms
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  metrics.avg_latency_ms > 500 ? 'bg-red-600' :
                  metrics.avg_latency_ms > 300 ? 'bg-orange-600' :
                  'bg-green-600'
                }`}
                style={{ width: `${Math.min((metrics.avg_latency_ms / 1000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            View Detailed Metrics
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            Download Report
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            Configure Alerts
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;