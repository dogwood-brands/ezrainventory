'use client';

// ===========================================
// EZRA PORTAL - Executive Dashboard
// ===========================================

import React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Info,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOverviewMetrics } from '@/hooks/useOverviewMetrics';
import { formatCurrency, formatPercent, formatRelativeTime } from '@/lib/formatters';
import { KPICard, KPIGrid } from '@/components/dashboard/KPICard';
import {
  ChartCard,
  RevenueLineChart,
  LocationBarChart,
  DonutChart,
} from '@/components/charts/ChartCard';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { InsightItem } from '@/types';

// ============ Insights Panel ============
interface InsightsPanelProps {
  insights: InsightItem[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  const getIcon = (type: InsightItem['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-500" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-danger-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-ezra-400" />;
    }
  };

  const getBgColor = (type: InsightItem['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-warning-50 dark:bg-warning-500/10 border-warning-200 dark:border-warning-500/20';
      case 'alert':
        return 'bg-danger-50 dark:bg-danger-500/10 border-danger-200 dark:border-danger-500/20';
      case 'success':
        return 'bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-500/20';
      case 'info':
      default:
        return 'bg-ezra-50 dark:bg-ezra-500/10 border-ezra-200 dark:border-ezra-500/20';
    }
  };

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-heading-sm text-surface-900 dark:text-surface-100">
          AI Insights
        </h3>
        <span className="px-2 py-0.5 rounded-full bg-ezra-500/10 text-ezra-500 text-xs font-medium">
          {insights.length} new
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={cn(
              'p-4 rounded-lg border transition-all cursor-pointer',
              'hover:shadow-sm',
              getBgColor(insight.type)
            )}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">{getIcon(insight.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 dark:text-surface-100 text-sm">
                  {insight.title}
                </p>
                <p className="text-surface-600 dark:text-surface-400 text-sm mt-1 line-clamp-2">
                  {insight.description}
                </p>
                <p className="text-surface-400 dark:text-surface-500 text-xs mt-2">
                  {formatRelativeTime(insight.timestamp)}
                </p>
              </div>
              {insight.actionUrl && (
                <ChevronRight className="w-5 h-5 text-surface-400 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-sm text-ezra-500 hover:text-ezra-400 font-medium">
        View all insights
      </button>
    </Card>
  );
};

// ============ Quick Actions ============
const QuickActions = () => {
  const actions = [
    { label: 'View All Locations', href: '/app/locations' },
    { label: 'Generate Report', href: '/app/reports' },
    { label: 'LP Alerts', href: '/app/lp' },
    { label: 'Settings', href: '/app/settings' },
  ];

  return (
    <Card padding="sm">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-surface-500 dark:text-surface-400">
          Quick actions:
        </span>
        <div className="flex gap-2">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button variant="ghost" size="sm">
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
};

// ============ Main Dashboard Page ============
export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useOverviewMetrics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 skeleton mb-2" />
            <div className="h-4 w-64 skeleton" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 skeleton rounded-xl" />
          <div className="h-80 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertTriangle className="w-12 h-12 text-warning-500 mb-4" />
        <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
          Failed to load dashboard
        </h2>
        <p className="text-surface-500 mb-6">{error?.message || 'An error occurred'}</p>
        <Button onClick={refetch} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
            Executive Dashboard
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Overview of your franchise performance across all locations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={refetch}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick actions */}
      <QuickActions />

      {/* KPI Cards */}
      <KPIGrid columns={5}>
        {data.kpis.map((kpi, index) => (
          <KPICard
            key={kpi.label}
            data={kpi}
            className={cn(
              'animate-fade-in-up',
              index === 1 && 'animation-delay-100',
              index === 2 && 'animation-delay-200',
              index === 3 && 'animation-delay-300',
              index === 4 && 'animation-delay-400'
            )}
          />
        ))}
      </KPIGrid>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue Trend"
            subtitle="Last 30 days"
            height={320}
          >
            <RevenueLineChart data={data.revenueTrend} />
          </ChartCard>
        </div>
        <InsightsPanel insights={data.insights} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Sales by Location"
            subtitle="Top 10 locations by revenue"
            height={400}
          >
            <LocationBarChart data={data.salesByLocation} />
          </ChartCard>
        </div>
        <div className="space-y-6">
          <ChartCard title="Revenue Mix" subtitle="Services vs Products" height={180}>
            <DonutChart data={data.serviceProductMix} showLegend />
          </ChartCard>
          <ChartCard title="Payment Methods" subtitle="Card vs Cash" height={180}>
            <DonutChart data={data.paymentMix} showLegend />
          </ChartCard>
        </div>
      </div>

      {/* Bottom CTA */}
      <Card className="bg-gradient-to-r from-ezra-500/10 to-purple-500/10 border-ezra-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Want deeper insights?
            </h3>
            <p className="text-surface-500 dark:text-surface-400 mt-1">
              Explore individual location dashboards for detailed breakdowns and trends.
            </p>
          </div>
          <Link href="/app/locations">
            <Button rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              View All Locations
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
