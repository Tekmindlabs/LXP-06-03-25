import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma, FacilityType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { CampusService } from "../services/campus.service";
import { UserType, SystemStatus } from "../constants";

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

// Pagination schema
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Program campus association schema
const programCampusSchema = z.object({
  campusId: z.string(),
  programId: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
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

  // New endpoints for campus management
  
  // Get campus classes
  getClasses: protectedProcedure
    .input(z.object({
      campusId: z.string(),
      ...paginationSchema.shape,
      programId: z.string().optional(),
      termId: z.string().optional(),
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
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

      const { campusId, page, pageSize, sortBy, sortOrder, ...filters } = input;
      const service = new CampusService({ prisma: ctx.prisma });
      return service.getCampusClasses(
        campusId,
        { page, pageSize, sortBy, sortOrder },
        filters,
      );
    }),

  // Get campus teachers
  getTeachers: protectedProcedure
    .input(z.object({
      campusId: z.string(),
      ...paginationSchema.shape,
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
    }))
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

      const { campusId, page, pageSize, sortBy, sortOrder, ...filters } = input;
      const service = new CampusService({ prisma: ctx.prisma });
      return service.getCampusTeachers(
        campusId,
        { page, pageSize, sortBy, sortOrder },
        filters,
      );
    }),

  // Get campus students
  getStudents: protectedProcedure
    .input(z.object({
      campusId: z.string(),
      ...paginationSchema.shape,
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
    }))
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

      const { campusId, page, pageSize, sortBy, sortOrder, ...filters } = input;
      const service = new CampusService({ prisma: ctx.prisma });
      return service.getCampusStudents(
        campusId,
        { page, pageSize, sortBy, sortOrder },
        filters,
      );
    }),

  // Get campus facilities
  getFacilities: protectedProcedure
    .input(z.object({
      campusId: z.string(),
      ...paginationSchema.shape,
      type: z.nativeEnum(FacilityType).optional(),
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
    }))
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

      const { campusId, page, pageSize, sortBy, sortOrder, ...filters } = input;
      const service = new CampusService({ prisma: ctx.prisma });
      return service.getCampusFacilities(
        campusId,
        { page, pageSize, sortBy, sortOrder },
        filters,
      );
    }),

  // Get campus programs
  getPrograms: protectedProcedure
    .input(z.object({
      campusId: z.string(),
      ...paginationSchema.shape,
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
    }))
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

      const { campusId, page, pageSize, sortBy, sortOrder, ...filters } = input;
      const service = new CampusService({ prisma: ctx.prisma });
      return service.getCampusPrograms(
        campusId,
        { page, pageSize, sortBy, sortOrder },
        filters,
      );
    }),

  // Assign program to campus
  assignProgram: protectedProcedure
    .input(programCampusSchema)
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

      const service = new CampusService({ prisma: ctx.prisma });
      return service.assignProgramToCampus(
        input.campusId,
        input.programId,
        input.startDate,
        input.endDate,
      );
    }),

  // Remove program from campus
  removeProgram: protectedProcedure
    .input(z.object({
      campusId: z.string(),
      programId: z.string(),
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

      const service = new CampusService({ prisma: ctx.prisma });
      return service.removeProgramFromCampus(
        input.campusId,
        input.programId,
      );
    }),

  getCampus: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const campus = await ctx.prisma.campus.findUnique({
        where: { id: input.id },
        include: {
          institution: true,
          _count: {
            select: {
              programs: true,
              facilities: true,
              userAccess: true
            }
          }
        }
      });

      if (!campus) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campus not found"
        });
      }

      return campus;
    }),
}); 
