'use client';

import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface BusinessData {
  metrics?: Record<string, number>;
  alerts?: Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    category: string;
    title: string;
    description: string;
    impact?: string;
    suggestedAction?: string;
    value?: number;
  }>;
  insights?: string[];
  visualizations?: {
    cashFlowChart?: { type: string; data: Array<Record<string, unknown>> };
    revenueExpenseChart?: { type: string; data: Record<string, number> };
    liquidityGauge?: { type: string; value: number; min: number; max: number; zones: Array<{ value: number; color: string }> };
  };
}

interface BusinessDataChartsProps {
  businessData: BusinessData;
}

export default function BusinessDataCharts({ businessData }: BusinessDataChartsProps) {
  if (!businessData) return null;

  const { metrics, alerts, insights } = businessData;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Métricas */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(metrics).slice(0, 4).map(([key, value]) => (
            <div
              key={key}
              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {key.replace(/_/g, ' ')}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {typeof value === 'number' && key.toLowerCase().includes('valor')
                  ? formatCurrency(value)
                  : value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Alertas */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getAlertBg(alert.type)}`}
            >
              <div className="flex items-start gap-2">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {alert.description}
                  </p>
                  {alert.suggestedAction && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      💡 {alert.suggestedAction}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">
            📊 Insights
          </p>
          <ul className="space-y-1">
            {insights.slice(0, 3).map((insight, index) => (
              <li key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                <span className="text-purple-500">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
