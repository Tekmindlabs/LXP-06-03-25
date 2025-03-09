import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ActivityService } from "../services/activity.service";
import { SystemStatus, UserType } from "../constants";
import { ActivityType, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

// Input validation schemas
const createActivitySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.nativeEnum(ActivityType),
  subjectId: z.string(),
  topicId: z.string().optional(),
  classId: z.string(),
  content: z.record(z.unknown()).transform(val => val as Prisma.InputJsonValue),
  isGradable: z.boolean().optional(),
  maxScore: z.number().min(0).optional(),
  passingScore: z.number().min(0).optional(),
  weightage: z.number().min(0).optional(),
  gradingConfig: z.record(z.unknown()).optional().transform(val => val as Prisma.InputJsonValue),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  resources: z.array(z.record(z.unknown())).optional(),
  status: z.nativeEnum(SystemStatus).optional(),
});

const updateActivitySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  type: z.nativeEnum(ActivityType).optional(),
  topicId: z.string().nullable().optional(),
  content: z.record(z.unknown()).optional().transform(val => val as Prisma.InputJsonValue),
  isGradable: z.boolean().optional(),
  maxScore: z.number().min(0).optional(),
  passingScore: z.number().min(0).optional(),
  weightage: z.number().min(0).optional(),
  gradingConfig: z.record(z.unknown()).optional().transform(val => val as Prisma.InputJsonValue),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  resources: z.array(z.record(z.unknown())).optional(),
  status: z.nativeEnum(SystemStatus).optional(),
});

const activityIdSchema = z.object({
  id: z.string(),
});

export const activityRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createActivitySchema)
    .mutation(async ({ ctx, input }) => {
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
          UserType.CAMPUS_TEACHER,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      
      const service = new ActivityService({ prisma: ctx.prisma });
      return service.createActivity(input);
    }),

  getById: protectedProcedure
    .input(activityIdSchema)
    .query(async ({ input, ctx }) => {
      const service = new ActivityService({ prisma: ctx.prisma });
      return service.getActivity(input.id);
    }),

  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
      subjectId: z.string().optional(),
      topicId: z.string().optional(),
      type: z.nativeEnum(ActivityType).optional(),
      isGradable: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
          UserType.CAMPUS_TEACHER,
          UserType.CAMPUS_STUDENT,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const { page, pageSize, sortBy, sortOrder, ...filters } = input;
      const service = new ActivityService({ prisma: ctx.prisma });
      return service.listActivities(
        { page, pageSize, sortBy, sortOrder },
        filters,
      );
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: updateActivitySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
          UserType.CAMPUS_TEACHER,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const service = new ActivityService({ prisma: ctx.prisma });
      return service.updateActivity(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(activityIdSchema)
    .mutation(async ({ ctx, input }) => {
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
          UserType.CAMPUS_TEACHER,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const service = new ActivityService({ prisma: ctx.prisma });
      return service.deleteActivity(input.id);
    }),

  getStats: protectedProcedure
    .input(z.object({
      classId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
          UserType.CAMPUS_TEACHER,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const service = new ActivityService({ prisma: ctx.prisma });
      return service.getActivityStats(input.classId);
    }),

  submitResponse: protectedProcedure
    .input(z.object({
      activityId: z.string(),
      studentId: z.string(),
      submission: z.record(z.unknown()).transform(val => val as Prisma.InputJsonValue),
    }))
    .mutation(async ({ input, ctx }) => {
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
          UserType.CAMPUS_TEACHER,
          UserType.CAMPUS_STUDENT,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const service = new ActivityService({ prisma: ctx.prisma });
      return service.submitActivityResponse(input.activityId, input.studentId, input.submission);
    }),

  completeActivity: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      data: z.object({
        status: z.string(),
        completionData: z.record(z.unknown()).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
          UserType.CAMPUS_TEACHER,
          UserType.CAMPUS_STUDENT,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // ... existing code ...
    }),
}); 