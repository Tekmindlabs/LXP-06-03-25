import React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Button,
  Card,
  useToast
} from '@/components/ui';
import { RubricBuilder } from './rubric-builder';
import { Save, X } from 'lucide-react';
import { api } from '@/trpc/react';
import { SystemStatus, AssessmentCategory } from '@prisma/client';

const templateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  category: z.nativeEnum(AssessmentCategory, {
    required_error: 'Category is required',
  }),
  description: z.string().min(1, 'Description is required'),
  maxScore: z.number().min(0, 'Maximum score must be positive'),
  weightage: z.number().min(0, 'Weightage must be positive').max(100, 'Weightage cannot exceed 100'),
  status: z.nativeEnum(SystemStatus, {
    required_error: 'Status is required',
  }),
  rubric: z.array(z.object({
    criteria: z.string().min(1, 'Criteria is required'),
    weight: z.number().min(0).max(100),
    levels: z.array(z.object({
      score: z.number().min(0),
      description: z.string().min(1, 'Level description is required')
    }))
  }))
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface AssessmentTemplateFormProps {
  templateId?: string;
}

export function AssessmentTemplateForm({ templateId }: AssessmentTemplateFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Fetch template data if editing
  const { data: template, isLoading: isLoadingTemplate } = api.assessment.getById.useQuery(
    { id: templateId! },
    { enabled: !!templateId }
  );

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: template ? {
      title: template.title,
      category: template.category as AssessmentCategory,
      description: template.description || '',
      maxScore: template.maxScore,
      weightage: template.weightage,
      status: template.status,
      rubric: template.rubric as any || []
    } : {
      title: '',
      category: AssessmentCategory.EXAM,
      description: '',
      maxScore: 100,
      weightage: 0,
      status: SystemStatus.ACTIVE,
      rubric: []
    }
  });

  // Create mutation
  const createMutation = api.assessment.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Template created successfully',
      });
      router.push('/admin/academic/assessments');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create template',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = api.assessment.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Template updated successfully',
      });
      router.push('/admin/academic/assessments');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update template',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    if (templateId) {
      updateMutation.mutate({
        id: templateId,
        data: {
          title: data.title,
          category: data.category,
          description: data.description,
          maxScore: data.maxScore,
          weightage: data.weightage,
          status: data.status,
          rubric: data.rubric
        }
      });
    } else {
      createMutation.mutate(data);
    }
  };

  if (templateId && isLoadingTemplate) {
    return <div>Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter template title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(AssessmentCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0) + category.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Input 
                      type="number" 
                      min={0} 
                      placeholder="Enter maximum score"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weightage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weightage (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      max={100}
                      placeholder="Enter weightage"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter template description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(SystemStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rubric</h3>
          <FormField
            control={form.control}
            name="rubric"
            render={({ field }) => (
              <RubricBuilder
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            type="submit"
            className="w-full sm:w-auto order-1 sm:order-2"
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {templateId ? (
              updateMutation.isLoading ? 'Updating...' : 'Update Template'
            ) : (
              createMutation.isLoading ? 'Creating...' : 'Create Template'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 