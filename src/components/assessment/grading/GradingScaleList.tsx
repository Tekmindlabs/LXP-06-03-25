'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/trpc/react';
import { toast } from 'react-hot-toast';
import { SystemStatus, GradingScale } from '@/server/api/constants';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

interface GradingScaleRow {
  id: string;
  name: string;
  type: GradingScale;
  status: SystemStatus;
  minScore: number;
  maxScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export const GradingScaleList = () => {
  const router = useRouter();

  const { data: gradingScales, isLoading } = api.grading.listScales.useQuery();

  const deleteScale = api.grading.deleteScale.useMutation({
    onSuccess: () => {
      toast.success('Grading scale deleted successfully');
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to delete grading scale: ${error.message}`);
    }
  });

  const columns: ColumnDef<GradingScaleRow>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue('type')}
        </Badge>
      ),
    },
    {
      accessorKey: 'minScore',
      header: 'Min Score',
    },
    {
      accessorKey: 'maxScore',
      header: 'Max Score',
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
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/assessment/grading-scales/${row.original.id}`)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteScale.mutate({ id: row.original.id })}
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
        <CardTitle>Grading Scales</CardTitle>
        <Button
          onClick={() => router.push('/assessment/grading-scales/new')}
        >
          Add Scale
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={gradingScales || []}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default GradingScaleList; 