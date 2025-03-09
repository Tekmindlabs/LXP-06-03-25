import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { SystemStatus, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const programInput = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  type: z.string().min(1),
  level: z.number().min(1),
  duration: z.number().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(SystemStatus),
  settings: z.any().optional(),
  curriculum: z.any().optional(),
  institutionId: z.string(),
});

export const programRouter = createTRPCRouter({
  create: protectedProcedure
    .input(programInput)
    .mutation(async ({ ctx, input }) => {
      const { settings, curriculum, ...rest } = input;
      return ctx.prisma.program.create({
        data: {
          ...rest,
          settings: settings as Prisma.InputJsonValue,
          curriculum: curriculum as Prisma.InputJsonValue,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(200).optional(),
      code: z.string().min(1).max(50).optional(),
      type: z.string().min(1).optional(),
      level: z.number().min(1).optional(),
      duration: z.number().min(1).optional(),
      description: z.string().optional(),
      status: z.nativeEnum(SystemStatus).optional(),
      settings: z.any().optional(),
      curriculum: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, settings, curriculum, ...rest } = input;
      return ctx.prisma.program.update({
        where: { id },
        data: {
          ...rest,
          settings: settings as Prisma.InputJsonValue,
          curriculum: curriculum as Prisma.InputJsonValue,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.program.update({
        where: { id: input.id },
        data: { status: SystemStatus.DELETED },
      });
    }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const program = await ctx.prisma.program.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              courses: true,
              campusOfferings: true,
            },
          },
        },
      });

      if (!program) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program not found",
        });
      }

      return program;
    }),

  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.nativeEnum(SystemStatus).optional(),
      institutionId: z.string().optional(),
      page: z.number().min(1).optional(),
      pageSize: z.number().min(1).optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    }).optional())
    .query(async ({ ctx, input = {} }) => {
      const {
        search,
        status,
        institutionId,
        page = 1,
        pageSize = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = input;

      const where: Prisma.ProgramWhereInput = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
            { code: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
          ],
        }),
        ...(status && { status }),
        ...(institutionId && { institutionId }),
      };

      const [total, programs] = await Promise.all([
        ctx.prisma.program.count({ where }),
        ctx.prisma.program.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            _count: {
              select: {
                courses: true,
                campusOfferings: true,
              },
            },
          },
        }),
      ]);

      return {
        programs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  getProgramCampusesByCampus: protectedProcedure
    .input(z.object({
      campusId: z.string(),
      status: z.nativeEnum(SystemStatus).optional().default(SystemStatus.ACTIVE)
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.programCampus.findMany({
        where: {
          campusId: input.campusId,
          status: input.status,
        },
        include: {
          program: true,
        },
      });
    }),
}); 
