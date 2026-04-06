'use client';

// ===========================================
// EZRA PORTAL - Exponential Store Drilldown
// ===========================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Rocket,
  ArrowLeft,
  Users,
  UserCheck,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Target,
  Zap,
  Info,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Clock,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExponentialStore } from '@/hooks/useExponentialData';
import { formatNumber, formatDate } from '@/lib/formatters';
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
  LineChart,
  Line,
} from 'recharts';
import type { ExponentialSegment, ExponentialRecommendation, ExponentialGuestSample } from '@/types';

// ============ Segment Detail Card ============

interface SegmentDetailCardProps {
  segment: ExponentialSegment;
}

const SegmentDetailCard: React.FC<SegmentDetailCardProps> = ({ segment }) => {
  const getSegmentColor = () => {
    switch (segment.name) {
      case '4-week':
        return { bg: 'bg-success-500/10', border: 'border-success-500/20', text: 'text-success-500' };
      case '6-week':
        return { bg: 'bg-warning-500/10', border: 'border-warning-500/20', text: 'text-warning-500' };
      case '8-week':
        return { bg: 'bg-danger-500/10', border: 'border-danger-500/20', text: 'text-danger-500' };
    }
  };

  const colors = getSegmentColor();

  return (
    <Card className={cn('border', colors.border)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.bg)}>
            <Target className={cn('w-5 h-5', colors.text)} />
          </div>
          <div>
            <h3 className={cn('text-lg font-semibold', colors.text)}>
              {segment.name.charAt(0).toUpperCase() + segment.name.slice(1)} Segment
            </h3>
            <p className="text-sm text-surface-500">{segment.customerCount} customers</p>
          </div>
        </div>
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs font-medium border capitalize',
          colors.bg, colors.border, colors.text
        )}>
          {segment.riskLevel} risk
        </span>
      </div>

      <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
        {segment.description}
      </p>

      <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50">
        <div className="text-center">
          <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            {formatNumber(segment.messagesSent)}
          </p>
          <p className="text-xs text-surface-500">Messages Sent</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            {formatNumber(segment.returns)}
          </p>
          <p className="text-xs text-surface-500">Returned</p>
        </div>
        <div className="text-center">
          <p className={cn(
            'text-2xl font-bold',
            segment.uptakePercent >= 30 ? 'text-success-500' :
            segment.uptakePercent >= 20 ? 'text-warning-500' : 'text-danger-500'
          )}>
            {segment.uptakePercent.toFixed(1)}%
          </p>
          <p className="text-xs text-surface-500">Uptake Rate</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
        <p className="text-sm text-surface-500">
          <strong>Recommended Offer:</strong> {segment.offerRange}
        </p>
      </div>
    </Card>
  );
};

// ============ Recommendation Card ============

interface RecommendationCardProps {
  recommendation: ExponentialRecommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const getIcon = () => {
    switch (recommendation.type) {
      case 'increase_outreach':
        return <MessageSquare className="w-5 h-5" />;
      case 'adjust_offer':
        return <Target className="w-5 h-5" />;
      case 'timing':
        return <Clock className="w-5 h-5" />;
      case 'segment_focus':
        return <TrendingUp className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'high':
        return 'bg-danger-500/10 border-danger-500/20 text-danger-500';
      case 'medium':
        return 'bg-warning-500/10 border-warning-500/20 text-warning-500';
      case 'low':
        return 'bg-surface-500/10 border-surface-500/20 text-surface-500';
    }
  };

  const getTypeColor = () => {
    switch (recommendation.type) {
      case 'increase_outreach':
        return 'text-orange-500';
      case 'adjust_offer':
        return 'text-purple-500';
      case 'timing':
        return 'text-ezra-500';
      case 'segment_focus':
        return 'text-warning-500';
      case 'success':
        return 'text-success-500';
      default:
        return 'text-surface-500';
    }
  };

