import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { 
  teacherScheduleSchema,
  facilityScheduleSchema,
  schedulePeriodSchema,
} from '@/lib/validations/schedule';
import { validateInput } from '@/lib/middleware/validation';
import { TRPCError } from '@trpc/server';
import { ScheduleService } from '../services/schedule.service';
import { SystemStatus, DayOfWeek, PeriodType, UserType } from '@prisma/client';

// Input validation schemas
const createScheduleSchema = z.object({
  classId: z.string(),
  teacherId: z.string(),
  facilityId: z.string(),
  dayOfWeek: z.nativeEnum(DayOfWeek),
  periodType: z.nativeEnum(PeriodType),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:mm"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:mm"),
  recurrenceRule: z.string().optional(),
  status: z.nativeEnum(SystemStatus).optional(),
});

const updateScheduleSchema = z.object({
  teacherId: z.string().optional(),
  facilityId: z.string().optional(),
  dayOfWeek: z.nativeEnum(DayOfWeek).optional(),
  periodType: z.nativeEnum(PeriodType).optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:mm").optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:mm").optional(),
  recurrenceRule: z.string().optional(),
  status: z.nativeEnum(SystemStatus).optional(),
});

const scheduleIdSchema = z.object({
  id: z.string(),
});

export const scheduleRouter = createTRPCRouter({
  // Create teacher schedule
  createTeacherSchedule: protectedProcedure
    .input(z.object({
      schedule: teacherScheduleSchema,
      periods: z.array(z.object({
        timetablePeriodId: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create the teacher schedule
      const schedule = await ctx.prisma.teacherSchedule.create({
        data: {
          ...input.schedule,
        },
      });

      // Create schedule periods
      const periods = await Promise.all(
        input.periods.map(period =>
          ctx.prisma.teacherSchedulePeriod.create({
            data: {
              scheduleId: schedule.id,
              timetablePeriodId: period.timetablePeriodId,
              status: SystemStatus.ACTIVE,
            },
          })
        )
      );

      return {
        schedule,
        periods,
      };
    }),

  // Create facility schedule
  createFacilitySchedule: protectedProcedure
    .input(z.object({
      schedule: facilityScheduleSchema,
      periods: z.array(z.object({
        timetablePeriodId: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create the facility schedule
      const schedule = await ctx.prisma.facilitySchedule.create({
        data: {
          ...input.schedule,
        },
      });

      // Create schedule periods
      const periods = await Promise.all(
        input.periods.map(period =>
          ctx.prisma.facilitySchedulePeriod.create({
            data: {
              scheduleId: schedule.id,
              timetablePeriodId: period.timetablePeriodId,
              status: SystemStatus.ACTIVE,
            },
          })
        )
      );

      return {
        schedule,
        periods,
      };
    }),

  // Get teacher schedule
  getTeacherSchedule: protectedProcedure
    .input(z.object({
      teacherId: z.string(),
      termId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.userType !== UserType.SYSTEM_ADMIN &&
        ctx.session.userType !== UserType.SYSTEM_MANAGER &&
        ctx.session.userType !== UserType.CAMPUS_ADMIN &&
        ctx.session.userType !== UserType.CAMPUS_COORDINATOR &&
        ctx.session.userType !== UserType.CAMPUS_TEACHER
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const schedule = await ctx.prisma.teacherSchedule.findFirst({
        where: {
          teacherId: input.teacherId,
          termId: input.termId,
        },
        include: {
          periods: {
            include: {
              timetablePeriod: true
            }
          },
        },
      });

      if (!schedule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Schedule not found',
        });
      }

      return schedule;
    }),

  // Get facility schedule
  getFacilitySchedule: protectedProcedure
    .input(z.object({
      facilityId: z.string(),
      termId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const schedule = await ctx.prisma.facilitySchedule.findFirst({
        where: {
          facilityId: input.facilityId,
          termId: input.termId,
        },
        include: {
          periods: {
            include: {
              timetablePeriod: true
            }
          },
        },
      });

      if (!schedule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Schedule not found',
        });
      }

      return schedule;
    }),

  // Check schedule conflicts
  checkConflicts: protectedProcedure
    .input(z.object({
      type: z.enum(['TEACHER', 'FACILITY']),
      id: z.string(),
      termId: z.string(),
      timetablePeriodIds: z.array(z.string()),
    }))
    .query(async ({ ctx, input }) => {
      const conflicts = [];

      for (const timetablePeriodId of input.timetablePeriodIds) {
        // Get the timetable period to check
        const timetablePeriod = await ctx.prisma.timetablePeriod.findUnique({
          where: { id: timetablePeriodId }
        });

        if (!timetablePeriod) {
          continue;
        }

        // Find overlapping periods
        const overlappingPeriods = input.type === 'TEACHER'
          ? await ctx.prisma.teacherSchedulePeriod.findMany({
              where: {
                schedule: {
                  teacherId: input.id,
                  termId: input.termId,
                },
                timetablePeriod: {
                  dayOfWeek: timetablePeriod.dayOfWeek,
                  OR: [
                    {
                      AND: [
                        { startTime: { lte: timetablePeriod.startTime } },
                        { endTime: { gt: timetablePeriod.startTime } },
                      ],
                    },
                    {
                      AND: [
                        { startTime: { lt: timetablePeriod.endTime } },
                        { endTime: { gte: timetablePeriod.endTime } },
                      ],
                    },
                  ],
                }
              },
              include: {
                timetablePeriod: true
              }
            })
          : await ctx.prisma.facilitySchedulePeriod.findMany({
              where: {
                schedule: {
                  facilityId: input.id,
                  termId: input.termId,
                },
                timetablePeriod: {
                  dayOfWeek: timetablePeriod.dayOfWeek,
                  OR: [
                    {
                      AND: [
                        { startTime: { lte: timetablePeriod.startTime } },
                        { endTime: { gt: timetablePeriod.startTime } },
                      ],
                    },
                    {
                      AND: [
                        { startTime: { lt: timetablePeriod.endTime } },
                        { endTime: { gte: timetablePeriod.endTime } },
                      ],
                    },
                  ],
                }
              },
              include: {
                timetablePeriod: true
              }
            });

        if (overlappingPeriods.length > 0) {
          conflicts.push({
            timetablePeriod,
            overlappingPeriods,
          });
        }
      }

      return conflicts;
    }),

  create: protectedProcedure
    .input(createScheduleSchema)
    .mutation(async ({ input, ctx }) => {
      if (
        ctx.session.userType !== UserType.SYSTEM_ADMIN &&
        ctx.session.userType !== UserType.SYSTEM_MANAGER &&
        ctx.session.userType !== UserType.CAMPUS_ADMIN &&
        ctx.session.userType !== UserType.CAMPUS_COORDINATOR
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      
      // Create a simple timetable entry
      const timetable = await ctx.prisma.timetable.create({
        data: {
          name: `Schedule for ${input.classId}`,
          class: { connect: { id: input.classId } },
          // Use a direct query to find a valid courseCampus
          courseCampus: {
            connect: {
              id: await ctx.prisma.courseCampus.findFirst({
                where: { courseId: { not: "" } },
                select: { id: true }
              }).then(result => result?.id || "default-id")
            }
          },
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: SystemStatus.ACTIVE
        }
      });
      
      // Return the created timetable
      return { timetable };
    }),

  getById: protectedProcedure
    .input(scheduleIdSchema)
    .query(async ({ input, ctx }) => {
      // Get timetable by ID
      const timetable = await ctx.prisma.timetable.findUnique({
        where: { id: input.id },
        include: {
          periods: true,
          class: true
        }
      });
      
      if (!timetable) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Timetable not found'
        });
      }
      
      return timetable;
    }),

  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
      classId: z.string().optional(),
      teacherId: z.string().optional(),
      facilityId: z.string().optional(),
      dayOfWeek: z.nativeEnum(DayOfWeek).optional(),
      periodType: z.nativeEnum(PeriodType).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { page, pageSize, sortBy, sortOrder, ...filters } = input;
      
      // Implement pagination and filtering manually
      const skip = (page - 1) * pageSize;
      const take = pageSize;
      
      const where: any = {};
      
      if (filters.status) where.status = filters.status;
      if (filters.classId) where.classId = filters.classId;
      
      // Get timetables with pagination
      const timetables = await ctx.prisma.timetable.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' },
        include: {
          periods: true,
          class: true
        }
      });
      
      const total = await ctx.prisma.timetable.count({ where });
      
      return {
        items: timetables,
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize)
      };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: updateScheduleSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      if (
        ctx.session.userType !== UserType.SYSTEM_ADMIN &&
        ctx.session.userType !== UserType.SYSTEM_MANAGER &&
        ctx.session.userType !== UserType.CAMPUS_ADMIN &&
        ctx.session.userType !== UserType.CAMPUS_COORDINATOR
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Get the timetable
      const timetable = await ctx.prisma.timetable.findUnique({
        where: { id: input.id },
        include: { periods: true }
      });
      
      if (!timetable) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Timetable not found'
        });
      }
      
      // Update timetable status if provided
      if (input.data.status) {
        await ctx.prisma.timetable.update({
          where: { id: input.id },
          data: { status: input.data.status }
        });
      }
      
      // If there are periods and we need to update them
      if (timetable.periods.length > 0 && 
          (input.data.dayOfWeek || input.data.startTime || input.data.endTime || input.data.periodType)) {
        
        // Update the first period as an example (you might want to handle this differently)
        const periodToUpdate = timetable.periods[0];
        
        const updateData: any = {};
        
        if (input.data.dayOfWeek) {
          updateData.dayOfWeek = input.data.dayOfWeek;
        }
        
        if (input.data.startTime) {
          const startTimeParts = input.data.startTime.split(':');
          const startDate = new Date();
          startDate.setHours(parseInt(startTimeParts[0], 10));
          startDate.setMinutes(parseInt(startTimeParts[1], 10));
          updateData.startTime = startDate;
        }
        
        if (input.data.endTime) {
          const endTimeParts = input.data.endTime.split(':');
          const endDate = new Date();
          endDate.setHours(parseInt(endTimeParts[0], 10));
          endDate.setMinutes(parseInt(endTimeParts[1], 10));
          updateData.endTime = endDate;
        }
        
        if (input.data.periodType) {
          updateData.type = input.data.periodType;
        }
        
        if (Object.keys(updateData).length > 0) {
          await ctx.prisma.timetablePeriod.update({
            where: { id: periodToUpdate.id },
            data: updateData
          });
        }
      }
      
      // Return the updated timetable
      return ctx.prisma.timetable.findUnique({
        where: { id: input.id },
        include: { periods: true }
      });
    }),

  delete: protectedProcedure
    .input(scheduleIdSchema)
    .mutation(async ({ input, ctx }) => {
      if (
        ctx.session.userType !== UserType.SYSTEM_ADMIN &&
        ctx.session.userType !== UserType.SYSTEM_MANAGER &&
        ctx.session.userType !== UserType.CAMPUS_ADMIN &&
        ctx.session.userType !== UserType.CAMPUS_COORDINATOR
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Delete timetable
      return ctx.prisma.timetable.delete({
        where: { id: input.id }
      });
    }),

  getStats: protectedProcedure
    .input(scheduleIdSchema)
    .query(async ({ input, ctx }) => {
      if (
        ctx.session.userType !== UserType.SYSTEM_ADMIN &&
        ctx.session.userType !== UserType.SYSTEM_MANAGER &&
        ctx.session.userType !== UserType.CAMPUS_ADMIN &&
        ctx.session.userType !== UserType.CAMPUS_COORDINATOR &&
        ctx.session.userType !== UserType.CAMPUS_TEACHER
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Get timetable stats
      const timetable = await ctx.prisma.timetable.findUnique({
        where: { id: input.id },
        include: {
          periods: true,
          class: true
        }
      });
      
      if (!timetable) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Timetable not found'
        });
      }
      
      // Calculate stats
      const periodsByType = timetable.periods.reduce((acc: Record<string, number>, period) => {
        acc[period.type] = (acc[period.type] || 0) + 1;
        return acc;
      }, {});
      
      return {
        timetable,
        stats: {
          totalPeriods: timetable.periods.length,
          periodsByType,
          startDate: timetable.startDate,
          endDate: timetable.endDate,
          durationInDays: Math.ceil((timetable.endDate.getTime() - timetable.startDate.getTime()) / (1000 * 60 * 60 * 24))
        }
      };
    }),

  getUserSchedule: protectedProcedure
    .input(
      z.object({
        // ... existing code ...
      })
    )
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.userType !== UserType.SYSTEM_ADMIN &&
        ctx.session.userType !== UserType.SYSTEM_MANAGER &&
        ctx.session.userType !== UserType.CAMPUS_ADMIN &&
        ctx.session.userType !== UserType.CAMPUS_COORDINATOR &&
        ctx.session.userType !== UserType.CAMPUS_TEACHER &&
        ctx.session.userType !== UserType.CAMPUS_STUDENT
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // ... existing code ...
    }),

  getStudentSchedule: protectedProcedure
    .input(
      z.object({
        // ... existing code ...
      })
    )
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.userType !== UserType.SYSTEM_ADMIN &&
        ctx.session.userType !== UserType.SYSTEM_MANAGER &&
        ctx.session.userType !== UserType.CAMPUS_ADMIN &&
        ctx.session.userType !== UserType.CAMPUS_COORDINATOR &&
        ctx.session.userType !== UserType.CAMPUS_TEACHER &&
        ctx.session.userType !== UserType.CAMPUS_STUDENT
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // ... existing code ...
    }),
}); 