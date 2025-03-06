import { TRPCError } from "@trpc/server";
import { hash, compare } from "bcrypt";
import type { Prisma, User } from ".prisma/client";
import {
  CreateUserInput,
  UpdateUserInput,
  UserServiceConfig,
  UserFilters,
  CreateProfileInput,
  UpdateProfileInput,
  SystemStatus,
  UserType
} from "../types/user";
import { UserPreferences, DEFAULT_USER_PREFERENCES } from "../constants";

// Re-export UserPreferences type for convenience
export type { UserPreferences } from "../constants";

export class UserService {
  constructor(private config: UserServiceConfig) {}

  // User CRUD Operations
  async createUser(input: CreateUserInput) {
    const { prisma } = this.config;

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          { username: input.username }
        ]
      }
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "User with this email or username already exists"
      });
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (input.password) {
      hashedPassword = await hash(input.password, this.config.passwordHashRounds || 10);
    }

    // Create user with proper JSON handling
    const userData: Prisma.UserCreateInput = {
      ...input,
      password: hashedPassword,
      status: this.config.defaultUserStatus || SystemStatus.ACTIVE,
      profileData: input.profileData as Prisma.InputJsonValue,
      institution: {
        connect: { id: input.institutionId }
      }
    };

    const user = await prisma.user.create({
      data: userData
    });

    return user;
  }

  async getUser(id: string) {
    const { prisma } = this.config;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        teacherProfile: true,
        coordinatorProfile: true,
        permissions: {
          include: {
            permission: true
          }
        },
        activeCampuses: {
          include: {
            campus: true
          }
        }
      }
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }

    return user;
  }

  async updateUser(id: string, input: UpdateUserInput) {
    const { prisma } = this.config;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }

    // Hash new password if provided
    let hashedPassword: string | undefined;
    if (input.password) {
      hashedPassword = await hash(input.password, this.config.passwordHashRounds || 10);
    }

    // Update user with proper JSON handling
    const userData: Prisma.UserUpdateInput = {
      ...input,
      password: hashedPassword || undefined,
      profileData: input.profileData as Prisma.InputJsonValue
    };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: userData
    });

    return updatedUser;
  }

  async deleteUser(id: string) {
    const { prisma } = this.config;

    // Soft delete by updating status
    await prisma.user.update({
      where: { id },
      data: {
        status: SystemStatus.DELETED,
        deletedAt: new Date()
      }
    });
  }

  async listUsers(filters: UserFilters, skip?: number, take?: number) {
    const { prisma } = this.config;

    const where: Prisma.UserWhereInput = {
      institutionId: filters.institutionId,
      userType: filters.userType,
      status: filters.status,
      OR: filters.search ? [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } }
      ] : undefined,
      activeCampuses: filters.campusId ? {
        some: {
          campusId: filters.campusId
        }
      } : undefined
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: {
          studentProfile: true,
          teacherProfile: true,
          coordinatorProfile: true,
          permissions: {
            include: {
              permission: true
            }
          },
          activeCampuses: {
            include: {
              campus: true
            }
          }
        },
        skip,
        take
      })
    ]);

    return {
      total,
      items: users
    };
  }

  // Profile Management
  async createStudentProfile(input: CreateProfileInput) {
    const { prisma } = this.config;

    const user = await prisma.user.findUnique({
      where: { id: input.userId }
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }

    if (user.userType !== UserType.CAMPUS_STUDENT) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User is not a student"
      });
    }

    const profileData: Prisma.StudentProfileCreateInput = {
      user: { connect: { id: input.userId } },
      enrollmentNumber: input.enrollmentNumber!,
      currentGrade: input.currentGrade,
      academicHistory: input.academicHistory as Prisma.InputJsonValue,
      interests: input.interests || [],
      achievements: input.achievements as Prisma.InputJsonValue[] || [],
      specialNeeds: input.specialNeeds as Prisma.InputJsonValue,
      guardianInfo: input.guardianInfo as Prisma.InputJsonValue
    };

    const profile = await prisma.studentProfile.create({
      data: profileData
    });

    return profile;
  }

  async createTeacherProfile(userId: string, specialization?: string) {
    const { prisma } = this.config;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }

    if (user.userType !== UserType.CAMPUS_TEACHER) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User is not a teacher"
      });
    }

    const profile = await prisma.teacherProfile.create({
      data: {
        userId,
        specialization,
        qualifications: [],
        certifications: [],
        experience: [],
        expertise: [],
        publications: [],
        achievements: []
      }
    });

    return profile;
  }

  async createCoordinatorProfile(userId: string, department?: string) {
    const { prisma } = this.config;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }

    if (user.userType !== UserType.CAMPUS_COORDINATOR) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User is not a coordinator"
      });
    }

    const profile = await prisma.coordinatorProfile.create({
      data: {
        userId,
        department,
        qualifications: [],
        responsibilities: [],
        managedPrograms: [],
        managedCourses: []
      }
    });

    return profile;
  }

  async updateStudentProfile(userId: string, input: UpdateProfileInput) {
    const { prisma } = this.config;

    const profileData: Prisma.StudentProfileUpdateInput = {
      currentGrade: input.currentGrade,
      academicHistory: input.academicHistory as Prisma.InputJsonValue,
      interests: input.interests,
      achievements: input.achievements as Prisma.InputJsonValue[],
      specialNeeds: input.specialNeeds as Prisma.InputJsonValue,
      guardianInfo: input.guardianInfo as Prisma.InputJsonValue
    };

    const profile = await prisma.studentProfile.update({
      where: { userId },
      data: profileData
    });

    return profile;
  }

  async getProfile(userId: string, userType: UserType) {
    const { prisma } = this.config;

    switch (userType) {
      case UserType.CAMPUS_STUDENT:
        return prisma.studentProfile.findUnique({
          where: { userId }
        });
      case UserType.CAMPUS_TEACHER:
        return prisma.teacherProfile.findUnique({
          where: { userId }
        });
      case UserType.CAMPUS_COORDINATOR:
        return prisma.coordinatorProfile.findUnique({
          where: { userId }
        });
      default:
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid user type for profile"
        });
    }
  }

  // Authentication
  async validateCredentials(username: string, password: string) {
    const { prisma } = this.config;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ],
        status: SystemStatus.ACTIVE
      }
    });

    if (!user || !user.password) {
      return null;
    }

    const isValid = await compare(password, user.password);
    return isValid ? user : null;
  }

  // Campus Access Management
  async assignToCampus(userId: string, campusId: string, roleType: UserType) {
    const { prisma } = this.config;

    const access = await prisma.userCampusAccess.create({
      data: {
        userId,
        campusId,
        roleType,
        status: SystemStatus.ACTIVE
      }
    });

    return access;
  }

  async removeCampusAccess(userId: string, campusId: string) {
    const { prisma } = this.config;

    await prisma.userCampusAccess.update({
      where: {
        userId_campusId: {
          userId,
          campusId
        }
      },
      data: {
        status: SystemStatus.INACTIVE,
        endDate: new Date()
      }
    });
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const { prisma } = this.config;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        userType: true,
        profileData: true
      }
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }

    // Get default preferences based on user type
    const basePreferences = DEFAULT_USER_PREFERENCES[user.userType as UserType];
    
    // Extract stored preferences from profileData if they exist
    const storedPreferences = user.profileData && typeof user.profileData === 'object' && 'preferences' in user.profileData
      ? (user.profileData as { preferences: Partial<UserPreferences> }).preferences
      : {};

    // Merge default preferences with stored preferences
    return {
      ...basePreferences,
      ...storedPreferences,
      notifications: {
        ...basePreferences.notifications,
        ...(storedPreferences.notifications || {})
      },
      display: {
        ...basePreferences.display,
        ...(storedPreferences.display || {})
      },
      accessibility: {
        ...basePreferences.accessibility,
        ...(storedPreferences.accessibility || {})
      }
    };
  }

  async updateUserPreferences(userId: string, preferences: UserPreferences): Promise<UserPreferences> {
    const { prisma } = this.config;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileData: true
      }
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }

    // Prepare the updated profileData
    const currentProfileData = user.profileData as Prisma.JsonObject || {};
    const updatedProfileData = {
      ...currentProfileData,
      preferences: preferences as unknown as Prisma.JsonValue
    };

    // Update the user's profileData
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileData: updatedProfileData as Prisma.InputJsonValue
      }
    });

    return preferences;
  }
} 