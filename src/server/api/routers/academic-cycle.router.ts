import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { AcademicCycleService } from "../services/academic-cycle.service";
import { SystemStatus, UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { ACADEMIC_CYCLE_PERMISSIONS, ROLE_PERMISSIONS } from '../constants/permissions';
import { requirePermission } from '../middleware/auth.middleware';
import { AcademicCycleType } from "../types/academic-calendar";

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
  description: z.string().optional().nullable(),
  startDate: z.date(),
  endDate: z.date(),
  type: z.nativeEnum(AcademicCycleType).default(AcademicCycleType.ANNUAL),
  createdBy: z.string()
});

const updateAcademicCycleSchema = z.object({
  id: z.string(),
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  type: z.nativeEnum(AcademicCycleType).optional(),
  status: z.nativeEnum(SystemStatus).optional(),
  updatedBy: z.string().optional()
});

const listAcademicCyclesSchema = z.object({
  institutionId: z.string(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  status: z.nativeEnum(SystemStatus).optional(),
  type: z.nativeEnum(AcademicCycleType).optional(),
  searchQuery: z.string().optional()
});

const dateRangeSchema = z.object({
  institutionId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  type: z.nativeEnum(AcademicCycleType).optional()
});

const upcomingCyclesSchema = z.object({
  institutionId: z.string(),
  limit: z.number().min(1).max(20).optional(),
  type: z.nativeEnum(AcademicCycleType).optional()
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
      console.log('Academic cycle list query called with input:', input);
      console.log('Session context:', {
        userId: ctx.session?.userId,
        userType: ctx.session?.user?.type
      });
      
      const userType = ctx.session.user.type as UserType;
      
      // Use the permission check from constants
      if (!checkPermission(userType, ACADEMIC_CYCLE_PERMISSIONS.VIEW_ALL_ACADEMIC_CYCLES)) {
        console.log('Permission check failed for user type:', userType);
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view academic cycles',
        });
      }

      console.log('Permission check passed, fetching academic cycles');
      const service = new AcademicCycleService({ prisma: ctx.prisma });
      const cycles = await service.listAcademicCycles({
        ...input,
        userId: ctx.session.userId,
        userType: userType,
      });
      
      console.log(`Returning ${cycles.length} academic cycles`);
      return cycles;
    }),

  update: protectedProcedure
    .use(requirePermission(ACADEMIC_CYCLE_PERMISSIONS.MANAGE_ACADEMIC_CYCLES))
    .input(updateAcademicCycleSchema)
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.academicCycle.updateAcademicCycle(id, {
        ...data,
        updatedBy: ctx.session.user.id,
        id
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
    }),

  // Debug endpoint to directly query the database
  debug: publicProcedure
    .query(async ({ ctx }) => {
      try {
        // Direct database query to check if academic cycles exist
        const cycles = await ctx.prisma.academicCycle.findMany({
          take: 10,
        });
        
        return {
          success: true,
          count: cycles.length,
          cycles,
        };
      } catch (error) {
        console.error('Debug query error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),
}); 
