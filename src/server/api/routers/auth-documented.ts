/**
 * Documented Authentication Router
 * Example of using the documentation utilities with the auth router
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { AuthService } from "../services/auth.service";
import { UserType, SYSTEM_CONFIG } from "../constants";
import { documentRouter, documentProcedure } from "../utils/router-docs";

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
}).describe("User registration data");

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
}).describe("User login credentials");

const updateProfileSchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.date().optional(),
  profileData: z.record(z.unknown()).optional(),
}).describe("User profile update data");

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(SYSTEM_CONFIG.SECURITY.PASSWORD_MIN_LENGTH),
}).describe("Password change data");

// Output schemas
const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  username: z.string(),
  userType: z.nativeEnum(UserType),
  institutionId: z.string(),
  phoneNumber: z.string().nullable(),
  dateOfBirth: z.date().nullable(),
  profileData: z.record(z.unknown()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).describe("User profile data");

const authResultSchema = z.object({
  user: userProfileSchema,
  token: z.string(),
}).describe("Authentication result");

/**
 * Authentication Router Implementation
 */
const authRouter = createTRPCRouter({
  /**
   * User registration procedure
   * Creates a new user account with basic profile
   */
  register: documentProcedure({
    description: "Register a new user account",
    input: registerSchema,
    output: authResultSchema,
    tags: ["auth"],
    examples: {
      input: [
        {
          email: "user@example.com",
          password: "securePassword123",
          name: "John Doe",
          username: "johndoe",
          userType: "STUDENT",
          institutionId: "inst_123456",
          phoneNumber: "+1234567890",
          dateOfBirth: "1990-01-01T00:00:00.000Z",
          profileData: {
            bio: "Computer Science student",
            interests: ["programming", "AI"]
          }
        }
      ],
      output: [
        {
          user: {
            id: "user_123456",
            email: "user@example.com",
            name: "John Doe",
            username: "johndoe",
            userType: "STUDENT",
            institutionId: "inst_123456",
            phoneNumber: "+1234567890",
            dateOfBirth: "1990-01-01T00:00:00.000Z",
            profileData: {
              bio: "Computer Science student",
              interests: ["programming", "AI"]
            },
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-01T00:00:00.000Z"
          },
          token: "jwt_token_example"
        }
      ]
    }
  })(
    publicProcedure
      .input(registerSchema)
      .mutation(async ({ ctx, input }) => {
        const authService = new AuthService({ prisma: ctx.prisma });
        return authService.register(input);
      })
  ),

  /**
   * User login procedure
   * Authenticates user and creates session
   */
  login: documentProcedure({
    description: "Authenticate a user and create a session",
    input: loginSchema,
    output: authResultSchema,
    tags: ["auth"],
    examples: {
      input: [
        {
          username: "johndoe",
          password: "securePassword123"
        }
      ],
      output: [
        {
          user: {
            id: "user_123456",
            email: "user@example.com",
            name: "John Doe",
            username: "johndoe",
            userType: "STUDENT",
            institutionId: "inst_123456",
            phoneNumber: "+1234567890",
            dateOfBirth: "1990-01-01T00:00:00.000Z",
            profileData: {
              bio: "Computer Science student",
              interests: ["programming", "AI"]
            },
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-01T00:00:00.000Z"
          },
          token: "jwt_token_example"
        }
      ]
    }
  })(
    publicProcedure
      .input(loginSchema)
      .mutation(async ({ ctx, input }) => {
        const authService = new AuthService({ prisma: ctx.prisma });
        return authService.login(input);
      })
  ),

  /**
   * Get current user profile
   * Returns detailed user information for authenticated users
   */
  getProfile: documentProcedure({
    description: "Get the current user's profile",
    output: userProfileSchema,
    tags: ["auth", "profile"],
    examples: {
      output: [
        {
          id: "user_123456",
          email: "user@example.com",
          name: "John Doe",
          username: "johndoe",
          userType: "STUDENT",
          institutionId: "inst_123456",
          phoneNumber: "+1234567890",
          dateOfBirth: "1990-01-01T00:00:00.000Z",
          profileData: {
            bio: "Computer Science student",
            interests: ["programming", "AI"]
          },
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z"
        }
      ]
    }
  })(
    protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.session?.userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User ID not found in session",
          });
        }
        const authService = new AuthService({ prisma: ctx.prisma });
        return authService.getUserById(ctx.session.userId);
      })
  ),

  /**
   * Update user profile
   * Allows users to update their profile information
   */
  updateProfile: documentProcedure({
    description: "Update the current user's profile",
    input: updateProfileSchema,
    output: userProfileSchema,
    tags: ["auth", "profile"],
    examples: {
      input: [
        {
          name: "John Smith",
          phoneNumber: "+1987654321",
          profileData: {
            bio: "Updated bio information",
            interests: ["programming", "AI", "machine learning"]
          }
        }
      ],
      output: [
        {
          id: "user_123456",
          email: "user@example.com",
          name: "John Smith",
          username: "johndoe",
          userType: "STUDENT",
          institutionId: "inst_123456",
          phoneNumber: "+1987654321",
          dateOfBirth: "1990-01-01T00:00:00.000Z",
          profileData: {
            bio: "Updated bio information",
            interests: ["programming", "AI", "machine learning"]
          },
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-02T00:00:00.000Z"
        }
      ]
    }
  })(
    protectedProcedure
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
      })
  ),
});

// Document the router
documentRouter("auth", {
  description: "Authentication and user profile management",
  procedures: {
    register: {
      description: "Register a new user account",
      input: registerSchema,
      output: authResultSchema,
      tags: ["auth"],
    },
    login: {
      description: "Authenticate a user and create a session",
      input: loginSchema,
      output: authResultSchema,
      tags: ["auth"],
    },
    getProfile: {
      description: "Get the current user's profile",
      output: userProfileSchema,
      tags: ["auth", "profile"],
    },
    updateProfile: {
      description: "Update the current user's profile",
      input: updateProfileSchema,
      output: userProfileSchema,
      tags: ["auth", "profile"],
    },
  },
});

export { authRouter }; 