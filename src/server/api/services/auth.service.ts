/**
 * Authentication Service
 * Handles user authentication and management operations
 */

import { TRPCError } from "@trpc/server";
import { hash, compare } from "bcryptjs";
import { randomBytes } from 'crypto';
import { PrismaClient, Prisma, UserType as PrismaUserType, AccessScope as PrismaAccessScope, SystemStatus } from "@prisma/client";
import { UserType, AccessScope, SYSTEM_CONFIG } from "../constants";
import { hashPassword, verifyPassword } from "../utils/auth";
import crypto from "crypto";

interface AuthServiceConfig {
  prisma: PrismaClient;
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

interface LoginInput {
  username: string;
  password: string;
}

interface UpdateProfileInput {
  name?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  profileData?: Record<string, unknown>;
}

interface Permission {
  id: string;
  code: string;
  scope: AccessScope;
}

interface AuthenticatedUser {
  id: string;
  name: string | null;
  email: string;
  username: string;
  userType: UserType;
  institutionId: string;
  permissions: Permission[];
  primaryCampusId: string | null;
  accessScope: AccessScope;
  activeCampuses: { id: string; campusId: string; roleType: UserType }[];
}

export class AuthService {
  private prisma: PrismaClient;

  constructor(config: AuthServiceConfig) {
    this.prisma = config.prisma;
  }

  /**
   * Register a new user
   */
  async register(input: RegisterInput) {
    // Check if username or email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: input.username },
          { email: input.email },
        ],
        institutionId: input.institutionId,
      },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Username or email already exists",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        username: input.username,
        password: hashedPassword,
        phoneNumber: input.phoneNumber,
        userType: input.userType as unknown as PrismaUserType,
        institutionId: input.institutionId,
        profileData: input.profileData as Prisma.InputJsonValue,
        status: SystemStatus.ACTIVE,
        accessScope: AccessScope.SINGLE_CAMPUS as unknown as PrismaAccessScope,
      },
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Validate user credentials
   */
  private async validateCredentials(credentials: LoginInput): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findFirst({
      where: {
        username: credentials.username,
        status: SystemStatus.ACTIVE,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        activeCampuses: true,
      },
    });

    if (!user || !user.password) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await verifyPassword(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email || "",
      username: user.username,
      userType: user.userType as unknown as UserType,
      institutionId: user.institutionId,
      permissions: user.permissions.map(p => ({
        id: p.permission.id,
        code: p.permission.code,
        scope: p.permission.scope as unknown as AccessScope,
      })),
      activeCampuses: user.activeCampuses.map(c => ({
        id: c.id,
        campusId: c.campusId,
        roleType: c.roleType as unknown as UserType,
      })),
      primaryCampusId: user.primaryCampusId,
      accessScope: user.accessScope as unknown as AccessScope,
    };
  }

  /**
   * Create a new session for a user
   */
  private async createSession(userId: string): Promise<string> {
    // Calculate session expiration using the system config
    const expires = new Date(Date.now() + SYSTEM_CONFIG.SECURITY.SESSION_DURATION);
    
    // Generate a random session ID
    const sessionId = crypto.randomUUID();
    
    const session = await this.prisma.session.create({
      data: {
        id: sessionId,
        userId,
        expires,
      },
    });

    return session.id;
  }

  /**
   * Login a user
   */
  async login(credentials: LoginInput) {
    const user = await this.validateCredentials(credentials);
    
    // Clear any existing sessions for this user
    await this.prisma.session.deleteMany({
      where: { userId: user.id }
    });
    
    // Create new session
    const sessionId = await this.createSession(user.id);
    
    return {
      user,
      sessionId,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        activeCampuses: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Map user to authenticated user format
    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      name: user.name,
      email: user.email || "",
      username: user.username,
      userType: user.userType as unknown as UserType,
      institutionId: user.institutionId,
      permissions: user.permissions.map(p => ({
        id: p.permission.id,
        code: p.permission.code,
        scope: p.permission.scope as unknown as AccessScope,
      })),
      activeCampuses: user.activeCampuses.map(c => ({
        id: c.id,
        campusId: c.campusId,
        roleType: c.roleType as unknown as UserType,
      })),
      primaryCampusId: user.primaryCampusId,
      accessScope: user.accessScope as unknown as AccessScope,
    };

    return authenticatedUser;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        updatedAt: new Date(),
        name: input.name,
        phoneNumber: input.phoneNumber,
        dateOfBirth: input.dateOfBirth,
        profileData: input.profileData as Prisma.InputJsonValue,
      },
    });

    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Create user profile based on user type
   */
  private async createUserProfile(user: { id: string; userType: UserType }) {
    switch (user.userType) {
      case UserType.CAMPUS_STUDENT:
        await this.prisma.studentProfile.create({
          data: {
            userId: user.id,
            enrollmentNumber: await this.generateEnrollmentNumber(),
          },
        });
        break;

      case UserType.CAMPUS_TEACHER:
        await this.prisma.teacherProfile.create({
          data: {
            userId: user.id,
          },
        });
        break;

      case UserType.CAMPUS_COORDINATOR:
        await this.prisma.coordinatorProfile.create({
          data: {
            userId: user.id,
          },
        });
        break;
    }
  }

  /**
   * Generate unique enrollment number for students
   */
  private async generateEnrollmentNumber(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await this.prisma.studentProfile.count();
    const sequence = (count + 1).toString().padStart(4, "0");
    return `ST${year}${sequence}`;
  }

  /**
   * Initiate password reset process
   */
  async forgotPassword(email: string) {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      // Return success even if user not found to prevent email enumeration
      if (!user || user.status !== SystemStatus.ACTIVE) {
        return { success: true };
      }

      // Generate reset token and set expiry to 1 hour from now
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Update user with reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        } as Prisma.UserUpdateInput,
      });

      // TODO: Send email with reset link
      // In a real application, you would send an email here with the reset link
      // The link would include the resetToken as a parameter

      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process password reset request',
      });
    }
  }

  async resetPassword(resetToken: string, newPassword: string) {
    try {
      // Find user by reset token and check if token is not expired
      const user = await this.prisma.user.findFirst({
        where: {
          resetToken,
          resetTokenExpiry: {
            gt: new Date(),
          },
        } as Prisma.UserWhereInput,
      });

      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired reset token',
        });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user with new password and clear reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        } as Prisma.UserUpdateInput,
      });

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to reset password',
      });
    }
  }
} 
