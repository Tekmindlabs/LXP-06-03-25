import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";
import { getUserSession } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { NewClassForm } from "./NewClassForm";

interface NewClassPageProps {
  params: {
    id: string;
  };
  searchParams: {
    programId?: string;
    courseId?: string;
  };
}

export default async function NewClassPage({ params, searchParams }: NewClassPageProps) {
  const session = await getUserSession();

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
    where: { id: params.id },
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

  // Get available programs for this campus
  const programCampuses = await prisma.programCampus.findMany({
    where: {
      campusId: params.id,
      status: 'ACTIVE',
    },
    include: {
      program: true,
    },
    orderBy: {
      program: {
        name: 'asc',
      },
    },
  });

  // Get active terms - using academicCycle.institutionId instead of institutionId
  const terms = await prisma.term.findMany({
    where: {
      // Get terms that are active
      status: 'ACTIVE',
      // Filter by academic cycles related to this institution
      academicCycle: {
        institutionId: campus.institutionId
      }
    },
    orderBy: {
      startDate: 'desc',
    },
  });

  // Get courses for this campus
  const courseCampuses = await prisma.courseCampus.findMany({
    where: {
      campusId: params.id,
      status: 'ACTIVE',
    },
    include: {
      course: true,
    },
    orderBy: {
      course: {
        name: 'asc',
      },
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/admin/system/campuses/${params.id}/classes`}>
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={`New Class - ${campus.name}`}
          description={`Create a new class for ${campus.code} campus`}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Class</CardTitle>
          <CardDescription>
            Set up a new class for this campus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewClassForm 
            campusId={params.id}
            programCampuses={programCampuses}
            courseCampuses={courseCampuses}
            terms={terms}
            selectedProgramId={searchParams.programId}
            selectedCourseId={searchParams.courseId}
          />
        </CardContent>
      </Card>
    </div>
  );
} 