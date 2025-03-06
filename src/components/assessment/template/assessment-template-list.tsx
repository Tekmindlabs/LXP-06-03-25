'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  DataTable,
  SearchBar,
  Button,
  Badge,
  useToast
} from '@/components/ui';
import { Plus, Edit, Trash, Copy, EyeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/format';
import { api } from '@/trpc/react';
import { SystemStatus, AssessmentCategory } from '@prisma/client';
import Link from 'next/link';

interface AssessmentTemplate {
  id: string;
  title: string;
  category: AssessmentCategory;
  description: string | null;
  status: SystemStatus;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    submissions: number;
  };
}

export function AssessmentTemplateList() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  // Fetch templates using tRPC
  const { data: templates, isLoading, refetch } = api.assessment.list.useQuery({
    page: 1,
    pageSize: 50,
    search: searchQuery,
    category: selectedCategory !== 'all' ? selectedCategory as AssessmentCategory : undefined,
  });

  // Delete mutation
  const deleteMutation = api.assessment.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  // Filter templates based on search and category
  const filteredTemplates = templates?.items.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Get unique categories for filter
  const categories = ['all', ...Object.values(AssessmentCategory)];

  // Mobile card view component
  const TemplateCard = ({ template }: { template: AssessmentTemplate }) => (
    <Card className="mb-4 p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{template.title}</h3>
        <Badge 
          variant={
            template.status === SystemStatus.ACTIVE ? 'success' :
            template.status === SystemStatus.INACTIVE ? 'warning' : 'secondary'
          }
        >
          {template.status}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{template.category}</p>
      <p className="text-xs text-muted-foreground mb-4">
        Last modified: {formatDate(template.updatedAt)}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/academic/assessments/${template.id}`)}
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/academic/assessments/${template.id}/edit`)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-600"
          onClick={() => deleteMutation.mutate({ id: template.id })}
        >
          <Trash className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    </Card>
  );

  // Table columns for desktop view
  const columns = [
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Category",
      accessorKey: "category",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge 
          variant={
            row.original.status === SystemStatus.ACTIVE ? 'success' :
            row.original.status === SystemStatus.INACTIVE ? 'warning' : 'secondary'
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      header: "Submissions",
      accessorKey: "_count.submissions",
      cell: ({ row }) => row.original._count?.submissions || 0,
    },
    {
      header: "Last Modified",
      accessorKey: "updatedAt",
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/academic/assessments/${row.original.id}`)}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/academic/assessments/${row.original.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={() => deleteMutation.mutate({ id: row.original.id })}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="w-full sm:w-auto">
          <SearchBar
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[300px]"
          />
        </div>
        <Button
          onClick={() => router.push('/admin/academic/assessments/new')}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {/* Mobile view */}
      <div className="block sm:hidden">
        {filteredTemplates.map(template => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns}
          data={filteredTemplates}
          pagination
          sorting
        />
      </div>
    </div>
  );
} 