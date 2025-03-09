import { redirect, notFound } from "next/navigation";
import { getUserSession } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { CampusProgramsContent } from "./CampusProgramsContent";

interface CampusProgramsPageProps {
  params: {
    id: string;
  };
}

export default async function CampusProgramsPage({ 
  params: { id } // Destructure id from params
}: CampusProgramsPageProps) {
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
    where: { id }, // Use destructured id
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

  // Get programs associated with this campus
  const programCampuses = await prisma.programCampus.findMany({
    where: {
      campusId: id, // Use destructured id
      status: 'ACTIVE',
    },
    include: {
      program: true,
      _count: {
        select: {
          classes: true,
          courseOfferings: true,
        },
      },
    },
    orderBy: {
      program: {
        name: 'asc',
      },
    },
  });

  // Get available programs that can be added to this campus
  const availablePrograms = await prisma.program.findMany({
    where: {
      institutionId: campus.institutionId,
      status: 'ACTIVE',
      // Exclude programs already associated with this campus
      NOT: {
        campusOfferings: {
          some: {
            campusId: id, // Use destructured id
            status: 'ACTIVE',
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <CampusProgramsContent
      campus={campus}
      programCampuses={programCampuses}
      availablePrograms={availablePrograms}
    />
  );
} 
