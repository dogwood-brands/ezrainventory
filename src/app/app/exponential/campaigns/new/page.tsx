'use client';

// ===========================================
// EZRA PORTAL - New Campaign Creation Page
// ===========================================

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  ArrowLeft,
  Send,
  Clock,
  Users,
  MapPin,
  User,
  DollarSign,
  FileText,
  Check,
  ChevronRight,
  Info,
  Zap,
  AlertTriangle,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTemplates, useAudienceEstimate, useCampaignActions } from '@/hooks/useCampaignData';
import { useLocations } from '@/hooks/useLocations';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { CampaignSegment, CampaignAudienceType, SMSTemplate, CampaignFormData } from '@/types';

// ============ Step Indicator ============
interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => (
  <div className="flex items-center gap-2">
    {steps.map((step, index) => (
      <React.Fragment key={step}>
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
          index < currentStep
            ? 'bg-success-500/10 text-success-500'
            : index === currentStep
              ? 'bg-ezra-500/10 text-ezra-500'
              : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
        )}>
          {index < currentStep ? (
            <Check className="w-4 h-4" />
          ) : (
            <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
              {index + 1}
            </span>
          )}
          <span className="hidden sm:inline">{step}</span>
        </div>
        {index < steps.length - 1 && (
          <ChevronRight className="w-4 h-4 text-surface-400" />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ============ Template Card ============
interface TemplateCardProps {
  template: SMSTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected, onSelect }) => (
  <button
    onClick={onSelect}
    className={cn(
      'w-full text-left p-4 rounded-xl border-2 transition-all',
      isSelected
        ? 'border-ezra-500 bg-ezra-500/5'
        : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
    )}
  >
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-medium text-surface-900 dark:text-surface-100">
        {template.name}
      </h4>
      {isSelected && (
        <div className="w-5 h-5 rounded-full bg-ezra-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
    <p className="text-sm text-surface-500 line-clamp-2 mb-2">
      {template.content}
    </p>
    <div className="flex items-center gap-2">
      <span className={cn(
        'px-2 py-0.5 rounded text-xs font-medium',
        template.segment === '4-week' ? 'bg-success-500/10 text-success-500' :
        template.segment === '6-week' ? 'bg-warning-500/10 text-warning-500' :
        template.segment === '8-week' ? 'bg-danger-500/10 text-danger-500' :
        'bg-ezra-500/10 text-ezra-500'
      )}>
        {template.segment === 'all' ? 'All Segments' : template.segment}
      </span>
      <span className="text-xs text-surface-400">
        Suggested: {template.suggestedCouponRange}
      </span>
    </div>
  </button>
);

// ============ Audience Option Card ============
interface AudienceOptionProps {
  type: CampaignAudienceType;
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

const AudienceOption: React.FC<AudienceOptionProps> = ({
  type, icon, title, description, isSelected, onSelect
}) => (
  <button
    onClick={onSelect}
    className={cn(
      'flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left',
      isSelected
        ? 'border-ezra-500 bg-ezra-500/5'
        : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
    )}
  >
    <div className={cn(
      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
      isSelected ? 'bg-ezra-500/10' : 'bg-surface-100 dark:bg-surface-800'
    )}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-surface-900 dark:text-surface-100">{title}</h4>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-ezra-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <p className="text-sm text-surface-500 mt-1">{description}</p>
    </div>
  </button>
);

// ============ Main Component ============
export default function NewCampaignPage() {
  const router = useRouter();
  const { templates, isLoading: templatesLoading } = useTemplates();
  const { locations } = useLocations();
  const { createCampaign, isSubmitting } = useCampaignActions();
  
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Template', 'Audience', 'Offer', 'Schedule'];

  // Form state
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    templateId: null,
    customMessage: '',
    segment: 'all',
    couponValue: '',
    couponCode: '',
    audienceType: 'all_locations',
    locationIds: [],
    guestIds: [],
    scheduleType: 'immediate',
    scheduledAt: null,
    // Recurring schedule fields
    recurringFrequency: 'daily',
    recurringStartDate: null,
    recurringEndDate: null,
    recurringTime: '10:00',
  });

  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);

  // Get audience estimate
  const { getCountForSegment, getTotalForLocations } = useAudienceEstimate(
    formData.audienceType === 'select_locations' ? selectedLocationIds : undefined
  );

  // Get filtered templates based on segment
  const filteredTemplates = useMemo(() => {
    if (formData.segment === 'all') return templates;
    return templates.filter(t => t.segment === formData.segment || t.segment === 'all');
  }, [templates, formData.segment]);

  // Selected template
  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === formData.templateId);
  }, [templates, formData.templateId]);

  // Estimated recipients
  const estimatedRecipients = useMemo(() => {
    if (formData.audienceType === 'select_guests') {
      return formData.guestIds.length;
    }
    if (formData.audienceType === 'select_locations' && selectedLocationIds.length > 0) {
      return getTotalForLocations(selectedLocationIds, formData.segment);
    }
    return getCountForSegment(formData.segment);
  }, [formData.audienceType, formData.segment, formData.guestIds, selectedLocationIds, getCountForSegment, getTotalForLocations]);

  // Message preview
  const messagePreview = useMemo(() => {
    const content = useCustomMessage ? formData.customMessage : (selectedTemplate?.content || '');
    return content
      .replace('{first_name}', 'Sarah')
      .replace('{location_name}', 'Minneapolis Downtown')
      .replace('{coupon_value}', formData.couponValue || '$XX')
      .replace('{coupon_code}', formData.couponCode || 'XXXXXX')
      .replace('{booking_link}', 'book.ezra.ai/xxxxx');
  }, [useCustomMessage, formData.customMessage, formData.couponValue, formData.couponCode, selectedTemplate]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setFormData(prev => ({ ...prev, templateId }));
    setUseCustomMessage(false);
  };

  // Handle location toggle
  const handleLocationToggle = (locationId: string) => {
    setSelectedLocationIds(prev => 
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  // Update formData when selectedLocationIds changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, locationIds: selectedLocationIds }));
  }, [selectedLocationIds]);

  // Validation
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: // Template
        return (formData.templateId !== null || (useCustomMessage && formData.customMessage.length > 20));
      case 1: // Audience
        if (formData.audienceType === 'select_locations') {
          return selectedLocationIds.length > 0;
        }
        return true;
      case 2: // Offer
        return formData.name.length > 0 && formData.couponValue.length > 0 && formData.couponCode.length > 0;
      case 3: // Schedule
        if (formData.scheduleType === 'scheduled') {
          return formData.scheduledAt !== null;
        }
        if (formData.scheduleType === 'recurring') {
          return formData.recurringStartDate !== null && 
                 formData.recurringEndDate !== null && 
                 formData.recurringFrequency !== undefined;
        }
        return true;
      default:
        return false;
    }
  }, [currentStep, formData, useCustomMessage, selectedLocationIds]);

  // Handle submit
  const handleSubmit = async () => {
    try {
      await createCampaign(formData);
      router.push('/app/exponential/campaigns');
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/app/exponential/campaigns"
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-surface-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
              New Campaign
            </h1>
            <p className="text-surface-500 dark:text-surface-400">
              Create a new SMS campaign for your guests
            </p>
          </div>
        </div>
        <StepIndicator currentStep={currentStep} steps={steps} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 0: Template Selection */}
          {currentStep === 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-ezra-500" />
                Choose a Message Template
              </h2>

              {/* Segment Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Target Segment
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['all', '4-week', '6-week', '8-week'] as CampaignSegment[]).map((seg) => (
                    <button
                      key={seg}
                      onClick={() => setFormData(prev => ({ ...prev, segment: seg, templateId: null }))}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        formData.segment === seg
                          ? seg === '4-week' ? 'bg-success-500 text-white' :
                            seg === '6-week' ? 'bg-warning-500 text-white' :
                            seg === '8-week' ? 'bg-danger-500 text-white' :
                            'bg-ezra-500 text-white'
                          : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                      )}
                    >
                      {seg === 'all' ? 'All Segments' : seg}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-surface-500 mt-2">
                  {formData.segment === '4-week' && 'Low risk: Guests who visited 2+ times in the last 30 days'}
                  {formData.segment === '6-week' && 'Medium risk: Guests with last visit 31-42 days ago'}
                  {formData.segment === '8-week' && 'High risk: Guests with last visit 43+ days ago'}
                  {formData.segment === 'all' && 'Target all guest segments with a single message'}
                </p>
              </div>

              {/* Template Grid */}
              <div className="space-y-3 mb-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={formData.templateId === template.id && !useCustomMessage}
                    onSelect={() => handleTemplateSelect(template.id)}
                  />
                ))}
              </div>

              {/* Custom Message Option */}
              <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
                <button
                  onClick={() => {
                    setUseCustomMessage(true);
                    setFormData(prev => ({ ...prev, templateId: null }));
                  }}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border-2 transition-all',
                    useCustomMessage
                      ? 'border-ezra-500 bg-ezra-500/5'
                      : 'border-dashed border-surface-300 dark:border-surface-600 hover:border-surface-400 dark:hover:border-surface-500'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className={cn('w-5 h-5', useCustomMessage ? 'text-ezra-500' : 'text-surface-400')} />
                    <div>
                      <h4 className="font-medium text-surface-900 dark:text-surface-100">
                        Write Custom Message
                      </h4>
                      <p className="text-sm text-surface-500">
                        Create your own message from scratch
                      </p>
                    </div>
                  </div>
                </button>

                {useCustomMessage && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Custom Message
                    </label>
                    <textarea
                      value={formData.customMessage}
                      onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
                      placeholder="Hi {first_name}! We miss you at {location_name}..."
                      className="w-full px-4 py-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-ezra-500 resize-none"
                      rows={4}
                    />
                    <p className="text-xs text-surface-500 mt-2">
                      Available variables: {'{first_name}'}, {'{location_name}'}, {'{coupon_value}'}, {'{coupon_code}'}, {'{booking_link}'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Step 1: Audience Selection */}
          {currentStep === 1 && (
            <Card>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-ezra-500" />
                Select Your Audience
              </h2>

              <div className="space-y-3 mb-6">
                <AudienceOption
                  type="all_locations"
                  icon={<MapPin className={cn('w-5 h-5', formData.audienceType === 'all_locations' ? 'text-ezra-500' : 'text-surface-500')} />}
                  title="All Locations"
                  description="Send to all guests in the selected segment across all your locations"
                  isSelected={formData.audienceType === 'all_locations'}
                  onSelect={() => setFormData(prev => ({ ...prev, audienceType: 'all_locations' }))}
                />
                <AudienceOption
                  type="select_locations"
                  icon={<MapPin className={cn('w-5 h-5', formData.audienceType === 'select_locations' ? 'text-ezra-500' : 'text-surface-500')} />}
                  title="Select Locations"
                  description="Choose specific locations to target"
                  isSelected={formData.audienceType === 'select_locations'}
                  onSelect={() => setFormData(prev => ({ ...prev, audienceType: 'select_locations' }))}
                />
                <AudienceOption
                  type="select_guests"
                  icon={<User className={cn('w-5 h-5', formData.audienceType === 'select_guests' ? 'text-ezra-500' : 'text-surface-500')} />}
                  title="Select Guests"
                  description="Manually select individual guests to message"
                  isSelected={formData.audienceType === 'select_guests'}
                  onSelect={() => setFormData(prev => ({ ...prev, audienceType: 'select_guests' }))}
                />
              </div>

              {/* Location Selection */}
              {formData.audienceType === 'select_locations' && (
                <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                      Select Locations
                    </label>
                    <button
                      onClick={() => setSelectedLocationIds(
                        selectedLocationIds.length === locations.length ? [] : locations.map(l => l.id)
                      )}
                      className="text-sm text-ezra-500 hover:text-ezra-600"
                    >
                      {selectedLocationIds.length === locations.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {locations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => handleLocationToggle(location.id)}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border text-left transition-colors',
                          selectedLocationIds.includes(location.id)
                            ? 'border-ezra-500 bg-ezra-500/5'
                            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                        )}
                      >
                        <div className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                          selectedLocationIds.includes(location.id)
                            ? 'bg-ezra-500 border-ezra-500'
                            : 'border-surface-300 dark:border-surface-600'
                        )}>
                          {selectedLocationIds.includes(location.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                            {location.name}
                          </p>
                          <p className="text-xs text-surface-500">{location.storeCode}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Guest Selection Placeholder */}
              {formData.audienceType === 'select_guests' && (
                <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
                  <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-4 text-center">
                    <User className="w-8 h-8 text-surface-400 mx-auto mb-2" />
                    <p className="text-sm text-surface-500">
                      Guest selection will be available after connecting to your guest database.
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      For now, use location-based targeting.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Step 2: Offer Details */}
          {currentStep === 2 && (
            <Card>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-ezra-500" />
                Offer Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Campaign Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., February Win-Back Campaign"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Coupon Value *
                    </label>
                    <Input
                      value={formData.couponValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, couponValue: e.target.value }))}
                      placeholder="e.g., $20 or 20%"
                    />
                    {selectedTemplate && (
                      <p className="text-xs text-surface-500 mt-1">
                        Suggested: {selectedTemplate.suggestedCouponRange}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Coupon Code *
                    </label>
                    <Input
                      value={formData.couponCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                      placeholder="e.g., SAVE20"
                      className="uppercase"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <Card>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-ezra-500" />
                When to Send
              </h2>

              <div className="space-y-4">
                {/* Main Schedule Type Options */}
                <div className="space-y-3">
                  {/* Send Immediately */}
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, scheduleType: 'immediate', scheduledAt: null }))}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left transition-all',
                      formData.scheduleType === 'immediate'
                        ? 'border-ezra-500 bg-ezra-500/5'
                        : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        formData.scheduleType === 'immediate' ? 'bg-ezra-500/10' : 'bg-surface-100 dark:bg-surface-800'
                      )}>
                        <Send className={cn('w-5 h-5', formData.scheduleType === 'immediate' ? 'text-ezra-500' : 'text-surface-500')} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-surface-900 dark:text-surface-100">Send Immediately</h4>
                        <p className="text-sm text-surface-500">Send to all recipients as soon as you confirm</p>
                      </div>
                      {formData.scheduleType === 'immediate' && (
                        <div className="w-5 h-5 rounded-full bg-ezra-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Schedule for Later */}
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, scheduleType: 'scheduled' }))}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left transition-all',
                      (formData.scheduleType === 'scheduled' || formData.scheduleType === 'recurring')
                        ? 'border-ezra-500 bg-ezra-500/5'
                        : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        (formData.scheduleType === 'scheduled' || formData.scheduleType === 'recurring') ? 'bg-ezra-500/10' : 'bg-surface-100 dark:bg-surface-800'
                      )}>
                        <Clock className={cn('w-5 h-5', (formData.scheduleType === 'scheduled' || formData.scheduleType === 'recurring') ? 'text-ezra-500' : 'text-surface-500')} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-surface-900 dark:text-surface-100">Schedule for Later</h4>
                        <p className="text-sm text-surface-500">Choose when to send your campaign</p>
                      </div>
                      {(formData.scheduleType === 'scheduled' || formData.scheduleType === 'recurring') && (
                        <div className="w-5 h-5 rounded-full bg-ezra-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                {/* Schedule for Later - Sub Options */}
                {(formData.scheduleType === 'scheduled' || formData.scheduleType === 'recurring') && (
                  <div className="ml-4 pl-4 border-l-2 border-ezra-500/30 space-y-4">
                    <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                      Choose scheduling type:
                    </p>
                    
                    {/* Sub-option cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Specific Date/Time */}
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, scheduleType: 'scheduled' }))}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all',
                          formData.scheduleType === 'scheduled'
                            ? 'border-ezra-500 bg-white dark:bg-surface-900'
                            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 bg-white dark:bg-surface-900'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                            formData.scheduleType === 'scheduled'
                              ? 'border-ezra-500 bg-ezra-500'
                              : 'border-surface-300 dark:border-surface-600'
                          )}>
                            {formData.scheduleType === 'scheduled' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-surface-900 dark:text-surface-100 text-sm">Specific Date & Time</h4>
                            <p className="text-xs text-surface-500 mt-0.5">Send once at a scheduled time</p>
                          </div>
                        </div>
                      </button>

                      {/* Time Period */}
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, scheduleType: 'recurring' }))}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all',
                          formData.scheduleType === 'recurring'
                            ? 'border-ezra-500 bg-white dark:bg-surface-900'
                            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 bg-white dark:bg-surface-900'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                            formData.scheduleType === 'recurring'
                              ? 'border-ezra-500 bg-ezra-500'
                              : 'border-surface-300 dark:border-surface-600'
                          )}>
                            {formData.scheduleType === 'recurring' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-surface-900 dark:text-surface-100 text-sm">Set Time Period</h4>
                            <p className="text-xs text-surface-500 mt-0.5">Run over a date range</p>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Specific Date/Time Options */}
                    {formData.scheduleType === 'scheduled' && (
                      <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Send Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.scheduledAt || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-ezra-500"
                        />
                        <p className="text-xs text-surface-500 mt-2">
                          Messages will be sent in recipients' local timezone when possible.
                        </p>
                      </div>
                    )}

                    {/* Time Period Options */}
                    {formData.scheduleType === 'recurring' && (
                      <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl space-y-4">
                        {/* Frequency */}
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Send Frequency
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { value: 'daily', label: 'Daily' },
                              { value: 'weekly', label: 'Weekly' },
                              { value: 'biweekly', label: 'Bi-Weekly' },
                              { value: 'monthly', label: 'Monthly' },
                            ].map((freq) => (
                              <button
                                key={freq.value}
                                onClick={() => setFormData(prev => ({ ...prev, recurringFrequency: freq.value as 'daily' | 'weekly' | 'biweekly' | 'monthly' }))}
                                className={cn(
                                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                  formData.recurringFrequency === freq.value
                                    ? 'bg-ezra-500 text-white'
                                    : 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300'
                                )}
                              >
                                {freq.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={formData.recurringStartDate || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, recurringStartDate: e.target.value }))}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-ezra-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={formData.recurringEndDate || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, recurringEndDate: e.target.value }))}
                              min={formData.recurringStartDate || new Date().toISOString().split('T')[0]}
                              className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-ezra-500"
                            />
                          </div>
                        </div>

                        {/* Send Time */}
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Send Time
                          </label>
                          <input
                            type="time"
                            value={formData.recurringTime || '10:00'}
                            onChange={(e) => setFormData(prev => ({ ...prev, recurringTime: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-ezra-500"
                          />
                        </div>

                        {/* Summary */}
                        {formData.recurringStartDate && formData.recurringEndDate && (
                          <div className="flex items-start gap-3 p-3 bg-ezra-500/10 rounded-lg">
                            <Info className="w-4 h-4 text-ezra-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-ezra-700 dark:text-ezra-400">
                              Campaign will send <strong>{formData.recurringFrequency || 'daily'}</strong> at{' '}
                              <strong>{formData.recurringTime || '10:00 AM'}</strong> from{' '}
                              <strong>{new Date(formData.recurringStartDate).toLocaleDateString()}</strong> to{' '}
                              <strong>{new Date(formData.recurringEndDate).toLocaleDateString()}</strong>.
                              New guests entering the segment will automatically receive the message.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Warning for immediate send */}
                {formData.scheduleType === 'immediate' && (
                  <div className="flex items-start gap-3 p-4 bg-warning-500/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning-700 dark:text-warning-400">
                        Immediate Send Warning
                      </p>
                      <p className="text-sm text-warning-600 dark:text-warning-500 mt-1">
                        Messages will start sending immediately after you click "Create Campaign". 
                        This action cannot be undone once sending begins.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                leftIcon={formData.scheduleType === 'immediate' ? <Send className="w-4 h-4" /> : formData.scheduleType === 'recurring' ? <RefreshCw className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              >
                {isSubmitting ? 'Creating...' : 
                 formData.scheduleType === 'immediate' ? 'Send Campaign' : 
                 formData.scheduleType === 'recurring' ? 'Start Recurring Campaign' :
                 'Schedule Campaign'}
              </Button>
            )}
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Message Preview */}
            <Card>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-ezra-500" />
                Message Preview
              </h3>
              <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3">
                <p className="text-sm text-surface-700 dark:text-surface-300 whitespace-pre-wrap">
                  {messagePreview || 'Select a template or write a custom message to see preview'}
                </p>
              </div>
              <p className="text-xs text-surface-500 mt-2">
                {messagePreview.length} characters
              </p>
            </Card>

            {/* Campaign Summary */}
            <Card>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
                Campaign Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-500">Segment</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    formData.segment === '4-week' ? 'bg-success-500/10 text-success-500' :
                    formData.segment === '6-week' ? 'bg-warning-500/10 text-warning-500' :
                    formData.segment === '8-week' ? 'bg-danger-500/10 text-danger-500' :
                    'bg-ezra-500/10 text-ezra-500'
                  )}>
                    {formData.segment === 'all' ? 'All' : formData.segment}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-500">Audience</span>
                  <span className="text-sm text-surface-900 dark:text-surface-100">
                    {formData.audienceType === 'all_locations' ? 'All Locations' :
                     formData.audienceType === 'select_locations' ? `${selectedLocationIds.length} Locations` :
                     'Selected Guests'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-500">Est. Recipients</span>
                  <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                    ~{estimatedRecipients.toLocaleString()}
                  </span>
                </div>
                {formData.couponValue && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-500">Offer</span>
                    <span className="text-sm text-surface-900 dark:text-surface-100">
                      {formData.couponValue} ({formData.couponCode || '—'})
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-500">Delivery</span>
                  <span className="text-sm text-surface-900 dark:text-surface-100">
                    {formData.scheduleType === 'immediate' ? 'Immediate' : 
                     formData.scheduleType === 'scheduled' && formData.scheduledAt ? 
                       new Date(formData.scheduledAt).toLocaleString() : 
                     formData.scheduleType === 'recurring' ? 
                       `${formData.recurringFrequency || 'Daily'}` : 
                     'Scheduled'}
                  </span>
                </div>
                {formData.scheduleType === 'recurring' && formData.recurringStartDate && formData.recurringEndDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-500">Period</span>
                    <span className="text-sm text-surface-900 dark:text-surface-100">
                      {new Date(formData.recurringStartDate).toLocaleDateString()} - {new Date(formData.recurringEndDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {formData.scheduleType === 'recurring' && formData.recurringTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-500">Send Time</span>
                    <span className="text-sm text-surface-900 dark:text-surface-100">
                      {formData.recurringTime}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Twilio Info */}
            <Card className="bg-violet-500/5 border-violet-500/20">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-violet-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    Powered by Twilio
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    Messages delivered via Twilio's enterprise SMS infrastructure.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
