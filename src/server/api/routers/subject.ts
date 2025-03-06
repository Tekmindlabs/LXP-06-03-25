import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { SubjectService } from "../services/subject.service";
import { SystemStatus, UserType } from "../constants";
import { TRPCError } from "@trpc/server";

// Input validation schemas
const createSubjectSchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(1).max(100),
  credits: z.number().min(0),
  courseId: z.string(),
  syllabus: z.record(z.unknown()).optional(),
  status: z.nativeEnum(SystemStatus).optional(),
});

const updateSubjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  credits: z.number().min(0).optional(),
  syllabus: z.record(z.unknown()).optional(),
  status: z.nativeEnum(SystemStatus).optional(),
});

const subjectIdSchema = z.object({
  id: z.string(),
});

export const subjectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createSubjectSchema)
    .mutation(async ({ input, ctx }) => {
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Insufficient permissions to create subjects"
        });
      }
      
      const service = new SubjectService({ prisma: ctx.prisma });
      return service.createSubject(input);
    }),

  getById: protectedProcedure
    .input(subjectIdSchema)
    .query(async ({ input, ctx }) => {
      const service = new SubjectService({ prisma: ctx.prisma });
      return service.getSubject(input.id);
    }),

  list: protectedProcedure
    .input(z.object({
      skip: z.number().min(0).default(0),
      take: z.number().min(1).max(100).default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
      courseId: z.string().optional(),
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
      const { skip, take, sortBy, sortOrder, ...filters } = input;
      const service = new SubjectService({ prisma: ctx.prisma });
      return service.listSubjects(
        { skip, take },
        filters,
      );
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: updateSubjectSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Insufficient permissions to update subjects"
        });
      }

      const service = new SubjectService({ prisma: ctx.prisma });
      return service.updateSubject(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(subjectIdSchema)
    .mutation(async ({ input, ctx }) => {
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only system admins can delete subjects"
        });
      }

      const service = new SubjectService({ prisma: ctx.prisma });
      return service.deleteSubject(input.id);
    }),

  getStats: protectedProcedure
    .input(subjectIdSchema)
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
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Insufficient permissions to view subject stats"
        });
      }

      const service = new SubjectService({ prisma: ctx.prisma });
      return service.getSubjectStats(input.id);
    }),
}); 