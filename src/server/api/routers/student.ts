import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { StudentService } from "../services/student.service";
import { TRPCError } from "@trpc/server";
import { SystemStatus } from "@prisma/client";

export const studentRouter = createTRPCRouter({
  getStudentEnrollments: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        campusId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const studentService = new StudentService({ prisma: ctx.prisma });
      return studentService.getStudentEnrollments(input.studentId, input.campusId);
    }),

  enrollStudentToCampus: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        campusId: z.string(),
        programId: z.string(),
        termId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const studentService = new StudentService({ prisma: ctx.prisma });
      return studentService.enrollStudentToCampus(input);
    }),

  enrollInProgram: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        programId: z.string(),
        campusId: z.string(),
        termId: z.string(),
        startDate: z.date().optional(),
        status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED']).optional().default('ACTIVE'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if student exists
      const student = await ctx.prisma.studentProfile.findUnique({
        where: { id: input.studentId },
      });

      if (!student) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Student not found',
        });
      }

      // Check if program exists
      const program = await ctx.prisma.program.findUnique({
        where: { id: input.programId },
      });

      if (!program) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Program not found',
        });
      }

      // Check if term exists
      const term = await ctx.prisma.term.findUnique({
        where: { id: input.termId },
      });

      if (!term) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Term not found',
        });
      }

      // Check for existing enrollment
      const existingEnrollment = await ctx.prisma.studentEnrollment.findFirst({
        where: {
          studentId: input.studentId,
          class: {
            courseCampus: {
              programCampus: {
                programId: input.programId,
                campusId: input.campusId,
              }
            }
          },
          status: SystemStatus.ACTIVE,
        },
      });

      if (existingEnrollment) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Student is already enrolled in this program',
        });
      }

      // Find the appropriate class for enrollment
      const targetClass = await ctx.prisma.class.findFirst({
        where: {
          courseCampus: {
            programCampus: {
              programId: input.programId,
              campusId: input.campusId,
            }
          },
          termId: input.termId,
          status: SystemStatus.ACTIVE,
        },
      });

      if (!targetClass) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active class found for the given program, campus, and term',
        });
      }

      // Create new enrollment
      return ctx.prisma.studentEnrollment.create({
        data: {
          studentId: input.studentId,
          classId: targetClass.id,
          startDate: input.startDate || new Date(),
          status: input.status === 'ACTIVE' ? SystemStatus.ACTIVE : SystemStatus.INACTIVE,
          createdById: ctx.session.user.id,
        },
        include: {
          class: {
            include: {
              courseCampus: {
                include: {
                  programCampus: {
                    include: {
                      program: true,
                    }
                  }
                }
              },
              term: true,
            }
          },
        },
      });
    }),
}); 
