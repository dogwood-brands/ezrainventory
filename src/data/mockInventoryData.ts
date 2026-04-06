// ===========================================
// EZRA PORTAL - Mock Inventory Data
// ===========================================

// ============ Franchisee Settings (Configurable) ============
export interface InventorySettings {
  // Budget percentages
  suppliesPct: number;        // Default 1% of Net Sales
  servicePct: number;         // Default 8% of Service Sales
  retailPct: number;          // Default 37% of Product Sales
  
  // Exception thresholds
  lowerThreshold: number;     // Default 0.8%
  upperThreshold: number;     // Default 1.2%
  escalateThreshold: number;  // Default 1.5%
  
  // Budget wipe date
  budgetWipeDay: number;      // Default 25th of month
  
  // Last updated
  updatedAt: string;
  updatedBy: string;
}

export const defaultSettings: InventorySettings = {
  suppliesPct: 1,
  servicePct: 8,
  retailPct: 37,
  lowerThreshold: 0.8,
  upperThreshold: 1.2,
  escalateThreshold: 1.5,
  budgetWipeDay: 25,
  updatedAt: '2026-04-15T10:30:00Z',
  updatedBy: 'Admin',
};

// ============ Location Data ============
export interface InventoryLocation {
  id: string;
  name: string;
  code: string;
  netSales: number;           // Pulled from Zenoti daily
  serviceSales: number;       // Pulled from Zenoti daily
  productSales: number;       // Pulled from Zenoti daily
  retailVarPct: number;       // Can override per location
  supplyPct90: number;        // 90-day trailing supply cost %
  region: string;
  override?: boolean;
  overrideReason?: string;
  lastSyncedAt: string;       // When Zenoti data was last pulled
}

// ============ Cycle Count Configuration ============
export interface CycleCountMonth {
  month: string;
  monthNum: number;
  description: string;
  fullDescription: string;
  isActive: boolean;          // Can be toggled off
  customDescription?: string; // Franchisee can customize
}

// ============ Manual Spend Entry ============
export interface ManualSpendEntry {
  id: string;
  locationCode: string;
  locationName: string;
  vendor: string;
  category: 'backbar' | 'service' | 'retail';
  amount: number;
  month: string;
  uploadedAt: string;
  uploadedBy: string;
}

// ============ Override Log Entry ============
export interface OverrideLogEntry {
  id: string;
  locationName: string;
  locationCode: string;
  reason: string;
  date: string;
  loggedBy: string;
}

// ============ Inventory Aging Item ============
export interface InventoryAgingItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  locationCode: string;
  locationName: string;
  quantityOnHand: number;
  daysSinceLastSale: number;
  lastSaleDate: string | null;
  costValue: number;
  retailValue: number;
  agingBand: '30-60' | '60-90' | '90-120' | '120+';
}

// ============ Trend Data ============
export interface TrendDataPoint {
  month: string;
  value: number;
}

// ============ Sample Data ============

