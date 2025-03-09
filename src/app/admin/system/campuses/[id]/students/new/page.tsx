import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";
import { getUserSession } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { AddStudentForm } from "./AddStudentForm";

interface AddStudentPageProps {
  params: {
    id: string;
  };
}

export default async function AddStudentPage({ params }: AddStudentPageProps) {
  const session = await getUserSession();
  const campusId = params.id;

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

  // Get available programs for this campus
  const programCampuses = await prisma.programCampus.findMany({
    where: {
      campusId: campusId,
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/admin/system/campuses/${campusId}/students`}>
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={`Add Student - ${campus.name}`}
          description={`Add a student to ${campus.code} campus`}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Student</CardTitle>
          <CardDescription>
            Add an existing student or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddStudentForm 
            campusId={campusId}
            programCampuses={programCampuses}
          />
        </CardContent>
      </Card>
    </div>
  );
} 