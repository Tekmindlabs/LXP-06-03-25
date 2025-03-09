'use client';

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProgramForm } from "@/components/program/ProgramForm";
import { LoadingSpinner } from "@/components/ui/loading";
import { api } from "@/trpc/react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/atoms/page-header";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/feedback/toast";

// Create AlertTitle and AlertDescription components
const AlertTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <h5 className={`mb-1 font-medium leading-none tracking-tight ${className || ''}`} {...props}>
    {children}
  </h5>
);

const AlertDescription = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className || ''}`} {...props}>
    {children}
  </div>
);

export default function EditProgramPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const programId = params?.id;

  if (!programId || typeof programId !== 'string') {
    notFound();
  }

  const { data, isLoading, error } = api.program.getById.useQuery({
    id: programId,
  }, {
    retry: 1, // Only retry once to avoid excessive requests
    onError: (err) => {
      console.error("Error fetching program:", err);
      // We'll handle the error in the UI, so no need to show a toast here
    }
  });

  // Get institution data for fallback
  const { data: institutionData } = api.institution.getCurrent.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8">
        <PageHeader
          title="Program Not Found"
          description="The program you're looking for could not be found"
        />
        
        <Alert variant="destructive" className="my-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || "The program you're trying to edit doesn't exist or you don't have permission to access it."}
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-4 mt-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/system/programs')}
          >
            Back to Programs
          </Button>
          
          {institutionData && (
            <Button 
              onClick={() => router.push('/admin/system/programs/new')}
            >
              Create New Program
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <PageHeader
        title="Edit Program"
        description="Update program details and settings"
      />
      <ProgramForm 
        program={data} 
        institutionId={data.institutionId} 
      />
    </div>
  );
} 