export const mockInventoryLocations: InventoryLocation[] = [
  {
    id: 'loc-001',
    name: 'Supercuts 1',
    code: 'SC-001',
    netSales: 21989.70,
    serviceSales: 4820.00,
    productSales: 472.41,
    retailVarPct: 35,
    supplyPct90: 1.05,
    region: 'Region A',
    lastSyncedAt: '2026-05-06T08:00:00Z',
  },
  {
    id: 'loc-002',
    name: 'Supercuts 2',
    code: 'SC-002',
    netSales: 18342.00,
    serviceSales: 3210.00,
    productSales: 381.20,
    retailVarPct: 25,
    supplyPct90: 0.88,
    region: 'Region A',
    lastSyncedAt: '2026-05-06T08:00:00Z',
  },
  {
    id: 'loc-003',
    name: 'Supercuts 3',
    code: 'SC-003',
    netSales: 24610.50,
    serviceSales: 5540.00,
    productSales: 612.80,
    retailVarPct: 35,
    supplyPct90: 1.61,
    region: 'Region A',
    override: true,
    overrideReason: 'Bulk order — new treatment menu launch',
    lastSyncedAt: '2026-05-06T08:00:00Z',
  },
  {
    id: 'loc-004',
    name: 'Supercuts 4',
    code: 'SC-004',
    netSales: 17890.00,
    serviceSales: 3100.00,
    productSales: 290.00,
    retailVarPct: 25,
    supplyPct90: 0.74,
    region: 'Region B',
    lastSyncedAt: '2026-05-06T08:00:00Z',
  },
  {
    id: 'loc-005',
    name: 'Supercuts 5',
    code: 'SC-005',
    netSales: 19450.00,
    serviceSales: 4100.00,
    productSales: 440.00,
    retailVarPct: 25,
    supplyPct90: 0.96,
    region: 'Region B',
    lastSyncedAt: '2026-05-06T08:00:00Z',
  },
  {
    id: 'loc-006',
    name: 'Supercuts 6',
    code: 'SC-006',
    netSales: 14230.00,
    serviceSales: 2210.00,
    productSales: 198.50,
    retailVarPct: 25,
    supplyPct90: 1.04,
    region: 'Region C',
    lastSyncedAt: '2026-05-06T08:00:00Z',
  },
];

export const defaultCycleCountSchedule: CycleCountMonth[] = [
  { month: 'Jan', monthNum: 1, description: 'Shampoo & conditioner', fullDescription: 'Count all shampoo and conditioner inventory including professional and retail sizes. Verify quantities match system inventory and note any variances.', isActive: true },
  { month: 'Feb', monthNum: 2, description: 'Styling products', fullDescription: 'Count all styling products including gels, mousses, hairsprays, serums, and finishing products. Include both backbar and retail inventory.', isActive: true },
  { month: 'Mar', monthNum: 3, description: 'Color tubes & bowls', fullDescription: 'Count all color tubes by brand and shade. Include mixing bowls, applicator bottles, and color-related accessories. Note any expired products.', isActive: true },
  { month: 'Apr', monthNum: 4, description: 'Foils & developers', fullDescription: 'Count all foil rolls, pre-cut foils, developers by volume, and lightening products. Verify developer expiration dates.', isActive: true },
  { month: 'May', monthNum: 5, description: 'Backbar treatments', fullDescription: 'Count all backbar treatment products including deep conditioners, protein treatments, scalp treatments, and toners. Compare to system inventory and log variances.', isActive: true },
  { month: 'Jun', monthNum: 6, description: 'Retail inventory', fullDescription: 'Full retail inventory count. Count all products on retail shelves and in retail storage. Verify pricing and product placement.', isActive: true },
  { month: 'Jul', monthNum: 7, description: 'Tools & equipment', fullDescription: 'Count all tools including shears, clippers, blow dryers, flat irons, curling irons, and brushes. Note condition and replacement needs.', isActive: true },
  { month: 'Aug', monthNum: 8, description: 'Capes & towels', fullDescription: 'Count all capes, towels, neck strips, and linens. Note items needing replacement due to wear or staining.', isActive: true },
  { month: 'Sep', monthNum: 9, description: 'Sanitization supplies', fullDescription: 'Count all sanitization and cleaning supplies including disinfectants, Barbicide, cleaning solutions, and disposable items.', isActive: true },
  { month: 'Oct', monthNum: 10, description: 'Office & front desk', fullDescription: 'Count all office supplies, receipt paper, appointment cards, gift cards, and front desk inventory.', isActive: true },
  { month: 'Nov', monthNum: 11, description: 'No count', fullDescription: 'No cycle count scheduled for November. Focus on holiday preparation.', isActive: false },
  { month: 'Dec', monthNum: 12, description: 'No count', fullDescription: 'No cycle count scheduled for December. Focus on year-end activities.', isActive: false },
];

