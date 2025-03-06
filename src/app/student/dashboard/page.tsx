import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserSession } from "@/server/api/trpc";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";
import { prisma } from "@/server/db";

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Your AIVY LXP Student Dashboard",
};

export default async function StudentDashboardPage() {
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

  if (!user || user.userType !== 'CAMPUS_STUDENT') {
    redirect("/login");
  }

  // Custom metrics for student
  const metrics = {
    courses: { value: 4, description: "Enrolled courses" },
    assignments: { value: 3, description: "Pending assignments" },
    grades: { value: "B+", description: "Average grade" },
    messages: { value: 5, description: "Unread messages" },
  };

  return (
    <RoleDashboard 
      userName={user.name || "Student"} 
      userType={user.userType}
      metrics={metrics}
    />
  );
} 