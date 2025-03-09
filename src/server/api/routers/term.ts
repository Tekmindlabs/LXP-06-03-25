import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TermService } from "../services/term.service";
import { SystemStatus, UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { TermType, TermPeriod } from "../types/academic-calendar";
import { Prisma } from "@prisma/client";

// Input validation schemas
const createTermSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  termType: z.nativeEnum(TermType),
  termPeriod: z.nativeEnum(TermPeriod),
  startDate: z.date(),
  endDate: z.date(),
  courseId: z.string(),
  academicCycleId: z.string(),
});

const updateTermSchema = z.object({
  id: z.string(),
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  termType: z.nativeEnum(TermType).optional(),
  termPeriod: z.nativeEnum(TermPeriod).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  courseId: z.string().optional(),
  academicCycleId: z.string().optional(),
  status: z.nativeEnum(SystemStatus).optional(),
});

const termIdSchema = z.object({
  id: z.string(),
});

const listTermsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  courseId: z.string().optional(),
  academicCycleId: z.string().optional(),
  termType: z.nativeEnum(TermType).optional(),
  termPeriod: z.nativeEnum(TermPeriod).optional(),
  status: z.nativeEnum(SystemStatus).optional(),
  searchQuery: z.string().optional(),
});

// Check if user has admin permissions
const hasAdminPermission = (userType: string): boolean => {
  return ['SYSTEM_ADMIN', 'SYSTEM_MANAGER', 'CAMPUS_ADMIN'].includes(userType);
};

/**
 * Term Router
 * Provides endpoints for managing academic terms
 */
export const termRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTermSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (!hasAdminPermission(ctx.session.userType)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const service = new TermService({ prisma: ctx.prisma });
      // Convert the input to a Prisma.TermCreateInput
      const termData: Prisma.TermCreateInput = {
        code: input.code,
        name: input.name,
        description: input.description,
        termType: input.termType,
        termPeriod: input.termPeriod,
        startDate: input.startDate,
        endDate: input.endDate,
        course: {
          connect: { id: input.courseId }
        },
        academicCycle: {
          connect: { id: input.academicCycleId }
        }
      };
      
      return service.createTerm(termData);
    }),

  getById: protectedProcedure
    .input(termIdSchema)
    .query(async ({ ctx, input }) => {
      const service = new TermService({ prisma: ctx.prisma });
      const term = await service.getTerm(input.id);
      
      if (!term) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Term not found"
        });
      }
      
      return term;
    }),

  update: protectedProcedure
    .input(updateTermSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (!hasAdminPermission(ctx.session.userType)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { id, ...updateData } = input;
      
      // Convert the input to a Prisma.TermUpdateInput
      const termData: Prisma.TermUpdateInput = {
        ...updateData,
        course: updateData.courseId ? {
          connect: { id: updateData.courseId }
        } : undefined,
        academicCycle: updateData.academicCycleId ? {
          connect: { id: updateData.academicCycleId }
        } : undefined
      };
      
      const service = new TermService({ prisma: ctx.prisma });
      return service.updateTerm(id, termData);
    }),

  list: protectedProcedure
    .input(listTermsSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, ...filters } = input;
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const service = new TermService({ prisma: ctx.prisma });
      return service.listTerms(filters, skip, take);
    }),

  delete: protectedProcedure
    .input(termIdSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (!hasAdminPermission(ctx.session.userType)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const service = new TermService({ prisma: ctx.prisma });
      return service.deleteTerm(input.id);
    }),
}); 