export const mockManualEntries: ManualSpendEntry[] = [
  { id: 'entry-1', locationCode: 'SC-001', locationName: 'Supercuts 1', vendor: 'Super Center', category: 'backbar', amount: 142.50, month: 'Apr 2026', uploadedAt: '2026-04-28T14:30:00Z', uploadedBy: 'Admin' },
  { id: 'entry-2', locationCode: 'SC-003', locationName: 'Supercuts 3', vendor: 'Leaf & Flower', category: 'service', amount: 890.00, month: 'Apr 2026', uploadedAt: '2026-04-28T14:30:00Z', uploadedBy: 'Admin' },
  { id: 'entry-3', locationCode: 'SC-004', locationName: 'Supercuts 4', vendor: 'Enjoy', category: 'retail', amount: 215.00, month: 'Apr 2026', uploadedAt: '2026-04-28T14:30:00Z', uploadedBy: 'Admin' },
  { id: 'entry-4', locationCode: 'SC-002', locationName: 'Supercuts 2', vendor: 'Johnny B', category: 'backbar', amount: 78.25, month: 'Apr 2026', uploadedAt: '2026-04-28T14:30:00Z', uploadedBy: 'Admin' },
  { id: 'entry-5', locationCode: 'SC-005', locationName: 'Supercuts 5', vendor: 'Loma', category: 'retail', amount: 312.00, month: 'Apr 2026', uploadedAt: '2026-04-28T14:30:00Z', uploadedBy: 'Admin' },
];

export const mockOverrideLog: OverrideLogEntry[] = [
  {
    id: 'override-1',
    locationName: 'Supercuts 3',
    locationCode: 'SC-003',
    reason: 'Bulk order — new treatment menu launch',
    date: 'Apr 12, 2026',
    loggedBy: 'Admin',
  },
];

export const portfolioTrendData: TrendDataPoint[] = [
  { month: 'Dec', value: 0.94 },
  { month: 'Jan', value: 1.01 },
  { month: 'Feb', value: 0.98 },
  { month: 'Mar', value: 1.08 },
  { month: 'Apr', value: 1.02 },
];

// Inventory Aging data (from Zenoti report)
export const mockInventoryAging: InventoryAgingItem[] = [
  { id: 'aging-1', sku: 'RF-SH-001', productName: 'Redken Frizz Dismiss Shampoo 10oz', category: 'Retail', locationCode: 'SC-001', locationName: 'Supercuts 1', quantityOnHand: 8, daysSinceLastSale: 45, lastSaleDate: '2026-03-22', costValue: 96.00, retailValue: 192.00, agingBand: '30-60' },
  { id: 'aging-2', sku: 'PM-TT-003', productName: 'Paul Mitchell Tea Tree Special Shampoo 33oz', category: 'Retail', locationCode: 'SC-002', locationName: 'Supercuts 2', quantityOnHand: 4, daysSinceLastSale: 78, lastSaleDate: '2026-02-18', costValue: 72.00, retailValue: 140.00, agingBand: '60-90' },
  { id: 'aging-3', sku: 'JB-POM-002', productName: 'Johnny B Street Cream Pomade', category: 'Retail', locationCode: 'SC-004', locationName: 'Supercuts 4', quantityOnHand: 12, daysSinceLastSale: 112, lastSaleDate: '2026-01-15', costValue: 108.00, retailValue: 216.00, agingBand: '90-120' },
  { id: 'aging-4', sku: 'SV-GEL-001', productName: 'Suavecito Firme Hold Gel 32oz', category: 'Retail', locationCode: 'SC-005', locationName: 'Supercuts 5', quantityOnHand: 6, daysSinceLastSale: 156, lastSaleDate: '2025-12-02', costValue: 54.00, retailValue: 102.00, agingBand: '120+' },
  { id: 'aging-5', sku: 'LF-MSK-001', productName: 'Leaf & Flower CBD Corrective Mask', category: 'Backbar', locationCode: 'SC-003', locationName: 'Supercuts 3', quantityOnHand: 3, daysSinceLastSale: 92, lastSaleDate: '2026-02-04', costValue: 135.00, retailValue: 0, agingBand: '90-120' },
  { id: 'aging-6', sku: 'EN-SER-002', productName: 'Enjoy Hair Repair Serum 3.4oz', category: 'Retail', locationCode: 'SC-006', locationName: 'Supercuts 6', quantityOnHand: 5, daysSinceLastSale: 67, lastSaleDate: '2026-02-28', costValue: 62.50, retailValue: 125.00, agingBand: '60-90' },
  { id: 'aging-7', sku: 'LM-OIL-001', productName: 'Loma Nourishing Oil Treatment', category: 'Retail', locationCode: 'SC-001', locationName: 'Supercuts 1', quantityOnHand: 7, daysSinceLastSale: 134, lastSaleDate: '2025-12-24', costValue: 98.00, retailValue: 196.00, agingBand: '120+' },
];

