import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserSession } from "@/server/api/trpc";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";
import { prisma } from "@/server/db";

export const metadata: Metadata = {
  title: "Coordinator Dashboard",
  description: "Your AIVY LXP Coordinator Dashboard",
};

export default async function CoordinatorDashboardPage() {
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

  if (!user || user.userType !== 'CAMPUS_COORDINATOR') {
    redirect("/login");
  }

  // Custom metrics for coordinator
  const metrics = {
    teachers: { value: 15, description: "Active teachers" },
    programs: { value: 6, description: "Active programs" },
    events: { value: 3, description: "Upcoming events" },
    tasks: { value: 7, description: "Pending tasks" },
  };

  return (
    <RoleDashboard 
      userName={user.name || "Coordinator"} 
      userType={user.userType}
      metrics={metrics}
    />
  );
}
 