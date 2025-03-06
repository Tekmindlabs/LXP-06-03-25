'use client';

import React from "react";
import { ProgramForm } from "@/components/program/ProgramForm";
import { PageHeader } from "@/components/ui/page-header";

export default function NewProgramPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <PageHeader
        title="Create New Program"
        description="Set up a new academic program"
      />
      <ProgramForm />
    </div>
  );
} 