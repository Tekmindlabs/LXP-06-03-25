/**
 * Authorization Middleware
 * Provides granular permission-based access control using the Permission Service
 */

import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";
import { PermissionService } from "../services/permission.service";
import { UserType } from "@prisma/client";

/**
 * Validates if a user has a specific permission
 * @param permissionCode - The permission code to check
 * @param campusId - Optional campus ID for campus-specific permissions
 */
export const hasPermission = (permissionCode: string, campusId?: string) =>
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

    const permissionService = new PermissionService({ prisma: ctx.prisma });
    
    const hasPermission = await permissionService.validatePermission(
      userId,
      permissionCode,
      campusId
    );

    if (!hasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Insufficient permissions: ${permissionCode}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.session.user,
      },
    });
  });

/**
 * Validates if a user has any of the specified permissions
 * @param permissionCodes - Array of permission codes to check (any match grants access)
 * @param campusId - Optional campus ID for campus-specific permissions
 */
export const hasAnyPermission = (permissionCodes: string[], campusId?: string) =>
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

    const permissionService = new PermissionService({ prisma: ctx.prisma });
    
    // Check each permission code
    const permissionChecks = await Promise.all(
      permissionCodes.map(code => 
        permissionService.validatePermission(userId, code, campusId)
      )
    );
    
    // If any permission check passes, allow access
    if (!permissionChecks.some(Boolean)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Insufficient permissions. Required one of: ${permissionCodes.join(', ')}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.session.user,
      },
    });
  });

/**
 * Validates if a user has all of the specified permissions
 * @param permissionCodes - Array of permission codes to check (all must match)
 * @param campusId - Optional campus ID for campus-specific permissions
 */
export const hasAllPermissions = (permissionCodes: string[], campusId?: string) =>
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

    const permissionService = new PermissionService({ prisma: ctx.prisma });
    
    // Check each permission code
    const permissionChecks = await Promise.all(
      permissionCodes.map(code => 
        permissionService.validatePermission(userId, code, campusId)
      )
    );
    
    // All permission checks must pass
    if (!permissionChecks.every(Boolean)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Insufficient permissions. Required all of: ${permissionCodes.join(', ')}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.session.user,
      },
    });
  });

/**
 * Validates if a user has a specific role
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

    if (!allowedRoles.includes(userType)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. Required role: ${allowedRoles.join(', ')}`,
      });
    }

    return next({
      ctx,
    });
  });

/**
 * Validates if a user belongs to a specific campus
 * @param campusId - Campus ID to check
 */
export const belongsToCampus = (campusId: string) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const { prisma } = ctx;
    const userId = ctx.session.userId;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User ID is required",
      });
    }

    const userCampusAccess = await prisma.userCampusAccess.findFirst({
      where: {
        userId,
        campusId,
        status: 'ACTIVE'
      }
    });

    if (!userCampusAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No access to this campus",
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.session.user,
        campusAccess: userCampusAccess
      },
    });
  });

/**
 * Validates if a user belongs to a specific institution
 * @param institutionId - Institution ID to check
 */
export const belongsToInstitution = (institutionId: string) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const { prisma } = ctx;
    const userId = ctx.session.userId;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User ID is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { institutionId: true }
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
        user: ctx.session.user,
      },
    });
  });

/**
 * Validates if a user is the owner of a resource
 * @param resourceType - The type of resource to check
 * @param resourceIdField - The field name in the input that contains the resource ID
 */
export const isResourceOwner = (resourceType: string, resourceIdField: string) =>
  middleware(async ({ ctx, next, rawInput }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const { prisma } = ctx;
    const userId = ctx.session.userId;
    const input = rawInput as Record<string, unknown>;
    const resourceId = input[resourceIdField] as string;

    if (!resourceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Resource ID field '${resourceIdField}' is required`,
      });
    }

    // Check resource ownership based on resource type
    let isOwner = false;

    // Since we don't have a clear view of all models and their relationships,
    // we'll implement a simplified version that can be expanded later
    switch (resourceType) {
      case 'resource':
        const resource = await prisma.resource.findUnique({
          where: { id: resourceId },
          select: { ownerId: true }
        });
        isOwner = resource?.ownerId === userId;
        break;
      
      // Add more resource types as needed
      
      default:
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unsupported resource type: ${resourceType}`,
        });
    }

    if (!isOwner) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource",
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.session.user,
      },
    });
  }); 