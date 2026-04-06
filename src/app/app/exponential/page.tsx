'use client';

// ===========================================
// EZRA PORTAL - Ezra Exponential Overview
// ===========================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Rocket,
  Users,
  UserCheck,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  Search,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExponentialOverview } from '@/hooks/useExponentialData';
import { formatNumber, formatPercent, formatRelativeTime } from '@/lib/formatters';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ChartCard } from '@/components/charts/ChartCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ExponentialSegment, ExponentialLocationSummary } from '@/types';

// ============ Segment Card ============

interface SegmentCardProps {
  segment: ExponentialSegment;
}

const SegmentCard: React.FC<SegmentCardProps> = ({ segment }) => {
  const getRiskColor = () => {
    switch (segment.riskLevel) {
      case 'low':
        return 'bg-success-500/10 text-success-500 border-success-500/20';
      case 'medium':
        return 'bg-warning-500/10 text-warning-500 border-warning-500/20';
      case 'high':
        return 'bg-danger-500/10 text-danger-500 border-danger-500/20';
    }
  };

  const getSegmentColor = () => {
    switch (segment.name) {
      case '4-week':
        return 'text-success-500';
      case '6-week':
        return 'text-warning-500';
      case '8-week':
        return 'text-danger-500';
    }
  };

  const getSegmentBorder = () => {
    switch (segment.name) {
      case '4-week':
        return 'border-l-success-500';
      case '6-week':
        return 'border-l-warning-500';
      case '8-week':
        return 'border-l-danger-500';
    }
  };

  return (
    <div className={cn(
      'rounded-xl bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700/50 p-4 overflow-hidden border-l-4',
      getSegmentBorder()
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={cn('text-base font-semibold', getSegmentColor())}>
          {segment.name.charAt(0).toUpperCase() + segment.name.slice(1)}
        </h3>
        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border capitalize whitespace-nowrap', getRiskColor())}>
          {segment.riskLevel}
        </span>
      </div>
      <p className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-1">
        {formatNumber(segment.customerCount)}
      </p>
      <p className="text-xs text-surface-500 mb-3 line-clamp-2">
        {segment.description}
      </p>
      <div className="pt-2 border-t border-surface-100 dark:border-surface-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-surface-500">Offer</span>
          <span className="font-medium text-surface-900 dark:text-surface-100 truncate ml-2">{segment.offerRange}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-surface-500">Sent</span>
          <span className="font-medium text-surface-900 dark:text-surface-100">{formatNumber(segment.messagesSent)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-surface-500">Uptake</span>
          <span className={cn(
            'font-semibold',
            segment.uptakePercent >= 30 ? 'text-success-500' :
            segment.uptakePercent >= 20 ? 'text-warning-500' : 'text-danger-500'
          )}>
            {segment.uptakePercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

// ============ Campaign Stacked Bar Chart ============

interface CampaignChartProps {
  data: Array<{
    date: string;
    fourWeekSends: number;
    sixWeekSends: number;
    eightWeekSends: number;
  }>;
}

const CampaignChart: React.FC<CampaignChartProps> = ({ data }) => {
  // Show last 14 days for readability
  const chartData = data.slice(-14).map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#71717a', fontSize: 11 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#71717a', fontSize: 12 }}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#18181b',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#a1a1aa' }}
        />
        <Legend />
        <Bar dataKey="fourWeekSends" name="4-week" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
        <Bar dataKey="sixWeekSends" name="6-week" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
        <Bar dataKey="eightWeekSends" name="8-week" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ============ Uptake Bar Chart ============

interface UptakeChartProps {
  data: Array<{ segment: string; uptake: number }>;
}

const UptakeChart: React.FC<UptakeChartProps> = ({ data }) => {
  const chartData = data.map(d => ({
    ...d,
    fill: d.segment === '4-week' ? '#22c55e' : d.segment === '6-week' ? '#f59e0b' : '#ef4444',
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
        <XAxis
          type="number"
          tickFormatter={(v) => `${v}%`}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#71717a', fontSize: 12 }}
          domain={[0, 60]}
        />
        <YAxis
          type="category"
          dataKey="segment"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#a1a1aa', fontSize: 12 }}
          width={70}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Uptake']}
          contentStyle={{
            backgroundColor: '#18181b',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#a1a1aa' }}
        />
        <Bar dataKey="uptake" radius={[0, 4, 4, 0]} barSize={28}>
          {chartData.map((entry, index) => (
            <rect key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ============ Location Table Row ============

interface LocationRowProps {
  location: ExponentialLocationSummary;
  rank: number;
}

const LocationRow: React.FC<LocationRowProps> = ({ location, rank }) => {
  const riskColor = location.retentionRiskScore >= 50
    ? 'text-danger-500'
    : location.retentionRiskScore >= 30
      ? 'text-warning-500'
      : 'text-success-500';

  return (
    <Link
      href={`/app/exponential/${location.locationId}`}
      className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors border-b border-surface-100 dark:border-surface-800 last:border-0"
    >
      <div className="col-span-3 flex items-center gap-3">
        <span className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
          rank <= 3 ? 'bg-danger-500/10 text-danger-500' : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
        )}>
          {rank}
        </span>
        <div className="min-w-0">
          <p className="font-medium text-surface-900 dark:text-surface-100 truncate">
            {location.locationName}
          </p>
          <p className="text-xs text-surface-500">{location.storeCode} · {location.state}</p>
        </div>
      </div>
      <div className="col-span-1 flex items-center justify-end text-surface-900 dark:text-surface-100">
        {formatNumber(location.guestsMTD)}
      </div>
      <div className="col-span-1 flex items-center justify-end text-surface-600 dark:text-surface-400">
        {formatNumber(location.customersLastMonth)}
      </div>
      <div className="col-span-1 flex items-center justify-end text-success-500">
        {formatNumber(location.fourWeekCount)}
      </div>
      <div className="col-span-1 flex items-center justify-end text-warning-500">
        {formatNumber(location.sixWeekCount)}
      </div>
      <div className="col-span-1 flex items-center justify-end text-danger-500">
        {formatNumber(location.eightWeekCount)}
      </div>
      <div className="col-span-1 flex items-center justify-end text-surface-600 dark:text-surface-400">
        {formatNumber(location.followUpsSent)}
      </div>
      <div className="col-span-1 flex items-center justify-end">
        <span className={cn(
          'font-medium',
          location.overallUptake >= 30 ? 'text-success-500' :
          location.overallUptake >= 20 ? 'text-warning-500' : 'text-danger-500'
        )}>
          {location.overallUptake.toFixed(1)}%
        </span>
      </div>
      <div className={cn('col-span-1 flex items-center justify-end font-semibold', riskColor)}>
        {location.retentionRiskScore}
      </div>
      <div className="col-span-1 flex items-center justify-end text-xs text-surface-500">
        {formatRelativeTime(location.lastSyncAt)}
      </div>
    </Link>
  );
};

// ============ Main Component ============

export default function ExponentialOverviewPage() {
  const { data, isLoading, refetch, dateRange, setDateRange } = useExponentialOverview();
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'mtd'>('30d');

  // Filter locations
  const filteredLocations = useMemo(() => {
    if (!data) return [];

    return data.locationSummaries.filter(loc => {
      const matchesSearch = searchQuery === '' ||
        loc.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.storeCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesState = stateFilter === 'all' || loc.state === stateFilter;
      return matchesSearch && matchesState;
    });
  }, [data, searchQuery, stateFilter]);

  // Get unique states
  const states = useMemo(() => {
    if (!data) return [];
    const stateSet = new Set(data.locationSummaries.map(l => l.state));
    return Array.from(stateSet).sort();
  }, [data]);

  // Handle period change
  const handlePeriodChange = (period: '7d' | '30d' | 'mtd') => {
    setSelectedPeriod(period);
    const endDate = new Date();
    let startDate = new Date();

    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      // MTD - first day of current month
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    }

    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-xl" />
          ))}
        </div>
        <div className="h-96 skeleton rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
              Ezra Exponential
            </h1>
            <p className="text-surface-500 dark:text-surface-400">
              Customer retention & follow-up across {data?.locationSummaries.length || 0} locations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
            {(['7d', '30d', 'mtd'] as const).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium transition-colors uppercase',
                  selectedPeriod === period
                    ? 'bg-ezra-500 text-white'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                )}
              >
                {period}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={refetch}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Link href="/app/exponential/campaigns">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<MessageSquare className="w-4 h-4" />}
            >
              Campaigns
            </Button>
          </Link>
          <Button size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <Users className="w-4 h-4" />
            Total Salon Guests (MTD)
          </div>
          <p className="text-3xl font-bold text-surface-900 dark:text-surface-100">
            {formatNumber(data?.guestsMTD || 0)}
          </p>
          <p className="text-sm text-surface-500 mt-1">
            Unique guests this month
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <UserCheck className="w-4 h-4" />
            Total Customers (Last Month)
          </div>
          <p className="text-3xl font-bold text-surface-900 dark:text-surface-100">
            {formatNumber(data?.customersLastMonth || 0)}
          </p>
          <p className="text-sm text-surface-500 mt-1">
            Eligible for follow-up
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <Target className="w-4 h-4" />
            Bucket Breakdown
          </div>
          <div className="flex items-center gap-4 mt-2">
            {data?.segments.map(seg => (
              <div key={seg.name} className="text-center">
                <p className={cn(
                  'text-xl font-bold',
                  seg.name === '4-week' ? 'text-success-500' :
                  seg.name === '6-week' ? 'text-warning-500' : 'text-danger-500'
                )}>
                  {formatNumber(seg.customerCount)}
                </p>
                <p className="text-xs text-surface-500">{seg.name}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 3x3 Grid Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Segments */}
        <div className="lg:col-span-1 min-w-0">
          <h2 className="text-heading-sm text-surface-900 dark:text-surface-100 flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-orange-400" />
            Customer Segments
          </h2>
          <div className="space-y-3">
            {data?.segments.map(segment => (
              <SegmentCard key={segment.name} segment={segment} />
            ))}
          </div>
        </div>

        {/* Right Column - Campaign Activity */}
        <div className="lg:col-span-2 min-w-0 space-y-6">
          {data && (
            <ChartCard
              title="Daily Follow-ups by Segment"
              subtitle="SMS campaigns launched per day"
              height={280}
            >
              <CampaignChart data={data.dailyCampaigns} />
            </ChartCard>
          )}

          {/* Uptake Effectiveness */}
          {data && (
            <ChartCard
              title="Uptake Effectiveness by Segment"
              subtitle="% of messaged customers who returned within 14 days"
              height={180}
              action={
                <span className="group relative">
                  <Info className="w-4 h-4 text-surface-400 cursor-help" />
                  <span className="absolute bottom-full right-0 mb-2 px-3 py-2 text-xs bg-surface-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Uptake % = Customers returned ÷ Customers messaged
                  </span>
                </span>
              }
            >
              <UptakeChart data={data.uptakeBySegment} />
            </ChartCard>
          )}
        </div>
      </div>

      {/* Location Rankings Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-heading-sm text-surface-900 dark:text-surface-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Location Rankings by Retention Risk
              </h3>
              <p className="text-sm text-surface-500 mt-0.5">
                Ranked by retention risk score (highest risk first)
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-ezra-500"
                />
              </div>
              {/* State filter */}
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-ezra-500"
              >
                <option value="all">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-800/50 text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100 dark:border-surface-800">
          <div className="col-span-3">Location</div>
          <div className="col-span-1 text-right">Guests MTD</div>
          <div className="col-span-1 text-right">Last Mo.</div>
          <div className="col-span-1 text-right">4wk</div>
          <div className="col-span-1 text-right">6wk</div>
          <div className="col-span-1 text-right">8wk</div>
          <div className="col-span-1 text-right">Sent</div>
          <div className="col-span-1 text-right">Uptake</div>
          <div className="col-span-1 text-right">Risk</div>
          <div className="col-span-1 text-right">Synced</div>
        </div>

        {/* Table Body */}
        <div className="max-h-[500px] overflow-y-auto">
          {filteredLocations.map((location, index) => (
            <LocationRow
              key={location.locationId}
              location={location}
              rank={index + 1}
            />
          ))}
          {filteredLocations.length === 0 && (
            <div className="px-4 py-8 text-center text-surface-500">
              No locations match your search criteria.
            </div>
          )}
        </div>
      </Card>

      {/* Info Banner */}
      <Card className="bg-orange-500/5 border-orange-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">
              About Ezra Exponential
            </h3>
            <p className="text-surface-500 dark:text-surface-400 mt-1">
              Ezra Exponential segments customers by visit frequency and automates SMS follow-ups via Twilio.
              Customers with 2+ visits in 30 days are in the 4-week bucket (lowest churn risk).
              Single-visit customers are placed in 6-week (31-42 days) or 8-week (43+ days) buckets based on time since last visit.
              Offer values increase with time to maximize re-engagement.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
