/**
 * Authentication Middleware
 * Handles user authentication and role-based access control
 */

import { TRPCError } from "@trpc/server";
import { middleware } from "@/server/api/trpc";
import type { PermissionCheck } from "../types";
import { AccessScope, EntityType, SystemStatus } from "@prisma/client";
import { UserType } from "@prisma/client";

interface UserPermission {
  permission: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    status: SystemStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    scope: AccessScope;
    entityType: EntityType | null;
  };
  campusId?: string | null;
}

interface ActiveCampus {
  campusId: string;
}

/**
 * Ensures user is authenticated
 */
export const isAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      // Enhance context with authenticated user
      user: {
        id: ctx.session.userId,
        type: ctx.session.userType
      },
    },
  });
});

/**
 * Validates user has required permissions
 * @param check - Permission check configuration
 */
export const hasPermission = (check: PermissionCheck) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const userId = ctx.session.userId;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User ID is required",
      });
    }

    const { prisma } = ctx;

    // Get user permissions
    const userWithPermissions = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        activeCampuses: true,
      },
    });

    if (!userWithPermissions) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    // Check system-wide permissions
    const hasSystemPermission = userWithPermissions.permissions.some(
      (p) => p.permission && (p.permission.scope as string) === "SYSTEM"
    );

    if (hasSystemPermission) {
      return next({
        ctx: {
          ...ctx,
          user: userWithPermissions,
        },
      });
    }

    // Check campus-specific permissions
    if (check.campusId) {
      const hasCampusAccess = userWithPermissions.activeCampuses.some(
        (c: ActiveCampus) => c.campusId === check.campusId
      );

      if (!hasCampusAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No access to this campus",
        });
      }

      const hasCampusPermission = userWithPermissions.permissions.some(
        (p: UserPermission) =>
          p.permission.entityType === check.entityType &&
          p.campusId === check.campusId
      );

      if (!hasCampusPermission) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions for this campus",
        });
      }
    }

    // Check entity-specific permissions
    const hasEntityPermission = userWithPermissions.permissions.some(
      (p) => p.permission && 
             (p.permission.scope as string) === "ENTITY" && 
             p.permission.entityType !== null && 
             p.permission.entityType === check.entityType
    );

    if (!hasEntityPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient permissions for this operation",
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: userWithPermissions,
      },
    });
  });

/**
 * Validates user has required role
 * @param allowedRoles - Array of allowed user types
 */
export const hasRole = (allowedRoles: UserType[]) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const userType = ctx.session.userType as UserType;
    if (!userType) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User type is required",
      });
    }

    const { prisma } = ctx;
    const userId = ctx.session.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    if (!allowedRoles.includes(user.userType)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient role permissions",
      });
    }

    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  });

/**
 * Validates user belongs to institution
 * @param institutionId - Institution ID to check against
 */
export const belongsToInstitution = (institutionId: string) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const userId = ctx.session.userId;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User ID is required",
      });
    }

    const { prisma } = ctx;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.institutionId !== institutionId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No access to this institution",
      });
    }

    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  }); 