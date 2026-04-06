'use client';

// ===========================================
// EZRA PORTAL - Scheduling Data Hook
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import type { 
  SchedulingOverviewData, 
  SchedulingStoreData, 
  DateRange 
} from '@/types';
import { 
  getSchedulingOverview, 
  getSchedulingStore 
} from '@/data/mockSchedulingData';
import { useAuth } from '@/context/AuthContext';
import { sleep } from '@/lib/utils';
import { format, subDays } from 'date-fns';

// ============ Overview Hook ============

interface UseSchedulingOverviewReturn {
  data: SchedulingOverviewData | null;
  isLoading: boolean;
  error: Error | null;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  refetch: () => void;
}

export function useSchedulingOverview(): UseSchedulingOverviewReturn {
  const { user } = useAuth();
  const clientId = user?.clientId || 'client-001';

  const [data, setData] = useState<SchedulingOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API latency
      await sleep(500);

      const result = getSchedulingOverview(clientId, dateRange);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch scheduling data'));
    } finally {
      setIsLoading(false);
    }
  }, [clientId, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    dateRange,
    setDateRange,
    refetch: fetchData,
  };
}

// ============ Store Hook ============

interface UseSchedulingStoreReturn {
  data: SchedulingStoreData | null;
  isLoading: boolean;
  error: Error | null;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  refetch: () => void;
}

export function useSchedulingStore(locationId: string): UseSchedulingStoreReturn {
  const [data, setData] = useState<SchedulingStoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchData = useCallback(async () => {
    if (!locationId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API latency
      await sleep(400);

      const result = getSchedulingStore(locationId, dateRange);
      
      if (!result) {
        throw new Error('Location not found');
      }
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch store scheduling data'));
    } finally {
      setIsLoading(false);
    }
  }, [locationId, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    dateRange,
    setDateRange,
    refetch: fetchData,
  };
}

export default useSchedulingOverview;
