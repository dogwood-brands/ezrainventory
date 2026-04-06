'use client';

// ===========================================
// EZRA PORTAL - Ezra Inventory Overview
// ===========================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  FileDown,
  RefreshCw,
  Info,
  Upload,
  Plus,
  Calendar,
  CheckCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { KPIGrid } from '@/components/dashboard/KPICard';
import {
  useInventoryLocations,
  useExceptions,
  useActualSpend,
  useCycleCounts,
} from '@/hooks/useInventoryData';
import {
  calculateSuppliesBudget,
  calculateColorBudget,
  calculateRetailBudget,
  calculateTotalBudget,
  getBandStatus,
  getBandColor,
  getBandLabel,
  getBandDescription,
  type InventoryLocation,
} from '@/data/mockInventoryData';

// Tab type
type InventoryTab = 'budget' | 'exceptions' | 'actual' | 'cycles';

// ============ Tab Button ============
interface TabButtonProps {
  tab: InventoryTab;
  activeTab: InventoryTab;
  label: string;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, activeTab, label, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
      activeTab === tab
        ? 'bg-surface-800 text-ezra-400'
        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
    )}
  >
    {label}
  </button>
);

// ============ Budget Tab ============
interface BudgetTabProps {
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

const BudgetTab: React.FC<BudgetTabProps> = ({
  locations,
  updateLocation,
  portfolioTotals,
  avgSupplyPct,
  flaggedCount,
  activeCount,
}) => {
  const avgStatus = getBandStatus(avgSupplyPct);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="animate-fade-in">
          <span className="text-xs text-surface-500 uppercase tracking-wide">
            Total Portfolio Budget
          </span>
          <div className="text-2xl font-semibold text-ezra-400 mt-1">
            ${portfolioTotals.totalBudget.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </Card>
        <Card className="animate-fade-in animation-delay-100">
          <span className="text-xs text-surface-500 uppercase tracking-wide">
            Active Locations
          </span>
          <div className="text-2xl font-semibold text-surface-100 mt-1">{activeCount}</div>
        </Card>
        <Card className="animate-fade-in animation-delay-200">
          <span className="text-xs text-surface-500 uppercase tracking-wide">
            Portfolio Avg Supply Cost %
          </span>
          <div
            className={cn(
              'text-2xl font-semibold mt-1',
              avgStatus === 'normal'
                ? 'text-success-500'
                : avgStatus === 'high'
                ? 'text-warning-500'
                : avgStatus === 'escalate'
                ? 'text-danger-500'
                : 'text-info-500'
            )}
          >
            {avgSupplyPct.toFixed(2)}%
          </div>
        </Card>
        <Card className="animate-fade-in animation-delay-300">
          <span className="text-xs text-surface-500 uppercase tracking-wide">
            Flagged Locations
          </span>
          <div
            className={cn(
              'text-2xl font-semibold mt-1',
              flaggedCount > 0 ? 'text-danger-500' : 'text-success-500'
            )}
          >
            {flaggedCount}
          </div>
        </Card>
      </div>

      {/* Budget Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="text-left py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                  Location
                </th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                  Gross Sales
                </th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                  Color Sales
                </th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                  Product Sales
                </th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                  <span className="inline-flex items-center gap-1 cursor-help" title="% of product sales for retail replenishment. Default 37%.">
                    Retail Var %
                    <HelpCircle className="w-3 h-3" />
                  </span>
                </th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                  Supplies
                </th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                  Color
                </th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                  Retail
                </th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, index) => (
                <tr key={loc.id} className="border-b border-surface-800">
                  <td className="py-3 px-2">
                    <div className="font-medium text-surface-100">{loc.name}</div>
                    <div className="text-xs text-surface-500">{loc.code}</div>
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={loc.grossSales}
                      onChange={(e) =>
                        updateLocation(index, 'grossSales', parseFloat(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1.5 text-right bg-surface-900 border border-surface-700 rounded-md text-surface-100 text-sm focus:outline-none focus:border-ezra-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={loc.colorSales}
                      onChange={(e) =>
                        updateLocation(index, 'colorSales', parseFloat(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1.5 text-right bg-surface-900 border border-surface-700 rounded-md text-surface-100 text-sm focus:outline-none focus:border-ezra-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={loc.productSales}
                      onChange={(e) =>
                        updateLocation(index, 'productSales', parseFloat(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1.5 text-right bg-surface-900 border border-surface-700 rounded-md text-surface-100 text-sm focus:outline-none focus:border-ezra-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={loc.retailVarPct}
                      onChange={(e) =>
                        updateLocation(index, 'retailVarPct', parseFloat(e.target.value) || 0)
                      }
                      className="w-16 px-2 py-1.5 text-right bg-surface-900 border border-surface-700 rounded-md text-surface-100 text-sm focus:outline-none focus:border-ezra-500"
                    />
                  </td>
                  <td className="py-3 px-2 text-right text-surface-400">
                    ${calculateSuppliesBudget(loc.grossSales).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right text-surface-400">
                    ${calculateColorBudget(loc.colorSales).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right text-surface-400">
                    ${calculateRetailBudget(loc.productSales, loc.retailVarPct).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-ezra-400">
                    $
                    {calculateTotalBudget(
                      loc.grossSales,
                      loc.colorSales,
                      loc.productSales,
                      loc.retailVarPct
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-surface-800/50">
                <td className="py-3 px-2 font-semibold text-surface-100">Portfolio Total</td>
                <td className="py-3 px-2 text-right font-semibold text-surface-100">
                  ${portfolioTotals.grossSales.toLocaleString()}
                </td>
                <td className="py-3 px-2 text-right font-semibold text-surface-100">
                  ${portfolioTotals.colorSales.toLocaleString()}
                </td>
                <td className="py-3 px-2 text-right font-semibold text-surface-100">
                  ${portfolioTotals.productSales.toLocaleString()}
                </td>
                <td className="py-3 px-2"></td>
                <td className="py-3 px-2 text-right font-semibold text-surface-100">
                  ${portfolioTotals.suppliesBudget.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right font-semibold text-surface-100">
                  ${portfolioTotals.colorBudget.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right font-semibold text-surface-100">
                  ${portfolioTotals.retailBudget.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right font-semibold text-ezra-400">
                  ${portfolioTotals.totalBudget.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-700">
          <span className="text-xs text-surface-500">
            Budget loads May 1 — unspent balance wiped May 25. No carryover.
          </span>
          <Button size="sm" leftIcon={<FileDown className="w-4 h-4" />}>
            Export budgets
          </Button>
        </div>
      </Card>
    </div>
  );
};

// ============ Exceptions Tab ============
const ExceptionsTab: React.FC = () => {
  const { flaggedLocations, sortedByPct, trendData } = useExceptions();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Dynamic import Chart.js
    import('chart.js/auto').then((ChartModule) => {
      const Chart = ChartModule.default;
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create reference line data for upper and lower bounds
      const upperBound = trendData.map(() => 1.2);
      const lowerBound = trendData.map(() => 0.8);

      chartInstance.current = new Chart(chartRef.current!, {
        type: 'line',
        data: {
          labels: trendData.map((d) => d.month),
          datasets: [
            {
              label: 'Portfolio Avg',
              data: trendData.map((d) => d.value),
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              tension: 0.3,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: '#06b6d4',
            },
            {
              label: 'Upper Threshold (1.2%)',
              data: upperBound,
              borderColor: '#f59e0b',
              borderDash: [5, 5],
              borderWidth: 1,
              pointRadius: 0,
              fill: false,
            },
            {
              label: 'Lower Threshold (0.8%)',
              data: lowerBound,
              borderColor: '#3b82f6',
              borderDash: [5, 5],
              borderWidth: 1,
              pointRadius: 0,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              grid: { color: '#27272a' },
              ticks: { color: '#52525b' },
            },
            y: {
              min: 0.5,
              max: 1.8,
              grid: { color: '#27272a' },
              ticks: {
                color: '#52525b',
                callback: (value: number | string) => {
                  if (typeof value === 'number') return value.toFixed(1) + '%';
                  return value;
                },
              },
            },
          },
        },
      });
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trendData]);

  const getStatusColor = (pct: number) => {
    const status = getBandStatus(pct);
    switch (status) {
      case 'under':
        return '#3b82f6';
      case 'normal':
        return '#22c55e';
      case 'high':
        return '#f59e0b';
      case 'escalate':
        return '#ef4444';
    }
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <span className="w-3 h-3 rounded-full bg-info-500" />
          Under 0.8% — possible SOP non-compliance
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <span className="w-3 h-3 rounded-full bg-success-500" />
          0.8–1.2% — normal
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <span className="w-3 h-3 rounded-full bg-warning-500" />
          1.2–1.5% — review
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <span className="w-3 h-3 rounded-full bg-danger-500" />
          Over 1.5% — escalate
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <h3 className="text-sm text-surface-400 mb-4">
            Portfolio avg supply cost % — trailing 5 months
          </h3>
          <div style={{ height: 200 }}>
            <canvas ref={chartRef} />
          </div>
        </Card>

        {/* Stack Rank */}
        <Card>
          <h3 className="text-sm text-surface-400 mb-4">
            Locations ranked by 90-day supply cost %
          </h3>
          <div className="space-y-2">
            {sortedByPct.map((loc) => (
              <div key={loc.id} className="flex items-center gap-3">
                <div className="w-32 text-xs text-surface-100 truncate">{loc.name}</div>
                <div className="flex-1 h-5 bg-surface-800 rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${(loc.supplyPct90 / 2) * 100}%`,
                      backgroundColor: getStatusColor(loc.supplyPct90),
                    }}
                  />
                </div>
                <div
                  className="w-14 text-right text-sm font-semibold"
                  style={{ color: getStatusColor(loc.supplyPct90) }}
                >
                  {loc.supplyPct90.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Flagged Locations */}
      <Card>
        <h3 className="text-sm text-surface-400 mb-4">Flagged locations</h3>
        {flaggedLocations.length === 0 ? (
          <p className="text-surface-500 text-sm">
            No flagged locations — all within normal band.
          </p>
        ) : (
          <div className="space-y-4">
            {flaggedLocations.map((loc) => {
              const status = getBandStatus(loc.supplyPct90);
              return (
                <div
                  key={loc.id}
                  className="flex items-center gap-4 py-3 border-b border-surface-800 last:border-0"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${getStatusColor(loc.supplyPct90)}20` }}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(loc.supplyPct90) }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-surface-100">{loc.name}</span>
                      <span className="text-xs text-surface-500">{loc.code}</span>
                      {loc.override && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning-500/10 text-warning-500">
                          Override logged
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {getBandDescription(status)}
                    </p>
                  </div>
                  <div
                    className="text-lg font-semibold"
                    style={{ color: getStatusColor(loc.supplyPct90) }}
                  >
                    {loc.supplyPct90.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

// ============ Actual Spend Tab ============
const ActualSpendTab: React.FC = () => {
  const { entries, vendors, activeVendors, toggleVendor, filteredEntries } = useActualSpend();

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'color':
        return 'bg-warning-500/10 text-warning-500';
      case 'retail':
        return 'bg-ezra-500/10 text-ezra-500';
      case 'backbar':
        return 'bg-info-500/10 text-info-500';
      default:
        return 'bg-surface-500/10 text-surface-500';
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-surface-400">
        Upload your monthly supply spend from QuickBooks or enter manually by vendor.
      </p>

      {/* Vendor chips */}
      <div className="flex flex-wrap gap-2">
        {vendors.map((vendor) => (
          <button
            key={vendor}
            onClick={() => toggleVendor(vendor)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm border transition-all',
              activeVendors.includes(vendor)
                ? 'bg-ezra-500 border-ezra-500 text-surface-900'
                : 'bg-transparent border-surface-700 text-surface-400 hover:border-surface-500'
            )}
          >
            {vendor}
          </button>
        ))}
      </div>

      {/* Upload zone */}
      <div className="border-2 border-dashed border-surface-700 rounded-xl p-10 text-center hover:border-surface-500 transition-colors cursor-pointer">
        <Upload className="w-12 h-12 mx-auto text-surface-500 mb-3" />
        <p className="text-surface-400">Drop QuickBooks export or accounting CSV</p>
        <p className="text-xs text-surface-500 mt-2">
          Required columns: Location ID · Category · Vendor · Amount · Month
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-surface-700" />
        <span className="text-sm text-surface-500">Or enter manually</span>
        <div className="flex-1 h-px bg-surface-700" />
      </div>

      {/* Manual entries table */}
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-700">
              <th className="text-left py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                Location
              </th>
              <th className="text-left py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                Vendor
              </th>
              <th className="text-left py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                Category
              </th>
              <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                Amount
              </th>
              <th className="text-left py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                Month
              </th>
              <th className="py-3 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="border-b border-surface-800">
                <td className="py-3 px-2 text-surface-100">{entry.locationCode}</td>
                <td className="py-3 px-2 text-surface-100">{entry.vendor}</td>
                <td className="py-3 px-2">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                      getCategoryBadge(entry.category)
                    )}
                  >
                    {entry.category}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-surface-100">
                  ${entry.amount.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-surface-400">{entry.month}</td>
                <td className="py-3 px-2">
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="flex items-center gap-2 mt-4 text-sm text-ezra-400 hover:text-ezra-300">
          <Plus className="w-4 h-4" />
          Add entry
        </button>
      </Card>
    </div>
  );
};

// ============ Cycle Counts Tab ============
const CycleCountsTab: React.FC = () => {
  const { schedule, currentMonth, currentMonthIndex, overrideLog } = useCycleCounts();

  return (
    <div className="space-y-6">
      {/* Section label */}
      <h3 className="text-xs text-surface-500 uppercase tracking-wide font-medium">
        Annual cycle count calendar
      </h3>

      {/* Calendar grid */}
      <div className="grid grid-cols-6 gap-3">
        {schedule.map((month, index) => (
          <div
            key={month.month}
            className={cn(
              'p-4 rounded-xl border text-center',
              index === currentMonthIndex
                ? 'border-ezra-500 bg-ezra-500/10'
                : 'border-surface-700 bg-surface-800/50'
            )}
          >
            <div className="font-semibold text-surface-100">{month.month}</div>
            <div
              className={cn(
                'text-xs mt-1',
                index === currentMonthIndex ? 'text-ezra-400' : 'text-surface-500',
                month.description === 'No count' && 'italic'
              )}
            >
              {month.description}
            </div>
          </div>
        ))}
      </div>

      {/* Current month callout */}
      {currentMonth && (
        <div className="p-4 rounded-xl border border-ezra-500 bg-ezra-500/10">
          <div className="font-semibold text-ezra-400">
            {currentMonth.month} 2026 — {currentMonth.description}
          </div>
          <p className="text-sm text-surface-400 mt-1">{currentMonth.fullDescription}</p>
        </div>
      )}

      {/* Override log section */}
      <h3 className="text-xs text-surface-500 uppercase tracking-wide font-medium pt-4">
        Override & exception log
      </h3>

      <Card>
        {overrideLog.length === 0 ? (
          <p className="text-surface-500 text-sm">No overrides logged.</p>
        ) : (
          <div className="space-y-4">
            {overrideLog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 py-3 border-b border-surface-800 last:border-0"
              >
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning-500/10 text-warning-500">
                  Override
                </span>
                <div className="flex-1">
                  <div className="font-medium text-surface-100">{entry.locationName}</div>
                  <p className="text-sm text-surface-400 mt-0.5">{entry.reason}</p>
                  <p className="text-xs text-surface-500 mt-1">
                    {entry.date} · {entry.loggedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="flex items-center gap-2 mt-4 text-sm text-ezra-400 hover:text-ezra-300">
          <Plus className="w-4 h-4" />
          Log override
        </button>
      </Card>
    </div>
  );
};

// ============ Main Component ============
export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<InventoryTab>('budget');
  const inventoryData = useInventoryLocations();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-surface-100">Ezra Inventory</h1>
              <p className="text-surface-400">
                Budget control and anomaly detection across {inventoryData.activeCount} locations
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-ezra-500/10 text-ezra-400">
              May 2026
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success-500/10 text-success-500">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
              Synced from Zenoti
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-800/50 rounded-lg w-fit">
        <TabButton tab="budget" activeTab={activeTab} label="Budget" onClick={() => setActiveTab('budget')} />
        <TabButton tab="exceptions" activeTab={activeTab} label="Exceptions" onClick={() => setActiveTab('exceptions')} />
        <TabButton tab="actual" activeTab={activeTab} label="Actual Spend" onClick={() => setActiveTab('actual')} />
        <TabButton tab="cycles" activeTab={activeTab} label="Cycle Counts" onClick={() => setActiveTab('cycles')} />
      </div>

      {/* Tab Content */}
      {activeTab === 'budget' && <BudgetTab {...inventoryData} />}
      {activeTab === 'exceptions' && <ExceptionsTab />}
      {activeTab === 'actual' && <ActualSpendTab />}
      {activeTab === 'cycles' && <CycleCountsTab />}

      {/* Info Banner */}
      <Card className="bg-emerald-500/5 border-emerald-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-100">About Ezra Inventory</h3>
            <p className="text-surface-400 mt-1">
              Ezra Inventory auto-calculates monthly budget allocations based on prior month Zenoti
              revenue. The normal operating band for supply cost is 0.8–1.2% of net revenue.
              Locations outside this band are flagged for review. Overrides document legitimate
              exceptions but do not increase budget ceilings.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
