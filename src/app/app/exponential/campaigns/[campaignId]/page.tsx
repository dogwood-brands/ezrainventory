'use client';

// ===========================================
// EZRA PORTAL - Campaign Detail Page
// ===========================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MessageSquare,
  ArrowLeft,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  MapPin,
  Calendar,
  RefreshCw,
  Download,
  Search,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaign } from '@/hooks/useCampaignData';
import { formatDate, formatRelativeTime, formatNumber, formatPercent } from '@/lib/formatters';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { CampaignMessage, MessageStatus } from '@/types';

// ============ Message Status Badge ============
interface MessageStatusBadgeProps {
  status: MessageStatus;
}

const MessageStatusBadge: React.FC<MessageStatusBadgeProps> = ({ status }) => {
  const config = {
    pending: { icon: Clock, label: 'Pending', className: 'bg-surface-500/10 text-surface-500' },
    sent: { icon: Send, label: 'Sent', className: 'bg-ezra-500/10 text-ezra-500' },
    delivered: { icon: CheckCircle, label: 'Delivered', className: 'bg-success-500/10 text-success-500' },
    failed: { icon: XCircle, label: 'Failed', className: 'bg-danger-500/10 text-danger-500' },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// ============ Stat Card ============
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, className }) => (
  <Card className={className}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
          {typeof value === 'number' ? formatNumber(value) : value}
        </p>
        <p className="text-sm text-surface-500">{label}</p>
        {subValue && <p className="text-xs text-surface-400">{subValue}</p>}
      </div>
    </div>
  </Card>
);

// ============ Message Row ============
interface MessageRowProps {
  message: CampaignMessage;
}

const MessageRow: React.FC<MessageRowProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors border-b border-surface-100 dark:border-surface-800 last:border-0">
      {/* Guest */}
      <div className="col-span-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
          <Phone className="w-4 h-4 text-surface-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-surface-900 dark:text-surface-100 truncate">
            {message.guestPhone.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4')}
          </p>
          <p className="text-xs text-surface-500">{message.guestId}</p>
        </div>
      </div>

      {/* Location */}
      <div className="col-span-2 flex items-center">
        <span className="text-sm text-surface-600 dark:text-surface-400 truncate">
          {message.locationName}
        </span>
      </div>

      {/* Segment */}
      <div className="col-span-1 flex items-center">
        <span className={cn(
          'px-2 py-0.5 rounded text-xs font-medium',
          message.segment === '4-week' ? 'bg-success-500/10 text-success-500' :
          message.segment === '6-week' ? 'bg-warning-500/10 text-warning-500' :
          'bg-danger-500/10 text-danger-500'
        )}>
          {message.segment}
        </span>
      </div>

      {/* Status */}
      <div className="col-span-1 flex items-center">
        <MessageStatusBadge status={message.status} />
      </div>

      {/* Sent At */}
      <div className="col-span-2 flex items-center">
        <span className="text-sm text-surface-600 dark:text-surface-400">
          {message.sentAt ? formatDate(message.sentAt, 'MMM d, h:mm a') : '—'}
        </span>
      </div>

      {/* Delivered At */}
      <div className="col-span-2 flex items-center">
        <span className="text-sm text-surface-600 dark:text-surface-400">
          {message.deliveredAt ? formatDate(message.deliveredAt, 'MMM d, h:mm a') : 
           message.failedReason ? (
             <span className="text-danger-500 text-xs">{message.failedReason}</span>
           ) : '—'}
        </span>
      </div>

      {/* Twilio SID */}
      <div className="col-span-2 flex items-center gap-2">
        {message.twilioMessageSid ? (
          <>
            <span className="text-xs text-surface-400 font-mono truncate max-w-24">
              {message.twilioMessageSid.slice(0, 12)}...
            </span>
            <button
              onClick={() => copyToClipboard(message.twilioMessageSid!)}
              className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              title="Copy full SID"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-success-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-surface-400" />
              )}
            </button>
          </>
        ) : (
          <span className="text-surface-400">—</span>
        )}
      </div>
    </div>
  );
};

