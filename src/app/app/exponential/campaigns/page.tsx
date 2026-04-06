'use client';

// ===========================================
// EZRA PORTAL - Campaign Management Page
// ===========================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Plus,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Search,
  MoreVertical,
  Calendar,
  Users,
  TrendingUp,
  RefreshCw,
  ArrowLeft,
  Zap,
  Mail,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaigns, useCampaignActions } from '@/hooks/useCampaignData';
import { formatDate, formatRelativeTime, formatNumber, formatPercent } from '@/lib/formatters';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { Campaign, CampaignStatus, CampaignSegment } from '@/types';

// ============ Status Badge ============
interface StatusBadgeProps {
  status: CampaignStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    draft: { icon: Edit, label: 'Draft', className: 'bg-surface-500/10 text-surface-500' },
    scheduled: { icon: Clock, label: 'Scheduled', className: 'bg-ezra-500/10 text-ezra-500' },
    sending: { icon: Send, label: 'Sending', className: 'bg-warning-500/10 text-warning-500' },
    sent: { icon: CheckCircle, label: 'Sent', className: 'bg-success-500/10 text-success-500' },
    partially_sent: { icon: AlertCircle, label: 'Partial', className: 'bg-warning-500/10 text-warning-500' },
    failed: { icon: XCircle, label: 'Failed', className: 'bg-danger-500/10 text-danger-500' },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', className)}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

// ============ Segment Badge ============
interface SegmentBadgeProps {
  segment: CampaignSegment;
}

const SegmentBadge: React.FC<SegmentBadgeProps> = ({ segment }) => {
  const config = {
    '4-week': { label: '4-Week', className: 'bg-success-500/10 text-success-500 border-success-500/20' },
    '6-week': { label: '6-Week', className: 'bg-warning-500/10 text-warning-500 border-warning-500/20' },
    '8-week': { label: '8-Week', className: 'bg-danger-500/10 text-danger-500 border-danger-500/20' },
    'all': { label: 'All Segments', className: 'bg-ezra-500/10 text-ezra-500 border-ezra-500/20' },
  };

  const { label, className } = config[segment];

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium', className)}>
      {label}
    </span>
  );
};

// ============ Campaign Row ============
interface CampaignRowProps {
  campaign: Campaign;
  onDelete: (id: string) => void;
  onSend: (id: string) => void;
}

