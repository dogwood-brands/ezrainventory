'use client';

// ===========================================
// EZRA PORTAL - Scheduling Store Drilldown
// ===========================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  ArrowLeft,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowUpRight,
  Timer,
  Zap,
  Sun,
  Sunset,
  Moon,
  Sunrise,
  Info,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSchedulingStore } from '@/hooks/useSchedulingData';
import { formatCurrency, formatNumber, formatDate } from '@/lib/formatters';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ChartCard } from '@/components/charts/ChartCard';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Area,
} from 'recharts';
import type { SchedulingRecommendation, TimeWindowInsight, SchedulingDailySummary } from '@/types';

// ============ Time Window Card ============

interface TimeWindowCardProps {
  insight: TimeWindowInsight;
  isHighlight?: 'best' | 'worst' | 'busiest' | 'slowest' | null;
}

const TimeWindowCard: React.FC<TimeWindowCardProps> = ({ insight, isHighlight }) => {
  const getIcon = () => {
    if (insight.window.includes('Morning')) return <Sunrise className="w-5 h-5" />;
    if (insight.window.includes('Noon')) return <Sun className="w-5 h-5" />;
    if (insight.window.includes('Afternoon')) return <Sunset className="w-5 h-5" />;
    return <Moon className="w-5 h-5" />;
  };

  const getBadge = () => {
    switch (isHighlight) {
      case 'best':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-500/10 text-success-500">Best SRPH</span>;
      case 'worst':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning-500/10 text-warning-500">Highest Idle</span>;
      case 'busiest':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-ezra-500/10 text-ezra-500">Peak Traffic</span>;
      case 'slowest':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-500/10 text-surface-500">Low Traffic</span>;
      default:
        return null;
    }
  };

  return (
    <Card className={cn(
      'relative',
      isHighlight === 'best' && 'ring-1 ring-success-500/30',
      isHighlight === 'worst' && 'ring-1 ring-warning-500/30'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
          {getIcon()}
          <span className="font-medium">{insight.window}</span>
        </div>
        {getBadge()}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-surface-500 mb-1">Avg Tickets</p>
          <p className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {insight.avgTickets.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-xs text-surface-500 mb-1">Avg Revenue</p>
          <p className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {formatCurrency(insight.avgRevenue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-surface-500 mb-1">SRPH</p>
          <p className={cn(
            'text-lg font-semibold',
            isHighlight === 'best' ? 'text-success-500' : 'text-surface-900 dark:text-surface-100'
          )}>
            ${insight.srph.toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-surface-500 mb-1">Idle %</p>
          <p className={cn(
            'text-lg font-semibold',
            insight.idlePercent > 20 ? 'text-danger-500' : 
            insight.idlePercent > 10 ? 'text-warning-500' : 'text-success-500'
          )}>
            {insight.idlePercent.toFixed(1)}%
          </p>
        </div>
      </div>
    </Card>
  );
};

// ============ Recommendation Card ============

interface RecommendationCardProps {
  recommendation: SchedulingRecommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const getIcon = () => {
    switch (recommendation.type) {
      case 'reduce_coverage':
        return <TrendingDown className="w-5 h-5" />;
      case 'add_coverage':
        return <TrendingUp className="w-5 h-5" />;
      case 'shift_hours':
        return <Clock className="w-5 h-5" />;
      case 'overtime_alert':
        return <AlertTriangle className="w-5 h-5" />;
      case 'efficiency':
        return <Zap className="w-5 h-5" />;
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
      case 'reduce_coverage':
        return 'text-warning-500';
      case 'add_coverage':
        return 'text-ezra-500';
      case 'overtime_alert':
        return 'text-danger-500';
      case 'efficiency':
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

// ============ Hourly Chart ============

interface HourlyChartProps {
  data: Array<{ hour: number; label: string; avgTickets: number; avgRevenue: number; avgLaborHours: number }>;
}

const HourlyChart: React.FC<HourlyChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#71717a', fontSize: 11 }}
          dy={10}
        />
        <YAxis
          yAxisId="left"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#71717a', fontSize: 12 }}
          tickFormatter={(v) => `$${v}`}
          width={50}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
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
        <Bar
          yAxisId="left"
          dataKey="avgRevenue"
          name="Avg Revenue"
          fill="#06b6d4"
          radius={[4, 4, 0, 0]}
          barSize={24}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="avgTickets"
          name="Avg Tickets"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// ============ Main Component ============

export default function SchedulingStorePage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const { data, isLoading, error, refetch, dateRange, setDateRange } = useSchedulingStore(storeId);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '14d' | '30d'>('14d');

  // Handle period change
  const handlePeriodChange = (period: '7d' | '14d' | '30d') => {
    setSelectedPeriod(period);
    const days = period === '7d' ? 7 : period === '14d' ? 14 : 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  };

  // Determine window highlights
  const getWindowHighlight = (insight: TimeWindowInsight): 'best' | 'worst' | 'busiest' | 'slowest' | null => {
    if (!data) return null;
    const sorted = [...data.timeWindowInsights];
    const bySRPH = sorted.sort((a, b) => b.srph - a.srph);
    const byIdle = sorted.sort((a, b) => b.idlePercent - a.idlePercent);
    const byTickets = sorted.sort((a, b) => b.avgTickets - a.avgTickets);
    
    if (insight.window === bySRPH[0].window) return 'best';
    if (insight.window === byIdle[0].window && byIdle[0].idlePercent > 10) return 'worst';
    if (insight.window === byTickets[0].window) return 'busiest';
    if (insight.window === byTickets[byTickets.length - 1].window) return 'slowest';
    return null;
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
          href="/app/scheduling"
          className="flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Scheduling
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
            href="/app/scheduling"
            className="flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Scheduling
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                {data.locationName}
              </h1>
              <p className="text-surface-500 dark:text-surface-400">
                Store {data.storeCode} · Scheduling Intelligence
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
            {(['7d', '14d', '30d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium transition-colors',
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
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <DollarSign className="w-4 h-4" />
            Revenue
          </div>
          <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
            {formatCurrency(data.summary.revenue, { compact: true })}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <Clock className="w-4 h-4" />
            Labor Hours
          </div>
          <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
            {formatNumber(data.summary.laborHours, { maximumFractionDigits: 1 })}h
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <Timer className="w-4 h-4" />
            Idle Hours
          </div>
          <p className={cn(
            'text-2xl font-semibold',
            data.summary.idlePercent > 15 ? 'text-danger-500' : 'text-surface-900 dark:text-surface-100'
          )}>
            {formatNumber(data.summary.idleHours, { maximumFractionDigits: 1 })}h
            <span className="text-sm font-normal text-surface-500 ml-1">
              ({data.summary.idlePercent.toFixed(1)}%)
            </span>
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <TrendingUp className="w-4 h-4" />
            Avg SRPH
          </div>
          <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
            ${data.summary.srph.toFixed(0)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <Users className="w-4 h-4" />
            Labor Cost
          </div>
          <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
            {formatCurrency(data.summary.laborCost, { compact: true })}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            Overtime
          </div>
          <p className={cn(
            'text-2xl font-semibold',
            data.summary.hasOvertimeFlag ? 'text-danger-500' : 'text-surface-900 dark:text-surface-100'
          )}>
            {formatNumber(data.summary.overtimeHours, { maximumFractionDigits: 1 })}h
            {data.summary.hasOvertimeFlag && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-danger-500/10 text-danger-500">
                Alert
              </span>
            )}
          </p>
        </Card>
      </div>

      {/* Time Window Insights */}
      <div>
        <h2 className="text-heading-sm text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-emerald-400" />
          Time-of-Day Insights
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.timeWindowInsights.map((insight) => (
            <TimeWindowCard 
              key={insight.window} 
              insight={insight} 
              isHighlight={getWindowHighlight(insight)}
            />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Hourly Performance" 
          subtitle="Average revenue and tickets by hour"
          height={320}
        >
          <HourlyChart data={data.hourlyTrend} />
        </ChartCard>

        {/* Daily Breakdown Table */}
        <Card>
          <h3 className="text-heading-sm text-surface-900 dark:text-surface-100 mb-4">
            Daily Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-surface-500 border-b border-surface-100 dark:border-surface-800">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-right py-2 font-medium">Revenue</th>
                  <th className="text-right py-2 font-medium">Labor</th>
                  <th className="text-right py-2 font-medium">Idle %</th>
                  <th className="text-right py-2 font-medium">SRPH</th>
                </tr>
              </thead>
              <tbody>
                {data.dailyBreakdown.slice(0, 10).map((day) => (
                  <tr 
                    key={day.date} 
                    className="border-b border-surface-100 dark:border-surface-800 last:border-0"
                  >
                    <td className="py-2">
                      <span className="text-surface-900 dark:text-surface-100">
                        {formatDate(day.date, 'MMM d')}
                      </span>
                      <span className="text-surface-500 ml-1 text-xs">
                        {day.dayOfWeek.slice(0, 3)}
                      </span>
                    </td>
                    <td className="text-right py-2 text-surface-900 dark:text-surface-100">
                      {formatCurrency(day.revenue)}
                    </td>
                    <td className="text-right py-2 text-surface-600 dark:text-surface-400">
                      {day.laborHours.toFixed(1)}h
                    </td>
                    <td className={cn(
                      'text-right py-2 font-medium',
                      day.idlePercent > 20 ? 'text-danger-500' :
                      day.idlePercent > 10 ? 'text-warning-500' : 'text-success-500'
                    )}>
                      {day.idlePercent.toFixed(1)}%
                    </td>
                    <td className="text-right py-2 text-surface-900 dark:text-surface-100">
                      ${day.srph.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-emerald-400" />
          <h2 className="text-heading-sm text-surface-900 dark:text-surface-100">
            Scheduling Recommendations
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
                Great job! No significant scheduling issues detected for this location.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
