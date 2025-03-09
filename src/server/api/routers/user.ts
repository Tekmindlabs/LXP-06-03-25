import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { UserService } from "../services/user.service";
import { SystemStatus, UserType, AccessScope } from "../types/user";

// Input validation schemas
const createUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().min(3),
  phoneNumber: z.string().optional(),
  password: z.string().min(8).optional(),
  userType: z.enum(Object.values(UserType) as [string, ...string[]]).transform(val => val as UserType),
  accessScope: z.enum(Object.values(AccessScope) as [string, ...string[]]).transform(val => val as AccessScope),
  primaryCampusId: z.string().optional(),
  institutionId: z.string(),
  profileData: z.record(z.any()).optional()
});

const updateUserSchema = z.object({
  id: z.string(),
  data: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    password: z.string().min(8).optional(),
    userType: z.enum(Object.values(UserType) as [string, ...string[]]).transform(val => val as UserType).optional(),
    accessScope: z.enum(Object.values(AccessScope) as [string, ...string[]]).transform(val => val as AccessScope).optional(),
    primaryCampusId: z.string().optional(),
    status: z.enum(Object.values(SystemStatus) as [string, ...string[]]).transform(val => val as SystemStatus).optional(),
    profileData: z.record(z.any()).optional()
  })
});

const createProfileSchema = z.object({
  userId: z.string(),
  enrollmentNumber: z.string().optional(),
  currentGrade: z.string().optional(),
  academicHistory: z.record(z.any()).optional(),
  interests: z.array(z.string()).optional(),
  achievements: z.array(z.record(z.any())).optional(),
  specialNeeds: z.record(z.any()).optional(),
  guardianInfo: z.record(z.any()).optional()
});

const updateProfileSchema = z.object({
  userId: z.string(),
  data: z.object({
    currentGrade: z.string().optional(),
    academicHistory: z.record(z.any()).optional(),
    interests: z.array(z.string()).optional(),
    achievements: z.array(z.record(z.any())).optional(),
    specialNeeds: z.record(z.any()).optional(),
    guardianInfo: z.record(z.any()).optional()
  })
});

const userListSchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.nativeEnum(SystemStatus).optional(),
  campus: z.string().optional(),
  dateRange: z.object({
    from: z.date().nullable(),
    to: z.date().nullable()
  }).optional(),
  skip: z.number().optional(),
  take: z.number().optional(),
});

// Add preference schema
const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    inApp: z.boolean().default(true),
    digest: z.enum(['none', 'daily', 'weekly']).default('daily')
  }).default({}),
  display: z.object({
    density: z.enum(['compact', 'comfortable', 'spacious']).default('comfortable'),
    fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
    colorScheme: z.enum(['default', 'high-contrast', 'pastel']).default('default')
  }).default({}),
  accessibility: z.object({
    reduceMotion: z.boolean().default(false),
    highContrast: z.boolean().default(false),
    screenReader: z.boolean().default(false),
    keyboardNavigation: z.boolean().default(false)
  }).default({})
});

