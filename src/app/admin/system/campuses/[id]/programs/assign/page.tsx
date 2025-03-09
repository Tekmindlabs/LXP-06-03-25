import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeftIcon } from "lucide-react";
import { getUserSession } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { ProgramAssignmentForm } from "@/components/campus/ProgramAssignmentForm";

interface AssignProgramPageProps {
  params: {
    id: string;
  };
  searchParams: {
    programId?: string;
  };
}

export default async function AssignProgramPage({ params, searchParams }: AssignProgramPageProps) {
  const session = await getUserSession();
  const campusId = params.id;
  const programIdParam = searchParams.programId;

  if (!session?.userId) {
    redirect("/login");
  }

  // Get user details from database
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      userType: true,
    },
  });

  if (!user || user.userType !== 'SYSTEM_ADMIN') {
    redirect("/login");
  }

  // Get campus details
  const campus = await prisma.campus.findUnique({
    where: { id: campusId },
    include: {
      institution: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  if (!campus) {
    notFound();
  }

  // Get available programs that can be added to this campus
  const availablePrograms = await prisma.program.findMany({
    where: {
      institutionId: campus.institutionId,
      status: 'ACTIVE',
      // Exclude programs already associated with this campus
      NOT: {
        campusOfferings: {
          some: {
            campusId: campusId,
            status: 'ACTIVE',
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // If a programId is provided in the query params, get that program
  let selectedProgram = null;
  if (programIdParam) {
    selectedProgram = await prisma.program.findUnique({
      where: { 
        id: programIdParam,
        institutionId: campus.institutionId,
      },
    });
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/admin/system/campuses/${campusId}/programs`}>
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={`Assign Program - ${campus.name}`}
          description={`Assign a program to ${campus.code} campus`}
        />
      </div>
      
      <div className="max-w-2xl mx-auto">
        <ProgramAssignmentForm 
          campusId={campusId}
          availablePrograms={availablePrograms}
          selectedProgramId={selectedProgram?.id}
          returnUrl={`/admin/system/campuses/${campusId}/programs`}
        />
      </div>
    </div>
  );
} 