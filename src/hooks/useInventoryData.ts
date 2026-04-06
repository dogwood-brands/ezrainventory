// ===========================================
// EZRA PORTAL - Inventory Data Hooks
// ===========================================

import { useState, useMemo, useCallback } from 'react';
import {
  mockInventoryLocations,
  cycleCountSchedule,
  mockManualEntries,
  mockOverrideLog,
  portfolioTrendData,
  vendors,
  calculateSuppliesBudget,
  calculateColorBudget,
  calculateRetailBudget,
  calculateTotalBudget,
  getBandStatus,
  type InventoryLocation,
  type ManualSpendEntry,
  type OverrideLogEntry,
} from '@/data/mockInventoryData';

export interface UseInventoryLocationsReturn {
  locations: InventoryLocation[];
  updateLocation: (index: number, field: keyof InventoryLocation, value: number) => void;
  portfolioTotals: {
    grossSales: number;
    colorSales: number;
    productSales: number;
    suppliesBudget: number;
    colorBudget: number;
    retailBudget: number;
    totalBudget: number;
  };
  avgSupplyPct: number;
  flaggedCount: number;
  activeCount: number;
}

export function useInventoryLocations(): UseInventoryLocationsReturn {
  const [locations, setLocations] = useState<InventoryLocation[]>(mockInventoryLocations);

  const updateLocation = useCallback(
    (index: number, field: keyof InventoryLocation, value: number) => {
      setLocations((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const portfolioTotals = useMemo(() => {
    const grossSales = locations.reduce((sum, l) => sum + l.grossSales, 0);
    const colorSales = locations.reduce((sum, l) => sum + l.colorSales, 0);
    const productSales = locations.reduce((sum, l) => sum + l.productSales, 0);
    const suppliesBudget = locations.reduce(
      (sum, l) => sum + calculateSuppliesBudget(l.grossSales),
      0
    );
    const colorBudget = locations.reduce(
      (sum, l) => sum + calculateColorBudget(l.colorSales),
      0
    );
    const retailBudget = locations.reduce(
      (sum, l) => sum + calculateRetailBudget(l.productSales, l.retailVarPct),
      0
    );
    const totalBudget = suppliesBudget + colorBudget + retailBudget;

    return {
      grossSales,
      colorSales,
      productSales,
      suppliesBudget,
      colorBudget,
      retailBudget,
      totalBudget,
    };
  }, [locations]);

  const avgSupplyPct = useMemo(() => {
    return locations.reduce((sum, l) => sum + l.supplyPct90, 0) / locations.length;
  }, [locations]);

  const flaggedCount = useMemo(() => {
    return locations.filter((l) => {
      const status = getBandStatus(l.supplyPct90);
      return status !== 'normal';
    }).length;
  }, [locations]);

  return {
    locations,
    updateLocation,
    portfolioTotals,
    avgSupplyPct,
    flaggedCount,
    activeCount: locations.length,
  };
}

export interface UseExceptionsReturn {
  flaggedLocations: InventoryLocation[];
  sortedByPct: InventoryLocation[];
  trendData: typeof portfolioTrendData;
}

export function useExceptions(): UseExceptionsReturn {
  const { locations } = useInventoryLocations();

  const flaggedLocations = useMemo(() => {
    return locations.filter((l) => {
      const status = getBandStatus(l.supplyPct90);
      return status !== 'normal';
    });
  }, [locations]);

  const sortedByPct = useMemo(() => {
    return [...locations].sort((a, b) => b.supplyPct90 - a.supplyPct90);
  }, [locations]);

  return {
    flaggedLocations,
    sortedByPct,
    trendData: portfolioTrendData,
  };
}

export interface UseActualSpendReturn {
  entries: ManualSpendEntry[];
  vendors: string[];
  activeVendors: string[];
  toggleVendor: (vendor: string) => void;
  filteredEntries: ManualSpendEntry[];
  addEntry: (entry: Omit<ManualSpendEntry, 'id'>) => void;
}

export function useActualSpend(): UseActualSpendReturn {
  const [entries, setEntries] = useState<ManualSpendEntry[]>(mockManualEntries);
  const [activeVendors, setActiveVendors] = useState<string[]>([]);

  const toggleVendor = useCallback((vendor: string) => {
    setActiveVendors((prev) =>
      prev.includes(vendor) ? prev.filter((v) => v !== vendor) : [...prev, vendor]
    );
  }, []);

  const filteredEntries = useMemo(() => {
    if (activeVendors.length === 0) return entries;
    return entries.filter((e) => activeVendors.includes(e.vendor));
  }, [entries, activeVendors]);

  const addEntry = useCallback((entry: Omit<ManualSpendEntry, 'id'>) => {
    const newEntry: ManualSpendEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
    };
    setEntries((prev) => [...prev, newEntry]);
  }, []);

  return {
    entries,
    vendors,
    activeVendors,
    toggleVendor,
    filteredEntries,
    addEntry,
  };
}

export interface UseCycleCountsReturn {
  schedule: typeof cycleCountSchedule;
  currentMonth: typeof cycleCountSchedule[0] | undefined;
  currentMonthIndex: number;
  overrideLog: OverrideLogEntry[];
  addOverride: (override: Omit<OverrideLogEntry, 'id'>) => void;
}

export function useCycleCounts(): UseCycleCountsReturn {
  const [overrideLog, setOverrideLog] = useState<OverrideLogEntry[]>(mockOverrideLog);

  // Get current month (May = 5 in the spec)
  const currentMonthIndex = 4; // May (0-indexed)
  const currentMonth = cycleCountSchedule[currentMonthIndex];

  const addOverride = useCallback((override: Omit<OverrideLogEntry, 'id'>) => {
    const newOverride: OverrideLogEntry = {
      ...override,
      id: `override-${Date.now()}`,
    };
    setOverrideLog((prev) => [...prev, newOverride]);
  }, []);

  return {
    schedule: cycleCountSchedule,
    currentMonth,
    currentMonthIndex,
    overrideLog,
    addOverride,
  };
}