export const userRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      const userService = new UserService({
        prisma: ctx.prisma,
        defaultUserStatus: SystemStatus.ACTIVE,
        passwordHashRounds: 10
      });
      return userService.createUser(input);
    }),

  get: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: id }) => {
      const userService = new UserService({ prisma: ctx.prisma });
      return userService.getUser(id);
    }),

  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const userService = new UserService({ prisma: ctx.prisma });
      return userService.updateUser(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: id }) => {
      const userService = new UserService({ prisma: ctx.prisma });
      return userService.deleteUser(id);
    }),

  list: protectedProcedure
    .input(userListSchema)
    .query(async ({ ctx, input }) => {
      const { search, role, status, campus, dateRange, skip = 0, take = 10 } = input;

      const users = await ctx.prisma.user.findMany({
        where: {
          OR: search ? [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ] : undefined,
          roles: role ? {
            some: { roleId: role }
          } : undefined,
          status: status,
          campusAccess: campus ? {
            some: { campusId: campus }
          } : undefined,
          createdAt: dateRange ? {
            gte: dateRange.from,
            lte: dateRange.to,
          } : undefined,
        },
        include: {
          roles: {
            include: {
              role: true,
              campus: true,
            }
          }
        },
        skip,
        take,
      });

      return {
        items: users,
        total: await ctx.prisma.user.count(),
      };
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findUnique({
        where: { id: input },
        include: {
          roles: {
            include: {
              role: true,
              campus: true,
            }
          }
        }
      });
    }),

  getRoles: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.userRole.findMany({
        where: { userId: input.userId },
        include: {
          role: true,
          campus: true,
        }
      });
    }),

  assignRole: protectedProcedure
    .input(z.object({
      userId: z.string(),
      roleId: z.string(),
      campusId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userRole.create({
        data: {
          userId: input.userId,
          roleId: input.roleId,
          campusId: input.campusId,
        }
      });
    }),

  removeRole: protectedProcedure
    .input(z.object({
      userId: z.string(),
      roleId: z.string(),
      campusId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userRole.delete({
        where: {
          userId_roleId_campusId: {
            userId: input.userId,
            roleId: input.roleId,
            campusId: input.campusId || null,
          }
        }
      });
    }),

  getActivity: protectedProcedure
    .input(z.object({
      userId: z.string(),
      dateRange: z.object({
        from: z.date().nullable(),
        to: z.date().nullable(),
      })
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.activityLog.findMany({
        where: {
          userId: input.userId,
          timestamp: {
            gte: input.dateRange.from,
            lte: input.dateRange.to,
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      });
    }),

  createStudentProfile: protectedProcedure
    .input(createProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const userService = new UserService({ prisma: ctx.prisma });
      return userService.createStudentProfile(input);
    }),

  createTeacherProfile: protectedProcedure
    .input(z.object({
      userId: z.string(),
      specialization: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const userService = new UserService({ prisma: ctx.prisma });
      return userService.createTeacherProfile(input.userId, input.specialization);
    }),

  createCoordinatorProfile: protectedProcedure
    .input(z.object({
      userId: z.string(),
      department: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const userService = new UserService({ prisma: ctx.prisma });
      return userService.createCoordinatorProfile(input.userId, input.department);
    }),

  updateStudentProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const userService = new UserService({ prisma: ctx.prisma });
      return userService.updateStudentProfile(input.userId, input.data);
    }),

  getProfile: protectedProcedure
    .input(z.object({
      userId: z.string(),
      userType: z.enum(Object.values(UserType) as [string, ...string[]]).transform(val => val as UserType)
    }))
    .query(async ({ ctx, input }) => {
      const userService = new UserService({ prisma: ctx.prisma });
      return userService.getProfile(input.userId, input.userType);
    }),

  assignToCampus: protectedProcedure
    .input(z.object({
      userId: z.string(),
      campusId: z.string(),
      roleType: z.enum(Object.values(UserType) as [string, ...string[]]).transform(val => val as UserType),
    }))
    .mutation(async ({ ctx, input }) => {
      const userService = new UserService({ 
        prisma: ctx.prisma,
        defaultUserStatus: SystemStatus.ACTIVE,
        passwordHashRounds: 10
      });
      return userService.assignToCampus(input.userId, input.campusId, input.roleType);
    }),

  removeCampusAccess: protectedProcedure
    .input(z.object({ accessId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userService = new UserService({ 
        prisma: ctx.prisma,
        defaultUserStatus: SystemStatus.ACTIVE,
        passwordHashRounds: 10
      });
      return userService.removeCampusAccess(input.accessId);
    }),

  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      const userService = new UserService({ prisma: ctx.prisma });
      return userService.getUserPreferences(ctx.session.user.id);
    }),

  updatePreferences: protectedProcedure
    .input(userPreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      const userService = new UserService({ prisma: ctx.prisma });
      return userService.updateUserPreferences(ctx.session.user.id, input);
    }),

  getAvailableTeachers: protectedProcedure
    .input(z.object({ campusId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userService = new UserService({ 
        prisma: ctx.prisma,
        defaultUserStatus: SystemStatus.ACTIVE,
        passwordHashRounds: 10
      });
      return userService.getAvailableTeachers(input.campusId);
    }),

  getAvailableStudents: protectedProcedure
    .input(z.object({ campusId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userService = new UserService({ 
        prisma: ctx.prisma,
        defaultUserStatus: SystemStatus.ACTIVE,
        passwordHashRounds: 10
      });
      return userService.getAvailableStudents(input.campusId);
    }),

  bulkAssignToCampus: protectedProcedure
    .input(z.object({
      userIds: z.array(z.string()),
      campusId: z.string(),
      roleType: z.enum(Object.values(UserType) as [string, ...string[]]).transform(val => val as UserType),
    }))
    .mutation(async ({ ctx, input }) => {
      const userService = new UserService({ 
        prisma: ctx.prisma,
        defaultUserStatus: SystemStatus.ACTIVE,
        passwordHashRounds: 10
      });
      return userService.bulkAssignToCampus(input.userIds, input.campusId, input.roleType);
    }),
}); 