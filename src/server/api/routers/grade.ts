import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { GradeService } from "../services/grade.service";
import type { GradeFilters } from "../types/index";
import { SystemStatus, GradingType, GradingScale, UserType } from "../constants";
import { PrismaClient, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

// Helper function to get student ID from user ID
async function getStudentIdFromUserId(prisma: PrismaClient, userId: string): Promise<string> {
  const studentProfile = await prisma.studentProfile.findFirst({
    where: { userId }
  });
  
  if (!studentProfile) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Student profile not found"
    });
  }
  
  return studentProfile.id;
}

// Input validation schemas
const createGradeSchema = z.object({
  studentId: z.string(),
  subjectId: z.string(),
  assessmentId: z.string().optional(),
  activityId: z.string().optional(),
  score: z.number().min(0),
  weightage: z.number().min(0).max(100),
  gradingType: z.nativeEnum(GradingType),
  gradingScale: z.nativeEnum(GradingScale),
  feedback: z.string().optional(),
  status: z.nativeEnum(SystemStatus).optional(),
}).refine(
  data => (data.assessmentId && !data.activityId) || (!data.assessmentId && data.activityId),
  {
    message: "Must provide either assessmentId or activityId, but not both",
  },
);

const updateGradeSchema = z.object({
  score: z.number().min(0).optional(),
  weightage: z.number().min(0).max(100).optional(),
  gradingType: z.nativeEnum(GradingType).optional(),
  gradingScale: z.nativeEnum(GradingScale).optional(),
  feedback: z.string().optional(),
  status: z.nativeEnum(SystemStatus).optional(),
});

const gradeIdSchema = z.object({
  id: z.string(),
});

const createGradeBookSchema = z.object({
  classId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  gradingType: z.nativeEnum(GradingType),
  gradingScale: z.nativeEnum(GradingScale),
  totalPoints: z.number().optional(),
  weight: z.number().optional(),
  settings: z.record(z.unknown()).optional()
});

const updateGradeBookSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  gradingType: z.nativeEnum(GradingType).optional(),
  gradingScale: z.nativeEnum(GradingScale).optional(),
  totalPoints: z.number().optional(),
  weight: z.number().optional(),
  settings: z.record(z.unknown()).optional(),
  status: z.enum([
    "ACTIVE", "INACTIVE", "ARCHIVED", "DELETED",
    "ARCHIVED_CURRENT_YEAR", "ARCHIVED_PREVIOUS_YEAR", "ARCHIVED_HISTORICAL"
  ]).transform(val => val as SystemStatus).optional()
});

const listGradeBooksSchema = z.object({
  classId: z.string().optional(),
  gradingType: z.nativeEnum(GradingType).optional(),
  gradingScale: z.nativeEnum(GradingScale).optional(),
  status: z.enum([
    "ACTIVE", "INACTIVE", "ARCHIVED", "DELETED",
    "ARCHIVED_CURRENT_YEAR", "ARCHIVED_PREVIOUS_YEAR", "ARCHIVED_HISTORICAL"
  ]).transform(val => val as SystemStatus).optional(),
  search: z.string().optional(),
  skip: z.number().optional(),
  take: z.number().optional()
});

const createStudentGradeSchema = z.object({
  gradeBookId: z.string(),
  studentId: z.string(),
  points: z.number().optional(),
  grade: z.string().optional(),
  comments: z.string().optional(),
  settings: z.record(z.unknown()).optional()
});

const updateStudentGradeSchema = z.object({
  gradeBookId: z.string(),
  studentId: z.string(),
  points: z.number().optional(),
  grade: z.string().optional(),
  comments: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
  status: z.enum([
    "ACTIVE", "INACTIVE", "ARCHIVED", "DELETED",
    "ARCHIVED_CURRENT_YEAR", "ARCHIVED_PREVIOUS_YEAR", "ARCHIVED_HISTORICAL"
  ]).transform(val => val as SystemStatus).optional()
});

const listStudentGradesSchema = z.object({
  gradeBookId: z.string().optional(),
  studentId: z.string().optional(),
  grade: z.string().optional(),
  status: z.enum([
    "ACTIVE", "INACTIVE", "ARCHIVED", "DELETED",
    "ARCHIVED_CURRENT_YEAR", "ARCHIVED_PREVIOUS_YEAR", "ARCHIVED_HISTORICAL"
  ]).transform(val => val as SystemStatus).optional(),
  skip: z.number().optional(),
  take: z.number().optional()
});