  return (
    <div className={cn(
      'p-4 rounded-lg border transition-all',
      recommendation.priority === 'high' ? 'bg-danger-500/5 border-danger-500/20' :
      recommendation.priority === 'medium' ? 'bg-warning-500/5 border-warning-500/20' :
      'bg-surface-50 dark:bg-surface-800/50 border-surface-200 dark:border-surface-700'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', getTypeColor())}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-surface-900 dark:text-surface-100">
              {recommendation.title}
            </h4>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
              getPriorityColor()
            )}>
              {recommendation.priority}
            </span>
          </div>
          <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
            {recommendation.description}
          </p>
          {(recommendation.metric || recommendation.impact) && (
            <div className="flex items-center gap-4 text-xs">
              {recommendation.metric && (
                <span className="text-surface-500">
                  📊 {recommendation.metric}
                </span>
              )}
              {recommendation.impact && (
                <span className="text-success-500 font-medium">
                  💰 {recommendation.impact}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ Guest Sample Table ============

interface GuestTableProps {
  guests: ExponentialGuestSample[];
}

const GuestTable: React.FC<GuestTableProps> = ({ guests }) => {
  const getStatusBadge = (status: ExponentialGuestSample['status']) => {
    switch (status) {
      case 'not_messaged':
        return 'bg-surface-500/10 text-surface-500';
      case 'messaged':
        return 'bg-ezra-500/10 text-ezra-500';
      case 'returned':
        return 'bg-success-500/10 text-success-500';
      case 'no_response':
        return 'bg-warning-500/10 text-warning-500';
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case '4-week':
        return 'text-success-500';
      case '6-week':
        return 'text-warning-500';
      case '8-week':
        return 'text-danger-500';
      default:
        return 'text-surface-500';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-surface-500 border-b border-surface-100 dark:border-surface-800">
            <th className="text-left py-2 font-medium">Guest ID</th>
            <th className="text-left py-2 font-medium">Last Visit</th>
            <th className="text-left py-2 font-medium">Segment</th>
            <th className="text-left py-2 font-medium">Last Message</th>
            <th className="text-left py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest) => (
            <tr
              key={guest.id}
              className="border-b border-surface-100 dark:border-surface-800 last:border-0"
            >
              <td className="py-2 font-mono text-xs text-surface-600 dark:text-surface-400">
                {guest.id}
              </td>
              <td className="py-2 text-surface-900 dark:text-surface-100">
                {formatDate(guest.lastVisitDate, 'MMM d, yyyy')}
              </td>
              <td className={cn('py-2 font-medium', getSegmentColor(guest.segment))}>
                {guest.segment}
              </td>
              <td className="py-2 text-surface-600 dark:text-surface-400">
                {guest.lastMessageDate ? formatDate(guest.lastMessageDate, 'MMM d') : '—'}
              </td>
              <td className="py-2">
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                  getStatusBadge(guest.status)
                )}>
                  {guest.status.replace('_', ' ')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============ Daily Campaign Chart ============

interface DailyCampaignChartProps {
  data: Array<{
    date: string;
    fourWeekSends: number;
    sixWeekSends: number;
    eightWeekSends: number;
  }>;
}

const DailyCampaignChart: React.FC<DailyCampaignChartProps> = ({ data }) => {
  const chartData = data.slice(-14).map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
        <Line type="monotone" dataKey="fourWeekSends" name="4-week" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="sixWeekSends" name="6-week" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="eightWeekSends" name="8-week" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// ============ Main Component ============

export default function ExponentialStorePage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const { data, isLoading, error, refetch, dateRange, setDateRange } = useExponentialStore(storeId);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'mtd'>('30d');

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
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-xl" />
          ))}
        </div>
        <div className="h-96 skeleton rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link
          href="/app/exponential"
          className="flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exponential
        </Link>
        <Card className="py-12 text-center">
          <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
            Location Not Found
          </h2>
          <p className="text-surface-500">
            The location you're looking for doesn't exist or has been removed.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back link & header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/app/exponential"
            className="flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Exponential
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                {data.locationName}
              </h1>
              <p className="text-surface-500 dark:text-surface-400">
                Store {data.storeCode} · Customer Retention
              </p>
            </div>
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
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <Users className="w-4 h-4" />
            Guests MTD
          </div>
          <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
            {formatNumber(data.summary.guestsMTD)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <UserCheck className="w-4 h-4" />
            Last Month
          </div>
          <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
            {formatNumber(data.summary.customersLastMonth)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-success-500" />
            4-week
          </div>
          <p className="text-2xl font-semibold text-success-500">
            {formatNumber(data.summary.fourWeekCount)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-warning-500" />
            6-week
          </div>
          <p className="text-2xl font-semibold text-warning-500">
            {formatNumber(data.summary.sixWeekCount)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-danger-500" />
            8-week
          </div>
          <p className="text-2xl font-semibold text-danger-500">
            {formatNumber(data.summary.eightWeekCount)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <MessageSquare className="w-4 h-4" />
            Follow-ups
          </div>
          <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
            {formatNumber(data.summary.followUpsSent)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <TrendingUp className="w-4 h-4" />
            Uptake
          </div>
          <p className={cn(
            'text-2xl font-semibold',
            data.summary.overallUptake >= 30 ? 'text-success-500' :
            data.summary.overallUptake >= 20 ? 'text-warning-500' : 'text-danger-500'
          )}>
            {data.summary.overallUptake.toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Segment Detail Panels */}
      <div>
        <h2 className="text-heading-sm text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-400" />
          Segment Details
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {data.segments.map(segment => (
            <SegmentDetailCard key={segment.name} segment={segment} />
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          title="Daily Follow-up Activity"
          subtitle="Messages sent per segment (last 14 days)"
          height={280}
        >
          <DailyCampaignChart data={data.dailyCampaigns} />
        </ChartCard>

        {/* Guest Sample Table */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-heading-sm text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              Sample Guest Records
            </h3>
            <span className="text-xs text-surface-500">
              Anonymized sample
            </span>
          </div>
          <GuestTable guests={data.guestSamples} />
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-orange-400" />
          <h2 className="text-heading-sm text-surface-900 dark:text-surface-100">
            Retention Recommendations
          </h2>
        </div>
        <div className="space-y-3">
          {data.recommendations.length > 0 ? (
            data.recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))
          ) : (
            <div className="py-8 text-center">
              <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-3" />
              <p className="text-surface-600 dark:text-surface-400">
                Great job! No significant retention issues detected for this location.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
