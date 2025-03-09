import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ActivityGradeService } from "../services/activity-grade.service";
import { SubmissionStatus } from "../constants";

export const activityGradeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        activityId: z.string(),
        studentId: z.string(),
        score: z.number().min(0).optional(),
        feedback: z.string().optional(),
        content: z.any().optional(),
        attachments: z.any().optional(),
        status: z.enum([
          SubmissionStatus.DRAFT,
          SubmissionStatus.SUBMITTED,
          SubmissionStatus.UNDER_REVIEW,
          SubmissionStatus.GRADED,
          SubmissionStatus.RETURNED,
          SubmissionStatus.RESUBMITTED,
          SubmissionStatus.LATE,
          SubmissionStatus.REJECTED,
        ]).optional(),
        gradedById: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = new ActivityGradeService({
        prisma: ctx.prisma,
      });
      return service.createActivityGrade({
        activityId: input.activityId,
        studentId: input.studentId,
        score: input.score,
        feedback: input.feedback,
        content: input.content,
        attachments: input.attachments,
        status: input.status,
        gradedById: input.gradedById,
      });
    }),

  get: protectedProcedure
    .input(
      z.object({
        activityId: z.string(),
        studentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const service = new ActivityGradeService({
        prisma: ctx.prisma,
      });
      return service.getActivityGrade(input.activityId, input.studentId);
    }),

  list: protectedProcedure
    .input(
      z.object({
        skip: z.number().int().min(0).optional(),
        take: z.number().int().min(1).max(100).optional(),
        activityId: z.string().optional(),
        studentId: z.string().optional(),
        status: z.enum([
          SubmissionStatus.DRAFT,
          SubmissionStatus.SUBMITTED,
          SubmissionStatus.UNDER_REVIEW,
          SubmissionStatus.GRADED,
          SubmissionStatus.RETURNED,
          SubmissionStatus.RESUBMITTED,
          SubmissionStatus.LATE,
          SubmissionStatus.REJECTED,
        ]).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { skip, take, ...filters } = input;
      const service = new ActivityGradeService({
        prisma: ctx.prisma,
      });
      return service.listActivityGrades({ skip: skip || 0, take: take || 10 }, {
        activityId: filters.activityId,
        studentId: filters.studentId,
        status: filters.status,
        search: filters.search,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        activityId: z.string(),
        studentId: z.string(),
        score: z.number().min(0).optional(),
        feedback: z.string().optional(),
        content: z.any().optional(),
        attachments: z.any().optional(),
        status: z.enum([
          SubmissionStatus.DRAFT,
          SubmissionStatus.SUBMITTED,
          SubmissionStatus.UNDER_REVIEW,
          SubmissionStatus.GRADED,
          SubmissionStatus.RETURNED,
          SubmissionStatus.RESUBMITTED,
          SubmissionStatus.LATE,
          SubmissionStatus.REJECTED,
        ]).optional(),
        gradedById: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { activityId, studentId, ...data } = input;
      const service = new ActivityGradeService({
        prisma: ctx.prisma,
      });
      return service.updateActivityGrade(activityId, studentId, {
        score: data.score,
        feedback: data.feedback,
        content: data.content,
        attachments: data.attachments,
        status: data.status,
        gradedById: data.gradedById,
      });
    }),

  batchGrade: protectedProcedure
    .input(
      z.object({
        activityId: z.string(),
        grades: z.array(
          z.object({
            studentId: z.string(),
            score: z.number().min(0),
            feedback: z.string().optional(),
          })
        ),
        gradedById: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = new ActivityGradeService({
        prisma: ctx.prisma,
      });
      return service.batchGradeActivities(input);
    }),
}); 