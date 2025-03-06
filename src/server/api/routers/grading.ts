import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { SystemStatus, UserType, GradingType, GradingScale } from '../constants';

// Input validation schemas
const createGradingScaleSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.nativeEnum(GradingType),
  scale: z.nativeEnum(GradingScale),
  minScore: z.number().min(0),
  maxScore: z.number().min(0),
  status: z.nativeEnum(SystemStatus).default(SystemStatus.ACTIVE),
  ranges: z.array(z.object({
    grade: z.string(),
    minScore: z.number(),
    maxScore: z.number(),
    gpaValue: z.number().optional(),
  })).min(1),
});

const updateGradingScaleSchema = createGradingScaleSchema.partial();

export const gradingRouter = createTRPCRouter({
  // Create grading scale
  createScale: protectedProcedure
    .input(createGradingScaleSchema)
    .mutation(async ({ input, ctx }) => {
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.prisma.gradingScaleModel.create({
        data: {
          ...input,
          createdById: ctx.session.userId,
        },
      });
    }),

  // Update grading scale
  updateScale: protectedProcedure
    .input(z.object({
      id: z.string(),
      ...updateGradingScaleSchema.shape
    }))
    .mutation(async ({ input, ctx }) => {
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { id, ...data } = input;
      return ctx.prisma.gradingScaleModel.update({
        where: { id },
        data: {
          ...data,
          updatedById: ctx.session.userId,
        },
      });
    }),

  // Delete grading scale
  deleteScale: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.prisma.gradingScaleModel.delete({
        where: { id: input.id },
      });
    }),

  // Get grading scale by ID
  getScaleById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.gradingScaleModel.findUnique({
        where: { id: input.id },
      });
    }),

  // List grading scales
  listScales: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input = {}, ctx }) => {
      const {
        page = 1,
        pageSize = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status,
        search,
      } = input;

      const where = {
        ...(status && { status }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const [total, items] = await Promise.all([
        ctx.prisma.gradingScaleModel.count({ where }),
        ctx.prisma.gradingScaleModel.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);

      return {
        items,
        total,
        page,
        pageSize,
        hasMore: total > page * pageSize,
      };
    }),
});

export default gradingRouter; 