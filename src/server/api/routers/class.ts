import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { classCapacitySchema } from '@/lib/validations/academic';
import { validateInput } from '@/lib/middleware/validation';
import type { Context } from '@/server/api/trpc';
import type { Prisma } from '@prisma/client';
import { ClassService } from "../services/class.service";
import { SystemStatus } from "../types/user";

const createClassSchema = z.object({
  code: z.string(),
  name: z.string(),
  courseCampusId: z.string(),
  termId: z.string(),
  minCapacity: z.number().optional(),
  maxCapacity: z.number().optional(),
  classTeacherId: z.string().optional(),
  facilityId: z.string().optional(),
  programCampusId: z.string().optional()
});

const updateClassSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  minCapacity: z.number().optional(),
  maxCapacity: z.number().optional(),
  classTeacherId: z.string().optional(),
  facilityId: z.string().optional(),
  status: z.enum([
    "ACTIVE", "INACTIVE", "ARCHIVED", "DELETED",
    "ARCHIVED_CURRENT_YEAR", "ARCHIVED_PREVIOUS_YEAR", "ARCHIVED_HISTORICAL"
  ]).transform(val => val as SystemStatus).optional()
});

const listClassesSchema = z.object({
  courseCampusId: z.string().optional(),
  termId: z.string().optional(),
  classTeacherId: z.string().optional(),
  facilityId: z.string().optional(),
  programCampusId: z.string().optional(),
  status: z.enum([
    "ACTIVE", "INACTIVE", "ARCHIVED", "DELETED",
    "ARCHIVED_CURRENT_YEAR", "ARCHIVED_PREVIOUS_YEAR", "ARCHIVED_HISTORICAL"
  ]).transform(val => val as SystemStatus).optional(),
  search: z.string().optional(),
  skip: z.number().optional(),
  take: z.number().optional()
});

const enrollStudentSchema = z.object({
  classId: z.string(),
  studentId: z.string()
});

const assignTeacherSchema = z.object({
  classId: z.string(),
  teacherId: z.string()
});

const removeStudentSchema = z.object({
  classId: z.string(),
  studentId: z.string()
});

const removeTeacherSchema = z.object({
  classId: z.string(),
  teacherId: z.string()
});

export const classRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createClassSchema)
    .use(async ({ next, input, ctx }) => {
      // Validate capacity constraints
      await validateInput(classCapacitySchema)({
        minCapacity: input.minCapacity,
        maxCapacity: input.maxCapacity,
        currentCount: 0,
      });
      return next();
    })
    .mutation(async ({ ctx, input }) => {
      const service = new ClassService({ prisma: ctx.prisma });
      return service.createClass(input);
    }),

  get: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const service = new ClassService({ prisma: ctx.prisma });
      return service.getClass(input);
    }),

  update: protectedProcedure
    .input(updateClassSchema)
    .use(async ({ next, input, ctx }) => {
      if (input.minCapacity || input.maxCapacity) {
        const currentClass = await ctx.prisma.class.findUnique({
          where: { id: input.id },
          select: {
            minCapacity: true,
            maxCapacity: true,
            currentCount: true,
          },
        });

        if (!currentClass) {
          throw new Error('Class not found');
        }

        // Validate capacity constraints with new values
        await validateInput(classCapacitySchema)({
          minCapacity: input.minCapacity ?? currentClass.minCapacity,
          maxCapacity: input.maxCapacity ?? currentClass.maxCapacity,
          currentCount: currentClass.currentCount,
        });
      }
      return next();
    })
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const service = new ClassService({ prisma: ctx.prisma });
      return service.updateClass(id, data);
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const service = new ClassService({ prisma: ctx.prisma });
      return service.deleteClass(input);
    }),

  list: protectedProcedure
    .input(listClassesSchema)
    .query(async ({ ctx, input }) => {
      const { skip = 0, take = 10, ...filters } = input;
      const service = new ClassService({ prisma: ctx.prisma });
      return service.listClasses(filters, skip, take);
    }),

  enrollStudent: protectedProcedure
    .input(enrollStudentSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new ClassService({ prisma: ctx.prisma });
      return service.enrollStudent({
        ...input,
        createdById: ctx.session.userId ?? ''
      });
    }),

  assignTeacher: protectedProcedure
    .input(assignTeacherSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new ClassService({ prisma: ctx.prisma });
      return service.assignTeacher(input);
    }),

  removeStudent: protectedProcedure
    .input(removeStudentSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new ClassService({ prisma: ctx.prisma });
      return service.removeStudent(input.classId, input.studentId);
    }),

  removeTeacher: protectedProcedure
    .input(removeTeacherSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new ClassService({ prisma: ctx.prisma });
      return service.removeTeacher(input.classId, input.teacherId);
    })
}); 