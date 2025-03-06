"use client";

import { useState } from "react";
import { DataTable } from "~/components/ui/data-display/data-table";
import { Button } from "~/components/ui/atoms/button";
import { SearchBar } from "~/components/ui/search-bar";
import { Card } from "~/components/ui/atoms/card";
import { api } from "~/trpc/react";
import { SystemStatus } from "@prisma/client";

interface Subject {
  id: string;
  code: string;
  name: string;
  status: SystemStatus;
  course: {
    name: string;
  };
}

export function SubjectList() {
  const [filters, setFilters] = useState({
    status: SystemStatus.ACTIVE,
    search: "",
    skip: 0,
    take: 10,
  });

  const { data, isLoading } = api.subject.getAll.useQuery(filters);

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
      header: "Status",
      accessorKey: "status",
    },
    {
      header: "Actions",
      cell: ({ row }: { row: { original: Subject } }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Handle edit action
            }}
          >
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
        <Button>Add Subject</Button>
      </div>
      <DataTable
        columns={columns}
        data={data?.subjects || []}
        isLoading={isLoading}
      />
    </Card>
  );
} 