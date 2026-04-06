'use client';

// ===========================================
// EZRA PORTAL - Exponential Data Hook
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import type {
  ExponentialOverviewData,
  ExponentialStoreData,
  DateRange,
} from '@/types';
import {
  getExponentialOverview,
  getExponentialStore,
} from '@/data/mockExponentialData';
import { useAuth } from '@/context/AuthContext';
import { sleep } from '@/lib/utils';
import { format, subDays } from 'date-fns';

// ============ Overview Hook ============

interface UseExponentialOverviewReturn {
  data: ExponentialOverviewData | null;
  isLoading: boolean;
  error: Error | null;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  refetch: () => void;
}

export function useExponentialOverview(): UseExponentialOverviewReturn {
  const { user } = useAuth();
  const clientId = user?.clientId || 'client-001';

  const [data, setData] = useState<ExponentialOverviewData | null>(null);
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
      await sleep(450);

      const result = getExponentialOverview(clientId, dateRange);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exponential data'));
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

interface UseExponentialStoreReturn {
  data: ExponentialStoreData | null;
  isLoading: boolean;
  error: Error | null;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  refetch: () => void;
}

export function useExponentialStore(locationId: string): UseExponentialStoreReturn {
  const [data, setData] = useState<ExponentialStoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchData = useCallback(async () => {
    if (!locationId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API latency
      await sleep(350);

      const result = getExponentialStore(locationId, dateRange);

      if (!result) {
        throw new Error('Location not found');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch store exponential data'));
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

export default useExponentialOverview;
