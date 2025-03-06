import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { CampusService } from "../services/campus.service";
import { SystemStatus, UserType } from "../constants";
import { TRPCError } from "@trpc/server";

// Input validation schemas
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  zipCode: z.string(),
});

const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string(),
  website: z.string().url().optional(),
});

const createCampusSchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(1).max(100),
  institutionId: z.string(),
  status: z.nativeEnum(SystemStatus).optional(),
  address: addressSchema,
  contact: contactSchema,
});

const updateCampusSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.nativeEnum(SystemStatus).optional(),
  address: addressSchema.partial().optional(),
  contact: contactSchema.partial().optional(),
});

const campusIdSchema = z.object({
  id: z.string(),
});

export const campusRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createCampusSchema)
    .mutation(async ({ input, ctx }) => {
      if (
        ctx.session.userType !== UserType.SYSTEM_ADMIN &&
        ctx.session.userType !== UserType.SYSTEM_MANAGER
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      
      const service = new CampusService({ prisma: ctx.prisma });
      return service.createCampus(input);
    }),

  getById: protectedProcedure
    .input(campusIdSchema)
    .query(async ({ input, ctx }) => {
      const service = new CampusService({ prisma: ctx.prisma });
      return service.getCampus(input.id);
    }),

  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
      institutionId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
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
      const service = new CampusService({ prisma: ctx.prisma });
      return service.listCampuses(
        { page, pageSize, sortBy, sortOrder },
        filters,
      );
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: updateCampusSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      if (
        ctx.session.userType !== UserType.SYSTEM_ADMIN &&
        ctx.session.userType !== UserType.SYSTEM_MANAGER &&
        ctx.session.userType !== UserType.CAMPUS_ADMIN
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const service = new CampusService({ prisma: ctx.prisma });
      return service.updateCampus(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(campusIdSchema)
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.userType !== UserType.SYSTEM_ADMIN) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const service = new CampusService({ prisma: ctx.prisma });
      return service.deleteCampus(input.id);
    }),

  getStats: protectedProcedure
    .input(campusIdSchema)
    .query(async ({ input, ctx }) => {
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

      const service = new CampusService({ prisma: ctx.prisma });
      return service.getCampusStats(input.id);
    }),
}); 