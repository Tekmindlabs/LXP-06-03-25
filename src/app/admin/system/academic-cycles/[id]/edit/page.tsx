'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/data-display/card';
import { Input } from '@/components/ui/forms/input';
import { DatePicker } from '@/components/ui/forms/date-picker';
import { Select } from '@/components/ui/forms/select';
import { Textarea } from '@/components/ui/forms/textarea';
import { api } from '@/trpc/react';
import { useToast } from '@/components/ui/feedback/toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon } from 'lucide-react';

// Define the form schema using Zod
const academicCycleSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['ANNUAL', 'SEMESTER', 'TRIMESTER', 'QUARTER', 'CUSTOM'], {
    required_error: 'Type is required',
  }),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
});

type AcademicCycleFormValues = z.infer<typeof academicCycleSchema>;

export default function EditAcademicCyclePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Fetch academic cycle details
  const { data: academicCycle, isLoading } = api.term.getAcademicCycle.useQuery({
    id: params.id,
  });
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<AcademicCycleFormValues>({
    resolver: zodResolver(academicCycleSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      type: undefined,
      startDate: undefined,
      endDate: undefined,
    },
  });
  
  // Update form values when academic cycle data is loaded
  useEffect(() => {
    if (academicCycle && !isLoaded) {
      form.reset({
        code: academicCycle.code,
        name: academicCycle.name,
        description: academicCycle.description || '',
        type: academicCycle.type,
        startDate: new Date(academicCycle.startDate),
        endDate: new Date(academicCycle.endDate),
      });
      setIsLoaded(true);
    }
  }, [academicCycle, form, isLoaded]);
  
  // Update academic cycle mutation
  const updateAcademicCycle = api.term.updateAcademicCycle.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Academic cycle updated successfully',
        variant: 'success',
      });
      router.push(`/admin/system/academic-cycles/${params.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update academic cycle',
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (data: AcademicCycleFormValues) => {
    // Validate dates
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      form.setError('endDate', {
        type: 'manual',
        message: 'End date must be after start date',
      });
      return;
    }
    
    updateAcademicCycle.mutate({
      id: params.id,
      ...data,
    });
  };
  
  if (isLoading && !isLoaded) {
    return (
      <PageLayout
        title="Edit Academic Cycle"
        description="Loading..."
        breadcrumbs={[
          { label: 'Academic Cycles', href: '/admin/system/academic-cycles' },
          { label: 'Academic Cycle', href: `/admin/system/academic-cycles/${params.id}` },
          { label: 'Edit', href: '#' },
        ]}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout
      title="Edit Academic Cycle"
      description={`Edit details for ${academicCycle?.name || ''}`}
      breadcrumbs={[
        { label: 'Academic Cycles', href: '/admin/system/academic-cycles' },
        { label: academicCycle?.name || 'Academic Cycle', href: `/admin/system/academic-cycles/${params.id}` },
        { label: 'Edit', href: '#' },
      ]}
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/system/academic-cycles/${params.id}`)}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Academic Cycle
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Academic Cycle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Code <span className="text-red-500">*</span>
                </label>
                <Input
                  id="code"
                  placeholder="e.g., AY-2023-24"
                  {...form.register('code')}
                  error={form.formState.errors.code?.message}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  placeholder="e.g., Academic Year 2023-2024"
                  {...form.register('name')}
                  error={form.formState.errors.name?.message}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Type <span className="text-red-500">*</span>
                </label>
                <Select
                  id="type"
                  placeholder="Select type"
                  options={[
                    { label: 'Annual', value: 'ANNUAL' },
                    { label: 'Semester', value: 'SEMESTER' },
                    { label: 'Trimester', value: 'TRIMESTER' },
                    { label: 'Quarter', value: 'QUARTER' },
                    { label: 'Custom', value: 'CUSTOM' },
                  ]}
                  value={form.watch('type')}
                  onChange={(value) => form.setValue('type', value as any)}
                  error={form.formState.errors.type?.message}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  id="startDate"
                  placeholder="Select start date"
                  value={form.watch('startDate')}
                  onChange={(date) => form.setValue('startDate', date)}
                  error={form.formState.errors.startDate?.message}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium">
                  End Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  id="endDate"
                  placeholder="Select end date"
                  value={form.watch('endDate')}
                  onChange={(date) => form.setValue('endDate', date)}
                  error={form.formState.errors.endDate?.message}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Enter a description for this academic cycle"
                  {...form.register('description')}
                  error={form.formState.errors.description?.message}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/system/academic-cycles/${params.id}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateAcademicCycle.isLoading}
              >
                {updateAcademicCycle.isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  );
}