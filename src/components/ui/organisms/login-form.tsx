'use client'

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../atoms/button";
import { Input } from "../atoms/input";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/use-debounce";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRPCClientError } from "@trpc/client";
import { parseTRPCError } from "@/utils/trpc-error-handler";

// Define mock user types
const USER_TYPES = {
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  SYSTEM_MANAGER: "SYSTEM_MANAGER",
  CAMPUS_ADMIN: "CAMPUS_ADMIN",
  CAMPUS_COORDINATOR: "CAMPUS_COORDINATOR", 
  CAMPUS_TEACHER: "CAMPUS_TEACHER",
  CAMPUS_STUDENT: "CAMPUS_STUDENT",
  CAMPUS_PARENT: "CAMPUS_PARENT"
};

// Mock credentials for development/testing
const DEV_CREDENTIALS: Record<string, { password: string; userType: string }> = {
  "sysadmin": { password: "password123", userType: USER_TYPES.SYSTEM_ADMIN },
  "manager": { password: "password123", userType: USER_TYPES.SYSTEM_MANAGER },
  "admin": { password: "password123", userType: USER_TYPES.CAMPUS_ADMIN },
  "teacher": { password: "password123", userType: USER_TYPES.CAMPUS_TEACHER },
  "student": { password: "password123", userType: USER_TYPES.CAMPUS_STUDENT },
  "parent": { password: "password123", userType: USER_TYPES.CAMPUS_PARENT },
};

