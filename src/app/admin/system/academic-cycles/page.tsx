'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/data-table';
import { DatePicker } from '@/components/ui/forms/date-picker';
import { Select } from '@/components/ui/forms/select';
import { Input } from '@/components/ui/input';
import { api } from '@/trpc/react';
import { formatDate } from '@/lib/utils';
import { PlusIcon, FilterIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/alert';

// Define column types for DataTable
type AcademicCycle = {
  id: string;
  code: string;
  name: string;
  type: string;
  startDate: Date;
  endDate: Date;
  status: string;
};

const ACADEMIC_ROUTES = {
  PROGRAMS: '/admin/system/academic/programs',
  CYCLES: '/admin/system/academic/cycles',
  TERMS: '/admin/system/academic/terms',
} as const;

export default function AcademicCyclesPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Check if user has access to this page
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we load your profile.</p>
        </div>
      </div>
    );
  }

  if (user.userType !== 'SYSTEM_ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <h2 className="font-semibold">Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </Alert>
      </div>
    );
  }
  
  // Define filters state with proper typing
  const [filters, setFilters] = useState<{
    type: string | undefined;
    status: string | undefined;
    startDate: Date | undefined;
    endDate: Date | undefined;
    searchQuery: string;
  }>({
    type: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    searchQuery: '',
  });
  
  // Fetch academic cycles with filters
  const { data: academicCycles = [], isLoading, error } = api.academicCycle.list.useQuery({
    institutionId: user?.institutionId || '',
    campusId: user?.primaryCampusId || undefined,
  }, {
    enabled: !!user?.institutionId,
    onSuccess: (data) => {
      console.log('Raw API Response:', {
        type: typeof data,
        isArray: Array.isArray(data),
        length: data?.length,
        firstItem: data?.[0],
      });
    },
    onError: (err) => {
      console.error('Error fetching academic cycles:', err);
    }
  });

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <h2 className="font-semibold">Error</h2>
          <p>{error.message}</p>
        </Alert>
      </div>
    );
  }

  // Filter academic cycles based on local filters
  const filteredData = React.useMemo(() => {
    if (!Array.isArray(academicCycles)) {
      console.warn('academicCycles is not an array:', academicCycles);
      return [];
    }

    console.log('Processing academic cycles:', {
      total: academicCycles.length,
      filters: filters
    });

    return academicCycles.filter(cycle => {
      // Skip invalid cycles
      if (!cycle || typeof cycle !== 'object') {
        console.warn('Invalid cycle object:', cycle);
        return false;
      }

      if (filters.type && cycle.type !== filters.type) return false;
      if (filters.status && cycle.status !== filters.status) return false;
      if (filters.startDate && new Date(cycle.startDate) < filters.startDate) return false;
      if (filters.endDate && new Date(cycle.endDate) > filters.endDate) return false;
      if (filters.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        return (
          cycle.code?.toLowerCase().includes(search) ||
          cycle.name?.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [academicCycles, filters]);
  
  const columns = [
    {
      accessorKey: 'code',
      header: 'Code',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: { row: { original: AcademicCycle } }) => {
        const type = row.original.type;
        return <span className="capitalize">{type.toLowerCase()}</span>;
      },
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }: { row: { original: AcademicCycle } }) => formatDate(row.original.startDate),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }: { row: { original: AcademicCycle } }) => formatDate(row.original.endDate),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: AcademicCycle } }) => {
        const status = row.original.status;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' :
            status === 'ARCHIVED' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: AcademicCycle } }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => router.push(`/admin/system/academic-cycles/${row.original.id}`)}
          >
            View
          </Button>
        );
      },
    },
  ];
  
  return (
    <PageLayout
      title="Academic Cycles"
      description="Manage academic cycles for your institution"
      actions={
        <Button onClick={() => router.push(ACADEMIC_ROUTES.PROGRAMS)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Academic Cycle
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <FilterIcon className="mr-2 h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <div className="w-32">
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
            >
              <option value="">Type</option>
              <option value="ANNUAL">Annual</option>
              <option value="SEMESTER">Semester</option>
              <option value="TRIMESTER">Trimester</option>
              <option value="QUARTER">Quarter</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
          
          <div className="w-32">
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
            >
              <option value="">Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          
          <div className="w-40">
            <Input
              type="date"
              className="w-full"
              value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                setFilters({ ...filters, startDate: date });
              }}
              placeholder="Start Date"
            />
          </div>
          
          <div className="w-40">
            <Input
              type="date"
              className="w-full"
              value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                setFilters({ ...filters, endDate: date });
              }}
              placeholder="End Date"
            />
          </div>
          
          <Input
            placeholder="Search..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-64"
          />
          
          <Button variant="outline" onClick={() => setFilters({
            type: undefined,
            status: undefined,
            startDate: undefined,
            endDate: undefined,
            searchQuery: '',
          })}>
            Clear
          </Button>
        </div>
        
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          defaultSort={{ id: 'startDate', desc: true }}
          pageSize={10}
          enableSorting
          enablePagination
          emptyMessage={
            isLoading 
              ? "Loading academic cycles..." 
              : filteredData.length === 0 && academicCycles.length > 0
                ? "No results match your filters"
                : "No academic cycles found"
          }
        />
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Debug Info:</h3>
            <div className="space-y-2 text-xs">
              <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
              <div>Total Cycles: {academicCycles?.length || 0}</div>
              <div>Filtered Cycles: {filteredData?.length || 0}</div>
              <div>Active Filters: {Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '').length}</div>
              <pre className="mt-2 p-2 bg-white rounded">
                {JSON.stringify({ filters, firstCycle: academicCycles?.[0] }, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
} 
