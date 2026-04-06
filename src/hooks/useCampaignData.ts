'use client';

// ===========================================
// EZRA PORTAL - Campaign Data Hooks
// ===========================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Campaign,
  CampaignMessage,
  SMSTemplate,
  CampaignSegment,
  CampaignStatus,
  CampaignFormData,
} from '@/types';
import {
  getMockCampaigns,
  getMockCampaignMessages,
  PRESET_TEMPLATES,
  getSegmentCounts,
  getCampaignSummaryStats,
} from '@/data/mockCampaignData';
import { sleep } from '@/lib/utils';

// ============ Campaign List Hook ============
interface UseCampaignsReturn {
  campaigns: Campaign[];
  isLoading: boolean;
  error: Error | null;
  stats: {
    totalCampaigns: number;
    activeCampaigns: number;
    scheduledCampaigns: number;
    totalMessagesSent: number;
    totalDelivered: number;
    avgDeliveryRate: number;
  };
  filters: {
    status: CampaignStatus | 'all';
    segment: CampaignSegment | 'all';
  };
  setFilters: (filters: { status?: CampaignStatus | 'all'; segment?: CampaignSegment | 'all' }) => void;
  refetch: () => void;
}

export function useCampaigns(): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFiltersState] = useState<{ status: CampaignStatus | 'all'; segment: CampaignSegment | 'all' }>({
    status: 'all',
    segment: 'all',
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await sleep(400);
      const data = getMockCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch campaigns'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      if (filters.status !== 'all' && c.status !== filters.status) return false;
      if (filters.segment !== 'all' && c.segment !== filters.segment) return false;
      return true;
    });
  }, [campaigns, filters]);

  const stats = useMemo(() => getCampaignSummaryStats(), []);

  const setFilters = useCallback((newFilters: { status?: CampaignStatus | 'all'; segment?: CampaignSegment | 'all' }) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    campaigns: filteredCampaigns,
    isLoading,
    error,
    stats,
    filters,
    setFilters,
    refetch: fetchData,
  };
}

// ============ Single Campaign Hook ============
interface UseCampaignReturn {
  campaign: Campaign | null;
  messages: CampaignMessage[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCampaign(campaignId: string): UseCampaignReturn {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [messages, setMessages] = useState<CampaignMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!campaignId) return;

    setIsLoading(true);
    setError(null);

    try {
      await sleep(300);
      const campaigns = getMockCampaigns();
      const found = campaigns.find(c => c.id === campaignId);
      
      if (!found) {
        throw new Error('Campaign not found');
      }
      
      setCampaign(found);
      setMessages(getMockCampaignMessages(campaignId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch campaign'));
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    campaign,
    messages,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ============ Templates Hook ============
interface UseTemplatesReturn {
  templates: SMSTemplate[];
  getTemplatesBySegment: (segment: CampaignSegment) => SMSTemplate[];
  isLoading: boolean;
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      await sleep(200);
      setTemplates(PRESET_TEMPLATES);
      setIsLoading(false);
    };
    fetchTemplates();
  }, []);

  const getTemplatesBySegment = useCallback((segment: CampaignSegment) => {
    if (segment === 'all') return templates;
    return templates.filter(t => t.segment === segment || t.segment === 'all');
  }, [templates]);

  return {
    templates,
    getTemplatesBySegment,
    isLoading,
  };
}

// ============ Audience Estimation Hook ============
interface UseAudienceEstimateReturn {
  counts: { segment: CampaignSegment; count: number }[];
  getCountForSegment: (segment: CampaignSegment) => number;
  getTotalForLocations: (locationIds: string[], segment: CampaignSegment) => number;
  isLoading: boolean;
}

export function useAudienceEstimate(locationIds?: string[]): UseAudienceEstimateReturn {
  const [counts, setCounts] = useState<{ segment: CampaignSegment; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);
      await sleep(150);
      setCounts(getSegmentCounts(locationIds));
      setIsLoading(false);
    };
    fetchCounts();
  }, [locationIds]);

  const getCountForSegment = useCallback((segment: CampaignSegment) => {
    const found = counts.find(c => c.segment === segment);
    return found?.count || 0;
  }, [counts]);

  const getTotalForLocations = useCallback((locIds: string[], segment: CampaignSegment) => {
    const segmentCounts = getSegmentCounts(locIds);
    const found = segmentCounts.find(c => c.segment === segment);
    return found?.count || 0;
  }, []);

  return {
    counts,
    getCountForSegment,
    getTotalForLocations,
    isLoading,
  };
}

// ============ Campaign Actions Hook ============
interface UseCampaignActionsReturn {
  createCampaign: (data: CampaignFormData) => Promise<Campaign>;
  updateCampaign: (id: string, data: Partial<CampaignFormData>) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;
  sendCampaign: (id: string) => Promise<void>;
  cancelCampaign: (id: string) => Promise<void>;
  isSubmitting: boolean;
  error: Error | null;
}

export function useCampaignActions(): UseCampaignActionsReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCampaign = useCallback(async (data: CampaignFormData): Promise<Campaign> => {
    setIsSubmitting(true);
    setError(null);

    try {
      await sleep(800);
      
      // Mock campaign creation
      const newCampaign: Campaign = {
        id: `camp-${Date.now()}`,
        name: data.name,
        templateId: data.templateId,
        templateName: data.templateId ? 'Template' : 'Custom Message',
        messageContent: data.customMessage,
        segment: data.segment,
        couponValue: data.couponValue,
        couponCode: data.couponCode,
        audienceType: data.audienceType,
        locationIds: data.locationIds,
        guestIds: data.guestIds,
        recipientCount: 0,
        scheduledAt: data.scheduleType === 'scheduled' ? data.scheduledAt : null,
        sentAt: null,
        completedAt: null,
        status: data.scheduleType === 'scheduled' ? 'scheduled' : 'draft',
        stats: { total: 0, pending: 0, sent: 0, delivered: 0, failed: 0, deliveryRate: 0 },
        createdAt: new Date().toISOString(),
        createdBy: 'user-001',
      };

      return newCampaign;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create campaign');
      setError(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateCampaign = useCallback(async (id: string, data: Partial<CampaignFormData>): Promise<Campaign> => {
    setIsSubmitting(true);
    setError(null);

    try {
      await sleep(500);
      const campaigns = getMockCampaigns();
      const existing = campaigns.find(c => c.id === id);
      if (!existing) throw new Error('Campaign not found');
      
      return { ...existing, ...data } as Campaign;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update campaign');
      setError(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteCampaign = useCallback(async (id: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      await sleep(400);
      // Mock deletion
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete campaign');
      setError(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const sendCampaign = useCallback(async (id: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      await sleep(600);
      // Mock send initiation
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send campaign');
      setError(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const cancelCampaign = useCallback(async (id: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      await sleep(400);
      // Mock cancellation
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel campaign');
      setError(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    cancelCampaign,
    isSubmitting,
    error,
  };
}
