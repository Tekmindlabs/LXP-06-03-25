'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/forms/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/forms/select';
import { api } from '@/trpc/react';
import { toast } from 'react-hot-toast';
import { SystemStatus, GradingScale } from '@/server/api/constants';
import { useRouter } from 'next/navigation';

const gradingScaleSchema = z.object({
  name: z.string().min(1, "Scale name is required").max(100, "Scale name must be less than 100 characters"),
  type: z.nativeEnum(GradingScale),
  minScore: z.number().min(0, "Minimum score must be non-negative"),
  maxScore: z.number().min(0, "Maximum score must be non-negative"),
  status: z.nativeEnum(SystemStatus).default(SystemStatus.ACTIVE),
  ranges: z.array(z.object({
    grade: z.string(),
    minScore: z.number(),
    maxScore: z.number(),
    gpaValue: z.number().optional(),
  })).min(1, "At least one grade range is required"),
});

type GradingScaleFormValues = z.infer<typeof gradingScaleSchema>;

interface GradingScaleFormProps {
  initialData?: GradingScaleFormValues;
  scaleId?: string;
}

export const GradingScaleForm: React.FC<GradingScaleFormProps> = ({
  initialData,
  scaleId
}) => {
  const router = useRouter();
  const isEditing = Boolean(scaleId);

  const form = useForm<GradingScaleFormValues>({
    resolver: zodResolver(gradingScaleSchema),
    defaultValues: initialData || {
      name: '',
      type: GradingScale.PERCENTAGE,
      minScore: 0,
      maxScore: 100,
      status: SystemStatus.ACTIVE,
      ranges: [
        { grade: 'A', minScore: 90, maxScore: 100, gpaValue: 4.0 },
        { grade: 'B', minScore: 80, maxScore: 89, gpaValue: 3.0 },
        { grade: 'C', minScore: 70, maxScore: 79, gpaValue: 2.0 },
        { grade: 'D', minScore: 60, maxScore: 69, gpaValue: 1.0 },
        { grade: 'F', minScore: 0, maxScore: 59, gpaValue: 0.0 },
      ],
    }
  });

  const createScale = api.grading.createScale.useMutation({
    onSuccess: () => {
      toast.success('Grading scale created successfully');
      router.push('/assessment/grading-scales');
    },
    onError: (error) => {
      toast.error(`Failed to create grading scale: ${error.message}`);
    }
  });

  const updateScale = api.grading.updateScale.useMutation({
    onSuccess: () => {
      toast.success('Grading scale updated successfully');
      router.push('/assessment/grading-scales');
    },
    onError: (error) => {
      toast.error(`Failed to update grading scale: ${error.message}`);
    }
  });

  const onSubmit = async (data: GradingScaleFormValues) => {
    try {
      if (isEditing) {
        await updateScale.mutateAsync({ id: scaleId, ...data });
      } else {
        await createScale.mutateAsync(data);
      }
    } catch (error) {
      console.error('Error saving grading scale:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Grading Scale' : 'Create Grading Scale'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scale Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scale Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select scale type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(GradingScale).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Score</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Score</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Grade Ranges</h3>
              {form.watch('ranges')?.map((_, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name={`ranges.${index}.grade`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ranges.${index}.minScore`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Score</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ranges.${index}.maxScore`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Score</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ranges.${index}.gpaValue`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GPA Value</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const ranges = form.getValues('ranges') || [];
                  form.setValue('ranges', [
                    ...ranges,
                    { grade: '', minScore: 0, maxScore: 0, gpaValue: 0 }
                  ]);
                }}
              >
                Add Grade Range
              </Button>
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SystemStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/assessment/grading-scales')}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Scale' : 'Create Scale'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GradingScaleForm; 