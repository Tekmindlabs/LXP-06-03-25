import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserSession } from "@/server/api/trpc";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";
import { prisma } from "@/server/db";

export const metadata: Metadata = {
  title: "Teacher Dashboard",
  description: "Your AIVY LXP Teacher Dashboard",
};

export default async function TeacherDashboardPage() {
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

  if (!user || user.userType !== 'CAMPUS_TEACHER') {
    redirect("/login");
  }

  // Custom metrics for teacher
  const metrics = {
    classes: { value: 5, description: "Active classes" },
    students: { value: 120, description: "Enrolled students" },
    assignments: { value: 8, description: "Pending assessments" },
    messages: { value: 12, description: "Unread messages" },
  };

  return (
    <RoleDashboard 
      userName={user.name || "Teacher"} 
      userType={user.userType}
      metrics={metrics}
    />
  );
} 