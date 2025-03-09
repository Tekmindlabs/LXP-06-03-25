'use client';

import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { TRPCClientError } from "@trpc/client";
import { UserType } from "@/types/user";
import { parseTRPCError, withTRPCErrorHandling } from "@/utils/trpc-error-handler";
import { useState, useEffect, useCallback } from "react";

interface LoginInput {
  username: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  username: string;
  password: string;
  phoneNumber?: string;
  userType: UserType;
  institutionId: string;
  profileData?: Record<string, unknown>;
}

interface AuthUser {
  id: string;
  username: string;
  userType: UserType;
  [key: string]: any;
}

export function useAuth() {
  const router = useRouter();
  const loginMutation = api.auth.login.useMutation();
  const registerMutation = api.auth.register.useMutation();
  const logoutMutation = api.auth.logout.useMutation();
  
  // Add local loading state to have more control
  const [localLoading, setLocalLoading] = useState(false);
  
  // Use suspense: false and enabled: true to fetch profile on mount
  const profileQuery = api.auth.getProfile.useQuery(undefined, {
    retry: false,
    suspense: false,
    enabled: true,
    onError: (error) => {
      // Silently handle unauthorized errors
      if (error instanceof TRPCClientError && error.message.includes('UNAUTHORIZED')) {
        console.log('User not authenticated, skipping profile fetch');
      } else {
        console.error('Error fetching profile:', error);
      }
    }
  });

  // Reset loading state if stuck for more than 5 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (loginMutation.isLoading) {
      timeoutId = setTimeout(() => {
        console.log('Login loading state was stuck, resetting...');
        loginMutation.reset();
        setLocalLoading(false);
      }, 5000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loginMutation.isLoading, loginMutation]);

  // Helper function to handle redirection based on user type
  const redirectToUserDashboard = useCallback((userType: UserType) => {
    console.log('Redirecting user based on type:', userType);
    
    let dashboardPath = '/dashboard';
    
    // Determine dashboard path based on user type
    switch (userType) {
      case UserType.SYSTEM_ADMIN:
        dashboardPath = '/admin/system';
        break;
      case UserType.CAMPUS_ADMIN:
        dashboardPath = '/admin/campus';
        break;
      case UserType.CAMPUS_COORDINATOR:
        dashboardPath = '/admin/coordinator';
        break;
      case UserType.CAMPUS_TEACHER:
        dashboardPath = '/teacher/dashboard';
        break;
      case UserType.CAMPUS_STUDENT:
        dashboardPath = '/student/dashboard';
        break;
      case UserType.CAMPUS_PARENT:
        dashboardPath = '/parent/dashboard';
        break;
    }
    
    // Use both router.push and window.location for maximum reliability
    try {
      router.push(dashboardPath);
      
      // As a fallback, also use window.location after a short delay
      setTimeout(() => {
        if (window.location.pathname !== dashboardPath) {
          console.log('Router navigation may have failed, using window.location fallback');
          window.location.href = dashboardPath;
        }
      }, 1000);
    } catch (navError) {
      console.error('Navigation error:', navError);
      // If router.push fails, use window.location directly
      window.location.href = dashboardPath;
    }
  }, [router]);

  const login = async (input: LoginInput) => {
    try {
      setLocalLoading(true);
      
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Login attempt started with:', input.username);
      }
      
      // Try to catch any network errors before they reach tRPC
      try {
        const user = await loginMutation.mutateAsync(input);
        
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('Login successful, user:', user);
        }
        
        // Store user info in localStorage for development mode fallback
        if (process.env.NODE_ENV === 'development') {
          localStorage.setItem('user', JSON.stringify({
            id: user.id,
            username: user.username,
            userType: user.userType,
            isAuthenticated: true
          }));
        }
        
        // Redirect based on user type
        redirectToUserDashboard(user.userType);
        
        return user;
      } catch (error) {
        // Only log detailed errors in development mode
        if (process.env.NODE_ENV === 'development') {
          console.error('Login mutation error details:', error);
        }
        
        // Check if it's a network error
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          throw new Error('Network error: Could not connect to the server. Please check your internet connection and try again.');
        }
        
        // Check if it's a JSON parsing error
        if (error instanceof Error && 
            (error.message.includes('JSON') || 
             error.message.includes('Unexpected token') || 
             error.message.includes('SyntaxError'))) {
          
          // Increment server error count for potential dev mode auto-enabling
          const currentCount = parseInt(localStorage.getItem('server_error_count') || '0');
          localStorage.setItem('server_error_count', (currentCount + 1).toString());
          
          throw new Error('Server communication error: The server returned an invalid response. This might be due to server maintenance or configuration issues.');
        }
        
        // Check for authentication errors
        if (error instanceof TRPCClientError) {
          if (error.message.toLowerCase().includes('unauthorized') || 
              error.message.toLowerCase().includes('invalid credentials')) {
            
            // Check for specific authentication error messages
            if (error.message.toLowerCase().includes('username not found') || 
                error.message.toLowerCase().includes('user not found')) {
              throw new Error('Username not found. Please check your username and try again.');
            } else if (error.message.toLowerCase().includes('incorrect password') || 
                      error.message.toLowerCase().includes('wrong password')) {
              throw new Error('Incorrect password. Please try again.');
            } else {
              throw new Error('Invalid username or password. Please try again.');
            }
          }
        }
        
        // Re-throw for the outer catch block
        throw error;
      }
    } catch (error) {
      const errorMessage = parseTRPCError(error);
      
      // We don't need to log here since parseTRPCError already logs in development mode
      
      throw error;
    } finally {
      setLocalLoading(false);
      // Force reset the mutation state to ensure isLoading is false
      loginMutation.reset();
    }
  };

  const register = async (input: RegisterInput) => {
    try {
      setLocalLoading(true);
      const user = await registerMutation.mutateAsync(input);
      router.push("/login?registered=true");
      return user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLocalLoading(false);
      registerMutation.reset();
    }
  };

  const logout = async () => {
    try {
      setLocalLoading(true);
      
      // Clear local storage user data (for development mode)
      if (process.env.NODE_ENV === 'development') {
        localStorage.removeItem('user');
      }
      
      // Call the logout mutation
      await logoutMutation.mutateAsync();
      
      // Always redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to login
      router.push("/login");
    } finally {
      setLocalLoading(false);
    }
  };

  // Add updateProfile function
  const updateProfileMutation = api.auth.updateProfile.useMutation();
  
  const updateProfile = async (profileData: any) => {
    try {
      setLocalLoading(true);
      const updatedProfile = await updateProfileMutation.mutateAsync(profileData);
      return updatedProfile;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    } finally {
      setLocalLoading(false);
    }
  };

  // Add changePassword function
  const changePasswordMutation = api.auth.changePassword.useMutation();
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLocalLoading(true);
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword
      });
      return true;
    } catch (error) {
      console.error("Password change error:", error);
      throw error;
    } finally {
      setLocalLoading(false);
    }
  };

  // Determine if the user is authenticated
  const isAuthenticated = !!profileQuery.data;
  
  // Determine if we're still loading authentication state
  const isLoading = profileQuery.isLoading || loginMutation.isLoading || 
                   registerMutation.isLoading || logoutMutation.isLoading || 
                   localLoading;

  return {
    user: profileQuery.data,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated,
    isLoading,
    tRPCLoading: profileQuery.isLoading || loginMutation.isLoading || registerMutation.isLoading
  };
} 