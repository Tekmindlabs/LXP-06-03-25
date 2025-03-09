"use client";

import { useState } from "react";
import { DataTable } from "~/components/ui/data-display/data-table";
import { Button } from "~/components/ui/atoms/button";
import { SearchBar } from "~/components/ui/search-bar";
import { Card } from "~/components/ui/atoms/card";
import { SystemStatus } from "~/server/api/constants";
import { Pencil, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Badge } from "~/components/ui/atoms/badge";
import { formatDate } from "@/utils/format";

// Interface to match the API response structure
interface Subject {
  id: string;
  code: string;
  name: string;
  status: SystemStatus;
  course: {
    name: string;
    id: string;
    code: string;
  };
  createdAt: Date;
  updatedAt: Date;
  credits: number;
  syllabus: any; // Using any for JsonValue
  courseId: string;
}

export function SubjectList() {
  const [filters, setFilters] = useState({
    status: SystemStatus.ACTIVE as SystemStatus | undefined,
    search: "",
    skip: 0,
    take: 10,
  });

  const router = useRouter();

  // Fetch subjects from API
  const { data, isLoading, refetch } = api.subject.list.useQuery({
    skip: filters.skip,
    take: filters.take,
    search: filters.search,
    status: filters.status,
  });

  const subjects = data?.items || [];
  const totalCount = data?.total || 0;

  const columns = [
    {
      header: "Code",
      accessorKey: "code",
      cell: ({ row }: { row: { original: Subject } }) => (
        <div className="font-medium">{row.original.code}</div>
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Course",
      accessorKey: "course.name",
    },
    {
      header: "Credits",
      accessorKey: "credits",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: { row: { original: Subject } }) => (
        <Badge 
          variant={row.original.status === SystemStatus.ACTIVE ? "success" : "secondary"}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      header: "Last Updated",
      accessorKey: "updatedAt",
      cell: ({ row }: { row: { original: Subject } }) => (
        <div>{formatDate(row.original.updatedAt)}</div>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }: { row: { original: Subject } }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push(`/admin/system/subjects/${row.original.id}`);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push(`/admin/system/subjects/${row.original.id}/edit`);
            }}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between mb-4">
        <SearchBar
          value={filters.search}
          onChange={handleSearch}
          placeholder="Search subjects..."
        />
      </div>
      <DataTable
        columns={columns}
        data={subjects as Subject[]}
        isLoading={isLoading}
        pagination={true}
        pageSize={filters.take}
        onRowClick={(row) => router.push(`/admin/system/subjects/${(row as Subject).id}`)}
      />
    </Card>
  );
} 