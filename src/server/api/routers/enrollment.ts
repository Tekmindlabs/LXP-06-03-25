import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { 
  EnrollmentService, 
  createEnrollmentSchema, 
  updateEnrollmentSchema, 
  bulkEnrollmentSchema 
} from "../services/enrollment.service";

export const enrollmentRouter = createTRPCRouter({
  // Create a new enrollment
  createEnrollment: protectedProcedure
    .input(createEnrollmentSchema)
    .mutation(async ({ ctx, input }) => {
      const enrollmentService = new EnrollmentService({ prisma: ctx.prisma });
      return enrollmentService.createEnrollment(input);
    }),

  // Get enrollment by ID
  getEnrollment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const enrollmentService = new EnrollmentService({ prisma: ctx.prisma });
      return enrollmentService.getEnrollment(input.id);
    }),

  // Update enrollment
  updateEnrollment: protectedProcedure
    .input(z.object({
      data: updateEnrollmentSchema,
      updatedById: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const enrollmentService = new EnrollmentService({ prisma: ctx.prisma });
      return enrollmentService.updateEnrollment(input.data, input.updatedById);
    }),

  // Delete enrollment
  deleteEnrollment: protectedProcedure
    .input(z.object({
      id: z.string(),
      updatedById: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const enrollmentService = new EnrollmentService({ prisma: ctx.prisma });
      return enrollmentService.deleteEnrollment(input.id, input.updatedById);
    }),

  // Get enrollments by class
  getEnrollmentsByClass: protectedProcedure
    .input(z.object({ classId: z.string() }))
    .query(async ({ ctx, input }) => {
      const enrollmentService = new EnrollmentService({ prisma: ctx.prisma });
      return enrollmentService.getEnrollmentsByClass(input.classId);
    }),

  // Get enrollments by student
  getEnrollmentsByStudent: protectedProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const enrollmentService = new EnrollmentService({ prisma: ctx.prisma });
      return enrollmentService.getEnrollmentsByStudent(input.studentId);
    }),

  // Bulk enroll students
  bulkEnroll: protectedProcedure
    .input(bulkEnrollmentSchema)
    .mutation(async ({ ctx, input }) => {
      const enrollmentService = new EnrollmentService({ prisma: ctx.prisma });
      return enrollmentService.bulkEnroll(input);
    }),
}); 