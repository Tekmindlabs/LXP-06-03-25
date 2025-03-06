import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserSession } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { PageHeader } from "@/components/ui/atoms/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { CampusDetail } from "@/components/campus/CampusDetail";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Campus Details",
  description: "View and manage campus details",
};

interface CampusDetailPageProps {
  params: {
    id: string;
  };
}

export default async function CampusDetailPage({ params }: CampusDetailPageProps) {
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
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      userAccess: {
        where: {
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          userAccess: true,
          facilities: true,
          programs: true,
        },
      },
    },
  });

  if (!campus) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/system/campuses">
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={campus.name}
          description={`Campus details for ${campus.code}`}
        />
      </div>
      
      <CampusDetail campus={campus} />
    </div>
  );
} 