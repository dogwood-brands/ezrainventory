'use client';

// ===========================================
// EZRA PORTAL - Sales Data Hook
// ===========================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { DailySalesRecord, SalesMetrics, SalesTrend, DateRange } from '@/types';
import { getSalesData, calculateMetrics, getSalesTrend } from '@/data/mockSalesData';
import { sleep } from '@/lib/utils';
import { format, subDays } from 'date-fns';

interface UseSalesDataOptions {
  startDate?: string;
  endDate?: string;
}

interface UseSalesDataReturn {
  data: DailySalesRecord[];
  metrics: SalesMetrics;
  trend: SalesTrend[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

/**
 * Hook to fetch and manage sales data for a location
 */
export function useSalesData(
  locationId: string,
  options: UseSalesDataOptions = {}
): UseSalesDataReturn {
  // Default to last 30 days
  const defaultEndDate = format(new Date(), 'yyyy-MM-dd');
  const defaultStartDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: options.startDate || defaultStartDate,
    endDate: options.endDate || defaultEndDate,
  });

  const [data, setData] = useState<DailySalesRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!locationId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API latency
      await sleep(300);

      const salesData = getSalesData(locationId, dateRange);
      setData(salesData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sales data'));
    } finally {
      setIsLoading(false);
    }
  }, [locationId, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate derived data
  const metrics = useMemo(() => calculateMetrics(data), [data]);
  const trend = useMemo(() => getSalesTrend(data), [data]);

  return {
    data,
    metrics,
    trend,
    isLoading,
    error,
    refetch: fetchData,
    dateRange,
    setDateRange,
  };
}

/**
 * Hook to fetch sales data for multiple locations
 */
export function useMultiLocationSalesData(
  locationIds: string[],
  dateRange?: DateRange
): {
  data: Record<string, DailySalesRecord[]>;
  isLoading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<Record<string, DailySalesRecord[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await sleep(500);

        const results: Record<string, DailySalesRecord[]> = {};
        for (const locId of locationIds) {
          results[locId] = getSalesData(locId, dateRange);
        }
        setData(results);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch sales data'));
      } finally {
        setIsLoading(false);
      }
    };

    if (locationIds.length > 0) {
      fetchAll();
    }
  }, [locationIds, dateRange?.startDate, dateRange?.endDate]);

  return { data, isLoading, error };
}

export default useSalesData;
