'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProgramList } from "@/components/program/ProgramList";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/trpc/react";
import { LoadingSpinner } from "@/components/ui/loading";
import type { SystemStatus } from "@prisma/client";

// Define the expected program type based on your actual data structure
type ProgramWithCounts = {
  id: string;
  name: string;
  code: string;
  status: SystemStatus;
  description?: string | null;
  _count: {
    courses: number;
    campusOfferings: number;
    studentEnrollments: number;
  };
};

export default function ProgramsPage() {
  const router = useRouter();
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading } = api.program.list.useQuery({
    search: "",
    status: "ACTIVE" as SystemStatus,
    page: 1,
    pageSize: 50,
    sortBy: sortField,
    sortOrder: sortOrder
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data?.programs) {
    return null;
  }

  // Transform the data to match the expected type
  const programsWithCounts: ProgramWithCounts[] = data.programs.map(program => ({
    id: program.id,
    name: program.name,
    code: program.code,
    status: program.status,
    // Only include description if it exists in your data
    ...(program.type && { description: program.type }),
    _count: {
      courses: program._count?.courses ?? 0,
      campusOfferings: program._count?.campusOfferings ?? 0,
      studentEnrollments: 0 // Set a default value since it's not in the current data
    }
  }));

  const handleSort = (field: string) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <PageHeader
        title="Academic Programs"
        description="Manage your institution's academic programs"
        action={
          <Button onClick={() => router.push("/admin/system/academic/programs/new")}>
            Add Program
          </Button>
        }
      />
      <ProgramList 
        programs={programsWithCounts}
        onSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
      />
    </div>
  );
} 