// ============ Main Component ============
export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.campaignId as string;
  const { campaign, messages, isLoading, refetch } = useCampaign(campaignId);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MessageStatus | 'all'>('all');

  const filteredMessages = messages.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (searchQuery && !m.guestPhone.includes(searchQuery) && !m.locationName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 skeleton rounded-xl w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-xl" />
          ))}
        </div>
        <div className="h-96 skeleton rounded-xl" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-surface-300 mx-auto mb-3" />
        <p className="text-surface-500">Campaign not found</p>
        <Link href="/app/exponential/campaigns" className="text-ezra-500 hover:underline mt-2 inline-block">
          Back to Campaigns
        </Link>
      </div>
    );
  }

  const statusConfig = {
    draft: { icon: Clock, color: 'text-surface-500', bg: 'bg-surface-500/10', label: 'Draft' },
    scheduled: { icon: Calendar, color: 'text-ezra-500', bg: 'bg-ezra-500/10', label: 'Scheduled' },
    sending: { icon: Send, color: 'text-warning-500', bg: 'bg-warning-500/10', label: 'Sending' },
    sent: { icon: CheckCircle, color: 'text-success-500', bg: 'bg-success-500/10', label: 'Sent' },
    partially_sent: { icon: AlertCircle, color: 'text-warning-500', bg: 'bg-warning-500/10', label: 'Partially Sent' },
    failed: { icon: XCircle, color: 'text-danger-500', bg: 'bg-danger-500/10', label: 'Failed' },
  };

  const StatusIcon = statusConfig[campaign.status].icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/app/exponential/campaigns"
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-surface-500" />
          </Link>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', statusConfig[campaign.status].bg)}>
            <StatusIcon className={cn('w-6 h-6', statusConfig[campaign.status].color)} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                {campaign.name}
              </h1>
              <span className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium',
                statusConfig[campaign.status].bg,
                statusConfig[campaign.status].color
              )}>
                {statusConfig[campaign.status].label}
              </span>
            </div>
            <p className="text-surface-500 dark:text-surface-400">
              {campaign.templateName} • Created {formatRelativeTime(campaign.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={refetch}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Campaign Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              campaign.segment === '4-week' ? 'bg-success-500/10' :
              campaign.segment === '6-week' ? 'bg-warning-500/10' :
              campaign.segment === '8-week' ? 'bg-danger-500/10' :
              'bg-ezra-500/10'
            )}>
              <Users className={cn(
                'w-5 h-5',
                campaign.segment === '4-week' ? 'text-success-500' :
                campaign.segment === '6-week' ? 'text-warning-500' :
                campaign.segment === '8-week' ? 'text-danger-500' :
                'text-ezra-500'
              )} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                {campaign.segment === 'all' ? 'All' : campaign.segment}
              </p>
              <p className="text-sm text-surface-500">Segment</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                {formatNumber(campaign.recipientCount)}
              </p>
              <p className="text-sm text-surface-500">Recipients</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                {campaign.stats.deliveryRate.toFixed(1)}%
              </p>
              <p className="text-sm text-surface-500">Delivery Rate</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ezra-500/10 flex items-center justify-center">
              <span className="text-lg font-bold text-ezra-500">{campaign.couponValue.replace('$', '')}</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                {campaign.couponCode}
              </p>
              <p className="text-sm text-surface-500">Coupon: {campaign.couponValue}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Delivery Stats */}
      <Card>
        <h3 className="text-heading-sm text-surface-900 dark:text-surface-100 mb-4">
          Delivery Statistics
        </h3>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
            <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
              {formatNumber(campaign.stats.total)}
            </p>
            <p className="text-sm text-surface-500">Total</p>
          </div>
          <div className="text-center p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
            <p className="text-2xl font-semibold text-surface-500">
              {formatNumber(campaign.stats.pending)}
            </p>
            <p className="text-sm text-surface-500">Pending</p>
          </div>
          <div className="text-center p-4 bg-ezra-500/5 rounded-lg">
            <p className="text-2xl font-semibold text-ezra-500">
              {formatNumber(campaign.stats.sent)}
            </p>
            <p className="text-sm text-surface-500">Sent</p>
          </div>
          <div className="text-center p-4 bg-success-500/5 rounded-lg">
            <p className="text-2xl font-semibold text-success-500">
              {formatNumber(campaign.stats.delivered)}
            </p>
            <p className="text-sm text-surface-500">Delivered</p>
          </div>
          <div className="text-center p-4 bg-danger-500/5 rounded-lg">
            <p className="text-2xl font-semibold text-danger-500">
              {formatNumber(campaign.stats.failed)}
            </p>
            <p className="text-sm text-surface-500">Failed</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden flex">
            <div 
              className="bg-success-500 transition-all" 
              style={{ width: `${(campaign.stats.delivered / campaign.stats.total) * 100}%` }}
            />
            <div 
              className="bg-ezra-500 transition-all" 
              style={{ width: `${((campaign.stats.sent - campaign.stats.delivered - campaign.stats.failed) / campaign.stats.total) * 100}%` }}
            />
            <div 
              className="bg-danger-500 transition-all" 
              style={{ width: `${(campaign.stats.failed / campaign.stats.total) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-success-500" />
              <span className="text-surface-500">Delivered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-ezra-500" />
              <span className="text-surface-500">In Transit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-danger-500" />
              <span className="text-surface-500">Failed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-surface-300 dark:bg-surface-600" />
              <span className="text-surface-500">Pending</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Message Log */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center justify-between">
            <h3 className="text-heading-sm text-surface-900 dark:text-surface-100">
              Message Log
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search phone or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-ezra-500 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as MessageStatus | 'all')}
                className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-ezra-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-800/50 text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100 dark:border-surface-800">
          <div className="col-span-2">Recipient</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-1">Segment</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Sent At</div>
          <div className="col-span-2">Delivered At</div>
          <div className="col-span-2">Twilio SID</div>
        </div>

        {/* Table Body */}
        <div className="max-h-[500px] overflow-y-auto">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((message) => (
              <MessageRow key={message.id} message={message} />
            ))
          ) : (
            <div className="px-4 py-12 text-center">
              <MessageSquare className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
              <p className="text-surface-500">
                {messages.length === 0 
                  ? 'No messages have been sent yet' 
                  : 'No messages match your filters'}
              </p>
            </div>
          )}
        </div>

        {/* Table Footer */}
        {messages.length > 0 && (
          <div className="px-4 py-3 border-t border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
            <p className="text-sm text-surface-500">
              Showing {filteredMessages.length} of {messages.length} messages
              {messages.length < campaign.recipientCount && (
                <span className="ml-1">(sample data)</span>
              )}
            </p>
          </div>
        )}
      </Card>

      {/* Twilio Info */}
      <Card className="bg-violet-500/5 border-violet-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">
              Twilio Message Tracking
            </h3>
            <p className="text-surface-500 dark:text-surface-400 mt-1">
              All messages include a Twilio Message SID for tracking. Delivery status is updated in real-time 
              via Twilio webhooks. Failed messages include error details for troubleshooting.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
