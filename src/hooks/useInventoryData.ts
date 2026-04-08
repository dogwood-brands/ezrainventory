// ===========================================
// EZRA PORTAL - Inventory Data Hooks
// ===========================================

import { useState, useMemo, useCallback } from 'react';
import {
  mockInventoryLocations,
  defaultCycleCountSchedule,
  mockManualEntries,
  mockOverrideLog,
  portfolioTrendData,
  mockInventoryAging,
  vendors,
  defaultSettings,
  calculateSuppliesBudget,
  calculateServiceBudget,
  calculateRetailBudget,
  calculateTotalBudget,
  getBandStatus,
  getAgingStats,
  type InventoryLocation,
  type InventorySettings,
  type CycleCountMonth,
  type ManualSpendEntry,
  type OverrideLogEntry,
  type InventoryAgingItem,
} from '@/data/mockInventoryData';

// ============ Settings Hook ============
export interface UseInventorySettingsReturn {
  settings: InventorySettings;
  updateSettings: (updates: Partial<InventorySettings>) => void;
  resetToDefaults: () => void;
}

export function useInventorySettings(): UseInventorySettingsReturn {
  const [settings, setSettings] = useState<InventorySettings>(defaultSettings);

  const updateSettings = useCallback((updates: Partial<InventorySettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings({
      ...defaultSettings,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  return { settings, updateSettings, resetToDefaults };
}

// ============ Locations Hook ============
export interface UseInventoryLocationsReturn {
  locations: InventoryLocation[];
  updateLocationRetailPct: (index: number, value: number) => void;
  portfolioTotals: {
    netSales: number;
    serviceSales: number;
    productSales: number;
    suppliesBudget: number;
    serviceBudget: number;
    retailBudget: number;
    totalBudget: number;
  };
  avgSupplyPct: number;
  flaggedCount: number;
  activeCount: number;
  lastSyncedAt: string;
}

export function useInventoryLocations(settings: InventorySettings): UseInventoryLocationsReturn {
  const [locations, setLocations] = useState<InventoryLocation[]>(mockInventoryLocations);

  const updateLocationRetailPct = useCallback((index: number, value: number) => {
    setLocations((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], retailVarPct: value };
      return updated;
    });
  }, []);

  const portfolioTotals = useMemo(() => {
    const netSales = locations.reduce((sum, l) => sum + l.netSales, 0);
    const serviceSales = locations.reduce((sum, l) => sum + l.serviceSales, 0);
    const productSales = locations.reduce((sum, l) => sum + l.productSales, 0);
    const suppliesBudget = locations.reduce(
      (sum, l) => sum + calculateSuppliesBudget(l.netSales, settings.suppliesPct),
      0
    );
    const serviceBudget = locations.reduce(
      (sum, l) => sum + calculateServiceBudget(l.serviceSales, settings.servicePct),
      0
    );
    const retailBudget = locations.reduce(
      (sum, l) => sum + calculateRetailBudget(l.productSales, l.retailVarPct),
      0
    );
    const totalBudget = suppliesBudget + serviceBudget + retailBudget;

    return {
      netSales,
      serviceSales,
      productSales,
      suppliesBudget,
      serviceBudget,
      retailBudget,
      totalBudget,
    };
  }, [locations, settings.suppliesPct, settings.servicePct]);

  const avgSupplyPct = useMemo(() => {
    return locations.reduce((sum, l) => sum + l.supplyPct90, 0) / locations.length;
  }, [locations]);

  const flaggedCount = useMemo(() => {
    return locations.filter((l) => {
      const status = getBandStatus(
        l.supplyPct90,
        settings.toleranceLower,
        settings.toleranceUpper
      );
      return status === 'outside';
    }).length;
  }, [locations, settings]);

  const lastSyncedAt = useMemo(() => {
    const dates = locations.map((l) => new Date(l.lastSyncedAt).getTime());
    return new Date(Math.max(...dates)).toISOString();
  }, [locations]);

  return {
    locations,
    updateLocationRetailPct,
    portfolioTotals,
    avgSupplyPct,
    flaggedCount,
    activeCount: locations.length,
    lastSyncedAt,
  };
}

// ============ Exceptions & Actual Spend Hook (Combined) ============
export interface UseExceptionsAndSpendReturn {
  // Exceptions data
  flaggedLocations: InventoryLocation[];
  sortedByPct: InventoryLocation[];
  trendData: typeof portfolioTrendData;
  
  // Actual spend data
  entries: ManualSpendEntry[];
  vendors: string[];
  activeVendors: string[];
  toggleVendor: (vendor: string) => void;
  filteredEntries: ManualSpendEntry[];
  addEntry: (entry: Omit<ManualSpendEntry, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  deleteEntry: (id: string) => void;
  
  // Override log
  overrideLog: OverrideLogEntry[];
  addOverride: (override: Omit<OverrideLogEntry, 'id'>) => void;
  
  // Totals
  totalSpendByMonth: Record<string, number>;
  totalSpendByCategory: Record<string, number>;
}

export function useExceptionsAndSpend(settings: InventorySettings): UseExceptionsAndSpendReturn {
  const [locations] = useState<InventoryLocation[]>(mockInventoryLocations);
  const [entries, setEntries] = useState<ManualSpendEntry[]>(mockManualEntries);
  const [activeVendors, setActiveVendors] = useState<string[]>([]);
  const [overrideLog, setOverrideLog] = useState<OverrideLogEntry[]>(mockOverrideLog);

  const flaggedLocations = useMemo(() => {
    return locations.filter((l) => {
      const status = getBandStatus(
        l.supplyPct90,
        settings.toleranceLower,
        settings.toleranceUpper
      );
      return status === 'outside';
    });
  }, [locations, settings]);

  const sortedByPct = useMemo(() => {
    return [...locations].sort((a, b) => b.supplyPct90 - a.supplyPct90);
  }, [locations]);

  const toggleVendor = useCallback((vendor: string) => {
    setActiveVendors((prev) =>
      prev.includes(vendor) ? prev.filter((v) => v !== vendor) : [...prev, vendor]
    );
  }, []);

  const filteredEntries = useMemo(() => {
    if (activeVendors.length === 0) return entries;
    return entries.filter((e) => activeVendors.includes(e.vendor));
  }, [entries, activeVendors]);

  const addEntry = useCallback((entry: Omit<ManualSpendEntry, 'id' | 'uploadedAt' | 'uploadedBy'>) => {
    const newEntry: ManualSpendEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User', // Would come from auth context
    };
    setEntries((prev) => [...prev, newEntry]);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addOverride = useCallback((override: Omit<OverrideLogEntry, 'id'>) => {
    const newOverride: OverrideLogEntry = {
      ...override,
      id: `override-${Date.now()}`,
    };
    setOverrideLog((prev) => [...prev, newOverride]);
  }, []);

  const totalSpendByMonth = useMemo(() => {
    return entries.reduce((acc, e) => {
      acc[e.month] = (acc[e.month] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [entries]);

  const totalSpendByCategory = useMemo(() => {
    return entries.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [entries]);

  return {
    flaggedLocations,
    sortedByPct,
    trendData: portfolioTrendData,
    entries,
    vendors,
    activeVendors,
    toggleVendor,
    filteredEntries,
    addEntry,
    deleteEntry,
    overrideLog,
    addOverride,
    totalSpendByMonth,
    totalSpendByCategory,
  };
}

// ============ Cycle Counts Hook ============
export interface UseCycleCountsReturn {
  schedule: CycleCountMonth[];
  currentMonth: CycleCountMonth | undefined;
  currentMonthIndex: number;
  updateMonth: (monthNum: number, updates: Partial<CycleCountMonth>) => void;
  toggleMonthActive: (monthNum: number) => void;
  resetSchedule: () => void;
}

export function useCycleCounts(): UseCycleCountsReturn {
  const [schedule, setSchedule] = useState<CycleCountMonth[]>(defaultCycleCountSchedule);

  // Get current month (May = 5 in the spec)
  const currentMonthIndex = 4; // May (0-indexed)
  const currentMonth = schedule[currentMonthIndex];

  const updateMonth = useCallback((monthNum: number, updates: Partial<CycleCountMonth>) => {
    setSchedule((prev) =>
      prev.map((m) => (m.monthNum === monthNum ? { ...m, ...updates } : m))
    );
  }, []);

  const toggleMonthActive = useCallback((monthNum: number) => {
    setSchedule((prev) =>
      prev.map((m) => (m.monthNum === monthNum ? { ...m, isActive: !m.isActive } : m))
    );
  }, []);

  const resetSchedule = useCallback(() => {
    setSchedule(defaultCycleCountSchedule);
  }, []);

  return {
    schedule,
    currentMonth,
    currentMonthIndex,
    updateMonth,
    toggleMonthActive,
    resetSchedule,
  };
}

// ============ Inventory Aging Hook ============
export interface UseInventoryAgingReturn {
  items: InventoryAgingItem[];
  stats: ReturnType<typeof getAgingStats>;
  filteredItems: InventoryAgingItem[];
  filterByBand: (band: InventoryAgingItem['agingBand'] | 'all') => void;
  filterByLocation: (locationCode: string | 'all') => void;
  activeBandFilter: InventoryAgingItem['agingBand'] | 'all';
  activeLocationFilter: string;
  sortBy: (field: 'daysSinceLastSale' | 'costValue' | 'quantityOnHand') => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

export function useInventoryAging(): UseInventoryAgingReturn {
  const [items] = useState<InventoryAgingItem[]>(mockInventoryAging);
  const [activeBandFilter, setActiveBandFilter] = useState<InventoryAgingItem['agingBand'] | 'all'>('all');
  const [activeLocationFilter, setActiveLocationFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('daysSinceLastSale');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const stats = useMemo(() => getAgingStats(items), [items]);

  const filteredItems = useMemo(() => {
    let filtered = [...items];
    
    if (activeBandFilter !== 'all') {
      filtered = filtered.filter((i) => i.agingBand === activeBandFilter);
    }
    
    if (activeLocationFilter !== 'all') {
      filtered = filtered.filter((i) => i.locationCode === activeLocationFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField as keyof InventoryAgingItem] as number;
      const bVal = b[sortField as keyof InventoryAgingItem] as number;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    return filtered;
  }, [items, activeBandFilter, activeLocationFilter, sortField, sortDirection]);

  const filterByBand = useCallback((band: InventoryAgingItem['agingBand'] | 'all') => {
    setActiveBandFilter(band);
  }, []);

  const filterByLocation = useCallback((locationCode: string | 'all') => {
    setActiveLocationFilter(locationCode);
  }, []);

  const sortBy = useCallback((field: 'daysSinceLastSale' | 'costValue' | 'quantityOnHand') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  return {
    items,
    stats,
    filteredItems,
    filterByBand,
    filterByLocation,
    activeBandFilter,
    activeLocationFilter,
    sortBy,
    sortField,
    sortDirection,
  };
}
