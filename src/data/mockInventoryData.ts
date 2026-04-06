// ===========================================
// EZRA PORTAL - Mock Inventory Data
// ===========================================

export interface InventoryLocation {
  id: string;
  name: string;
  code: string;
  grossSales: number;
  colorSales: number;
  productSales: number;
  retailVarPct: number;
  supplyPct90: number;
  region: string;
  override?: boolean;
  overrideReason?: string;
}

export interface CycleCountMonth {
  month: string;
  monthNum: number;
  description: string;
  fullDescription?: string;
}

export interface ManualSpendEntry {
  id: string;
  locationCode: string;
  locationName: string;
  vendor: string;
  category: 'backbar' | 'color' | 'retail';
  amount: number;
  month: string;
}

export interface OverrideLogEntry {
  id: string;
  locationName: string;
  locationCode: string;
  reason: string;
  date: string;
  loggedBy: string;
}

export interface TrendDataPoint {
  month: string;
  value: number;
}

// Sample location data
export const mockInventoryLocations: InventoryLocation[] = [
  {
    id: 'loc-az-001',
    name: 'Tucson — Vistoso Plaza',
    code: 'AZ-001',
    grossSales: 21989.70,
    colorSales: 4820.00,
    productSales: 472.41,
    retailVarPct: 35,
    supplyPct90: 1.05,
    region: 'Arizona',
  },
  {
    id: 'loc-az-002',
    name: 'Tucson — Saguaro Vista',
    code: 'AZ-002',
    grossSales: 18342.00,
    colorSales: 3210.00,
    productSales: 381.20,
    retailVarPct: 25,
    supplyPct90: 0.88,
    region: 'Arizona',
  },
  {
    id: 'loc-az-003',
    name: 'Oro Valley — La Canada',
    code: 'AZ-003',
    grossSales: 24610.50,
    colorSales: 5540.00,
    productSales: 612.80,
    retailVarPct: 35,
    supplyPct90: 1.61,
    region: 'Arizona',
    override: true,
    overrideReason: 'Leaf & Flower bulk order — new treatment menu launch',
  },
  {
    id: 'loc-nv-001',
    name: 'Las Vegas — Arroyo',
    code: 'NV-001',
    grossSales: 17890.00,
    colorSales: 3100.00,
    productSales: 290.00,
    retailVarPct: 25,
    supplyPct90: 0.74,
    region: 'Nevada',
  },
  {
    id: 'loc-nv-002',
    name: 'Henderson — Marks',
    code: 'NV-002',
    grossSales: 19450.00,
    colorSales: 4100.00,
    productSales: 440.00,
    retailVarPct: 25,
    supplyPct90: 0.96,
    region: 'Nevada',
  },
  {
    id: 'loc-nm-001',
    name: 'Los Lunas',
    code: 'NM-001',
    grossSales: 14230.00,
    colorSales: 2210.00,
    productSales: 198.50,
    retailVarPct: 25,
    supplyPct90: 1.04,
    region: 'New Mexico',
  },
];

// Cycle count schedule
export const cycleCountSchedule: CycleCountMonth[] = [
  { month: 'Jan', monthNum: 1, description: 'Shampoo & conditioner', fullDescription: 'Count all shampoo and conditioner inventory including professional and retail sizes. Verify quantities match system inventory and note any variances.' },
  { month: 'Feb', monthNum: 2, description: 'Styling products', fullDescription: 'Count all styling products including gels, mousses, hairsprays, serums, and finishing products. Include both backbar and retail inventory.' },
  { month: 'Mar', monthNum: 3, description: 'Color tubes & bowls', fullDescription: 'Count all color tubes by brand and shade. Include mixing bowls, applicator bottles, and color-related accessories. Note any expired products.' },
  { month: 'Apr', monthNum: 4, description: 'Foils & developers', fullDescription: 'Count all foil rolls, pre-cut foils, developers by volume, and lightening products. Verify developer expiration dates.' },
  { month: 'May', monthNum: 5, description: 'Backbar treatments', fullDescription: 'Count all backbar treatment products including deep conditioners, protein treatments, scalp treatments, and toners. Compare to system inventory and log variances.' },
  { month: 'Jun', monthNum: 6, description: 'Retail inventory', fullDescription: 'Full retail inventory count. Count all products on retail shelves and in retail storage. Verify pricing and product placement.' },
  { month: 'Jul', monthNum: 7, description: 'Tools & equipment', fullDescription: 'Count all tools including shears, clippers, blow dryers, flat irons, curling irons, and brushes. Note condition and replacement needs.' },
  { month: 'Aug', monthNum: 8, description: 'Capes & towels', fullDescription: 'Count all capes, towels, neck strips, and linens. Note items needing replacement due to wear or staining.' },
  { month: 'Sep', monthNum: 9, description: 'Sanitization supplies', fullDescription: 'Count all sanitization and cleaning supplies including disinfectants, Barbicide, cleaning solutions, and disposable items.' },
  { month: 'Oct', monthNum: 10, description: 'Office & front desk', fullDescription: 'Count all office supplies, receipt paper, appointment cards, gift cards, and front desk inventory.' },
  { month: 'Nov', monthNum: 11, description: 'No count', fullDescription: 'No cycle count scheduled for November. Focus on holiday preparation.' },
  { month: 'Dec', monthNum: 12, description: 'No count', fullDescription: 'No cycle count scheduled for December. Focus on year-end activities.' },
];

