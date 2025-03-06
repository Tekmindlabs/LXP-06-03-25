'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/data-display/card';
import { Input } from '@/components/ui/input';
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

export default function CreateAcademicCyclePage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<AcademicCycleFormValues>({
    resolver: zodResolver(academicCycleSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      type: 'ANNUAL',
      startDate: undefined,
      endDate: undefined,
    },
  });
  
  // Mock create academic cycle mutation
  const createAcademicCycle = {
    mutate: (data: AcademicCycleFormValues & { institutionId: string, createdBy: string }) => {
      addToast({
        title: 'Success',
        description: 'Academic cycle created successfully',
        variant: 'success',
      });
      router.push('/admin/system/academic-cycles');
    },
    isLoading: false,
  };
  
  const onSubmit = (data: AcademicCycleFormValues) => {
    // Validate dates
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      form.setError('endDate', {
        type: 'manual',
        message: 'End date must be after start date',
      });
      return;
    }
    
    createAcademicCycle.mutate({
      ...data,
      institutionId: '1', // Replace with actual institution ID from context
      createdBy: 'current-user-id', // Replace with actual user ID from context
    });
  };
  
  return (
    <PageLayout
      title="Create Academic Cycle"
      description="Create a new academic cycle for your institution"
      breadcrumbs={[
        { label: 'Academic Cycles', href: '/admin/system/academic-cycles' },
        { label: 'Create', href: '#' },
      ]}
      actions={
        <Button
          variant="outline"
          onClick={() => router.push('/admin/system/academic-cycles')}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Academic Cycles
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
                />
                {form.formState.errors.code && (
                  <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  placeholder="e.g., Academic Year 2023-2024"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.watch('type')}
                  onChange={(e) => form.setValue('type', e.target.value as any)}
                >
                  <option value="ANNUAL">Annual</option>
                  <option value="SEMESTER">Semester</option>
                  <option value="TRIMESTER">Trimester</option>
                  <option value="QUARTER">Quarter</option>
                  <option value="CUSTOM">Custom</option>
                </select>
                {form.formState.errors.type && (
                  <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.watch('startDate') ? form.watch('startDate').toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    form.setValue('startDate', date as any);
                  }}
                />
                {form.formState.errors.startDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.startDate.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium">
                  End Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.watch('endDate') ? form.watch('endDate').toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    form.setValue('endDate', date as any);
                  }}
                />
                {form.formState.errors.endDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.endDate.message}</p>
                )}
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Enter a description for this academic cycle"
                  {...form.register('description')}
                ></textarea>
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/system/academic-cycles')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAcademicCycle.isLoading}
              >
                {createAcademicCycle.isLoading ? 'Creating...' : 'Create Academic Cycle'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  );
} 