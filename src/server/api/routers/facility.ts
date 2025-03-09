import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { FacilityService, createFacilitySchema, updateFacilitySchema, facilityQuerySchema } from "../services/facility.service";
import { SystemStatus, FacilityType } from "@prisma/client";

export const facilityRouter = createTRPCRouter({
  createFacility: protectedProcedure
    .input(createFacilitySchema)
    .mutation(async ({ ctx, input }) => {
      const facilityService = new FacilityService({ prisma: ctx.prisma });
      return facilityService.createFacility(input);
    }),

  getFacility: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const facilityService = new FacilityService({ prisma: ctx.prisma });
      return facilityService.getFacility(input.id);
    }),

  updateFacility: protectedProcedure
    .input(updateFacilitySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const facilityService = new FacilityService({ prisma: ctx.prisma });
      return facilityService.updateFacility(id, data);
    }),

  deleteFacility: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const facilityService = new FacilityService({ prisma: ctx.prisma });
      return facilityService.deleteFacility(input.id);
    }),

  getFacilitiesByCampus: protectedProcedure
    .input(z.object({
      campusId: z.string(),
      type: z.nativeEnum(FacilityType).optional(),
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const facilityService = new FacilityService({ prisma: ctx.prisma });
      return facilityService.getFacilitiesByCampus(input.campusId, {
        type: input.type,
        status: input.status,
        search: input.search,
      });
    }),

  getFacilitiesByType: protectedProcedure
    .input(
      z.object({
        campusId: z.string(),
        type: z.nativeEnum(FacilityType),
      })
    )
    .query(async ({ ctx, input }) => {
      const facilityService = new FacilityService({ prisma: ctx.prisma });
      return facilityService.getFacilitiesByType(input.campusId, input.type);
    }),

  checkFacilityAvailability: protectedProcedure
    .input(
      z.object({
        facilityId: z.string(),
        dayOfWeek: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        classId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const facilityService = new FacilityService({ prisma: ctx.prisma });
      return facilityService.checkFacilityAvailability(
        input.facilityId,
        input.dayOfWeek,
        input.startTime,
        input.endTime,
        input.classId || ""
      );
    }),

  getFacilitySchedule: protectedProcedure
    .input(
      z.object({
        facilityId: z.string(),
        classId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const facilityService = new FacilityService({ prisma: ctx.prisma });
      return facilityService.getFacilitySchedule(
        input.facilityId,
        input.classId || ""
      );
    }),
}); 