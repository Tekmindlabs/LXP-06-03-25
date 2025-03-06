import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TermService } from "../services/term.service";
import { SystemStatus, UserType } from "../constants";
import { TRPCError } from "@trpc/server";
import { TermType, TermPeriod } from "../constants";

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

const listTermsSchema = z.object({
  courseId: z.string().optional(),
  academicCycleId: z.string().optional(),
  termType: z.nativeEnum(TermType).optional(),
  termPeriod: z.nativeEnum(TermPeriod).optional(),
  status: z.nativeEnum(SystemStatus).optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

const termIdSchema = z.object({
  id: z.string(),
});

/**
 * Term Router
 * Provides endpoints for managing academic terms
 */
export const termRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTermSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const service = new TermService({ prisma: ctx.prisma });
      return service.createTerm(input);
    }),

  getById: protectedProcedure
    .input(termIdSchema)
    .query(async ({ ctx, input }) => {
      const service = new TermService({ prisma: ctx.prisma });
      const term = await service.getTerm(input.id);
      
      if (!term) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Term not found",
        });
      }
      
      return term;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      ...updateTermSchema.shape,
    }))
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { id, ...data } = input;
      const service = new TermService({ prisma: ctx.prisma });
      return service.updateTerm(id, data);
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
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const service = new TermService({ prisma: ctx.prisma });
      return service.deleteTerm(input.id);
    }),
}); 