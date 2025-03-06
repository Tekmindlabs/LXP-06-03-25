import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserType } from '@prisma/client';
import { AccessScope } from './AccessControl';

interface ProtectedRouteProps {
  /**
   * The content to render if the user is authenticated and authorized
   */
  children: React.ReactNode;
  
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * The user types that are allowed to access the route
   * If not provided, all user types are allowed
   */
  allowedUserTypes?: UserType[];
  
  /**
   * The access scopes that are allowed to access the route
   * If not provided, all access scopes are allowed
   */
  allowedScopes?: AccessScope[];
  
  /**
   * Additional permissions to check
   * If provided, the user must have all the specified permissions
   */
  requiredPermissions?: string[];
  
  /**
   * The current user's type
   */
  userType?: UserType;
  
  /**
   * The current user's access scope
   */
  accessScope?: AccessScope;
  
  /**
   * The current user's permissions
   */
  userPermissions?: string[];
  
  /**
   * The path to redirect to if the user is not authenticated
   * Default: '/auth/login'
   */
  loginRedirect?: string;
  
  /**
   * The path to redirect to if the user is authenticated but not authorized
   * Default: '/'
   */
  unauthorizedRedirect?: string;
  
  /**
   * Whether to show a loading state while checking authentication
   * Default: true
   */
  showLoading?: boolean;
  
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;
}

/**
 * A component that protects routes based on authentication and authorization
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isAuthenticated,
  allowedUserTypes,
  allowedScopes,
  requiredPermissions,
  userType,
  accessScope,
  userPermissions = [],
  loginRedirect = '/auth/login',
  unauthorizedRedirect = '/',
  showLoading = true,
  loadingComponent = <div className="flex items-center justify-center min-h-screen">Loading...</div>,
}) => {
  const router = useRouter();
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(loginRedirect);
      return;
    }
    
    // If authenticated but user data is not available yet, wait
    if (!userType || !accessScope) {
      return;
    }
    
    // Check if the user type is allowed
    const hasAllowedUserType = !allowedUserTypes || allowedUserTypes.includes(userType);
    
    // Check if the access scope is allowed
    const hasAllowedScope = !allowedScopes || allowedScopes.includes(accessScope);
    
    // Check if the user has all required permissions
    const hasRequiredPermissions = !requiredPermissions || 
      requiredPermissions.every(permission => userPermissions.includes(permission));
    
    // If not authorized, redirect to unauthorized page
    if (!hasAllowedUserType || !hasAllowedScope || !hasRequiredPermissions) {
      router.push(unauthorizedRedirect);
    }
  }, [
    isAuthenticated, 
    userType, 
    accessScope, 
    allowedUserTypes, 
    allowedScopes, 
    requiredPermissions, 
    userPermissions, 
    loginRedirect, 
    unauthorizedRedirect, 
    router
  ]);
  
  // Show loading state if authentication is being checked
  if (!isAuthenticated || !userType || !accessScope) {
    return showLoading ? <>{loadingComponent}</> : null;
  }
  
  // Check authorization
  const hasAllowedUserType = !allowedUserTypes || allowedUserTypes.includes(userType);
  const hasAllowedScope = !allowedScopes || allowedScopes.includes(accessScope);
  const hasRequiredPermissions = !requiredPermissions || 
    requiredPermissions.every(permission => userPermissions.includes(permission));
  
  // If not authorized, show loading while redirecting
  if (!hasAllowedUserType || !hasAllowedScope || !hasRequiredPermissions) {
    return showLoading ? <>{loadingComponent}</> : null;
  }
  
  // If authenticated and authorized, render children
  return <>{children}</>;
};

export default ProtectedRoute; 