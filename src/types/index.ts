// ===========================================
// EZRA PORTAL - Type Definitions
// ===========================================

// ============ User & Auth Types ============
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId: string;
  clientName: string;
  avatar?: string;
  permissions: Permission[];
}

export type UserRole = 'franchisor' | 'franchisee' | 'district_manager' | 'store_manager' | 'viewer';

export type Permission = 
  | 'view_all_locations'
  | 'view_assigned_locations'
  | 'export_data'
  | 'manage_users'
  | 'view_reports'
  | 'manage_settings';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

// ============ Client & Location Types ============
export interface Client {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor?: string;
  posSystem: POSSystem;
  locationCount: number;
  createdAt: string;
  status: 'active' | 'onboarding' | 'suspended';
}

export type POSSystem = 'zenoti' | 'stripe' | 'toast' | 'square' | 'clover' | 'custom';

export interface Location {
  id: string;
  clientId: string;
  storeCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  timezone: string;
  posSystem: POSSystem;
  status: 'active' | 'inactive' | 'onboarding';
  lastSyncAt: string | null;
  lpRiskScore?: number;
  metadata?: Record<string, unknown>;
}

// ============ Sales Data Types ============
export interface DailySalesRecord {
  id: string;
  locationId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  totalRevenue: number;
  serviceRevenue: number;
  productRevenue: number;
  guestCount: number;
  ticketCount: number;
  avgTicket: number;
  totalTips: number;
  cashRevenue: number;
  cardRevenue: number;
  refundAmount: number;
  discountAmount: number;
  goalRevenue: number | null;
  goalGap: number | null;
  goalGapPercent: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesMetrics {
  totalRevenue: number;
  serviceRevenue: number;
  productRevenue: number;
  avgTicket: number;
  ticketCount: number;
  guestCount: number;
  totalTips: number;
  cashRevenue: number;
  cardRevenue: number;
  refundAmount: number;
  discountAmount: number;
  goalRevenue: number;
  goalGap: number;
  goalGapPercent: number;
}

export interface SalesTrend {
  date: string;
  revenue: number;
  serviceRevenue: number;
  productRevenue: number;
  ticketCount: number;
}

// ============ Dashboard Types ============
export interface KPIData {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'currency' | 'percent' | 'number';
  icon?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface InsightItem {
  id: string;
  type: 'warning' | 'success' | 'info' | 'alert';
  title: string;
  description: string;
  locationId?: string;
  actionUrl?: string;
  timestamp: string;
}

// ============ Report Types ============
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  dateRange: DateRange;
  locationIds: string[];
  status: 'ready' | 'generating' | 'failed';
  createdAt: string;
  downloadUrl?: string;
}

export type ReportType = 'sales_summary' | 'daily_breakdown' | 'location_comparison' | 'trend_analysis';

export interface DateRange {
  startDate: string;
  endDate: string;
}

// ============ Filter & Query Types ============
export interface LocationFilters {
  search?: string;
  state?: string;
  status?: Location['status'];
  posSystem?: POSSystem;
}

export interface SalesFilters {
  locationId?: string;
  dateRange?: DateRange;
  groupBy?: 'day' | 'week' | 'month';
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============ API Response Types ============
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

// ============ Theme Types ============
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

// ============ Navigation Types ============
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavItem[];
  requiredPermissions?: Permission[];
}

// ============ Form Types ============
export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  phone?: string;
  message: string;
  locationCount?: string;
  posSystem?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// ============ Scheduling Types ============
export interface SchedulingTimeBucket {
  date: string;
  hour: number; // 0-23
  timeLabel: string; // "9:00 AM", etc.
  revenue: number;
  guestTickets: number;
  laborHours: number;
  laborCost: number;
  overtimeHours: number;
}

export interface SchedulingDailySummary {
  date: string;
  dayOfWeek: string;
  revenue: number;
  guestTickets: number;
  laborHours: number;
  laborCost: number;
  idleHours: number;
  idlePercent: number;
  srph: number; // Sales Revenue Per Hour
  ticketsPerLaborHour: number;
  overtimeHours: number;
  peakHour: number;
  slowestHour: number;
}

export interface SchedulingLocationSummary {
  locationId: string;
  storeCode: string;
  locationName: string;
  state: string;
  revenue: number;
  laborHours: number;
  laborCost: number;
  idleHours: number;
  idlePercent: number;
  srph: number;
  ticketsPerLaborHour: number;
  overtimeHours: number;
  hasOvertimeFlag: boolean;
  lastSyncAt: string;
  peakWindow: string;
  slowestWindow: string;
}

export interface SchedulingRecommendation {
  id: string;
  type: 'reduce_coverage' | 'add_coverage' | 'shift_hours' | 'overtime_alert' | 'efficiency';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric?: string;
  impact?: string;
}

export interface TimeWindowInsight {
  window: string;
  avgTickets: number;
  avgRevenue: number;
  avgLaborHours: number;
  srph: number;
  idlePercent: number;
}

export interface SchedulingOverviewData {
  totalRevenue: number;
  totalLaborHours: number;
  totalIdleHours: number;
  idlePercent: number;
  avgSRPH: number;
  overtimeAlerts: number;
  locationSummaries: SchedulingLocationSummary[];
  revenueTrend: Array<{ date: string; revenue: number }>;
  idleByLocation: Array<{ name: string; idlePercent: number }>;
}

export interface SchedulingStoreData {
  locationId: string;
  locationName: string;
  storeCode: string;
  summary: {
    revenue: number;
    laborHours: number;
    laborCost: number;
    idleHours: number;
    idlePercent: number;
    srph: number;
    ticketsPerLaborHour: number;
    overtimeHours: number;
    hasOvertimeFlag: boolean;
  };
  timeWindowInsights: TimeWindowInsight[];
  dailyBreakdown: SchedulingDailySummary[];
  hourlyTrend: Array<{ hour: number; label: string; avgTickets: number; avgRevenue: number; avgLaborHours: number }>;
  recommendations: SchedulingRecommendation[];
}

// ============ Exponential Types ============
export interface ExponentialSegment {
  name: '4-week' | '6-week' | '8-week';
  customerCount: number;
  description: string;
  offerRange: string;
  riskLevel: 'low' | 'medium' | 'high';
  uptakePercent: number;
  messagesSent: number;
  returns: number;
}

export interface ExponentialDailyCampaign {
  date: string;
  fourWeekSends: number;
  sixWeekSends: number;
  eightWeekSends: number;
  totalSends: number;
}

export interface ExponentialLocationSummary {
  locationId: string;
  storeCode: string;
  locationName: string;
  state: string;
  guestsMTD: number;
  customersLastMonth: number;
  fourWeekCount: number;
  sixWeekCount: number;
  eightWeekCount: number;
  followUpsSent: number;
  overallUptake: number;
  retentionRiskScore: number;
  lastSyncAt: string;
}

export interface ExponentialRecommendation {
  id: string;
  type: 'increase_outreach' | 'adjust_offer' | 'timing' | 'segment_focus' | 'success';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric?: string;
  impact?: string;
}

export interface ExponentialGuestSample {
  id: string;
  lastVisitDate: string;
  segment: '4-week' | '6-week' | '8-week';
  lastMessageDate: string | null;
  status: 'not_messaged' | 'messaged' | 'returned' | 'no_response';
}

export interface ExponentialOverviewData {
  guestsMTD: number;
  customersLastMonth: number;
  segments: ExponentialSegment[];
  dailyCampaigns: ExponentialDailyCampaign[];
  uptakeBySegment: Array<{ segment: string; uptake: number }>;
  locationSummaries: ExponentialLocationSummary[];
}

export interface ExponentialStoreData {
  locationId: string;
  locationName: string;
  storeCode: string;
  summary: {
    guestsMTD: number;
    customersLastMonth: number;
    fourWeekCount: number;
    sixWeekCount: number;
    eightWeekCount: number;
    followUpsSent: number;
    overallUptake: number;
  };
  segments: ExponentialSegment[];
  dailyCampaigns: ExponentialDailyCampaign[];
  recommendations: ExponentialRecommendation[];
  guestSamples: ExponentialGuestSample[];
}

// ============ Campaign Types ============
export type CampaignSegment = '4-week' | '6-week' | '8-week' | 'all';
export type CampaignAudienceType = 'all_locations' | 'select_locations' | 'select_guests';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'partially_sent' | 'failed';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  segment: CampaignSegment;
  suggestedCouponRange: string;
  isPreset: boolean;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  templateId: string | null;
  templateName: string;
  messageContent: string;
  segment: CampaignSegment;
  couponValue: string;
  couponCode: string;
  audienceType: CampaignAudienceType;
  locationIds: string[];
  guestIds: string[];
  recipientCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  completedAt: string | null;
  status: CampaignStatus;
  stats: CampaignStats;
  createdAt: string;
  createdBy: string;
}

export interface CampaignStats {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  failed: number;
  deliveryRate: number;
}

export interface CampaignMessage {
  id: string;
  campaignId: string;
  guestId: string;
  guestPhone: string;
  locationId: string;
  locationName: string;
  segment: CampaignSegment;
  couponValue: string;
  couponCode: string;
  messageContent: string;
  scheduledAt: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  status: MessageStatus;
  twilioMessageSid: string | null;
  failedReason: string | null;
}

export interface CampaignFormData {
  name: string;
  templateId: string | null;
  customMessage: string;
  segment: CampaignSegment;
  couponValue: string;
  couponCode: string;
  audienceType: CampaignAudienceType;
  locationIds: string[];
  guestIds: string[];
  scheduleType: 'immediate' | 'scheduled' | 'recurring';
  scheduledAt: string | null;
  // Recurring schedule fields
  recurringFrequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  recurringStartDate?: string | null;
  recurringEndDate?: string | null;
  recurringTime?: string;
}

export interface CampaignListFilters {
  status?: CampaignStatus;
  segment?: CampaignSegment;
  dateRange?: DateRange;
}
