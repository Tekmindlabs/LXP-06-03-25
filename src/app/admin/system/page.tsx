import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserSession } from "@/server/api/trpc";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";
import { SystemAdminDashboardContent } from "@/components/dashboard/SystemAdminDashboardContent";
import { prisma } from "@/server/db";
import { logger } from '@/server/api/utils/logger';
import { userCache, dataCache } from "@/server/api/utils/cache";

// Define interfaces for our data structures
interface User {
  id: string;
  name: string | null;
  userType: string;
}

interface AuditLog {
  id: string;
  action: string;
  createdAt: Date;
  user: {
    name: string | null;
    userType: string;
  } | null;
}

interface SystemCounts {
  institutions: number;
  campuses: number;
  users: number;
}

export const metadata: Metadata = {
  title: "System Admin Dashboard",
  description: "Your AIVY LXP System Admin Dashboard",
};

export default async function SystemAdminDashboardPage() {
  try {
    const session = await getUserSession();
    if (!session?.userId) {
      logger.debug('No session found for system admin page, redirecting to login');
      redirect("/login");
    }

    // Cache user details
    const userCacheKey = `user:${session.userId}`;
    let user = await userCache.get<User>(userCacheKey);
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          name: true,
          userType: true,
        },
      }) as User;
      
      if (!user) {
        logger.debug('User not found for system admin page, redirecting to login');
        redirect("/login");
      }
      
      await userCache.set(userCacheKey, user);
    }

    if (user.userType !== 'SYSTEM_ADMIN') {
      logger.debug(`User type ${user.userType} not authorized for system admin page, redirecting to login`);
      redirect("/login");
    }

    // Log successful access
    logger.debug('User successfully accessed system admin page', {
      userId: session.userId,
      userType: user.userType
    });

    // Cache system counts
    const countsCacheKey = 'system:dashboard:counts';
    let counts = await dataCache.get<SystemCounts>(countsCacheKey);
    if (!counts) {
      counts = {
        institutions: await prisma.institution.count({
          where: { status: 'ACTIVE' }
        }),
        campuses: await prisma.campus.count({
          where: { status: 'ACTIVE' }
        }),
        users: await prisma.user.count({
          where: { status: 'ACTIVE' }
        })
      };
      await dataCache.set(countsCacheKey, counts);
    }

    // Cache audit logs
    const auditLogsCacheKey = 'system:dashboard:auditLogs';
    let recentAuditLogs = await dataCache.get<AuditLog[]>(auditLogsCacheKey);
    if (!recentAuditLogs) {
      recentAuditLogs = await prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              userType: true
            }
          }
        }
      });
      await dataCache.set(auditLogsCacheKey, recentAuditLogs);
    }

    // Map the audit logs to match the expected interface
    const formattedAuditLogs = recentAuditLogs.map((log: AuditLog) => ({
      id: log.id,
      action: log.action,
      details: log.action, // Using action as details since it's missing
      timestamp: log.createdAt,
      user: log.user
    }));

    // Custom metrics for system admin
    const metrics = {
      institutions: { value: counts.institutions, description: "Active institutions" },
      campuses: { value: counts.campuses, description: "Active campuses" },
      users: { value: counts.users, description: "Total users" },
      tickets: { value: 3, description: "Open support tickets" },
    };

    return (
      <div className="container mx-auto py-6 space-y-8">
        <RoleDashboard 
          userName={user.name || "System Admin"} 
          userType={user.userType}
          metrics={metrics}
        >
          <SystemAdminDashboardContent recentAuditLogs={formattedAuditLogs} />
        </RoleDashboard>
      </div>
    );
  } catch (error) {
    logger.error("Error in system admin page:", { error });
    redirect("/login");
  }
} 
