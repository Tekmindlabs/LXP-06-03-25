import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { AuthService } from "../services/auth.service";
import { UserType, SYSTEM_CONFIG } from "../constants";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { logger } from "../utils/logger";

/**
 * Authentication Router
 * Handles user authentication and profile management routes
 */

// Input validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(SYSTEM_CONFIG.SECURITY.PASSWORD_MIN_LENGTH),
  name: z.string(),
  username: z.string(),
  userType: z.nativeEnum(UserType),
  institutionId: z.string(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.date().optional(),
  profileData: z.record(z.unknown()).optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.date().optional(),
  profileData: z.record(z.unknown()).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(SYSTEM_CONFIG.SECURITY.PASSWORD_MIN_LENGTH),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  resetToken: z.string(),
  newPassword: z.string().min(8),
});

/**
 * Helper function to create a session in the database
 */
const createSession = async (userId: string, prisma: any) => {
  // Create a session that expires in 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  const sessionId = randomUUID();
  
  // Create session in database
  await prisma.session.create({
    data: {
      id: sessionId,
      expires: expiresAt,
      user: {
        connect: {
          id: userId
        }
      }
    },
  });
  
  // Set session cookie
  try {
    // In server components, we need to use the Edge Runtime cookies API
    // Use type assertion to work around TypeScript error
    const cookieStore = cookies() as any;
    cookieStore.set({
      name: 'session',
      value: sessionId,
      expires: expiresAt,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    logger.debug("Session cookie set successfully", { sessionId });
  } catch (error) {
    logger.error('Failed to set session cookie:', { error });
  }
  
  return sessionId;
};

/**
 * Helper function to clear the session cookie
 */
const clearSessionCookie = () => {
  try {
    // Use type assertion to work around TypeScript error
    const cookieStore = cookies() as any;
    cookieStore.set({
      name: 'session',
      value: '',
      expires: new Date(0),
      path: '/',
    });
    
    logger.debug("Session cookie cleared successfully");
  } catch (error) {
    logger.error('Failed to clear session cookie:', { error });
  }
};

/**
 * Authentication Router Implementation
 */
export const authRouter = createTRPCRouter({
  /**
   * Get the current session
   * Returns the session object for the current user
   */
  getSession: publicProcedure
    .query(({ ctx }) => {
      console.log('getSession called, session:', {
        userId: ctx.session?.userId,
        userType: ctx.session?.user?.type,
        isAuthenticated: !!ctx.session?.userId
      });
      return ctx.session;
    }),

  /**
   * User registration procedure
   * Creates a new user account with basic profile
   */
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const authService = new AuthService({ prisma: ctx.prisma });
      return authService.register(input);
    }),

  /**
   * User login procedure
   * Authenticates user and creates session
   */
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ ctx, input }) => {
      const authService = new AuthService({ prisma: ctx.prisma });
      const result = await authService.login(input);
      
      // Set session cookie using the session ID from AuthService
      try {
        // In server components, we need to use the Edge Runtime cookies API
        const cookieStore = cookies() as any;
        cookieStore.set({
          name: 'session',
          value: result.sessionId,
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          // Expires in 7 days
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      } catch (error) {
        console.error('Failed to set session cookie:', error);
      }
      
      return result.user;
    }),

  /**
   * Logout procedure
   * Removes the user's session
   */
  logout: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.session?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }
      
      try {
        // Get session ID from cookie
        let sessionId: string | undefined;
        
        try {
          // Use type assertion to work around TypeScript error
          const cookieStore = cookies() as any;
          sessionId = cookieStore.get('session')?.value;
        } catch (cookieError) {
          logger.error('Failed to access cookies during logout:', { error: cookieError });
        }
        
        if (sessionId) {
          // Delete session from database
          await ctx.prisma.session.delete({
            where: { id: sessionId },
          }).catch(error => {
            logger.error('Failed to delete session from database:', { error, sessionId });
          });
        }
        
        // Clear session cookie
        clearSessionCookie();
        
        return { success: true };
      } catch (error) {
        logger.error('Logout error:', { error });
        return { success: false };
      }
    }),

  /**
   * Get current user profile
   * Returns detailed user information for authenticated users
   */
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User ID not found in session",
        });
      }
      const authService = new AuthService({ prisma: ctx.prisma });
      return authService.getUserById(ctx.session.userId);
    }),

  /**
   * Update user profile
   * Allows users to update their profile information
   */
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User ID not found in session",
        });
      }
      const authService = new AuthService({ prisma: ctx.prisma });
      return authService.updateProfile(ctx.session.userId, input);
    }),

  /**
   * Change password
   * Allows users to update their password
   */
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User ID not found in session",
        });
      }
      const authService = new AuthService({ prisma: ctx.prisma });
      return authService.changePassword(
        ctx.session.userId,
        input.currentPassword,
        input.newPassword
      );
    }),

  /**
   * Forgot password procedure
   * Initiates password reset process
   */
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const authService = new AuthService({ prisma: ctx.prisma });
      return await authService.forgotPassword(input.email);
    }),

  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const authService = new AuthService({ prisma: ctx.prisma });
      return await authService.resetPassword(input.resetToken, input.newPassword);
    }),
}); 