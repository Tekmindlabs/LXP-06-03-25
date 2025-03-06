import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { AcademicCycleService } from "../services/academic-cycle.service";
import { SystemStatus, UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { ACADEMIC_CYCLE_PERMISSIONS, ROLE_PERMISSIONS } from '../constants/permissions';
import { requirePermission } from '../middleware/auth.middleware';

// Helper function to check permissions
const checkPermission = (userType: UserType, permission: string): boolean => {
  if (userType === 'SYSTEM_ADMIN') return true;
  
  const rolePermissions = (ROLE_PERMISSIONS[userType as keyof typeof ROLE_PERMISSIONS] || []) as readonly string[];
  return rolePermissions.includes(permission);
};

// Input validation schemas
const createAcademicCycleSchema = z.object({
  institutionId: z.string(),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  type: z.enum(["ANNUAL", "SEMESTER", "TRIMESTER", "QUARTER", "CUSTOM"]).default("ANNUAL"),
  createdBy: z.string()
});

const updateAcademicCycleSchema = z.object({
  id: z.string(),
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  type: z.enum(["ANNUAL", "SEMESTER", "TRIMESTER", "QUARTER", "CUSTOM"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED", "DELETED"]).optional(),
  updatedBy: z.string().optional()
});

const listAcademicCyclesSchema = z.object({
  institutionId: z.string(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED", "DELETED"]).optional(),
  type: z.enum(["ANNUAL", "SEMESTER", "TRIMESTER", "QUARTER", "CUSTOM"]).optional(),
  searchQuery: z.string().optional()
});

const dateRangeSchema = z.object({
  institutionId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  type: z.enum(["ANNUAL", "SEMESTER", "TRIMESTER", "QUARTER", "CUSTOM"]).optional()
});

const upcomingCyclesSchema = z.object({
  institutionId: z.string(),
  limit: z.number().min(1).max(20).optional(),
  type: z.enum(["ANNUAL", "SEMESTER", "TRIMESTER", "QUARTER", "CUSTOM"]).optional()
});

export const academicCycleRouter = createTRPCRouter({
  create: protectedProcedure
    .use(requirePermission(ACADEMIC_CYCLE_PERMISSIONS.MANAGE_ACADEMIC_CYCLES))
    .input(createAcademicCycleSchema)
    .mutation(({ ctx, input }) => {
      const data = {
        ...input,
        description: input.description ?? null
      };
      return ctx.academicCycle.createAcademicCycle(data, ctx.session.user.type as UserType);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const service = new AcademicCycleService({ prisma: ctx.prisma });
      return service.getAcademicCycle(input.id);
    }),

  list: protectedProcedure
    .input(z.object({
      institutionId: z.string(),
      campusId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userType = ctx.session.user.type as UserType;
      
      // Use the permission check from constants
      if (!checkPermission(userType, ACADEMIC_CYCLE_PERMISSIONS.VIEW_ALL_ACADEMIC_CYCLES)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view academic cycles',
        });
      }

      const service = new AcademicCycleService({ prisma: ctx.prisma });
      const cycles = await service.listAcademicCycles({
        ...input,
        userId: ctx.session.user.id,
        userType: userType,
      });

      // Transform the data to match frontend expectations
      return cycles
        .filter(cycle => !cycle.deletedAt)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .map(cycle => ({
          id: cycle.id,
          code: cycle.code,
          name: cycle.name,
          type: cycle.type,
          startDate: cycle.startDate,
          endDate: cycle.endDate,
          status: cycle.status,
          description: cycle.description,
          duration: cycle.duration,
          institutionId: cycle.institutionId,
          createdAt: cycle.createdAt,
          updatedAt: cycle.updatedAt,
          deletedAt: cycle.deletedAt,
          createdBy: cycle.createdBy,
          updatedBy: cycle.updatedBy
        }));
    }),

  update: protectedProcedure
    .use(requirePermission(ACADEMIC_CYCLE_PERMISSIONS.MANAGE_ACADEMIC_CYCLES))
    .input(updateAcademicCycleSchema)
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.academicCycle.updateAcademicCycle(id, {
        ...data,
        updatedBy: ctx.session.user.id
      }, ctx.session.user.type as UserType);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Authorization check
      if (ctx.session.userType !== UserType.SYSTEM_ADMIN) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const service = new AcademicCycleService({ prisma: ctx.prisma });
      return service.deleteAcademicCycle(input.id);
    }),

  getCurrent: protectedProcedure
    .input(z.object({ institutionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const service = new AcademicCycleService({ prisma: ctx.prisma });
      return service.getCurrentAcademicCycle(input.institutionId);
    }),

  getByDateRange: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input, ctx }) => {
      const service = new AcademicCycleService({ prisma: ctx.prisma });
      return service.getAcademicCyclesByDateRange(input);
    }),

  getUpcoming: protectedProcedure
    .input(upcomingCyclesSchema)
    .query(async ({ input, ctx }) => {
      const service = new AcademicCycleService({ prisma: ctx.prisma });
      return service.getUpcomingCycles(input);
    })
}); 
