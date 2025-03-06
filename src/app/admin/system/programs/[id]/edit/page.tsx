'use client';

import React from "react";
import { useParams } from "next/navigation";
import { ProgramForm } from "@/components/program/ProgramForm";
import { LoadingSpinner } from "@/components/ui/loading";
import { api } from "@/trpc/react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";

export default function EditProgramPage() {
  const params = useParams();
  const programId = params?.id;

  if (!programId || typeof programId !== 'string') {
    notFound();
  }

  const { data, isLoading } = api.program.getById.useQuery({
    id: programId,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data?.program) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold">Program not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <PageHeader
        title="Edit Program"
        description="Update program details and settings"
      />
      <ProgramForm program={data.program} />
    </div>
  );
} 