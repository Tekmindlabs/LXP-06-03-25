import React from 'react';
import { UserType } from '@prisma/client';

export type AccessScope = 'SINGLE_CAMPUS' | 'MULTI_CAMPUS' | 'ALL_CAMPUSES';

interface AccessControlProps {
  /**
   * The content to render if the user has access
   */
  children: React.ReactNode;
  
  /**
   * The user types that are allowed to access the content
   * If not provided, all user types are allowed
   */
  allowedUserTypes?: UserType[];
  
  /**
   * The access scopes that are allowed to access the content
   * If not provided, all access scopes are allowed
   */
  allowedScopes?: AccessScope[];
  
  /**
   * The content to render if the user doesn't have access
   * If not provided, null will be rendered
   */
  fallback?: React.ReactNode;
  
  /**
   * The current user's type
   */
  userType: UserType;
  
  /**
   * The current user's access scope
   */
  accessScope: AccessScope;
  
  /**
   * Additional permissions to check
   * If provided, the user must have all the specified permissions
   */
  requiredPermissions?: string[];
  
  /**
   * The current user's permissions
   */
  userPermissions?: string[];
}

/**
 * A component that conditionally renders content based on the user's role and permissions
 */
export const AccessControl: React.FC<AccessControlProps> = ({
  children,
  allowedUserTypes,
  allowedScopes,
  fallback = null,
  userType,
  accessScope,
  requiredPermissions,
  userPermissions = [],
}) => {
  // Check if the user type is allowed
  const hasAllowedUserType = !allowedUserTypes || allowedUserTypes.includes(userType);
  
  // Check if the access scope is allowed
  const hasAllowedScope = !allowedScopes || allowedScopes.includes(accessScope);
  
  // Check if the user has all required permissions
  const hasRequiredPermissions = !requiredPermissions || 
    requiredPermissions.every(permission => userPermissions.includes(permission));
  
  // Render the children if the user has access, otherwise render the fallback
  if (hasAllowedUserType && hasAllowedScope && hasRequiredPermissions) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

export default AccessControl; 