const CampaignRow: React.FC<CampaignRowProps> = ({ campaign, onDelete, onSend }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors border-b border-surface-100 dark:border-surface-800 last:border-0">
      {/* Campaign Info */}
      <div className="col-span-4 flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          campaign.status === 'sending' ? 'bg-warning-500/10' :
          campaign.status === 'sent' ? 'bg-success-500/10' :
          campaign.status === 'scheduled' ? 'bg-ezra-500/10' :
          'bg-surface-100 dark:bg-surface-800'
        )}>
          <MessageSquare className={cn(
            'w-5 h-5',
            campaign.status === 'sending' ? 'text-warning-500' :
            campaign.status === 'sent' ? 'text-success-500' :
            campaign.status === 'scheduled' ? 'text-ezra-500' :
            'text-surface-500'
          )} />
        </div>
        <div className="min-w-0">
          <Link 
            href={`/app/exponential/campaigns/${campaign.id}`}
            className="font-medium text-surface-900 dark:text-surface-100 hover:text-ezra-500 transition-colors block truncate"
          >
            {campaign.name}
          </Link>
          <p className="text-xs text-surface-500 mt-0.5 truncate">
            {campaign.templateName}
          </p>
        </div>
      </div>

      {/* Segment */}
      <div className="col-span-1 flex items-center">
        <SegmentBadge segment={campaign.segment} />
      </div>

      {/* Status */}
      <div className="col-span-1 flex items-center">
        <StatusBadge status={campaign.status} />
      </div>

      {/* Recipients */}
      <div className="col-span-1 flex items-center justify-end">
        <span className="text-surface-900 dark:text-surface-100 font-medium">
          {formatNumber(campaign.recipientCount)}
        </span>
      </div>

      {/* Delivery Stats */}
      <div className="col-span-2 flex items-center gap-3">
        {campaign.status === 'sent' || campaign.status === 'sending' ? (
          <>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-surface-500">Delivered</span>
                <span className="text-success-500 font-medium">
                  {formatPercent(campaign.stats.deliveryRate / 100)}
                </span>
              </div>
              <div className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success-500 rounded-full transition-all"
                  style={{ width: `${campaign.stats.deliveryRate}%` }}
                />
              </div>
            </div>
            {campaign.stats.failed > 0 && (
              <span className="text-xs text-danger-500">
                {campaign.stats.failed} failed
              </span>
            )}
          </>
        ) : campaign.status === 'scheduled' ? (
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(campaign.scheduledAt!, 'MMM d, h:mm a')}</span>
          </div>
        ) : (
          <span className="text-surface-400 text-sm">—</span>
        )}
      </div>

      {/* Coupon */}
      <div className="col-span-1 flex items-center justify-end">
        {campaign.couponValue ? (
          <span className="text-surface-900 dark:text-surface-100 font-medium">
            {campaign.couponValue}
          </span>
        ) : (
          <span className="text-surface-400">—</span>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-1 flex items-center justify-end gap-2 relative">
        {campaign.status === 'draft' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSend(campaign.id)}
            leftIcon={<Play className="w-3.5 h-3.5" />}
          >
            Send
          </Button>
        )}
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-surface-500" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)} 
              />
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-surface-900 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 py-1 z-20">
                <Link
                  href={`/app/exponential/campaigns/${campaign.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Link>
                {campaign.status === 'draft' && (
                  <Link
                    href={`/app/exponential/campaigns/${campaign.id}/edit`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                )}
                {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                  <button
                    onClick={() => { onDelete(campaign.id); setShowMenu(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 w-full"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ Main Component ============
export default function CampaignsPage() {
  const { campaigns, isLoading, stats, filters, setFilters, refetch } = useCampaigns();
  const { deleteCampaign, sendCampaign, isSubmitting } = useCampaignActions();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCampaigns = campaigns.filter(c => 
    searchQuery === '' || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      await deleteCampaign(id);
      refetch();
    }
  };

  const handleSend = async (id: string) => {
    if (confirm('Are you sure you want to send this campaign now?')) {
      await sendCampaign(id);
      refetch();
    }
  };

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/app/exponential"
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-surface-500" />
          </Link>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
              Campaigns
            </h1>
            <p className="text-surface-500 dark:text-surface-400">
              Manage SMS campaigns and message templates
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
          <Link href="/app/exponential/campaigns/import">
            <Button variant="secondary" size="sm" leftIcon={<Users className="w-4 h-4" />}>
              Import Guests
            </Button>
          </Link>
          <Link href="/app/exponential/campaigns/new">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                {formatNumber(stats.totalMessagesSent)}
              </p>
              <p className="text-sm text-surface-500">Messages Sent</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                {stats.avgDeliveryRate}%
              </p>
              <p className="text-sm text-surface-500">Delivery Rate</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-500/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                {stats.activeCampaigns}
              </p>
              <p className="text-sm text-surface-500">Active Now</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ezra-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-ezra-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                {stats.scheduledCampaigns}
              </p>
              <p className="text-sm text-surface-500">Scheduled</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaign List */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center justify-between">
            <h3 className="text-heading-sm text-surface-900 dark:text-surface-100">
              All Campaigns
            </h3>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-ezra-500 w-64"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters({ status: e.target.value as CampaignStatus | 'all' })}
                className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-ezra-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sending">Sending</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>

              {/* Segment Filter */}
              <select
                value={filters.segment}
                onChange={(e) => setFilters({ segment: e.target.value as CampaignSegment | 'all' })}
                className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-ezra-500"
              >
                <option value="all">All Segments</option>
                <option value="4-week">4-Week</option>
                <option value="6-week">6-Week</option>
                <option value="8-week">8-Week</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-800/50 text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100 dark:border-surface-800">
          <div className="col-span-4">Campaign</div>
          <div className="col-span-1">Segment</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Recipients</div>
          <div className="col-span-2">Delivery</div>
          <div className="col-span-1 text-right">Coupon</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="max-h-[600px] overflow-y-auto">
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => (
              <CampaignRow
                key={campaign.id}
                campaign={campaign}
                onDelete={handleDelete}
                onSend={handleSend}
              />
            ))
          ) : (
            <div className="px-4 py-12 text-center">
              <MessageSquare className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
              <p className="text-surface-500 mb-4">No campaigns found</p>
              <Link href="/app/exponential/campaigns/new">
                <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Create Your First Campaign
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* Info Banner */}
      <Card className="bg-violet-500/5 border-violet-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">
              Powered by Twilio
            </h3>
            <p className="text-surface-500 dark:text-surface-400 mt-1">
              All SMS messages are delivered via Twilio's reliable messaging infrastructure. 
              Delivery status updates in real-time as messages are sent and confirmed.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
