// ===========================================
// EZRA PORTAL - Mock Scheduling Data
// ===========================================

import type {
  SchedulingTimeBucket,
  SchedulingDailySummary,
  SchedulingLocationSummary,
  SchedulingRecommendation,
  TimeWindowInsight,
  SchedulingOverviewData,
  SchedulingStoreData,
  DateRange,
} from '@/types';
import { format, subDays, parseISO, eachDayOfInterval, isWeekend } from 'date-fns';
import { mockLocations } from './mockLocations';
import { randomFloatInRange, randomInRange, generateId } from '@/lib/utils';

// ============ Constants ============
export const SCHEDULING_CONSTANTS = {
  AVG_HOURLY_LABOR_COST: 18.5, // Average cost per labor hour
  OVERTIME_THRESHOLD: 40, // Weekly hours threshold for overtime
  IDLE_THRESHOLD: 0, // Revenue threshold for idle hours
  PEAK_HOURS: [14, 15, 16, 17, 18], // Typical peak hours (2pm-6pm)
  SLOW_HOURS: [9, 10, 11, 20, 21], // Typical slow hours
  OPERATING_HOURS: { start: 9, end: 21 }, // 9am to 9pm
  TIME_WINDOWS: {
    morning: { start: 9, end: 12, label: 'Morning (9AM-12PM)' },
    noon: { start: 12, end: 14, label: 'Noon (12PM-2PM)' },
    afternoon: { start: 14, end: 17, label: 'Afternoon (2PM-5PM)' },
    evening: { start: 17, end: 21, label: 'Evening (5PM-9PM)' },
  },
};

// ============ Helper Functions ============

