'use client';

// ===========================================
// EZRA PORTAL - Ezra LP Overview
// ===========================================

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Bell,
  Eye,
  FileWarning,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnhancedLocations } from '@/hooks/useLocations';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { KPIGrid } from '@/components/dashboard/KPICard';
import type { KPIData } from '@/types';

// Mock LP alerts
const mockAlerts = [
  {
    id: 'alert-1',
    type: 'high' as const,
    title: 'Unusual refund pattern',
    location: 'Beverly Hills',
    storeCode: 'GS-BH01',
    description: '47% increase in refunds vs. 30-day average',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'new',
  },
  {
    id: 'alert-2',
    type: 'medium' as const,
    title: 'High discount rate',
    location: 'Scottsdale',
    storeCode: 'GS-SC01',
    description: 'Discount rate 12.3% above threshold',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: 'investigating',
  },
  {
    id: 'alert-3',
    type: 'low' as const,
    title: 'Void transaction spike',
    location: 'Austin Downtown',
    storeCode: 'GS-AU01',
    description: '8 void transactions in 4-hour window',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    status: 'resolved',
  },
];

export default function LPOverviewPage() {
  const { locations } = useEnhancedLocations();

  // Calculate LP stats
  const highRiskCount = locations.filter((l) => (l.lpRiskScore || 0) >= 30).length;
  const mediumRiskCount = locations.filter(
    (l) => (l.lpRiskScore || 0) >= 15 && (l.lpRiskScore || 0) < 30
  ).length;
  const lowRiskCount = locations.filter((l) => (l.lpRiskScore || 0) < 15).length;
  const avgRiskScore =
    locations.reduce((sum, l) => sum + (l.lpRiskScore || 0), 0) / locations.length;

  const kpis: KPIData[] = [
    {
      label: 'Active Alerts',
      value: mockAlerts.filter((a) => a.status !== 'resolved').length,
      change: -2,
      changeLabel: 'vs last week',
      trend: 'down',
      format: 'number',
      icon: 'alert-triangle',
    },
    {
      label: 'High Risk Locations',
      value: highRiskCount,
      change: 0,
      changeLabel: 'vs last week',
      trend: 'neutral',
      format: 'number',
      icon: 'shield',
    },
    {
      label: 'Avg Risk Score',
      value: avgRiskScore,
      change: -3.2,
      changeLabel: 'vs last month',
      trend: 'down',
      format: 'number',
      icon: 'trending-down',
    },
    {
      label: 'Resolved This Week',
      value: 12,
      change: 4,
      changeLabel: 'vs last week',
      trend: 'up',
      format: 'number',
      icon: 'check-circle',
    },
  ];

  // Sort locations by risk score
  const highRiskLocations = [...locations]
    .filter((l) => l.lpRiskScore !== undefined)
    .sort((a, b) => (b.lpRiskScore || 0) - (a.lpRiskScore || 0))
    .slice(0, 5);

  const getAlertBadge = (type: 'high' | 'medium' | 'low') => {
    switch (type) {
      case 'high':
        return 'bg-danger-500/10 text-danger-500 border-danger-500/20';
      case 'medium':
        return 'bg-warning-500/10 text-warning-500 border-warning-500/20';
      case 'low':
        return 'bg-surface-500/10 text-surface-500 border-surface-500/20';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-danger-500/10 text-danger-500';
      case 'investigating':
        return 'bg-warning-500/10 text-warning-500';
      case 'resolved':
        return 'bg-success-500/10 text-success-500';
      default:
        return 'bg-surface-500/10 text-surface-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
              Ezra LP
            </h1>
            <p className="text-surface-500 dark:text-surface-400">
              Loss prevention monitoring across {locations.length} locations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<Bell className="w-4 h-4" />}>
            Configure Alerts
          </Button>
          <Button size="sm" leftIcon={<FileWarning className="w-4 h-4" />}>
            Generate LP Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPIGrid columns={4}>
        {kpis.map((kpi, index) => (
          <Card
            key={kpi.label}
            className={cn(
              'animate-fade-in-up',
              index === 1 && 'animation-delay-100',
              index === 2 && 'animation-delay-200',
              index === 3 && 'animation-delay-300'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm text-surface-500">{kpi.label}</span>
              {kpi.trend === 'down' && kpi.label !== 'Active Alerts' ? (
                <TrendingDown className="w-4 h-4 text-success-500" />
              ) : kpi.trend === 'up' && kpi.label === 'Resolved This Week' ? (
                <TrendingUp className="w-4 h-4 text-success-500" />
              ) : null}
            </div>
            <div className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
              {kpi.format === 'number' && typeof kpi.value === 'number'
                ? Math.round(kpi.value)
                : kpi.value}
            </div>
            {kpi.change !== undefined && kpi.change !== 0 && (
              <span className="text-sm text-surface-500">
                {kpi.change > 0 ? '+' : ''}
                {kpi.change} {kpi.changeLabel}
              </span>
            )}
          </Card>
        ))}
      </KPIGrid>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Alerts */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-heading-sm text-surface-900 dark:text-surface-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning-500" />
                Active Alerts
              </h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {mockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all cursor-pointer hover:shadow-sm',
                    getAlertBadge(alert.type)
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-surface-900 dark:text-surface-100">
                          {alert.title}
                        </h4>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                            getStatusBadge(alert.status)
                          )}
                        >
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-sm text-surface-500">{alert.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-surface-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {alert.location} ({alert.storeCode})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatRelativeTime(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Risk Distribution & High Risk Locations */}
        <div className="space-y-6">
          {/* Risk Distribution */}
          <Card>
            <h3 className="text-heading-sm text-surface-900 dark:text-surface-100 mb-4">
              Risk Distribution
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success-500" />
                  <span className="text-surface-600 dark:text-surface-400">Low Risk</span>
                </div>
                <span className="font-semibold text-surface-900 dark:text-surface-100">
                  {lowRiskCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning-500" />
                  <span className="text-surface-600 dark:text-surface-400">Medium Risk</span>
                </div>
                <span className="font-semibold text-surface-900 dark:text-surface-100">
                  {mediumRiskCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger-500" />
                  <span className="text-surface-600 dark:text-surface-400">High Risk</span>
                </div>
                <span className="font-semibold text-surface-900 dark:text-surface-100">
                  {highRiskCount}
                </span>
              </div>
              {/* Visual bar */}
              <div className="h-4 rounded-full overflow-hidden bg-surface-100 dark:bg-surface-800 flex">
                <div
                  className="bg-success-500 h-full"
                  style={{ width: `${(lowRiskCount / locations.length) * 100}%` }}
                />
                <div
                  className="bg-warning-500 h-full"
                  style={{ width: `${(mediumRiskCount / locations.length) * 100}%` }}
                />
                <div
                  className="bg-danger-500 h-full"
                  style={{ width: `${(highRiskCount / locations.length) * 100}%` }}
                />
              </div>
            </div>
          </Card>

          {/* High Risk Locations */}
          <Card>
            <h3 className="text-heading-sm text-surface-900 dark:text-surface-100 mb-4">
              Highest Risk Locations
            </h3>
            <div className="space-y-3">
              {highRiskLocations.map((location) => (
                <Link
                  key={location.id}
                  href={`/app/locations/${location.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-surface-900 dark:text-surface-100">
                      {location.name}
                    </p>
                    <p className="text-xs text-surface-500">{location.storeCode}</p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      (location.lpRiskScore || 0) >= 30
                        ? 'bg-danger-500/10 text-danger-500'
                        : 'bg-warning-500/10 text-warning-500'
                    )}
                  >
                    Score: {location.lpRiskScore}
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-purple-500/5 border-purple-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">
              About Ezra LP
            </h3>
            <p className="text-surface-500 dark:text-surface-400 mt-1">
              Ezra LP uses AI-powered anomaly detection to identify unusual patterns in refunds,
              discounts, voids, and other transactions that may indicate loss or fraud. Risk scores
              are calculated based on multiple factors and updated daily.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
