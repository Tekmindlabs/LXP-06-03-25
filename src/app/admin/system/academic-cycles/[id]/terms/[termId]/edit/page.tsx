'use client';

import React, { useState, useEffect } from 'react';
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
const termSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  termType: z.enum(['SEMESTER', 'TRIMESTER', 'QUARTER', 'THEME_BASED', 'CUSTOM'], {
    required_error: 'Term type is required',
  }),
  termPeriod: z.string({
    required_error: 'Term period is required',
  }),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  courseId: z.string().min(1, 'Course is required'),
});

type TermFormValues = z.infer<typeof termSchema>;

export default function EditTermPage({ params }: { params: { id: string; termId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [validPeriods, setValidPeriods] = useState<{ label: string; value: string }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Fetch academic cycle details
  const { data: academicCycle, isLoading: isLoadingCycle } = api.term.getAcademicCycle.useQuery({
    id: params.id,
  });
  
  // Fetch term details
  const { data: term, isLoading: isLoadingTerm } = api.term.getTerm.useQuery({
    id: params.termId,
  });
  
  // Fetch courses for dropdown
  const { data: courses, isLoading: isLoadingCourses } = api.term.listCourses.useQuery({
    institutionId: '1', // Replace with actual institution ID from context
    status: 'ACTIVE',
  });
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<TermFormValues>({
    resolver: zodResolver(termSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      termType: undefined,
      termPeriod: undefined,
      startDate: undefined,
      endDate: undefined,
      courseId: '',
    },
  });
  
  // Update form values when term data is loaded
  useEffect(() => {
    if (term && !isLoaded) {
      form.reset({
        code: term.code,
        name: term.name,
        description: term.description || '',
        termType: term.termType,
        termPeriod: term.termPeriod,
        startDate: new Date(term.startDate),
        endDate: new Date(term.endDate),
        courseId: term.courseId,
      });
      setIsLoaded(true);
    }
  }, [term, form, isLoaded]);
  
  // Update valid periods when term type changes
  useEffect(() => {
    const termType = form.watch('termType');
    if (!termType) return;
    
    // Define valid periods based on term type
    const periodsByType: Record<string, { label: string; value: string }[]> = {
      'SEMESTER': [
        { label: 'Fall', value: 'FALL' },
        { label: 'Spring', value: 'SPRING' },
        { label: 'Summer', value: 'SUMMER' },
        { label: 'Winter', value: 'WINTER' },
      ],
      'TRIMESTER': [
        { label: 'First Trimester', value: 'FIRST_TRIMESTER' },
        { label: 'Second Trimester', value: 'SECOND_TRIMESTER' },
        { label: 'Third Trimester', value: 'THIRD_TRIMESTER' },
      ],
      'QUARTER': [
        { label: 'First Quarter', value: 'FIRST_QUARTER' },
        { label: 'Second Quarter', value: 'SECOND_QUARTER' },
        { label: 'Third Quarter', value: 'THIRD_QUARTER' },
        { label: 'Fourth Quarter', value: 'FOURTH_QUARTER' },
      ],
      'THEME_BASED': [
        { label: 'Theme Unit', value: 'THEME_UNIT' },
      ],
      'CUSTOM': [
        { label: 'Fall', value: 'FALL' },
        { label: 'Spring', value: 'SPRING' },
        { label: 'Summer', value: 'SUMMER' },
        { label: 'Winter', value: 'WINTER' },
        { label: 'First Quarter', value: 'FIRST_QUARTER' },
        { label: 'Second Quarter', value: 'SECOND_QUARTER' },
        { label: 'Third Quarter', value: 'THIRD_QUARTER' },
        { label: 'Fourth Quarter', value: 'FOURTH_QUARTER' },
        { label: 'First Trimester', value: 'FIRST_TRIMESTER' },
        { label: 'Second Trimester', value: 'SECOND_TRIMESTER' },
        { label: 'Third Trimester', value: 'THIRD_TRIMESTER' },
        { label: 'Theme Unit', value: 'THEME_UNIT' },
      ],
    };
    
    setValidPeriods(periodsByType[termType] || []);
  }, [form.watch('termType')]);
  
  // Update term mutation
  const updateTerm = api.term.updateTerm.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Term updated successfully',
        variant: 'success',
      });
      router.push(`/admin/system/academic-cycles/${params.id}/terms/${params.termId}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update term',
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (data: TermFormValues) => {
    // Validate dates
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      form.setError('endDate', {
        type: 'manual',
        message: 'End date must be after start date',
      });
      return;
    }
    
    // Validate academic cycle dates
    if (academicCycle) {
      if (data.startDate < academicCycle.startDate) {
        form.setError('startDate', {
          type: 'manual',
          message: 'Start date cannot be before academic cycle start date',
        });
        return;
      }
      
      if (data.endDate > academicCycle.endDate) {
        form.setError('endDate', {
          type: 'manual',
          message: 'End date cannot be after academic cycle end date',
        });
        return;
      }
    }
    
    updateTerm.mutate({
      id: params.termId,
      ...data,
    });
  };
  
  const isLoading = isLoadingCycle || isLoadingTerm || isLoadingCourses;
  
  if (isLoading && !isLoaded) {
    return (
      <PageLayout
        title="Edit Term"
        description="Loading..."
        breadcrumbs={[
          { label: 'Academic Cycles', href: '/admin/system/academic-cycles' },
          { label: 'Academic Cycle', href: `/admin/system/academic-cycles/${params.id}` },
          { label: 'Terms', href: `/admin/system/academic-cycles/${params.id}/terms` },
          { label: 'Term', href: `/admin/system/academic-cycles/${params.id}/terms/${params.termId}` },
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
      title="Edit Term"
      description={`Edit term details for ${term?.name || ''}`}
      breadcrumbs={[
        { label: 'Academic Cycles', href: '/admin/system/academic-cycles' },
        { label: academicCycle?.name || 'Academic Cycle', href: `/admin/system/academic-cycles/${params.id}` },
        { label: 'Terms', href: `/admin/system/academic-cycles/${params.id}/terms` },
        { label: term?.name || 'Term', href: `/admin/system/academic-cycles/${params.id}/terms/${params.termId}` },
        { label: 'Edit', href: '#' },
      ]}
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/system/academic-cycles/${params.id}/terms/${params.termId}`)}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Term
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Term Details</CardTitle>
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
                  placeholder="e.g., FALL-2023"
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
                  placeholder="e.g., Fall Semester 2023"
                  {...form.register('name')}
                  error={form.formState.errors.name?.message}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="termType" className="text-sm font-medium">
                  Term Type <span className="text-red-500">*</span>
                </label>
                <Select
                  id="termType"
                  placeholder="Select term type"
                  options={[
                    { label: 'Semester', value: 'SEMESTER' },
                    { label: 'Trimester', value: 'TRIMESTER' },
                    { label: 'Quarter', value: 'QUARTER' },
                    { label: 'Theme Based', value: 'THEME_BASED' },
                    { label: 'Custom', value: 'CUSTOM' },
                  ]}
                  value={form.watch('termType')}
                  onChange={(value) => form.setValue('termType', value as any)}
                  error={form.formState.errors.termType?.message}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="termPeriod" className="text-sm font-medium">
                  Term Period <span className="text-red-500">*</span>
                </label>
                <Select
                  id="termPeriod"
                  placeholder="Select term period"
                  options={validPeriods}
                  value={form.watch('termPeriod')}
                  onChange={(value) => form.setValue('termPeriod', value)}
                  error={form.formState.errors.termPeriod?.message}
                  disabled={!form.watch('termType') || validPeriods.length === 0}
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
                  minDate={academicCycle?.startDate}
                  maxDate={academicCycle?.endDate}
                />
                {academicCycle && (
                  <p className="text-xs text-gray-500">
                    Must be between {new Date(academicCycle.startDate).toLocaleDateString()} and {new Date(academicCycle.endDate).toLocaleDateString()}
                  </p>
                )}
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
                  minDate={form.watch('startDate') || academicCycle?.startDate}
                  maxDate={academicCycle?.endDate}
                />
                {academicCycle && (
                  <p className="text-xs text-gray-500">
                    Must be between start date and {new Date(academicCycle.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="courseId" className="text-sm font-medium">
                  Course <span className="text-red-500">*</span>
                </label>
                <Select
                  id="courseId"
                  placeholder={isLoadingCourses ? 'Loading courses...' : 'Select course'}
                  options={courses?.map(course => ({
                    label: `${course.code} - ${course.name}`,
                    value: course.id,
                  })) || []}
                  value={form.watch('courseId')}
                  onChange={(value) => form.setValue('courseId', value)}
                  error={form.formState.errors.courseId?.message}
                  disabled={isLoadingCourses}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Enter a description for this term"
                  {...form.register('description')}
                  error={form.formState.errors.description?.message}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/system/academic-cycles/${params.id}/terms/${params.termId}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateTerm.isLoading}
              >
                {updateTerm.isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  );
} 