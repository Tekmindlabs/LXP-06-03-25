'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/data-display/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/atoms/badge';
import { api } from '@/trpc/react';
import { useToast } from '@/components/ui/feedback/toast';
import { formatDate } from '@/lib/utils';
import { EditIcon, CalendarIcon, TrashIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { Dialog } from '@/components/ui/feedback/dialog';

// Define term type for type safety
interface Term {
  id: string;
  code: string;
  name: string;
  termType: string;
  termPeriod: string;
  startDate: Date;
  endDate: Date;
  status: string;
  academicCycleId: string;
  courseId: string;
}

export default function AcademicCycleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string | null>(null);
  
  // Fetch academic cycle details
  const { data: academicCycle, isLoading, error, refetch } = api.term.getAcademicCycle.useQuery({
    id: params.id,
  });
  
  // Fetch terms for this academic cycle
  const { data: terms } = api.term.listByAcademicCycle.useQuery({
    academicCycleId: params.id,
  }, {
    enabled: !!params.id,
  });
  
  // Delete academic cycle mutation
  const deleteAcademicCycle = api.term.deleteAcademicCycle.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Academic cycle deleted successfully',
        variant: 'success',
      });
      router.push('/admin/system/academic-cycles');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete academic cycle',
        variant: 'destructive',
      });
    },
  });
  
  // Update academic cycle status mutation
  const updateAcademicCycleStatus = api.term.updateAcademicCycleStatus.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Academic cycle status updated to ${newStatus}`,
        variant: 'success',
      });
      setIsStatusDialogOpen(false);
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update academic cycle status',
        variant: 'destructive',
      });
    },
  });
  
  const handleDelete = () => {
    deleteAcademicCycle.mutate({ id: params.id });
  };
  
  const handleStatusChange = (status: string) => {
    setNewStatus(status);
    setIsStatusDialogOpen(true);
  };
  
  const confirmStatusChange = () => {
    if (newStatus) {
      updateAcademicCycleStatus.mutate({
        id: params.id,
        status: newStatus,
      });
    }
  };
  
  if (isLoading) {
    return (
      <PageLayout
        title="Academic Cycle Details"
        description="Loading..."
        breadcrumbs={[
          { label: 'Academic Cycles', href: '/admin/system/academic-cycles' },
          { label: 'Details', href: '#' },
        ]}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }
  
  if (error || !academicCycle) {
    return (
      <PageLayout
        title="Error"
        description="Failed to load academic cycle details"
        breadcrumbs={[
          { label: 'Academic Cycles', href: '/admin/system/academic-cycles' },
          { label: 'Error', href: '#' },
        ]}
      >
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error?.message || 'Academic cycle not found'}
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout
      title={academicCycle.name}
      description={`Academic Cycle: ${academicCycle.code}`}
      breadcrumbs={[
        { label: 'Academic Cycles', href: '/admin/system/academic-cycles' },
        { label: academicCycle.name, href: '#' },
      ]}
      actions={
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/system/academic-cycles/${params.id}/edit`)}
          >
            <EditIcon className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/system/academic-cycles/${params.id}/terms`)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Manage Terms
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Academic Cycle Information</CardTitle>
              <Badge
                variant={
                  academicCycle.status === 'ACTIVE' ? 'success' :
                  academicCycle.status === 'INACTIVE' ? 'warning' :
                  academicCycle.status === 'ARCHIVED' ? 'secondary' :
                  'destructive'
                }
              >
                {academicCycle.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Code</h3>
                <p className="mt-1">{academicCycle.code}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1">{academicCycle.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Type</h3>
                <p className="mt-1 capitalize">{academicCycle.type.toLowerCase()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                <p className="mt-1">{academicCycle.duration} months</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                <p className="mt-1">{formatDate(academicCycle.startDate)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                <p className="mt-1">{formatDate(academicCycle.endDate)}</p>
              </div>
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{academicCycle.description || 'No description provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => handleStatusChange('ACTIVE')}
                disabled={academicCycle.status === 'ACTIVE'}
              >
                <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />
                Set as Active
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('INACTIVE')}
                disabled={academicCycle.status === 'INACTIVE'}
              >
                <XCircleIcon className="mr-2 h-4 w-4 text-yellow-500" />
                Set as Inactive
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('ARCHIVED')}
                disabled={academicCycle.status === 'ARCHIVED'}
              >
                <ClockIcon className="mr-2 h-4 w-4 text-gray-500" />
                Archive
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="terms">
          <TabsList>
            <TabsTrigger value="terms">Terms ({terms?.items?.length || 0})</TabsTrigger>
            <TabsTrigger value="events">Academic Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="terms" className="mt-4">
            {terms?.items && terms.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {terms.items.map((term: Term) => (
                  <Card key={term.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/system/academic-cycles/${params.id}/terms/${term.id}`)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{term.name}</CardTitle>
                        <Badge
                          variant={
                            term.status === 'ACTIVE' ? 'success' :
                            term.status === 'INACTIVE' ? 'warning' :
                            term.status === 'ARCHIVED' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {term.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-500">Code: {term.code}</p>
                      <p className="text-sm text-gray-500">Type: {term.termType}</p>
                      <p className="text-sm text-gray-500">Period: {term.termPeriod}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDate(term.startDate)} - {formatDate(term.endDate)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">No terms found</h3>
                <p className="mt-2 text-gray-500">Get started by creating a term for this academic cycle.</p>
                <Button 
                  className="mt-4"
                  onClick={() => router.push(`/admin/system/academic-cycles/${params.id}/terms/create`)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Add Term
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="events" className="mt-4">
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Academic Events</h3>
              <p className="mt-2 text-gray-500">Manage academic events for this cycle.</p>
              <Button 
                className="mt-4"
                onClick={() => router.push(`/admin/system/calendar`)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Manage Calendar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Academic Cycle"
        description="Are you sure you want to delete this academic cycle? This action cannot be undone."
        actions={
          <>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      />
      
      {/* Status Change Dialog */}
      <Dialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        title={`Change Status to ${newStatus}`}
        description={`Are you sure you want to change the status of this academic cycle to ${newStatus}?`}
        actions={
          <>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={confirmStatusChange}>
              Confirm
            </Button>
          </>
        }
      />
    </PageLayout>
  );
} 