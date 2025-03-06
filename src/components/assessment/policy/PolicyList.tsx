'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/atoms/button';
import { DataTable } from '@/components/ui/data-display/data-table';
import { Badge } from '@/components/ui/atoms/badge';
import { api } from '@/trpc/react';
import { toast } from 'react-hot-toast';
import { SystemStatus } from '@/server/api/constants';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

interface PolicyRow {
  id: string;
  name: string;
  description: string;
  status: SystemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const PolicyList = () => {
  const router = useRouter();

  const { data: policies, isLoading } = api.policy.listPolicies.useQuery();

  const deletePolicy = api.policy.deletePolicy.useMutation({
    onSuccess: () => {
      toast.success('Assessment policy deleted successfully');
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to delete assessment policy: ${error.message}`);
    }
  });

  const columns: ColumnDef<PolicyRow>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('status') === SystemStatus.ACTIVE ? 'success' : 'secondary'}>
          {row.getValue('status')}
        </Badge>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => new Date(row.getValue('updatedAt')).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/assessment/policies/${row.original.id}`)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deletePolicy.mutate({ id: row.original.id })}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Assessment Policies</CardTitle>
        <Button
          onClick={() => router.push('/assessment/policies/new')}
        >
          Add Policy
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={policies || []}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default PolicyList; 