function getTimeLabel(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${period}`;
}

function getTimeWindow(hour: number): string {
  const { TIME_WINDOWS } = SCHEDULING_CONSTANTS;
  if (hour >= TIME_WINDOWS.morning.start && hour < TIME_WINDOWS.morning.end) return 'Morning';
  if (hour >= TIME_WINDOWS.noon.start && hour < TIME_WINDOWS.noon.end) return 'Noon';
  if (hour >= TIME_WINDOWS.afternoon.start && hour < TIME_WINDOWS.afternoon.end) return 'Afternoon';
  return 'Evening';
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ============ Data Generation ============

/**
 * Generate hourly scheduling data for a single day
 */
function generateDayTimeBuckets(
  locationId: string,
  date: string,
  locationSeed: number
): SchedulingTimeBucket[] {
  const { OPERATING_HOURS, PEAK_HOURS, SLOW_HOURS } = SCHEDULING_CONSTANTS;
  const dateNum = new Date(date).getDate();
  const dayOfWeek = new Date(date).getDay();
  const isWeekendDay = isWeekend(parseISO(date));
  
  const buckets: SchedulingTimeBucket[] = [];
  
  for (let hour = OPERATING_HOURS.start; hour < OPERATING_HOURS.end; hour++) {
    const seed = locationSeed + dateNum + hour;
    const isPeakHour = PEAK_HOURS.includes(hour);
    const isSlowHour = SLOW_HOURS.includes(hour);
    
    // Base metrics with variance
    let baseRevenue = isPeakHour ? 450 : isSlowHour ? 120 : 280;
    let baseTickets = isPeakHour ? 8 : isSlowHour ? 2 : 5;
    let baseLaborHours = isPeakHour ? 3.5 : isSlowHour ? 2 : 2.5;
    
    // Weekend multiplier
    if (isWeekendDay) {
      baseRevenue *= 1.25;
      baseTickets = Math.round(baseTickets * 1.2);
      baseLaborHours *= 1.1;
    }
    
    // Add variance
    const variance = seededRandom(seed);
    const revenue = Math.round(baseRevenue * (0.7 + variance * 0.6));
    const tickets = Math.max(0, Math.round(baseTickets * (0.6 + variance * 0.8)));
    const laborHours = Math.round(baseLaborHours * (0.8 + variance * 0.4) * 10) / 10;
    const laborCost = Math.round(laborHours * SCHEDULING_CONSTANTS.AVG_HOURLY_LABOR_COST * 100) / 100;
    
    // Overtime (small chance, usually in evening)
    const overtimeHours = hour >= 19 && seededRandom(seed + 100) > 0.85 
      ? Math.round(seededRandom(seed + 101) * 1.5 * 10) / 10 
      : 0;
    
    buckets.push({
      date,
      hour,
      timeLabel: getTimeLabel(hour),
      revenue,
      guestTickets: tickets,
      laborHours,
      laborCost,
      overtimeHours,
    });
  }
  
  return buckets;
}

/**
 * Generate daily summary from time buckets
 */
function generateDailySummary(
  buckets: SchedulingTimeBucket[],
  date: string
): SchedulingDailySummary {
  const totalRevenue = buckets.reduce((sum, b) => sum + b.revenue, 0);
  const totalTickets = buckets.reduce((sum, b) => sum + b.guestTickets, 0);
  const totalLaborHours = buckets.reduce((sum, b) => sum + b.laborHours, 0);
  const totalLaborCost = buckets.reduce((sum, b) => sum + b.laborCost, 0);
  const totalOvertime = buckets.reduce((sum, b) => sum + b.overtimeHours, 0);
  
  // Calculate idle hours (labor hours with no revenue)
  const idleHours = buckets
    .filter(b => b.laborHours > 0 && b.revenue === 0)
    .reduce((sum, b) => sum + b.laborHours, 0);
  
  const idlePercent = totalLaborHours > 0 ? (idleHours / totalLaborHours) * 100 : 0;
  const srph = totalLaborHours > 0 ? totalRevenue / totalLaborHours : 0;
  const ticketsPerLaborHour = totalLaborHours > 0 ? totalTickets / totalLaborHours : 0;
  
  // Find peak and slowest hours
  const sortedByTickets = [...buckets].sort((a, b) => b.guestTickets - a.guestTickets);
  const peakHour = sortedByTickets[0]?.hour || 14;
  const slowestHour = sortedByTickets[sortedByTickets.length - 1]?.hour || 10;
  
  return {
    date,
    dayOfWeek: format(parseISO(date), 'EEEE'),
    revenue: totalRevenue,
    guestTickets: totalTickets,
    laborHours: Math.round(totalLaborHours * 10) / 10,
    laborCost: Math.round(totalLaborCost * 100) / 100,
    idleHours: Math.round(idleHours * 10) / 10,
    idlePercent: Math.round(idlePercent * 10) / 10,
    srph: Math.round(srph * 100) / 100,
    ticketsPerLaborHour: Math.round(ticketsPerLaborHour * 100) / 100,
    overtimeHours: Math.round(totalOvertime * 10) / 10,
    peakHour,
    slowestHour,
  };
}

/**
 * Generate location summary from daily summaries
 */
function generateLocationSummary(
  locationId: string,
  dailySummaries: SchedulingDailySummary[]
): Omit<SchedulingLocationSummary, 'locationName' | 'storeCode' | 'state'> {
  const totalRevenue = dailySummaries.reduce((sum, d) => sum + d.revenue, 0);
  const totalLaborHours = dailySummaries.reduce((sum, d) => sum + d.laborHours, 0);
  const totalLaborCost = dailySummaries.reduce((sum, d) => sum + d.laborCost, 0);
  const totalIdleHours = dailySummaries.reduce((sum, d) => sum + d.idleHours, 0);
  const totalOvertime = dailySummaries.reduce((sum, d) => sum + d.overtimeHours, 0);
  const totalTickets = dailySummaries.reduce((sum, d) => sum + d.guestTickets, 0);
  
  const idlePercent = totalLaborHours > 0 ? (totalIdleHours / totalLaborHours) * 100 : 0;
  const srph = totalLaborHours > 0 ? totalRevenue / totalLaborHours : 0;
  const ticketsPerLaborHour = totalLaborHours > 0 ? totalTickets / totalLaborHours : 0;
  
  // Find most common peak/slow windows
  const peakHours = dailySummaries.map(d => d.peakHour);
  const slowHours = dailySummaries.map(d => d.slowestHour);
  const avgPeakHour = Math.round(peakHours.reduce((a, b) => a + b, 0) / peakHours.length);
  const avgSlowHour = Math.round(slowHours.reduce((a, b) => a + b, 0) / slowHours.length);
  
  const location = mockLocations.find(l => l.id === locationId);
  
  return {
    locationId,
    revenue: totalRevenue,
    laborHours: Math.round(totalLaborHours * 10) / 10,
    laborCost: Math.round(totalLaborCost * 100) / 100,
    idleHours: Math.round(totalIdleHours * 10) / 10,
    idlePercent: Math.round(idlePercent * 10) / 10,
    srph: Math.round(srph * 100) / 100,
    ticketsPerLaborHour: Math.round(ticketsPerLaborHour * 100) / 100,
    overtimeHours: Math.round(totalOvertime * 10) / 10,
    hasOvertimeFlag: totalOvertime > 5,
    lastSyncAt: location?.lastSyncAt || new Date().toISOString(),
    peakWindow: getTimeWindow(avgPeakHour) + ` (${getTimeLabel(avgPeakHour)})`,
    slowestWindow: getTimeWindow(avgSlowHour) + ` (${getTimeLabel(avgSlowHour)})`,
  };
}

/**
 * Generate time window insights from buckets
 */
function generateTimeWindowInsights(buckets: SchedulingTimeBucket[]): TimeWindowInsight[] {
  const { TIME_WINDOWS } = SCHEDULING_CONSTANTS;
  const windows = Object.entries(TIME_WINDOWS);
  
  return windows.map(([key, config]) => {
    const windowBuckets = buckets.filter(
      b => b.hour >= config.start && b.hour < config.end
    );
    
    if (windowBuckets.length === 0) {
      return {
        window: config.label,
        avgTickets: 0,
        avgRevenue: 0,
        avgLaborHours: 0,
        srph: 0,
        idlePercent: 0,
      };
    }
    
    const totalTickets = windowBuckets.reduce((sum, b) => sum + b.guestTickets, 0);
    const totalRevenue = windowBuckets.reduce((sum, b) => sum + b.revenue, 0);
    const totalLaborHours = windowBuckets.reduce((sum, b) => sum + b.laborHours, 0);
    const idleBuckets = windowBuckets.filter(b => b.laborHours > 0 && b.revenue === 0);
    const idleHours = idleBuckets.reduce((sum, b) => sum + b.laborHours, 0);
    
    const days = new Set(windowBuckets.map(b => b.date)).size;
    
    return {
      window: config.label,
      avgTickets: Math.round((totalTickets / days) * 10) / 10,
      avgRevenue: Math.round(totalRevenue / days),
      avgLaborHours: Math.round((totalLaborHours / days) * 10) / 10,
      srph: totalLaborHours > 0 ? Math.round((totalRevenue / totalLaborHours) * 100) / 100 : 0,
      idlePercent: totalLaborHours > 0 ? Math.round((idleHours / totalLaborHours) * 1000) / 10 : 0,
    };
  });
}

/**
 * Generate recommendations based on data
 */
function generateRecommendations(
  summary: SchedulingLocationSummary,
  windowInsights: TimeWindowInsight[],
  dailyData: SchedulingDailySummary[]
): SchedulingRecommendation[] {
  const recommendations: SchedulingRecommendation[] = [];
  
  // Find highest idle window
  const highestIdleWindow = [...windowInsights].sort((a, b) => b.idlePercent - a.idlePercent)[0];
  const lowestSRPHWindow = [...windowInsights].sort((a, b) => a.srph - b.srph)[0];
  const highestSRPHWindow = [...windowInsights].sort((a, b) => b.srph - a.srph)[0];
  const busiestWindow = [...windowInsights].sort((a, b) => b.avgTickets - a.avgTickets)[0];
  
  // High idle hours recommendation
  if (summary.idlePercent > 15) {
    recommendations.push({
      id: generateId(),
      type: 'reduce_coverage',
      priority: 'high',
      title: `Reduce coverage during ${highestIdleWindow.window}`,
      description: `High idle time detected: ${summary.idlePercent.toFixed(1)}% of labor hours have zero revenue. Consider reducing staffing during ${highestIdleWindow.window} when idle rate is ${highestIdleWindow.idlePercent.toFixed(1)}%.`,
      metric: `${summary.idleHours.toFixed(1)} idle hours / ${summary.laborHours.toFixed(1)} total`,
      impact: `Potential savings: $${Math.round(summary.idleHours * SCHEDULING_CONSTANTS.AVG_HOURLY_LABOR_COST * 0.5)}/period`,
    });
  }
  
  // Low SRPH window recommendation
  if (lowestSRPHWindow.srph < summary.srph * 0.7) {
    recommendations.push({
      id: generateId(),
      type: 'shift_hours',
      priority: 'medium',
      title: `Optimize staffing for ${lowestSRPHWindow.window}`,
      description: `${lowestSRPHWindow.window} has the lowest revenue per labor hour ($${lowestSRPHWindow.srph.toFixed(2)}/hr vs $${summary.srph.toFixed(2)}/hr average). Consider shifting staff to busier periods.`,
      metric: `SRPH: $${lowestSRPHWindow.srph.toFixed(2)} vs avg $${summary.srph.toFixed(2)}`,
    });
  }
  
  // Peak coverage recommendation
  if (busiestWindow.avgTickets > 25) {
    recommendations.push({
      id: generateId(),
      type: 'add_coverage',
      priority: 'medium',
      title: `Ensure adequate coverage during ${busiestWindow.window}`,
      description: `${busiestWindow.window} is the busiest period with ${busiestWindow.avgTickets.toFixed(1)} average tickets and $${busiestWindow.avgRevenue.toLocaleString()} average revenue. Ensure sufficient coverage to maximize conversion.`,
      metric: `${busiestWindow.avgTickets.toFixed(1)} tickets/day during peak`,
    });
  }
  
  // Overtime recommendation
  if (summary.hasOvertimeFlag) {
    recommendations.push({
      id: generateId(),
      type: 'overtime_alert',
      priority: 'high',
      title: 'Overtime hours detected',
      description: `${summary.overtimeHours.toFixed(1)} overtime hours recorded this period. Consider redistributing hours across the week or adding part-time staff to reduce overtime costs.`,
      metric: `${summary.overtimeHours.toFixed(1)} OT hours`,
      impact: `Overtime premium cost: ~$${Math.round(summary.overtimeHours * SCHEDULING_CONSTANTS.AVG_HOURLY_LABOR_COST * 0.5)}`,
    });
  }
  
  // Efficiency recommendation
  if (summary.srph > 150) {
    recommendations.push({
      id: generateId(),
      type: 'efficiency',
      priority: 'low',
      title: 'Strong revenue efficiency',
      description: `This location has excellent revenue per labor hour ($${summary.srph.toFixed(2)}). ${highestSRPHWindow.window} performs best at $${highestSRPHWindow.srph.toFixed(2)}/hr. Consider this location as a model for scheduling best practices.`,
      metric: `SRPH: $${summary.srph.toFixed(2)}`,
    });
  }
  
  // Add generic recommendation if we don't have many
  if (recommendations.length < 3) {
    const slowestDays = dailyData
      .filter(d => d.srph < summary.srph * 0.8)
      .map(d => d.dayOfWeek);
    
    if (slowestDays.length > 0) {
      const uniqueDays = [...new Set(slowestDays)];
      recommendations.push({
        id: generateId(),
        type: 'shift_hours',
        priority: 'low',
        title: `Review ${uniqueDays[0]} scheduling`,
        description: `${uniqueDays.join(' and ')} tend to have lower efficiency. Consider adjusting staffing levels based on historical demand patterns.`,
        metric: `Lower SRPH on ${uniqueDays.length} day(s)`,
      });
    }
  }
  
  return recommendations.slice(0, 6);
}

// ============ Public API ============

/**
 * Get scheduling overview data for all locations
 */
export function getSchedulingOverview(
  clientId: string,
  dateRange?: DateRange
): SchedulingOverviewData {
  const endDate = dateRange?.endDate || format(new Date(), 'yyyy-MM-dd');
  const startDate = dateRange?.startDate || format(subDays(parseISO(endDate), 30), 'yyyy-MM-dd');
  
  const days = eachDayOfInterval({ 
    start: parseISO(startDate), 
    end: parseISO(endDate) 
  });
  
  const locations = mockLocations.filter(l => l.clientId === clientId && l.status === 'active');
  
  const locationSummaries: SchedulingLocationSummary[] = locations.map(location => {
    const locationSeed = location.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Generate all buckets for this location
    const allBuckets = days.flatMap(day => 
      generateDayTimeBuckets(location.id, format(day, 'yyyy-MM-dd'), locationSeed)
    );
    
    // Generate daily summaries
    const dailySummaries = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayBuckets = allBuckets.filter(b => b.date === dayStr);
      return generateDailySummary(dayBuckets, dayStr);
    });
    
    // Generate location summary
    const summary = generateLocationSummary(location.id, dailySummaries);
    
    return {
      ...summary,
      locationName: location.name,
      storeCode: location.storeCode,
      state: location.state,
    };
  });
  
  // Calculate totals
  const totalRevenue = locationSummaries.reduce((sum, l) => sum + l.revenue, 0);
  const totalLaborHours = locationSummaries.reduce((sum, l) => sum + l.laborHours, 0);
  const totalIdleHours = locationSummaries.reduce((sum, l) => sum + l.idleHours, 0);
  const idlePercent = totalLaborHours > 0 ? (totalIdleHours / totalLaborHours) * 100 : 0;
  const avgSRPH = totalLaborHours > 0 ? totalRevenue / totalLaborHours : 0;
  const overtimeAlerts = locationSummaries.filter(l => l.hasOvertimeFlag).length;
  
  // Generate revenue trend
  const revenueTrend = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayRevenue = locationSummaries.reduce((sum, loc) => {
      const seed = loc.locationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + day.getDate();
      const baseRevenue = loc.revenue / days.length;
      const variance = (seededRandom(seed) - 0.5) * baseRevenue * 0.3;
      const weekendMultiplier = isWeekend(day) ? 1.2 : 1;
      return sum + (baseRevenue + variance) * weekendMultiplier;
    }, 0);
    return { date: dayStr, revenue: Math.round(dayRevenue) };
  });
  
  // Generate idle by location (top 10 by idle%)
  const idleByLocation = [...locationSummaries]
    .sort((a, b) => b.idlePercent - a.idlePercent)
    .slice(0, 10)
    .map(l => ({ name: l.locationName, idlePercent: l.idlePercent }));
  
  return {
    totalRevenue,
    totalLaborHours: Math.round(totalLaborHours * 10) / 10,
    totalIdleHours: Math.round(totalIdleHours * 10) / 10,
    idlePercent: Math.round(idlePercent * 10) / 10,
    avgSRPH: Math.round(avgSRPH * 100) / 100,
    overtimeAlerts,
    locationSummaries: locationSummaries.sort((a, b) => b.idlePercent - a.idlePercent),
    revenueTrend,
    idleByLocation,
  };
}

/**
 * Get scheduling data for a specific store
 */
export function getSchedulingStore(
  locationId: string,
  dateRange?: DateRange
): SchedulingStoreData | null {
  const location = mockLocations.find(l => l.id === locationId);
  if (!location) return null;
  
  const endDate = dateRange?.endDate || format(new Date(), 'yyyy-MM-dd');
  const startDate = dateRange?.startDate || format(subDays(parseISO(endDate), 14), 'yyyy-MM-dd');
  
  const days = eachDayOfInterval({ 
    start: parseISO(startDate), 
    end: parseISO(endDate) 
  });
  
  const locationSeed = location.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Generate all buckets
  const allBuckets = days.flatMap(day => 
    generateDayTimeBuckets(location.id, format(day, 'yyyy-MM-dd'), locationSeed)
  );
  
  // Generate daily summaries
  const dailyBreakdown = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayBuckets = allBuckets.filter(b => b.date === dayStr);
    return generateDailySummary(dayBuckets, dayStr);
  });
  
  // Generate location summary
  const summaryData = generateLocationSummary(location.id, dailyBreakdown);
  
  // Generate time window insights
  const timeWindowInsights = generateTimeWindowInsights(allBuckets);
  
  // Generate hourly trend (average across all days)
  const { OPERATING_HOURS } = SCHEDULING_CONSTANTS;
  const hourlyTrend = [];
  for (let hour = OPERATING_HOURS.start; hour < OPERATING_HOURS.end; hour++) {
    const hourBuckets = allBuckets.filter(b => b.hour === hour);
    const avgTickets = hourBuckets.reduce((sum, b) => sum + b.guestTickets, 0) / hourBuckets.length;
    const avgRevenue = hourBuckets.reduce((sum, b) => sum + b.revenue, 0) / hourBuckets.length;
    const avgLaborHours = hourBuckets.reduce((sum, b) => sum + b.laborHours, 0) / hourBuckets.length;
    
    hourlyTrend.push({
      hour,
      label: getTimeLabel(hour),
      avgTickets: Math.round(avgTickets * 10) / 10,
      avgRevenue: Math.round(avgRevenue),
      avgLaborHours: Math.round(avgLaborHours * 10) / 10,
    });
  }
  
  // Build full location summary
  const fullSummary: SchedulingLocationSummary = {
    ...summaryData,
    locationName: location.name,
    storeCode: location.storeCode,
    state: location.state,
  };
  
  // Generate recommendations
  const recommendations = generateRecommendations(fullSummary, timeWindowInsights, dailyBreakdown);
  
  return {
    locationId,
    locationName: location.name,
    storeCode: location.storeCode,
    summary: {
      revenue: summaryData.revenue,
      laborHours: summaryData.laborHours,
      laborCost: summaryData.laborCost,
      idleHours: summaryData.idleHours,
      idlePercent: summaryData.idlePercent,
      srph: summaryData.srph,
      ticketsPerLaborHour: summaryData.ticketsPerLaborHour,
      overtimeHours: summaryData.overtimeHours,
      hasOvertimeFlag: summaryData.hasOvertimeFlag,
    },
    timeWindowInsights,
    dailyBreakdown,
    hourlyTrend,
    recommendations,
  };
}
