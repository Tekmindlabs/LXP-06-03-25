import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserSession } from "@/server/api/trpc";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";
import { prisma } from "@/server/db";

export const metadata: Metadata = {
  title: "Campus Admin Dashboard",
  description: "Your AIVY LXP Campus Admin Dashboard",
};

export default async function CampusAdminDashboardPage() {
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
      primaryCampusId: true,
    },
  });

  if (!user || user.userType !== 'CAMPUS_ADMIN') {
    redirect("/login");
  }

  // Custom metrics for campus admin
  const metrics = {
    teachers: { value: 32, description: "Active teachers" },
    students: { value: 450, description: "Enrolled students" },
    courses: { value: 24, description: "Active courses" },
    events: { value: 5, description: "Upcoming events" },
  };

  return (
    <RoleDashboard 
      userName={user.name || "Campus Admin"} 
      userType={user.userType}
      metrics={metrics}
    />
  );
} 