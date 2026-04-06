'use client';

// ===========================================
// EZRA PORTAL - Ezra Inventory Module
// ===========================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  AlertTriangle,
  Settings,
  FileDown,
  Upload,
  Plus,
  Calendar,
  HelpCircle,
  RefreshCw,
  Clock,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Trash2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  useInventorySettings,
  useInventoryLocations,
  useExceptionsAndSpend,
  useCycleCounts,
  useInventoryAging,
} from '@/hooks/useInventoryData';
import {
  calculateSuppliesBudget,
  calculateServiceBudget,
  calculateRetailBudget,
  calculateTotalBudget,
  getBandStatus,
  getBandDescription,
  getAgingBandColor,
  type InventoryLocation,
  type InventorySettings,
} from '@/data/mockInventoryData';

// Tab type - now 4 tabs with combined Exceptions/Spend
type InventoryTab = 'budget' | 'exceptions' | 'cycles' | 'aging';

// ============ Settings Panel ============
interface SettingsPanelProps {
  settings: InventorySettings;
  onUpdate: (updates: Partial<InventorySettings>) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onUpdate(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-900 border border-surface-700 rounded-xl w-full max-w-lg p-6 m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-surface-100">Inventory Settings</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Budget Percentages */}
          <div>
            <h3 className="text-sm font-medium text-surface-300 mb-3">Budget Percentages</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-surface-500 mb-1">Supplies % of Net Sales</label>
                <input
                  type="number"
                  step="0.1"
                  value={localSettings.suppliesPct}
                  onChange={(e) => setLocalSettings({ ...localSettings, suppliesPct: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-surface-500 mb-1">Service % of Service Sales</label>
                <input
                  type="number"
                  step="0.1"
                  value={localSettings.servicePct}
                  onChange={(e) => setLocalSettings({ ...localSettings, servicePct: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-surface-500 mb-1">Default Retail %</label>
                <input
                  type="number"
                  step="1"
                  value={localSettings.retailPct}
                  onChange={(e) => setLocalSettings({ ...localSettings, retailPct: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Exception Thresholds */}
          <div>
            <h3 className="text-sm font-medium text-surface-300 mb-3">Exception Thresholds</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-surface-500 mb-1">Lower Band %</label>
                <input
                  type="number"
                  step="0.1"
                  value={localSettings.lowerThreshold}
                  onChange={(e) => setLocalSettings({ ...localSettings, lowerThreshold: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-surface-500 mb-1">Upper Band %</label>
                <input
                  type="number"
                  step="0.1"
                  value={localSettings.upperThreshold}
                  onChange={(e) => setLocalSettings({ ...localSettings, upperThreshold: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-surface-500 mb-1">Escalate %</label>
                <input
                  type="number"
                  step="0.1"
                  value={localSettings.escalateThreshold}
                  onChange={(e) => setLocalSettings({ ...localSettings, escalateThreshold: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-surface-500 mt-2">
              Locations below {localSettings.lowerThreshold}% or above {localSettings.upperThreshold}% will be flagged. Above {localSettings.escalateThreshold}% requires escalation.
            </p>
          </div>

          {/* Budget Wipe Day */}
          <div>
            <h3 className="text-sm font-medium text-surface-300 mb-3">Budget Cycle</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs text-surface-500 mb-1">Budget Wipe Day</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={localSettings.budgetWipeDay}
                  onChange={(e) => setLocalSettings({ ...localSettings, budgetWipeDay: parseInt(e.target.value) || 25 })}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 text-sm"
                />
              </div>
              <p className="flex-1 text-xs text-surface-500">
                Unspent budget is wiped on the {localSettings.budgetWipeDay}th of each month. No carryover.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-700">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

// ============ Tab Button ============
const TabButton: React.FC<{
  tab: InventoryTab;
  activeTab: InventoryTab;
  label: string;
  onClick: () => void;
}> = ({ tab, activeTab, label, onClick }) => (
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
const BudgetTab: React.FC<{
  locations: InventoryLocation[];
  updateLocationRetailPct: (index: number, value: number) => void;
  portfolioTotals: any;
  avgSupplyPct: number;
  flaggedCount: number;
  activeCount: number;
  settings: InventorySettings;
  lastSyncedAt: string;
}> = ({
  locations,
  updateLocationRetailPct,
  portfolioTotals,
  avgSupplyPct,
  flaggedCount,
  activeCount,
  settings,
  lastSyncedAt,
}) => {
  const avgStatus = getBandStatus(avgSupplyPct, settings.lowerThreshold, settings.upperThreshold, settings.escalateThreshold);

  return (
    <div className="space-y-6">
      {/* Zenoti Sync Status */}
      <div className="flex items-center gap-2 text-xs text-surface-500">
        <RefreshCw className="w-3 h-3" />
        Net Sales & Service Sales synced from Zenoti · Last updated {new Date(lastSyncedAt).toLocaleString()}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="animate-fade-in">
          <span className="text-xs text-surface-500 uppercase tracking-wide">Total Portfolio Budget</span>
          <div className="text-2xl font-semibold text-ezra-400 mt-1">
            ${portfolioTotals.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="animate-fade-in animation-delay-100">
          <span className="text-xs text-surface-500 uppercase tracking-wide">Active Locations</span>
          <div className="text-2xl font-semibold text-surface-100 mt-1">{activeCount}</div>
        </Card>
        <Card className="animate-fade-in animation-delay-200">
          <span className="text-xs text-surface-500 uppercase tracking-wide">Portfolio Avg Supply %</span>
          <div className={cn(
            'text-2xl font-semibold mt-1',
            avgStatus === 'normal' ? 'text-success-500' : avgStatus === 'high' ? 'text-warning-500' : avgStatus === 'escalate' ? 'text-danger-500' : 'text-info-500'
          )}>
            {avgSupplyPct.toFixed(2)}%
          </div>
        </Card>
        <Card className="animate-fade-in animation-delay-300">
          <span className="text-xs text-surface-500 uppercase tracking-wide">Flagged Locations</span>
          <div className={cn('text-2xl font-semibold mt-1', flaggedCount > 0 ? 'text-danger-500' : 'text-success-500')}>
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
                <th className="text-left py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">Location</th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                  <span className="inline-flex items-center gap-1">
                    Net Sales
                    <span className="text-ezra-400" title="From Zenoti">●</span>
                  </span>
                </th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                  <span className="inline-flex items-center gap-1">
                    Service Sales
                    <span className="text-ezra-400" title="From Zenoti">●</span>
                  </span>
                </th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                  <span className="inline-flex items-center gap-1">
                    Product Sales
                    <span className="text-ezra-400" title="From Zenoti">●</span>
                  </span>
                </th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">
                  <span className="inline-flex items-center gap-1 cursor-help" title="Retail Variable % — The percentage of Product Sales allocated for retail inventory replenishment. Unlike fixed portfolio-wide rates, this is editable per location to account for different retail strategies, shelf space, or sales velocity.">
                    Retail Var %
                    <HelpCircle className="w-3 h-3" />
                  </span>
                </th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">Supplies ({settings.suppliesPct}%)</th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">Service ({settings.servicePct}%)</th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">Retail</th>
                <th className="text-right py-3 px-2 text-xs text-surface-500 uppercase tracking-wide font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, index) => (
                <tr key={loc.id} className="border-b border-surface-800">
                  <td className="py-3 px-2">
                    <div className="font-medium text-surface-100">{loc.name}</div>
                    <div className="text-xs text-surface-500">{loc.code}</div>
                  </td>
                  <td className="py-3 px-2 text-right text-surface-300">${loc.netSales.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right text-surface-300">${loc.serviceSales.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right text-surface-300">${loc.productSales.toLocaleString()}</td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={loc.retailVarPct}
                      onChange={(e) => updateLocationRetailPct(index, parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1.5 text-right bg-surface-900 border border-surface-700 rounded-md text-surface-100 text-sm focus:outline-none focus:border-ezra-500"
                    />
                  </td>
                  <td className="py-3 px-2 text-right text-surface-400">${calculateSuppliesBudget(loc.netSales, settings.suppliesPct).toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-surface-400">${calculateServiceBudget(loc.serviceSales, settings.servicePct).toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-surface-400">${calculateRetailBudget(loc.productSales, loc.retailVarPct).toFixed(2)}</td>
                  <td className="py-3 px-2 text-right font-semibold text-ezra-400">
                    ${calculateTotalBudget(loc.netSales, loc.serviceSales, loc.productSales, settings.suppliesPct, settings.servicePct, loc.retailVarPct).toFixed(2)}
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-surface-800/50">
                <td className="py-3 px-2 font-semibold text-surface-100">Portfolio Total</td>
                <td className="py-3 px-2 text-right font-semibold text-surface-100">${portfolioTotals.netSales.toLocaleString()}</td>
                <td className="py-3 px-2 text-right font-semibold text-surface-100">${portfolioTotals.serviceSales.toLocaleString()}</td>
                <td className="py-3 px-2 text-right font-semibold text-surface-100">${portfolioTotals.productSales.toLocaleString()}</td>
                <td className="py-3 px-2"></td>
                <td className="py-3 px-2 text-right font-semibold text-surface-100">${portfolioTotals.suppliesBudget.toFixed(2)}</td>
                <td className="py-3 px-2 text-right font-semibold text-surface-100">${portfolioTotals.serviceBudget.toFixed(2)}</td>
                <td className="py-3 px-2 text-right font-semibold text-surface-100">${portfolioTotals.retailBudget.toFixed(2)}</td>
                <td className="py-3 px-2 text-right font-semibold text-ezra-400">${portfolioTotals.totalBudget.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-700">
          <span className="text-xs text-surface-500">
            Budget loads on the 1st — unspent balance wiped on the {settings.budgetWipeDay}th. No carryover.
          </span>
          <Button size="sm" leftIcon={<FileDown className="w-4 h-4" />}>Export budgets</Button>
        </div>
      </Card>

      {/* Retail Variable Explanation */}
      <Card className="bg-surface-800/50 border-surface-700">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-ezra-500/10 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5 text-ezra-400" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-100">What is Retail Var %?</h3>
            <p className="text-surface-400 mt-1 text-sm">
              <strong className="text-surface-200">Retail Variable %</strong> is the percentage of Product Sales allocated for retail inventory replenishment each month. 
              Unlike Supplies and Service percentages (which are fixed portfolio-wide in Budget Variables), Retail Var % is <strong className="text-surface-200">editable per location</strong> because 
              each store may have different retail dynamics — larger displays, different product mix, or varying sales velocity. 
              The default is {settings.retailPct}%, but you can override it for any location directly in the table above.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============ Combined Exceptions & Actual Spend Tab ============
const ExceptionsTab: React.FC<{ settings: InventorySettings }> = ({ settings }) => {
  const {
    flaggedLocations,
    sortedByPct,
    trendData,
    entries,
    vendors,
    activeVendors,
    toggleVendor,
    filteredEntries,
    overrideLog,
    totalSpendByCategory,
  } = useExceptionsAndSpend(settings);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    import('chart.js/auto').then((ChartModule) => {
      const Chart = ChartModule.default;
      
      if (chartInstance.current) chartInstance.current.destroy();

      const upperBound = trendData.map(() => settings.upperThreshold);
      const lowerBound = trendData.map(() => settings.lowerThreshold);

      chartInstance.current = new Chart(chartRef.current!, {
        type: 'line',
        data: {
          labels: trendData.map((d) => d.month),
          datasets: [
            { label: 'Portfolio Avg', data: trendData.map((d) => d.value), borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.1)', tension: 0.3, fill: true, pointRadius: 4, pointBackgroundColor: '#06b6d4' },
            { label: `Upper (${settings.upperThreshold}%)`, data: upperBound, borderColor: '#f59e0b', borderDash: [5, 5], borderWidth: 1, pointRadius: 0, fill: false },
            { label: `Lower (${settings.lowerThreshold}%)`, data: lowerBound, borderColor: '#3b82f6', borderDash: [5, 5], borderWidth: 1, pointRadius: 0, fill: false },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: '#27272a' }, ticks: { color: '#52525b' } },
            y: { min: 0.5, max: 2.0, grid: { color: '#27272a' }, ticks: { color: '#52525b', callback: (v: number | string) => typeof v === 'number' ? v.toFixed(1) + '%' : v } },
          },
        },
      });
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [trendData, settings]);

  const getStatusColor = (pct: number) => {
    const status = getBandStatus(pct, settings.lowerThreshold, settings.upperThreshold, settings.escalateThreshold);
    switch (status) {
      case 'under': return '#3b82f6';
      case 'normal': return '#22c55e';
      case 'high': return '#f59e0b';
      case 'escalate': return '#ef4444';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'service': return 'bg-warning-500/10 text-warning-500';
      case 'retail': return 'bg-ezra-500/10 text-ezra-500';
      case 'backbar': return 'bg-info-500/10 text-info-500';
      default: return 'bg-surface-500/10 text-surface-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <span className="w-3 h-3 rounded-full bg-info-500" />
          Under {settings.lowerThreshold}% — possible SOP non-compliance
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <span className="w-3 h-3 rounded-full bg-success-500" />
          {settings.lowerThreshold}–{settings.upperThreshold}% — normal
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <span className="w-3 h-3 rounded-full bg-warning-500" />
          {settings.upperThreshold}–{settings.escalateThreshold}% — review
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <span className="w-3 h-3 rounded-full bg-danger-500" />
          Over {settings.escalateThreshold}% — escalate
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm text-surface-400 mb-4">Portfolio avg supply cost % — trailing 5 months</h3>
          <div style={{ height: 200 }}><canvas ref={chartRef} /></div>
        </Card>
        <Card>
          <h3 className="text-sm text-surface-400 mb-4">Locations ranked by 90-day supply cost %</h3>
          <div className="space-y-2">
            {sortedByPct.map((loc) => (
              <div key={loc.id} className="flex items-center gap-3">
                <div className="w-32 text-xs text-surface-100 truncate">{loc.name}</div>
                <div className="flex-1 h-5 bg-surface-800 rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${(loc.supplyPct90 / 2) * 100}%`, backgroundColor: getStatusColor(loc.supplyPct90) }} />
                </div>
                <div className="w-14 text-right text-sm font-semibold" style={{ color: getStatusColor(loc.supplyPct90) }}>{loc.supplyPct90.toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Actual Spend Upload Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-surface-100">Actual Spend Data</h3>
          <span className="text-xs text-surface-500">Upload spend to calculate exception metrics</span>
        </div>

        {/* Vendor chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {vendors.map((vendor) => (
            <button
              key={vendor}
              onClick={() => toggleVendor(vendor)}
              className={cn(
                'px-3 py-1 rounded-full text-xs border transition-all',
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
        <div className="border-2 border-dashed border-surface-700 rounded-xl p-6 text-center hover:border-surface-500 transition-colors cursor-pointer mb-4">
          <Upload className="w-8 h-8 mx-auto text-surface-500 mb-2" />
          <p className="text-sm text-surface-400">Drop QuickBooks export or accounting CSV</p>
          <p className="text-xs text-surface-500 mt-1">Location ID · Category · Vendor · Amount · Month</p>
        </div>

        {/* Spend summary */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-surface-800 rounded-lg p-3">
            <span className="text-xs text-surface-500">Backbar Spend</span>
            <div className="text-lg font-semibold text-info-400">${(totalSpendByCategory.backbar || 0).toFixed(2)}</div>
          </div>
          <div className="bg-surface-800 rounded-lg p-3">
            <span className="text-xs text-surface-500">Service Spend</span>
            <div className="text-lg font-semibold text-warning-400">${(totalSpendByCategory.service || 0).toFixed(2)}</div>
          </div>
          <div className="bg-surface-800 rounded-lg p-3">
            <span className="text-xs text-surface-500">Retail Spend</span>
            <div className="text-lg font-semibold text-ezra-400">${(totalSpendByCategory.retail || 0).toFixed(2)}</div>
          </div>
        </div>

        {/* Recent entries */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-700">
              <th className="text-left py-2 px-2 text-xs text-surface-500 font-medium">Location</th>
              <th className="text-left py-2 px-2 text-xs text-surface-500 font-medium">Vendor</th>
              <th className="text-left py-2 px-2 text-xs text-surface-500 font-medium">Category</th>
              <th className="text-right py-2 px-2 text-xs text-surface-500 font-medium">Amount</th>
              <th className="text-left py-2 px-2 text-xs text-surface-500 font-medium">Month</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.slice(0, 5).map((entry) => (
              <tr key={entry.id} className="border-b border-surface-800">
                <td className="py-2 px-2 text-surface-100">{entry.locationCode}</td>
                <td className="py-2 px-2 text-surface-300">{entry.vendor}</td>
                <td className="py-2 px-2">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', getCategoryBadge(entry.category))}>{entry.category}</span>
                </td>
                <td className="py-2 px-2 text-right text-surface-100">${entry.amount.toFixed(2)}</td>
                <td className="py-2 px-2 text-surface-400">{entry.month}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="flex items-center gap-2 mt-3 text-sm text-ezra-400 hover:text-ezra-300">
          <Plus className="w-4 h-4" /> Add entry
        </button>
      </Card>

      {/* Flagged Locations */}
      <Card>
        <h3 className="text-sm font-medium text-surface-100 mb-4">Flagged Locations</h3>
        {flaggedLocations.length === 0 ? (
          <p className="text-surface-500 text-sm">No flagged locations — all within normal band.</p>
        ) : (
          <div className="space-y-3">
            {flaggedLocations.map((loc) => {
              const status = getBandStatus(loc.supplyPct90, settings.lowerThreshold, settings.upperThreshold, settings.escalateThreshold);
              return (
                <div key={loc.id} className="flex items-center gap-4 py-3 border-b border-surface-800 last:border-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${getStatusColor(loc.supplyPct90)}20` }}>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(loc.supplyPct90) }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-surface-100">{loc.name}</span>
                      <span className="text-xs text-surface-500">{loc.code}</span>
                      {loc.override && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning-500/10 text-warning-500">Override logged</span>}
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">{getBandDescription(status)}</p>
                  </div>
                  <div className="text-lg font-semibold" style={{ color: getStatusColor(loc.supplyPct90) }}>{loc.supplyPct90.toFixed(2)}%</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Override Log */}
        {overrideLog.length > 0 && (
          <div className="mt-4 pt-4 border-t border-surface-700">
            <h4 className="text-xs text-surface-500 uppercase tracking-wide mb-3">Override Log</h4>
            {overrideLog.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning-500/10 text-warning-500">Override</span>
                <div>
                  <span className="text-sm text-surface-100">{entry.locationName}</span>
                  <p className="text-xs text-surface-400">{entry.reason}</p>
                  <p className="text-xs text-surface-500">{entry.date} · {entry.loggedBy}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <button className="flex items-center gap-2 mt-3 text-sm text-ezra-400 hover:text-ezra-300">
          <Plus className="w-4 h-4" /> Log override
        </button>
      </Card>
    </div>
  );
};

// ============ Cycle Counts Tab ============
const CycleCountsTab: React.FC = () => {
  const { schedule, currentMonth, currentMonthIndex, updateMonth, toggleMonthActive, resetSchedule } = useCycleCounts();
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (monthNum: number, currentDesc: string) => {
    setEditingMonth(monthNum);
    setEditValue(currentDesc);
  };

  const handleSave = (monthNum: number) => {
    updateMonth(monthNum, { description: editValue, customDescription: editValue });
    setEditingMonth(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-surface-500 uppercase tracking-wide font-medium">Annual Cycle Count Calendar</h3>
        <Button variant="secondary" size="sm" onClick={resetSchedule}>Reset to Default</Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-6 gap-3">
        {schedule.map((month, index) => (
          <div
            key={month.month}
            className={cn(
              'p-4 rounded-xl border text-center relative group',
              !month.isActive && 'opacity-50',
              index === currentMonthIndex ? 'border-ezra-500 bg-ezra-500/10' : 'border-surface-700 bg-surface-800/50'
            )}
          >
            <button
              onClick={() => toggleMonthActive(month.monthNum)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              title={month.isActive ? 'Disable count' : 'Enable count'}
            >
              {month.isActive ? <Check className="w-3 h-3 text-success-500" /> : <X className="w-3 h-3 text-surface-500" />}
            </button>
            <div className="font-semibold text-surface-100">{month.month}</div>
            {editingMonth === month.monthNum ? (
              <div className="mt-1">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full text-xs bg-surface-900 border border-surface-600 rounded px-1 py-0.5 text-surface-100"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave(month.monthNum)}
                  autoFocus
                />
                <div className="flex gap-1 mt-1 justify-center">
                  <button onClick={() => handleSave(month.monthNum)} className="text-success-500"><Check className="w-3 h-3" /></button>
                  <button onClick={() => setEditingMonth(null)} className="text-surface-500"><X className="w-3 h-3" /></button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => month.isActive && handleEdit(month.monthNum, month.customDescription || month.description)}
                className={cn(
                  'text-xs mt-1 cursor-pointer hover:text-ezra-400',
                  index === currentMonthIndex ? 'text-ezra-400' : 'text-surface-500',
                  !month.isActive && 'italic'
                )}
              >
                {month.customDescription || month.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current month callout */}
      {currentMonth && currentMonth.isActive && (
        <div className="p-4 rounded-xl border border-ezra-500 bg-ezra-500/10">
          <div className="font-semibold text-ezra-400">{currentMonth.month} 2026 — {currentMonth.customDescription || currentMonth.description}</div>
          <p className="text-sm text-surface-400 mt-1">{currentMonth.fullDescription}</p>
        </div>
      )}

      <p className="text-xs text-surface-500">
        Click on any month to edit the count description. Click the checkmark to enable/disable counts for specific months.
      </p>
    </div>
  );
};

// ============ Inventory Aging Tab ============
const InventoryAgingTab: React.FC = () => {
  const { items, stats, filteredItems, filterByBand, filterByLocation, activeBandFilter, activeLocationFilter, sortBy, sortField, sortDirection } = useInventoryAging();
  const locations = [...new Set(items.map((i) => ({ code: i.locationCode, name: i.locationName })))];

  const getBandBadge = (band: string) => {
    switch (band) {
      case '30-60': return 'bg-warning-500/10 text-warning-500';
      case '60-90': return 'bg-warning-500/20 text-warning-400';
      case '90-120': return 'bg-danger-500/10 text-danger-500';
      case '120+': return 'bg-danger-500/20 text-danger-400';
      default: return 'bg-surface-500/10 text-surface-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-surface-500">
        <RefreshCw className="w-3 h-3" />
        Inventory Aging report synced from Zenoti · Shows products with no sales in 30+ days
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <span className="text-xs text-surface-500 uppercase tracking-wide">Total Aging Items</span>
          <div className="text-2xl font-semibold text-surface-100 mt-1">{stats.itemCount}</div>
          <span className="text-xs text-surface-500">{stats.totalUnits} units</span>
        </Card>
        <Card>
          <span className="text-xs text-surface-500 uppercase tracking-wide">Cost at Risk</span>
          <div className="text-2xl font-semibold text-danger-400 mt-1">${stats.totalCost.toFixed(2)}</div>
        </Card>
        <Card>
          <span className="text-xs text-surface-500 uppercase tracking-wide">90+ Days</span>
          <div className="text-2xl font-semibold text-danger-500 mt-1">
            {stats.bands['90-120'].length + stats.bands['120+'].length}
          </div>
          <span className="text-xs text-surface-500">items need attention</span>
        </Card>
        <Card>
          <span className="text-xs text-surface-500 uppercase tracking-wide">Retail Value at Risk</span>
          <div className="text-2xl font-semibold text-warning-400 mt-1">${stats.totalRetail.toFixed(2)}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-surface-500" />
            <span className="text-sm text-surface-400">Filter:</span>
          </div>
          <div className="flex gap-2">
            {(['all', '30-60', '60-90', '90-120', '120+'] as const).map((band) => (
              <button
                key={band}
                onClick={() => filterByBand(band)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
                  activeBandFilter === band ? 'bg-ezra-500 text-surface-900' : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                )}
              >
                {band === 'all' ? 'All' : `${band} days`}
              </button>
            ))}
          </div>
          <select
            value={activeLocationFilter}
            onChange={(e) => filterByLocation(e.target.value)}
            className="ml-auto px-3 py-1.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100"
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.code} value={loc.code}>{loc.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-700">
              <th className="text-left py-3 px-2 text-xs text-surface-500 font-medium">Product</th>
              <th className="text-left py-3 px-2 text-xs text-surface-500 font-medium">Location</th>
              <th className="text-center py-3 px-2 text-xs text-surface-500 font-medium">Qty</th>
              <th className="text-center py-3 px-2 text-xs text-surface-500 font-medium cursor-pointer hover:text-surface-300" onClick={() => sortBy('daysSinceLastSale')}>
                Days {sortField === 'daysSinceLastSale' && (sortDirection === 'desc' ? <ChevronDown className="inline w-3 h-3" /> : <ChevronUp className="inline w-3 h-3" />)}
              </th>
              <th className="text-right py-3 px-2 text-xs text-surface-500 font-medium cursor-pointer hover:text-surface-300" onClick={() => sortBy('costValue')}>
                Cost {sortField === 'costValue' && (sortDirection === 'desc' ? <ChevronDown className="inline w-3 h-3" /> : <ChevronUp className="inline w-3 h-3" />)}
              </th>
              <th className="text-center py-3 px-2 text-xs text-surface-500 font-medium">Band</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b border-surface-800">
                <td className="py-3 px-2">
                  <div className="font-medium text-surface-100">{item.productName}</div>
                  <div className="text-xs text-surface-500">{item.sku} · {item.category}</div>
                </td>
                <td className="py-3 px-2 text-surface-300">{item.locationName}</td>
                <td className="py-3 px-2 text-center text-surface-100">{item.quantityOnHand}</td>
                <td className="py-3 px-2 text-center">
                  <span className={cn('font-semibold', item.daysSinceLastSale >= 90 ? 'text-danger-400' : 'text-warning-400')}>
                    {item.daysSinceLastSale}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-surface-100">${item.costValue.toFixed(2)}</td>
                <td className="py-3 px-2 text-center">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getBandBadge(item.agingBand))}>
                    {item.agingBand}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="bg-warning-500/5 border-warning-500/20">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-surface-100">Aging Inventory Action</h4>
            <p className="text-sm text-surface-400 mt-1">
              Products over 90 days without a sale should be considered for markdowns, promotions, or returns to vendor if eligible.
              The Inventory Aging report syncs automatically from your Zenoti account daily.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============ Main Component ============
export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<InventoryTab>('budget');
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSettings } = useInventorySettings();
  const inventoryData = useInventoryLocations(settings);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel settings={settings} onUpdate={updateSettings} onClose={() => setShowSettings(false)} />
      )}

      {/* Mock Environment Banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <Info className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <p className="text-sm text-amber-200">
          <span className="font-medium">Demo Environment</span> — This module displays mock datasets for demonstration purposes. Data shown is not real and does not reflect actual Zenoti account information.
        </p>
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-surface-100">
                <span className="text-emerald-400">Ezra Inventory</span>
              </h1>
              <p className="text-surface-400">Budget control and anomaly detection across {inventoryData.activeCount} locations</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">Under Review</span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-ezra-500/10 text-ezra-400">May 2026</span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success-500/10 text-success-500">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
              Synced from Zenoti
            </span>
          </div>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Settings className="w-4 h-4" />} onClick={() => setShowSettings(true)}>
          Adjust Budget Variables
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-800/50 rounded-lg w-fit">
        <TabButton tab="budget" activeTab={activeTab} label="Budget" onClick={() => setActiveTab('budget')} />
        <TabButton tab="exceptions" activeTab={activeTab} label="Exceptions & Spend" onClick={() => setActiveTab('exceptions')} />
        <TabButton tab="cycles" activeTab={activeTab} label="Cycle Counts" onClick={() => setActiveTab('cycles')} />
        <TabButton tab="aging" activeTab={activeTab} label="Inventory Aging" onClick={() => setActiveTab('aging')} />
      </div>

      {/* Tab Content */}
      {activeTab === 'budget' && <BudgetTab {...inventoryData} settings={settings} />}
      {activeTab === 'exceptions' && <ExceptionsTab settings={settings} />}
      {activeTab === 'cycles' && <CycleCountsTab />}
      {activeTab === 'aging' && <InventoryAgingTab />}

      {/* Info Banner */}
      <Card className="bg-emerald-500/5 border-emerald-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-100">About Ezra Inventory</h3>
            <p className="text-surface-400 mt-1">
              Ezra Inventory auto-calculates monthly budget allocations based on prior month Zenoti revenue. 
              Net Sales and Service Sales are synced daily from Zenoti. Budget percentages, exception thresholds, 
              and cycle counts are fully configurable via Settings. Upload actual spend data to enable exception tracking.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