export const gradeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createGradeSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify user has appropriate access
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
          UserType.CAMPUS_TEACHER,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new Error("Unauthorized - Insufficient permissions to create grades");
      }
      
      const service = new GradeService({ prisma: ctx.prisma });
      return service.createGrade(input);
    }),

  getById: protectedProcedure
    .input(gradeIdSchema)
    .query(async ({ input, ctx }) => {
      const service = new GradeService({ prisma: ctx.prisma });
      const grade = await service.getGrade(input.id);

      // Verify user has access to view this grade
      if (ctx.session.userType === UserType.CAMPUS_STUDENT) {
        // Get the student profile for the current user
        const studentProfile = await ctx.prisma.studentProfile.findFirst({
          where: { userId: ctx.session.userId }
        });
        
        if (!studentProfile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student profile not found",
          });
        }
        
        if (studentProfile.id !== grade.student.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Students can only view their own grades",
          });
        }
      }

      return grade;
    }),

  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
      studentId: z.string().optional(),
      subjectId: z.string().optional(),
      assessmentId: z.string().optional(),
      activityId: z.string().optional(),
      gradingType: z.nativeEnum(GradingType).optional(),
      gradingScale: z.nativeEnum(GradingScale).optional(),
    }))
    .query(async ({ input, ctx }) => {
      // If user is a student, force filter to their grades only
      const filters = {
        ...input,
        ...(ctx.session.userType === UserType.CAMPUS_STUDENT && {
          studentId: await getStudentIdFromUserId(ctx.prisma, ctx.session.userId),
        }),
      };

      const { page, pageSize, sortBy, sortOrder, ...restFilters } = filters;
      const service = new GradeService({ prisma: ctx.prisma });
      return service.listGrades(
        { page, pageSize, sortBy, sortOrder },
        restFilters,
      );
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: updateGradeSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user has appropriate access
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
          UserType.CAMPUS_TEACHER,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new Error("Unauthorized - Insufficient permissions to update grades");
      }

      const service = new GradeService({ prisma: ctx.prisma });
      return service.updateGrade(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(gradeIdSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify user has appropriate access
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new Error("Unauthorized - Insufficient permissions to delete grades");
      }

      const service = new GradeService({ prisma: ctx.prisma });
      return service.deleteGrade(input.id);
    }),

  getStudentStats: protectedProcedure
    .input(z.object({
      studentId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // Verify user has appropriate access
      if (ctx.session.userType === UserType.CAMPUS_STUDENT) {
        // Get the student profile for the current user
        const studentProfile = await ctx.prisma.studentProfile.findFirst({
          where: { userId: ctx.session.userId }
        });
        
        if (!studentProfile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student profile not found",
          });
        }
        
        if (studentProfile.id !== input.studentId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Students can only access their own grade statistics",
          });
        }
      }

      const service = new GradeService({ prisma: ctx.prisma });
      return service.getStudentStats(input.studentId);
    }),

  // GradeBook endpoints
  createGradeBook: protectedProcedure
    .input(createGradeBookSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify user has appropriate access
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
          UserType.CAMPUS_TEACHER,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new Error("Unauthorized - Insufficient permissions to create grade books");
      }
      
      const service = new GradeService({ prisma: ctx.prisma });
      return service.createGradeBook({
        classId: input.classId,
        termId: input.classId, // Use a valid term ID or get it from somewhere else
        calculationRules: (input.settings || {}) as Prisma.JsonValue,
        createdById: ctx.session.userId || 'system'
      });
    }),

  getGradeBook: protectedProcedure
    .input(gradeIdSchema)
    .query(async ({ input, ctx }) => {
      const service = new GradeService({ prisma: ctx.prisma });
      return service.getGradeBook(input.id);
    }),

  updateGradeBook: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: updateGradeBookSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user has appropriate access
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
          UserType.CAMPUS_TEACHER,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new Error("Unauthorized - Insufficient permissions to update grade books");
      }

      const service = new GradeService({ prisma: ctx.prisma });
      return service.updateGradeBook(input.id, {
        calculationRules: input.data.settings as Prisma.JsonValue,
        updatedById: ctx.session.userId
      });
    }),

  deleteGradeBook: protectedProcedure
    .input(gradeIdSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify user has appropriate access
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new Error("Unauthorized - Insufficient permissions to delete grade books");
      }

      const service = new GradeService({ prisma: ctx.prisma });
      return service.deleteGradeBook(input.id);
    }),

  listGradeBooks: protectedProcedure
    .input(listGradeBooksSchema)
    .query(async ({ input, ctx }) => {
      const { skip, take, ...filters } = input;
      const service = new GradeService({ prisma: ctx.prisma });
      return service.listGradeBooks(filters, skip, take);
    }),

  // Student Grade endpoints
  createStudentGrade: protectedProcedure
    .input(createStudentGradeSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new GradeService({ prisma: ctx.prisma });
      return service.createStudentGrade({
        ...input,
        assessmentGrades: {}, // Add required assessmentGrades
      });
    }),

  updateStudentGrade: protectedProcedure
    .input(updateStudentGradeSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new GradeService({ prisma: ctx.prisma });
      return service.updateStudentGrade(
        input.gradeBookId,
        input.studentId,
        {
          assessmentGrades: input.settings as Prisma.JsonValue,
          finalGrade: input.points,
          letterGrade: input.grade,
          comments: input.comments,
          status: input.status
        }
      );
    }),

  listStudentGrades: protectedProcedure
    .input(listStudentGradesSchema)
    .query(async ({ input, ctx }) => {
      const { skip, take, ...filters } = input;
      const service = new GradeService({ prisma: ctx.prisma });
      return service.listStudentGrades(filters, skip, take);
    }),

  // Grade Calculation endpoints
  calculateClassGrades: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const service = new GradeService({ prisma: ctx.prisma });
      return service.calculateClassGrades(input);
    }),

  getStudentProgress: protectedProcedure
    .input(z.object({
      studentId: z.string(),
      classId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      // Verify user has appropriate access
      if (ctx.session.userType === UserType.CAMPUS_STUDENT) {
        // Get the student ID for the current user
        const studentId = await getStudentIdFromUserId(ctx.prisma, ctx.session.userId);
        
        if (studentId !== input.studentId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Students can only view their own progress"
          });
        }
      }

      const service = new GradeService({ prisma: ctx.prisma });
      return service.getStudentProgress(input.studentId, input.classId);
    })
}); 