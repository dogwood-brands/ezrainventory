'use client';

// ===========================================
// EZRA PORTAL - Reports Page
// ===========================================

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Clock,
  Check,
  BarChart3,
  TrendingUp,
  Shield,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatDate, formatRelativeTime } from '@/lib/formatters';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'lp' | 'operations' | 'executive';
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  lastGenerated: Date;
  status: 'ready' | 'generating' | 'scheduled';
}

const mockReports: Report[] = [
  {
    id: 'rpt-001',
    name: 'Weekly Sales Summary',
    description: 'Revenue, tickets, and goal performance across all locations',
    type: 'sales',
    frequency: 'weekly',
    lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'ready',
  },
  {
    id: 'rpt-002',
    name: 'Monthly Executive Report',
    description: 'High-level KPIs and trends for leadership review',
    type: 'executive',
    frequency: 'monthly',
    lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'ready',
  },
  {
    id: 'rpt-003',
    name: 'LP Risk Analysis',
    description: 'Locations with elevated risk scores and anomaly details',
    type: 'lp',
    frequency: 'weekly',
    lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'ready',
  },
  {
    id: 'rpt-004',
    name: 'Daily Sales Flash',
    description: "Quick snapshot of yesterday's performance",
    type: 'sales',
    frequency: 'daily',
    lastGenerated: new Date(Date.now() - 12 * 60 * 60 * 1000),
    status: 'ready',
  },
  {
    id: 'rpt-005',
    name: 'Location Comparison',
    description: 'Side-by-side performance metrics for all locations',
    type: 'operations',
    frequency: 'custom',
    lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'ready',
  },
];

const reportTemplates = [
  {
    id: 'tpl-sales',
    name: 'Sales Report',
    icon: BarChart3,
    description: 'Revenue, tickets, and performance metrics',
  },
  {
    id: 'tpl-executive',
    name: 'Executive Summary',
    icon: TrendingUp,
    description: 'High-level KPIs for leadership',
  },
  {
    id: 'tpl-lp',
    name: 'LP Analysis',
    icon: Shield,
    description: 'Risk scores and anomaly detection',
  },
  {
    id: 'tpl-labor',
    name: 'Labor Report',
    icon: Users,
    description: 'Staffing and labor cost analysis',
  },
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredReports =
    selectedType === 'all'
      ? mockReports
      : mockReports.filter((r) => r.type === selectedType);

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'sales':
        return <BarChart3 className="w-4 h-4" />;
      case 'lp':
        return <Shield className="w-4 h-4" />;
      case 'executive':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: Report['type']) => {
    switch (type) {
      case 'sales':
        return 'bg-ezra-500/10 text-ezra-500';
      case 'lp':
        return 'bg-purple-500/10 text-purple-500';
      case 'executive':
        return 'bg-amber-500/10 text-amber-500';
      default:
        return 'bg-surface-500/10 text-surface-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
            Reports
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Generate and download reports for your franchise operations
          </p>
        </div>
        <Button leftIcon={<FileText className="w-4 h-4" />}>
          Create Custom Report
        </Button>
      </div>

      {/* Report Templates */}
      <div>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Quick Generate
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                hover
                className="cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-ezra-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-ezra-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-surface-900 dark:text-surface-100">
                      {template.name}
                    </h3>
                    <p className="text-sm text-surface-500 mt-1">
                      {template.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-surface-500">Filter:</span>
        <div className="flex rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
          {['all', 'sales', 'lp', 'executive', 'operations'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors capitalize',
                selectedType === type
                  ? 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <Card padding="none">
        <div className="divide-y divide-surface-100 dark:divide-surface-800">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-4 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                  {getTypeIcon(report.type)}
                </div>
                <div>
                  <h3 className="font-medium text-surface-900 dark:text-surface-100">
                    {report.name}
                  </h3>
                  <p className="text-sm text-surface-500 mt-0.5">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                        getTypeBadgeColor(report.type)
                      )}
                    >
                      {report.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-surface-500">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(report.lastGenerated)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-surface-500 capitalize">
                      <Calendar className="w-3 h-3" />
                      {report.frequency}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {report.status === 'ready' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Download
                  </Button>
                )}
                {report.status === 'generating' && (
                  <span className="text-sm text-surface-500">Generating...</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Empty state for filtered results */}
      {filteredReports.length === 0 && (
        <Card className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-2">
            No reports found
          </h3>
          <p className="text-surface-500">
            No reports match the selected filter.
          </p>
        </Card>
      )}
    </div>
  );
}