// Manual spend entries
export const mockManualEntries: ManualSpendEntry[] = [
  { id: 'entry-1', locationCode: 'AZ-001', locationName: 'Tucson — Vistoso Plaza', vendor: 'Super Center', category: 'backbar', amount: 142.50, month: 'Apr 2026' },
  { id: 'entry-2', locationCode: 'AZ-003', locationName: 'Oro Valley — La Canada', vendor: 'Leaf & Flower', category: 'color', amount: 890.00, month: 'Apr 2026' },
  { id: 'entry-3', locationCode: 'NV-001', locationName: 'Las Vegas — Arroyo', vendor: 'Enjoy', category: 'retail', amount: 215.00, month: 'Apr 2026' },
  { id: 'entry-4', locationCode: 'AZ-002', locationName: 'Tucson — Saguaro Vista', vendor: 'Johnny B', category: 'backbar', amount: 78.25, month: 'Apr 2026' },
  { id: 'entry-5', locationCode: 'NV-002', locationName: 'Henderson — Marks', vendor: 'Loma', category: 'retail', amount: 312.00, month: 'Apr 2026' },
];

// Override log
export const mockOverrideLog: OverrideLogEntry[] = [
  {
    id: 'override-1',
    locationName: 'Oro Valley — La Canada',
    locationCode: 'AZ-003',
    reason: 'Leaf & Flower bulk order — new treatment menu launch',
    date: 'Apr 12, 2026',
    loggedBy: 'April C.',
  },
];

// Trend data for portfolio supply cost %
export const portfolioTrendData: TrendDataPoint[] = [
  { month: 'Dec', value: 0.94 },
  { month: 'Jan', value: 1.01 },
  { month: 'Feb', value: 0.98 },
  { month: 'Mar', value: 1.08 },
  { month: 'Apr', value: 1.02 },
];

// Vendors list
export const vendors = [
  'Super Center',
  'Enjoy',
  'Loma',
  'Leaf & Flower',
  'Johnny B',
  'Suavecito',
];

// Budget calculation functions
export const calculateSuppliesBudget = (grossSales: number): number => {
  return Math.round(grossSales * 0.01 * 100) / 100;
};

export const calculateColorBudget = (colorSales: number): number => {
  return Math.round(colorSales * 0.08 * 100) / 100;
};

export const calculateRetailBudget = (productSales: number, retailVarPct: number): number => {
  return Math.round(productSales * (retailVarPct / 100) * 100) / 100;
};

export const calculateTotalBudget = (
  grossSales: number,
  colorSales: number,
  productSales: number,
  retailVarPct: number
): number => {
  return (
    calculateSuppliesBudget(grossSales) +
    calculateColorBudget(colorSales) +
    calculateRetailBudget(productSales, retailVarPct)
  );
};

// Band classification
export type BandStatus = 'under' | 'normal' | 'high' | 'escalate';

export const getBandStatus = (supplyPct: number): BandStatus => {
  if (supplyPct < 0.8) return 'under';
  if (supplyPct <= 1.2) return 'normal';
  if (supplyPct <= 1.5) return 'high';
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

export const getBandLabel = (status: BandStatus): string => {
  switch (status) {
    case 'under':
      return 'Under 0.8%';
    case 'normal':
      return '0.8–1.2%';
    case 'high':
      return '1.2–1.5%';
    case 'escalate':
      return 'Over 1.5%';
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
