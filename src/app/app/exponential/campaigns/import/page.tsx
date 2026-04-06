'use client';

// ===========================================
// EZRA PORTAL - Guest Import Page
// ===========================================

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Upload,
  Download,
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Phone,
  Mail,
  Trash2,
  RefreshCw,
  Info,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatNumber } from '@/lib/formatters';

// ============ Types ============
interface ImportedGuest {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  locationCode: string;
  segment: string;
  isValid: boolean;
  errors: string[];
}

interface ImportStats {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
}

// ============ CSV Template ============
const CSV_TEMPLATE = `first_name,last_name,phone,email,location_code,segment
John,Smith,+15551234567,john.smith@email.com,MN-001,6-week
Jane,Doe,+15559876543,jane.doe@email.com,MN-002,4-week
Bob,Johnson,+15555551234,bob.j@email.com,TX-001,8-week`;

const CSV_HEADERS = ['first_name', 'last_name', 'phone', 'email', 'location_code', 'segment'];

// ============ Helper Functions ============
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function validatePhone(phone: string): boolean {
  // Basic phone validation - accepts various formats
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

function validateEmail(email: string): boolean {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateSegment(segment: string): boolean {
  const validSegments = ['4-week', '6-week', '8-week', ''];
  return validSegments.includes(segment.toLowerCase());
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return phone.startsWith('+') ? phone : `+${cleaned}`;
}

function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = lines.slice(1).map(line => {
    // Handle quoted values with commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  });
  
  return { headers, rows };
}

function validateGuest(row: string[], headers: string[]): ImportedGuest {
  const getValue = (key: string) => {
    const index = headers.indexOf(key);
    return index >= 0 ? row[index] || '' : '';
  };

  const firstName = getValue('first_name');
  const lastName = getValue('last_name');
  const phone = getValue('phone');
  const email = getValue('email');
  const locationCode = getValue('location_code');
  const segment = getValue('segment');

  const errors: string[] = [];

  if (!firstName.trim()) errors.push('First name is required');
  if (!phone.trim()) errors.push('Phone number is required');
  else if (!validatePhone(phone)) errors.push('Invalid phone number format');
  if (email && !validateEmail(email)) errors.push('Invalid email format');
  if (segment && !validateSegment(segment)) errors.push('Invalid segment (use 4-week, 6-week, or 8-week)');

  return {
    id: generateId(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phone: normalizePhone(phone.trim()),
    email: email.trim(),
    locationCode: locationCode.trim(),
    segment: segment.trim().toLowerCase(),
    isValid: errors.length === 0,
    errors,
  };
}

// ============ Guest Row Component ============
interface GuestRowProps {
  guest: ImportedGuest;
  onRemove: (id: string) => void;
}

const GuestRow: React.FC<GuestRowProps> = ({ guest, onRemove }) => (
  <div className={cn(
    'grid grid-cols-12 gap-4 px-4 py-3 border-b border-surface-100 dark:border-surface-800 last:border-0',
    !guest.isValid && 'bg-danger-500/5'
  )}>
    <div className="col-span-2 flex items-center gap-2">
      {guest.isValid ? (
        <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-danger-500 flex-shrink-0" />
      )}
      <span className="text-sm text-surface-900 dark:text-surface-100 truncate">
        {guest.firstName} {guest.lastName}
      </span>
    </div>
    <div className="col-span-2 flex items-center">
      <span className="text-sm text-surface-600 dark:text-surface-400 font-mono">
        {guest.phone}
      </span>
    </div>
    <div className="col-span-3 flex items-center">
      <span className="text-sm text-surface-600 dark:text-surface-400 truncate">
        {guest.email || '—'}
      </span>
    </div>
    <div className="col-span-1 flex items-center">
      <span className="text-sm text-surface-600 dark:text-surface-400">
        {guest.locationCode || '—'}
      </span>
    </div>
    <div className="col-span-1 flex items-center">
      {guest.segment ? (
        <span className={cn(
          'px-2 py-0.5 rounded text-xs font-medium',
          guest.segment === '4-week' ? 'bg-success-500/10 text-success-500' :
          guest.segment === '6-week' ? 'bg-warning-500/10 text-warning-500' :
          'bg-danger-500/10 text-danger-500'
        )}>
          {guest.segment}
        </span>
      ) : (
        <span className="text-surface-400">—</span>
      )}
    </div>
    <div className="col-span-2 flex items-center">
      {!guest.isValid && (
        <span className="text-xs text-danger-500 truncate" title={guest.errors.join(', ')}>
          {guest.errors[0]}
        </span>
      )}
    </div>
    <div className="col-span-1 flex items-center justify-end">
      <button
        onClick={() => onRemove(guest.id)}
        className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
      >
        <Trash2 className="w-4 h-4 text-surface-400 hover:text-danger-500" />
      </button>
    </div>
  </div>
);

// ============ Main Component ============
export default function GuestImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [guests, setGuests] = useState<ImportedGuest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importComplete, setImportComplete] = useState(false);

  // Calculate stats
  const stats: ImportStats = {
    total: guests.length,
    valid: guests.filter(g => g.isValid).length,
    invalid: guests.filter(g => !g.isValid).length,
    duplicates: 0, // Could implement phone deduplication
  };

  // Download template
  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ezra-guest-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Process file
  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const { headers, rows } = parseCSV(content);

        // Validate headers
        const missingHeaders = CSV_HEADERS.filter(h => !headers.includes(h) && h !== 'email' && h !== 'location_code' && h !== 'segment');
        if (missingHeaders.length > 0) {
          alert(`Missing required columns: ${missingHeaders.join(', ')}`);
          setIsProcessing(false);
          return;
        }

        // Process rows
        const importedGuests = rows
          .filter(row => row.some(cell => cell.trim())) // Skip empty rows
          .map(row => validateGuest(row, headers));

        setGuests(importedGuests);
        setImportComplete(false);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  }, []);

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Remove guest
  const handleRemoveGuest = (id: string) => {
    setGuests(prev => prev.filter(g => g.id !== id));
  };

  // Clear all
  const handleClearAll = () => {
    setGuests([]);
    setImportComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit import
  const handleImport = async () => {
    const validGuests = guests.filter(g => g.isValid);
    if (validGuests.length === 0) {
      alert('No valid guests to import');
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setImportComplete(true);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/app/exponential/campaigns"
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-surface-500" />
          </Link>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
              Import Guests
            </h1>
            <p className="text-surface-500 dark:text-surface-400">
              Upload a CSV file to import guests for campaigns
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownloadTemplate}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Download Template
        </Button>
      </div>

      {/* Template Info */}
      <Card className="bg-ezra-500/5 border-ezra-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-ezra-500/10 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-ezra-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">
              CSV Template Format
            </h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 mb-3">
              Download the template and fill in your guest data. Required fields are marked with *.
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-surface-700 dark:text-surface-300">Required Fields</p>
                <ul className="mt-1 space-y-1 text-surface-500">
                  <li>• <code className="text-xs bg-surface-100 dark:bg-surface-800 px-1 rounded">first_name</code> *</li>
                  <li>• <code className="text-xs bg-surface-100 dark:bg-surface-800 px-1 rounded">phone</code> *</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-surface-700 dark:text-surface-300">Optional Fields</p>
                <ul className="mt-1 space-y-1 text-surface-500">
                  <li>• <code className="text-xs bg-surface-100 dark:bg-surface-800 px-1 rounded">last_name</code></li>
                  <li>• <code className="text-xs bg-surface-100 dark:bg-surface-800 px-1 rounded">email</code></li>
                  <li>• <code className="text-xs bg-surface-100 dark:bg-surface-800 px-1 rounded">location_code</code></li>
                  <li>• <code className="text-xs bg-surface-100 dark:bg-surface-800 px-1 rounded">segment</code></li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-surface-700 dark:text-surface-300">Phone Format</p>
                <ul className="mt-1 space-y-1 text-surface-500">
                  <li>• +15551234567</li>
                  <li>• 5551234567</li>
                  <li>• (555) 123-4567</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Upload Area */}
      {guests.length === 0 && (
        <Card
          className={cn(
            'border-2 border-dashed transition-colors cursor-pointer',
            isDragging
              ? 'border-ezra-500 bg-ezra-500/5'
              : 'border-surface-300 dark:border-surface-600 hover:border-surface-400 dark:hover:border-surface-500'
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="py-12 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className={cn(
              'w-12 h-12 mx-auto mb-4',
              isDragging ? 'text-ezra-500' : 'text-surface-400'
            )} />
            <p className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-1">
              {isDragging ? 'Drop your file here' : 'Drag and drop your CSV file'}
            </p>
            <p className="text-surface-500">
              or <span className="text-ezra-500 font-medium">click to browse</span>
            </p>
            <p className="text-xs text-surface-400 mt-4">
              Supports .csv files up to 10MB
            </p>
          </div>
        </Card>
      )}

      {/* Processing State */}
      {isProcessing && (
        <Card>
          <div className="py-12 text-center">
            <RefreshCw className="w-8 h-8 text-ezra-500 mx-auto mb-4 animate-spin" />
            <p className="text-surface-600 dark:text-surface-400">Processing your file...</p>
          </div>
        </Card>
      )}

      {/* Import Complete */}
      {importComplete && (
        <Card className="bg-success-500/5 border-success-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success-500/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100">
                Import Successful!
              </h3>
              <p className="text-surface-500 dark:text-surface-400">
                {stats.valid} guests have been imported and are ready for campaigns.
              </p>
            </div>
            <div className="ml-auto flex gap-3">
              <Button variant="secondary" onClick={handleClearAll}>
                Import More
              </Button>
              <Link href="/app/exponential/campaigns/new">
                <Button>Create Campaign</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Preview Table */}
      {guests.length > 0 && !importComplete && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                  <Users className="w-5 h-5 text-surface-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                    {formatNumber(stats.total)}
                  </p>
                  <p className="text-sm text-surface-500">Total Rows</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-success-500">
                    {formatNumber(stats.valid)}
                  </p>
                  <p className="text-sm text-surface-500">Valid</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-danger-500/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-danger-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-danger-500">
                    {formatNumber(stats.invalid)}
                  </p>
                  <p className="text-sm text-surface-500">Invalid</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-warning-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-warning-500">
                    {formatNumber(stats.duplicates)}
                  </p>
                  <p className="text-sm text-surface-500">Duplicates</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Guest Table */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
              <h3 className="text-heading-sm text-surface-900 dark:text-surface-100">
                Preview Import
              </h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearAll}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Clear All
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Upload New File
                </Button>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-800/50 text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100 dark:border-surface-800">
              <div className="col-span-2">Name</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-1">Location</div>
              <div className="col-span-1">Segment</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Body */}
            <div className="max-h-[400px] overflow-y-auto">
              {guests.map((guest) => (
                <GuestRow
                  key={guest.id}
                  guest={guest}
                  onRemove={handleRemoveGuest}
                />
              ))}
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50 flex items-center justify-between">
              <p className="text-sm text-surface-500">
                {stats.invalid > 0 && (
                  <span className="text-warning-500">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    {stats.invalid} rows have errors and will be skipped
                  </span>
                )}
              </p>
              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={handleClearAll}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={stats.valid === 0 || isProcessing}
                  leftIcon={isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                >
                  {isProcessing ? 'Importing...' : `Import ${stats.valid} Guests`}
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Help Section */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-surface-500" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">
              Tips for Successful Imports
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-surface-500 dark:text-surface-400">
              <li>• Make sure your CSV has headers in the first row</li>
              <li>• Phone numbers should include country code or be 10 digits (US)</li>
              <li>• Valid segments are: <code className="bg-surface-100 dark:bg-surface-800 px-1 rounded">4-week</code>, <code className="bg-surface-100 dark:bg-surface-800 px-1 rounded">6-week</code>, <code className="bg-surface-100 dark:bg-surface-800 px-1 rounded">8-week</code></li>
              <li>• Location codes should match your Zenoti store codes (e.g., MN-001)</li>
              <li>• Remove any duplicate phone numbers before importing</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
