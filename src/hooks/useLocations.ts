'use client';

// ===========================================
// EZRA PORTAL - Locations Hook
// ===========================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Location, LocationFilters, PaginatedResponse } from '@/types';
import {
  filterLocations,
  getLocationById,
  getLocationByCode,
  getUniqueStates,
  getLocationCountByState,
  generateTodayRevenue,
  generateAvgTicket,
} from '@/data/mockLocations';
import { useAuth } from '@/context/AuthContext';
import { sleep, debounce } from '@/lib/utils';

interface UseLocationsOptions {
  initialFilters?: LocationFilters;
  pageSize?: number;
}

interface UseLocationsReturn {
  locations: Location[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  filters: LocationFilters;
  setFilters: (filters: LocationFilters) => void;
  setPage: (page: number) => void;
  refetch: () => void;
}

/**
 * Hook to fetch and manage locations list with filtering and pagination
 */
export function useLocations(options: UseLocationsOptions = {}): UseLocationsReturn {
  const { pageSize = 10, initialFilters = {} } = options;
  const { user } = useAuth();
  const clientId = user?.clientId || 'client-001';

  const [locations, setLocations] = useState<Location[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<LocationFilters>(initialFilters);

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API latency
      await sleep(200);

      const result = filterLocations(clientId, filters, page, pageSize);
      setLocations(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch locations'));
    } finally {
      setIsLoading(false);
    }
  }, [clientId, filters, page, pageSize]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Reset page when filters change
  const handleSetFilters = useCallback((newFilters: LocationFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  return {
    locations,
    total,
    page,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters: handleSetFilters,
    setPage,
    refetch: fetchLocations,
  };
}

/**
 * Hook to get a single location by ID
 */
export function useLocation(locationId: string): {
  location: Location | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!locationId) {
        setLocation(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await sleep(100);
        const loc = getLocationById(locationId) || getLocationByCode(locationId);
        if (!loc) {
          setError(new Error('Location not found'));
        }
        setLocation(loc || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch location'));
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [locationId]);

  return { location, isLoading, error };
}

/**
 * Hook to get location filter options
 */
export function useLocationFilters(): {
  states: string[];
  stateCounts: { state: string; count: number }[];
  isLoading: boolean;
} {
  const { user } = useAuth();
  const clientId = user?.clientId || 'client-001';

  const [isLoading, setIsLoading] = useState(true);
  const [states, setStates] = useState<string[]>([]);
  const [stateCounts, setStateCounts] = useState<{ state: string; count: number }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      await sleep(100);
      setStates(getUniqueStates(clientId));
      setStateCounts(getLocationCountByState(clientId));
      setIsLoading(false);
    };
    fetch();
  }, [clientId]);

  return { states, stateCounts, isLoading };
}

/**
 * Hook to get enhanced location data with today's metrics
 */
export function useEnhancedLocations(): {
  locations: (Location & { todayRevenue: number; avgTicket: number })[];
  isLoading: boolean;
} {
  const { locations, isLoading } = useLocations({ pageSize: 100 });

  const enhanced = useMemo(() => {
    return locations.map((loc) => ({
      ...loc,
      todayRevenue: generateTodayRevenue(loc.id),
      avgTicket: generateAvgTicket(loc.id),
    }));
  }, [locations]);

  return { locations: enhanced, isLoading };
}

/**
 * Hook for debounced search
 */
export function useLocationSearch(delay = 300): {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedTerm: string;
} {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(handler);
  }, [searchTerm, delay]);

  return { searchTerm, setSearchTerm, debouncedTerm };
}

export default useLocations;
