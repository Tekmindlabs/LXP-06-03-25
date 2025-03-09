import { redirect, notFound } from "next/navigation";
import { getUserSession } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { CampusStudentsContent } from "./CampusStudentsContent";

interface CampusStudentsPageProps {
  params: {
    id: string;
  };
  searchParams: {
    search?: string;
    programId?: string;
  };
}

export default async function CampusStudentsPage({ params, searchParams }: CampusStudentsPageProps) {
  const session = await getUserSession();

  if (!session?.userId) {
    redirect("/login");
  }

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

  // Get available programs for filtering
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

  return (
    <CampusStudentsContent
      campus={campus}
      programCampuses={programCampuses}
      searchParams={searchParams}
    />
  );
} 
