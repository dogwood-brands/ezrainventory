'use client';

// ===========================================
// EZRA PORTAL - Overview Metrics Hook
// ===========================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { KPIData, InsightItem } from '@/types';
import { getLocationsByClient } from '@/data/mockLocations';
import {
  generateOverviewMetrics,
  generateInsights,
  generateSalesByLocation,
  generateServiceProductMix,
  generatePaymentMix,
} from '@/data/mockSalesData';
import { useAuth } from '@/context/AuthContext';
import { sleep } from '@/lib/utils';
import { formatCurrency, formatPercent } from '@/lib/formatters';

interface OverviewData {
  kpis: KPIData[];
  insights: InsightItem[];
  salesByLocation: { name: string; revenue: number; target: number }[];
  serviceProductMix: { name: string; value: number; fill: string }[];
  paymentMix: { name: string; value: number; fill: string }[];
  revenueTrend: { date: string; revenue: number }[];
}

interface UseOverviewMetricsReturn {
  data: OverviewData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch executive dashboard overview metrics
 */
export function useOverviewMetrics(): UseOverviewMetricsReturn {
  const { user } = useAuth();
  const clientId = user?.clientId || 'client-001';

  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API latency
      await sleep(400);

      const locations = getLocationsByClient(clientId);
      const locationIds = locations.map((l) => l.id);
      const locationNames = Object.fromEntries(locations.map((l) => [l.id, l.name]));

      const metrics = generateOverviewMetrics(locationIds);
      const insights = generateInsights();
      const salesByLocation = generateSalesByLocation(locationIds, locationNames);
      const serviceProductMix = generateServiceProductMix();
      const paymentMix = generatePaymentMix();

      // Generate revenue trend for last 30 days
      const revenueTrend = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const baseRevenue = metrics.totalRevenue / 30;
        const variance = (Math.random() - 0.5) * baseRevenue * 0.3;
        const dayOfWeek = date.getDay();
        const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 1;
        return {
          date: date.toISOString().split('T')[0],
          revenue: Math.round((baseRevenue + variance) * weekendMultiplier),
        };
      });

      const kpis: KPIData[] = [
        {
          label: 'Total Revenue',
          value: metrics.totalRevenue,
          change: metrics.periodChange,
          changeLabel: 'vs last period',
          trend: metrics.periodChange >= 0 ? 'up' : 'down',
          format: 'currency',
          icon: 'dollar-sign',
        },
        {
          label: 'Average Ticket',
          value: metrics.avgTicket,
          change: 3.2,
          changeLabel: 'vs last period',
          trend: 'up',
          format: 'currency',
          icon: 'receipt',
        },
        {
          label: 'Labor %',
          value: metrics.laborPercent,
          change: -1.2,
          changeLabel: 'vs target',
          trend: 'up', // Lower labor % is good
          format: 'percent',
          icon: 'users',
        },
        {
          label: 'LP Risk Count',
          value: metrics.lpRiskCount,
          change: 2,
          changeLabel: 'new this week',
          trend: 'down',
          format: 'number',
          icon: 'alert-triangle',
        },
        {
          label: 'Marketing ROI',
          value: `${metrics.marketingROI}x`,
          change: 0.4,
          changeLabel: 'vs last month',
          trend: 'up',
          format: 'number',
          icon: 'trending-up',
        },
      ];

      setData({
        kpis,
        insights,
        salesByLocation,
        serviceProductMix,
        paymentMix,
        revenueTrend,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchMetrics,
  };
}

/**
 * Hook to get just the insights
 */
export function useInsights(): {
  insights: InsightItem[];
  isLoading: boolean;
} {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      await sleep(200);
      setInsights(generateInsights());
      setIsLoading(false);
    };
    fetch();
  }, []);

  return { insights, isLoading };
}

export default useOverviewMetrics;
