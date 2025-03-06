import { TRPCError } from '@trpc/server';
import type { UserType } from '@prisma/client';
import type { Context } from '../trpc';
import { ACADEMIC_CYCLE_PERMISSIONS, ROLE_PERMISSIONS } from '../constants/permissions';

// Define a type for the permissions array
type PermissionArray = readonly string[];

export const checkPermission = (userType: UserType, permission: string) => {
  if (userType === 'SYSTEM_ADMIN') {
    return true;
  }
  
  // Fix the type issue by properly typing the ROLE_PERMISSIONS access
  const rolePermissions = (ROLE_PERMISSIONS[userType as keyof typeof ROLE_PERMISSIONS] || []) as PermissionArray;
  return rolePermissions.includes(permission);
};

export const requirePermission = (permission: string) => {
  // Use a function that returns a middleware function instead of using middleware directly
  return ({ ctx, next }: { ctx: any; next: () => Promise<any> }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const hasPermission = checkPermission(ctx.session.user.type as UserType, permission);
    if (!hasPermission) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return next();
  };
}; 