// Create empty dashboard pages for development mode
const createEmptyDashboardPages = () => {
  // Only run in development mode and in the browser
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  
  const dashboardPaths = [
    '/system-admin/dashboard',
    '/campus-admin/dashboard',
    '/teacher/dashboard',
    '/student/dashboard',
    '/parent/dashboard',
    '/dashboard'
  ];
  
  // Check if we need to create empty pages
  const needsEmptyPages = !localStorage.getItem('empty_dashboards_created');
  
  if (needsEmptyPages) {
    console.log('Creating empty dashboard pages for development mode');
    
    // Mark as created to avoid doing this again
    localStorage.setItem('empty_dashboards_created', 'true');
    
    // Create a simple HTML structure for each dashboard
    const dashboardHtml = (title: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} Dashboard</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 1200px; margin: 0 auto; }
            .dashboard { background: #f9fafb; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            h1 { color: #111827; }
            .nav { display: flex; gap: 1rem; margin-bottom: 2rem; }
            .nav a { color: #4f46e5; text-decoration: none; }
            .card { background: white; padding: 1.5rem; border-radius: 6px; margin-bottom: 1rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
          </style>
        </head>
        <body>
          <div class="dashboard">
            <h1>${title} Dashboard</h1>
            <div class="nav">
              <a href="/login">Logout</a>
              <a href="/">Home</a>
            </div>
            <div class="card">
              <h2>Welcome to Development Mode</h2>
              <p>This is a placeholder dashboard for development testing.</p>
              <p>User type: ${title.split(' ')[0]}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Store the HTML in sessionStorage for each path
    sessionStorage.setItem('/system-admin/dashboard', dashboardHtml('System Admin'));
    sessionStorage.setItem('/campus-admin/dashboard', dashboardHtml('Campus Admin'));
    sessionStorage.setItem('/teacher/dashboard', dashboardHtml('Teacher'));
    sessionStorage.setItem('/student/dashboard', dashboardHtml('Student'));
    sessionStorage.setItem('/parent/dashboard', dashboardHtml('Parent'));
    sessionStorage.setItem('/dashboard', dashboardHtml('User'));
  }
};

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, tRPCLoading } = useAuth();
  
  console.log("LoginForm rendered, useAuth state:", { isLoading, tRPCLoading });
  
  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  
  // Validation state
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [useDevMode, setUseDevMode] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // Refs for auto-focus
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Debounced values for validation
  const debouncedUsername = useDebounce(formData.username, 500);
  const debouncedPassword = useDebounce(formData.password, 500);

  // Initialize component
  useEffect(() => {
    // Set initialized after component mounts to prevent SSR issues
    setIsInitialized(true);
    
    // Check if we should use dev mode based on local storage or environment
    const shouldUseDevMode = process.env.NODE_ENV === 'development' && 
      (localStorage.getItem('use_dev_auth') === 'true' || 
       parseInt(localStorage.getItem('server_error_count') || '0') > 2);
    
    setUseDevMode(shouldUseDevMode);
    
    // Focus the username input when the component mounts
    if (usernameRef.current) {
      setTimeout(() => {
        usernameRef.current?.focus();
      }, 100);
    }

    // Create empty dashboard pages for development mode
    if (shouldUseDevMode) {
      createEmptyDashboardPages();
    }
  }, []);

  // Fix for clickability issues
  useEffect(() => {
    const fixClickability = () => {
      // Ensure all form elements are clickable
      const formElements = formRef.current?.querySelectorAll('input, button, a');
      formElements?.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.pointerEvents = 'auto';
        }
      });
    };

    // Run on mount and whenever the form might re-render
    if (isInitialized && formRef.current) {
      fixClickability();
    }
  }, [isInitialized, formData, error]);

  // Validate username
  const validateUsername = (username: string): boolean => {
    if (!username || username.length === 0) return false; // Empty is invalid
    try {
      loginSchema.shape.username.parse(username);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Validate password
  const validatePassword = (password: string): boolean => {
    if (!password || password.length === 0) return false; // Empty is invalid
    try {
      loginSchema.shape.password.parse(password);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Password validation effect
  useEffect(() => {
    if (!debouncedPassword || debouncedPassword.length === 0) {
      setPasswordValid(null);
      return;
    }
    
    const isValid = validatePassword(debouncedPassword);
    setPasswordValid(isValid);
    
    // Only enable auto-login if both fields are valid and not empty
    if (isValid && usernameValid && !loginAttempted) {
      if (submitButtonRef.current) {
        submitButtonRef.current.focus();
      }
      // Don't auto-login, just focus the button
    }
  }, [debouncedPassword, usernameValid, loginAttempted]);

  // Username validation effect
  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length === 0) {
      setUsernameValid(null);
      return;
    }
    
    const isValid = validateUsername(debouncedUsername);
    setUsernameValid(isValid);

    // Move focus to password field if username is valid
    if (isValid && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [debouncedUsername]);

  // Handle redirection after successful login
  useEffect(() => {
    if (loginSuccess) {
      // This effect handles redirection after successful login
      const redirectTimer = setTimeout(() => {
        console.log("Redirecting after successful login");
        
        // For development mode, we'll use a custom approach
        if (useDevMode) {
          const userType = localStorage.getItem('user') 
            ? JSON.parse(localStorage.getItem('user') || '{}').userType 
            : USER_TYPES.SYSTEM_ADMIN;
          
          let dashboardPath = '/dashboard';
          
          // Determine dashboard path based on user type
          switch (userType) {
            case USER_TYPES.SYSTEM_ADMIN:
            case USER_TYPES.SYSTEM_MANAGER:
              dashboardPath = '/system-admin/dashboard';
              break;
            case USER_TYPES.CAMPUS_ADMIN:
            case USER_TYPES.CAMPUS_COORDINATOR:
              dashboardPath = '/campus-admin/dashboard';
              break;
            case USER_TYPES.CAMPUS_TEACHER:
              dashboardPath = '/teacher/dashboard';
              break;
            case USER_TYPES.CAMPUS_STUDENT:
              dashboardPath = '/student/dashboard';
              break;
            case USER_TYPES.CAMPUS_PARENT:
              dashboardPath = '/parent/dashboard';
              break;
          }
          
          // In development mode with empty pages, we'll use a custom approach
          if (process.env.NODE_ENV === 'development') {
            // Check if we have a stored HTML for this path
            const dashboardHtml = sessionStorage.getItem(dashboardPath);
            
            if (dashboardHtml) {
              // Create a new document and write the HTML to it
              const newWindow = window.open('', '_self');
              if (newWindow) {
                newWindow.document.open();
                newWindow.document.write(dashboardHtml);
                newWindow.document.close();
                return; // Exit early as we've handled the redirect
              }
            }
          }
          
          // Fallback to normal navigation
          window.location.href = dashboardPath;
        } else {
          // For production, we'll use both router and direct navigation for reliability
          try {
            router.push('/dashboard');
            
            // As a fallback, also use window.location after a short delay
            setTimeout(() => {
              if (window.location.pathname !== '/dashboard') {
                console.log('Router navigation may have failed, using window.location fallback');
                window.location.href = '/dashboard';
              }
            }, 500);
          } catch (navError) {
            console.error('Navigation error:', navError);
            // If router.push fails, use window.location directly
            window.location.href = '/dashboard';
          }
        }
      }, 1000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [loginSuccess, useDevMode, router]);

  const handleAutoLogin = async () => {
    console.log("Auto login triggered with:", formData);
    if (!usernameValid || !passwordValid) {
      console.log("Auto login cancelled:", { usernameValid, passwordValid, isLoading });
      return;
    }
    
    // Don't automatically submit the form, just focus the button
    setLoginAttempted(true);
    console.log("Auto login disabled, focusing submit button instead");
    if (submitButtonRef.current) {
      submitButtonRef.current.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
      setLoginAttempted(false);
    }
  };

  // Development mode login function - bypasses API calls
  const handleDevLogin = async (): Promise<boolean> => {
    console.log("Using development login mode");
    
    // Check if credentials match our development users
    const matchedUser = DEV_CREDENTIALS[formData.username.toLowerCase()];
    
    if (matchedUser && matchedUser.password === formData.password) {
      console.log("Development login successful:", formData.username);
      
      // Store auth state in localStorage to simulate login
      localStorage.setItem('user', JSON.stringify({
        username: formData.username,
        userType: matchedUser.userType,
        // Add any other needed properties
        isAuthenticated: true
      }));
      
      // Set login success to trigger the redirect effect
      setLoginSuccess(true);
      
      // Show success animation
      setUsernameValid(true);
      setPasswordValid(true);
      
      return true;
    } else {
      console.log("Development login failed - invalid credentials");
      setError("Invalid username or password");
      return false;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      console.log("Form submitted manually via form submit event");
    } else {
      console.log("Form submitted programmatically");
    }

    // Reset error state
    setError(null);
    
    // Validate form data before submission
    const usernameIsValid = validateUsername(formData.username);
    const passwordIsValid = validatePassword(formData.password);
    
    // Update validation states
    setUsernameValid(usernameIsValid);
    setPasswordValid(passwordIsValid);
    
    // If validation fails, show appropriate error messages
    if (!usernameIsValid) {
      setError("Username is required");
      return;
    }
    
    if (!passwordIsValid) {
      setError("Password is required");
      return;
    }

    try {
      // Validate form data with zod schema
      loginSchema.parse(formData);

      // If using development mode, bypass the regular login
      if (useDevMode) {
        return await handleDevLogin();
      }

      // Attempt to sign in
      console.log("Calling login function with:", formData);
      try {
        const result = await login(formData);
        console.log("Login successful, got result:", result);
        
        // Set login success to trigger the redirect effect
        setLoginSuccess(true);
        
        // Show success animation before redirect
        setUsernameValid(true);
        setPasswordValid(true);
        
        return true;
      } catch (loginError) {
        // Don't log the error here, it's already logged in the useAuth hook
        
        // Track server errors to potentially enable dev mode automatically
        if (loginError instanceof Error && 
            (loginError.message.includes('Server communication error') || 
             loginError.message.includes('Network error'))) {
          const currentCount = parseInt(localStorage.getItem('server_error_count') || '0');
          localStorage.setItem('server_error_count', (currentCount + 1).toString());
          
          // If we're in development, offer to switch to dev mode
          if (process.env.NODE_ENV === 'development' && !useDevMode && currentCount >= 1) {
            const useDevFallback = window.confirm(
              "Server communication error detected. Would you like to use development mode login instead?\n\n" +
              "Development mode uses local authentication with test credentials:\n" +
              "- sysadmin/password123\n" +
              "- teacher/password123\n" +
              "- student/password123"
            );
            
            if (useDevFallback) {
              localStorage.setItem('use_dev_auth', 'true');
              setUseDevMode(true);
              return handleDevLogin();
            }
          }
        }
        
        throw loginError;
      }
    } catch (error) {
      // Don't log the error here, it's already logged in the trpc-error-handler
      
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        
        setError(Object.values(fieldErrors)[0] || "Validation failed");
      } else {
        // For other errors, show a general error message
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        setError(errorMessage);
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Handle button click explicitly
  const handleButtonSubmit = () => {
    console.log("Submit button clicked directly");
    handleSubmit();
  };

  // Toggle dev mode manually
  const toggleDevMode = (e: React.MouseEvent) => {
    e.preventDefault();
    const newMode = !useDevMode;
    setUseDevMode(newMode);
    localStorage.setItem('use_dev_auth', newMode ? 'true' : 'false');
    console.log(newMode ? "Development mode enabled" : "Development mode disabled");
    
    // If enabling dev mode, create empty dashboard pages
    if (newMode) {
      createEmptyDashboardPages();
    }
  };

  // If not initialized yet, show a non-interactive form to prevent tRPC errors
  if (!isInitialized) {
    return (
      <div className="space-y-6 opacity-80">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Username
          </label>
          <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2"></div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Password
          </label>
          <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Forgot password?</div>
          <div className="h-10 w-20 rounded-md bg-primary-400"></div>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {useDevMode && (
        <div className="p-2 mb-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-yellow-700">Development Mode Active</span>
            <button 
              type="button" 
              onClick={toggleDevMode}
              className="text-xs text-yellow-700 hover:text-yellow-900 underline"
            >
              Disable
            </button>
          </div>
          <p className="mt-1 text-yellow-600">Using local authentication bypass.</p>
          <p className="mt-1 text-yellow-600 text-xs">
            Test credentials: sysadmin/password123, teacher/password123, student/password123
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <label
          htmlFor="username"
          className={cn(
            "text-sm font-medium leading-none flex items-center justify-between",
            usernameValid === false && "text-red-500"
          )}
        >
          Username
          {usernameValid !== null && formData.username.length > 0 && (
            <span className={cn(
              "transition-opacity duration-300",
              usernameValid ? "text-green-500" : "text-red-500"
            )}>
              {usernameValid ? (
                <CheckCircle className="h-4 w-4 animate-in fade-in-50" />
              ) : (
                <XCircle className="h-4 w-4 animate-in fade-in-50" />
              )}
            </span>
          )}
        </label>
        <input
          id="username"
          name="username"
          type="text"
          ref={usernameRef}
          required
          value={formData.username}
          onChange={handleChange}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
            usernameValid === false && formData.username.length > 0 ? "border-red-500 focus-visible:ring-red-500" : 
            usernameValid === true && formData.username.length > 0 ? "border-green-500 focus-visible:ring-green-500" : ""
          )}
          autoComplete="username"
          disabled={isLoading}
          placeholder="Enter your username"
          style={{ pointerEvents: 'auto' }}
        />
        {usernameValid === false && formData.username.length > 0 && (
          <p className="text-xs text-red-500 animate-in fade-in-50">
            Username is required
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <label
          htmlFor="password"
          className={cn(
            "text-sm font-medium leading-none flex items-center justify-between",
            passwordValid === false && "text-red-500"
          )}
        >
          Password
          {passwordValid !== null && formData.password.length > 0 && (
            <span className={cn(
              "transition-opacity duration-300",
              passwordValid ? "text-green-500" : "text-red-500"
            )}>
              {passwordValid ? (
                <CheckCircle className="h-4 w-4 animate-in fade-in-50" />
              ) : (
                <XCircle className="h-4 w-4 animate-in fade-in-50" />
              )}
            </span>
          )}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            ref={passwordRef}
            required
            value={formData.password}
            onChange={handleChange}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background pr-10",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors duration-200",
              passwordValid === false && formData.password.length > 0 ? "border-red-500 focus-visible:ring-red-500" : 
              passwordValid === true && formData.password.length > 0 ? "border-green-500 focus-visible:ring-green-500" : ""
            )}
            autoComplete="current-password"
            disabled={isLoading}
            placeholder="Enter your password"
            style={{ pointerEvents: 'auto' }}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
            style={{ pointerEvents: 'auto' }}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {passwordValid === false && formData.password.length > 0 && (
          <p className="text-xs text-red-500 animate-in fade-in-50">
            Password is required
          </p>
        )}
      </div>
      
      {error && 
       !error.toLowerCase().includes("username is required") && 
       !error.toLowerCase().includes("password is required") && (
        <div className="text-sm text-red-500 animate-in fade-in-50 bg-red-50 p-2 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline focus:outline-none"
            onClick={() => router.push("/forgot-password")}
            disabled={isLoading}
            style={{ pointerEvents: 'auto' }}
          >
            Forgot password?
          </button>
          
          {/* Dev mode toggle (only in development) */}
          {process.env.NODE_ENV === 'development' && !useDevMode && (
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-gray-600"
              onClick={toggleDevMode}
              style={{ pointerEvents: 'auto' }}
            >
              Dev Mode
            </button>
          )}
        </div>
        
        <button 
          type="submit" 
          ref={submitButtonRef}
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
            "h-10 px-4 py-2 transition-all duration-300",
            (usernameValid && passwordValid) 
              ? "bg-primary-600 hover:bg-primary-700 text-white" 
              : "bg-primary-400 text-white cursor-not-allowed",
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          )}
          onClick={handleButtonSubmit}
          disabled={isLoading || !(usernameValid && passwordValid)}
          style={{ pointerEvents: 'auto' }}
        >
          {isLoading && !useDevMode ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </div>
      
      {loginSuccess && (
        <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 animate-in fade-in-50">
          Login successful! Redirecting to dashboard...
        </div>
      )}
    </form>
  );
} 