export const vendors = [
  'Super Center',
  'Enjoy',
  'Loma',
  'Leaf & Flower',
  'Johnny B',
  'Suavecito',
];

// ============ Budget Calculation Functions ============

export const calculateSuppliesBudget = (netSales: number, pct: number): number => {
  return Math.round(netSales * (pct / 100) * 100) / 100;
};

export const calculateServiceBudget = (serviceSales: number, pct: number): number => {
  return Math.round(serviceSales * (pct / 100) * 100) / 100;
};

export const calculateRetailBudget = (productSales: number, retailVarPct: number): number => {
  return Math.round(productSales * (retailVarPct / 100) * 100) / 100;
};

export const calculateTotalBudget = (
  netSales: number,
  serviceSales: number,
  productSales: number,
  suppliesPct: number,
  servicePct: number,
  retailVarPct: number
): number => {
  return (
    calculateSuppliesBudget(netSales, suppliesPct) +
    calculateServiceBudget(serviceSales, servicePct) +
    calculateRetailBudget(productSales, retailVarPct)
  );
};

// ============ Band Classification (uses dynamic thresholds) ============

export type BandStatus = 'under' | 'normal' | 'high' | 'escalate';

export const getBandStatus = (
  supplyPct: number,
  lowerThreshold: number,
  upperThreshold: number,
  escalateThreshold: number
): BandStatus => {
  if (supplyPct < lowerThreshold) return 'under';
  if (supplyPct <= upperThreshold) return 'normal';
  if (supplyPct <= escalateThreshold) return 'high';
  return 'escalate';
};

export const getBandColor = (status: BandStatus): string => {
  switch (status) {
    case 'under':
      return 'info';
    case 'normal':
      return 'success';
    case 'high':
      return 'warning';
    case 'escalate':
      return 'danger';
  }
};

export const getBandDescription = (status: BandStatus): string => {
  switch (status) {
    case 'under':
      return 'Below normal — check SOP compliance or under-ordering';
    case 'normal':
      return 'Within normal operating band';
    case 'high':
      return 'Above normal — review ordering patterns';
    case 'escalate':
      return 'Significantly above normal — requires site visit';
  }
};

// ============ Inventory Aging Helpers ============

export const getAgingBandColor = (band: InventoryAgingItem['agingBand']): string => {
  switch (band) {
    case '30-60':
      return 'warning';
    case '60-90':
      return 'warning';
    case '90-120':
      return 'danger';
    case '120+':
      return 'danger';
  }
};

export const getAgingStats = (items: InventoryAgingItem[]) => {
  const bands = {
    '30-60': items.filter(i => i.agingBand === '30-60'),
    '60-90': items.filter(i => i.agingBand === '60-90'),
    '90-120': items.filter(i => i.agingBand === '90-120'),
    '120+': items.filter(i => i.agingBand === '120+'),
  };
  
  const totalCost = items.reduce((sum, i) => sum + i.costValue, 0);
  const totalRetail = items.reduce((sum, i) => sum + i.retailValue, 0);
  const totalUnits = items.reduce((sum, i) => sum + i.quantityOnHand, 0);
  
  return {
    bands,
    totalCost,
    totalRetail,
    totalUnits,
    itemCount: items.length,
  };
};
