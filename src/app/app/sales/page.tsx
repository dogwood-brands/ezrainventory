'use client';

// ===========================================
// EZRA PORTAL - Ezra Sales Overview
// ===========================================

import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOverviewMetrics } from '@/hooks/useOverviewMetrics';
import { useEnhancedLocations } from '@/hooks/useLocations';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { KPICard, KPIGrid } from '@/components/dashboard/KPICard';
import { ChartCard, RevenueLineChart, LocationBarChart } from '@/components/charts/ChartCard';

export default function SalesOverviewPage() {
  const { data, isLoading, refetch } = useOverviewMetrics();
  const { locations } = useEnhancedLocations();

  // Get top and bottom performers
  const sortedLocations = [...locations].sort((a, b) => b.todayRevenue - a.todayRevenue);
  const topPerformers = sortedLocations.slice(0, 5);
  const bottomPerformers = sortedLocations.slice(-5).reverse();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-ezra-500/10 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-ezra-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
              Ezra Sales
            </h1>
            <p className="text-surface-500 dark:text-surface-400">
              Sales intelligence across all {locations.length} locations
            </p>
          </div>
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
          <Button size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
            Generate Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {data && (
        <KPIGrid columns={4}>
          {data.kpis.slice(0, 4).map((kpi, index) => (
            <KPICard
              key={kpi.label}
              data={kpi}
              className={cn(
                'animate-fade-in-up',
                index === 1 && 'animation-delay-100',
                index === 2 && 'animation-delay-200',
                index === 3 && 'animation-delay-300'
              )}
            />
          ))}
        </KPIGrid>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {data && (
            <ChartCard title="Revenue Trend" subtitle="Last 30 days" height={320}>
              <RevenueLineChart data={data.revenueTrend} />
            </ChartCard>
          )}
        </div>
        <Card>
          <h3 className="text-heading-sm text-surface-900 dark:text-surface-100 mb-4">
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-surface-100 dark:border-surface-800">
              <span className="text-surface-500">Active Locations</span>
              <span className="font-semibold text-surface-900 dark:text-surface-100">
                {locations.filter((l) => l.status === 'active').length}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-surface-100 dark:border-surface-800">
              <span className="text-surface-500">Onboarding</span>
              <span className="font-semibold text-surface-900 dark:text-surface-100">
                {locations.filter((l) => l.status === 'onboarding').length}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-surface-100 dark:border-surface-800">
              <span className="text-surface-500">Avg Ticket (Today)</span>
              <span className="font-semibold text-surface-900 dark:text-surface-100">
                {formatCurrency(
                  locations.reduce((sum, l) => sum + l.avgTicket, 0) / locations.length
                )}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-surface-500">Total Revenue (Today)</span>
              <span className="font-semibold text-surface-900 dark:text-surface-100">
                {formatCurrency(locations.reduce((sum, l) => sum + l.todayRevenue, 0))}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Location Rankings */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-heading-sm text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success-500" />
              Top Performers
            </h3>
            <span className="text-sm text-surface-500">Today's revenue</span>
          </div>
          <div className="space-y-3">
            {topPerformers.map((location, index) => (
              <Link
                key={location.id}
                href={`/app/locations/${location.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      index === 0
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
                    )}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-surface-100">
                      {location.name}
                    </p>
                    <p className="text-xs text-surface-500">{location.storeCode}</p>
                  </div>
                </div>
                <span className="font-semibold text-success-500">
                  {formatCurrency(location.todayRevenue)}
                </span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Needs Attention */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-heading-sm text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-warning-500" />
              Needs Attention
            </h3>
            <span className="text-sm text-surface-500">Lowest revenue today</span>
          </div>
          <div className="space-y-3">
            {bottomPerformers.map((location, index) => (
              <Link
                key={location.id}
                href={`/app/locations/${location.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-xs font-bold text-surface-500">
                    {locations.length - bottomPerformers.length + index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-surface-100">
                      {location.name}
                    </p>
                    <p className="text-xs text-surface-500">{location.storeCode}</p>
                  </div>
                </div>
                <span className="font-semibold text-warning-500">
                  {formatCurrency(location.todayRevenue)}
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Sales by Location Chart */}
      {data && (
        <ChartCard
          title="Sales by Location"
          subtitle="Revenue comparison across all locations"
          height={400}
        >
          <LocationBarChart data={data.salesByLocation} />
        </ChartCard>
      )}

      {/* View All Locations CTA */}
      <Card className="bg-gradient-to-r from-ezra-500/10 to-purple-500/10 border-ezra-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Want detailed breakdowns?
            </h3>
            <p className="text-surface-500 dark:text-surface-400 mt-1">
              View individual location dashboards for daily trends, service mix, and more.
            </p>
          </div>
          <Link href="/app/locations">
            <Button rightIcon={<MapPin className="w-4 h-4" />}>
              View All Locations
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
