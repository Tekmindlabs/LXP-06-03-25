import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { SubjectTopicService } from "../services/subject-topic.service";
import { SystemStatus } from "@prisma/client";
import { SubjectNodeType, CompetencyLevel } from "../constants";

export const subjectTopicRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        title: z.string(),
        description: z.string().optional(),
        context: z.string().optional(),
        learningOutcomes: z.string().optional(),
        nodeType: z.enum([
          SubjectNodeType.CHAPTER,
          SubjectNodeType.TOPIC,
          SubjectNodeType.SUBTOPIC,
        ]),
        orderIndex: z.number().int().min(0),
        estimatedMinutes: z.number().int().optional(),
        competencyLevel: z.enum([
          CompetencyLevel.BASIC,
          CompetencyLevel.INTERMEDIATE,
          CompetencyLevel.ADVANCED,
          CompetencyLevel.EXPERT,
        ]).optional(),
        keywords: z.array(z.string()).optional(),
        subjectId: z.string(),
        parentTopicId: z.string().optional(),
        status: z.enum([
          SystemStatus.ACTIVE,
          SystemStatus.INACTIVE,
          SystemStatus.ARCHIVED,
        ]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = new SubjectTopicService({
        prisma: ctx.prisma,
      });
      return service.createSubjectTopic({
        code: input.code,
        title: input.title,
        description: input.description,
        context: input.context,
        learningOutcomes: input.learningOutcomes,
        nodeType: input.nodeType,
        orderIndex: input.orderIndex,
        estimatedMinutes: input.estimatedMinutes,
        competencyLevel: input.competencyLevel,
        keywords: input.keywords,
        subjectId: input.subjectId,
        parentTopicId: input.parentTopicId,
        status: input.status
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = new SubjectTopicService({
        prisma: ctx.prisma,
      });
      return service.getSubjectTopic(input.id);
    }),

  list: protectedProcedure
    .input(
      z.object({
        subjectId: z.string().optional(),
        nodeType: z.enum([
          SubjectNodeType.CHAPTER,
          SubjectNodeType.TOPIC,
          SubjectNodeType.SUBTOPIC,
        ]).optional(),
        parentTopicId: z.string().optional(),
        status: z.enum([
          SystemStatus.ACTIVE,
          SystemStatus.INACTIVE,
          SystemStatus.ARCHIVED,
        ]).optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).optional(),
        pageSize: z.number().int().min(1).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const service = new SubjectTopicService({
        prisma: ctx.prisma,
      });
      const { page, pageSize, ...filters } = input;
      return service.listSubjectTopics(
        {
          skip: page ? (page - 1) * (pageSize || 10) : undefined,
          take: pageSize,
        },
        filters
      );
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        context: z.string().optional(),
        learningOutcomes: z.string().optional(),
        nodeType: z.enum([
          SubjectNodeType.CHAPTER,
          SubjectNodeType.TOPIC,
          SubjectNodeType.SUBTOPIC,
        ]).optional(),
        orderIndex: z.number().int().min(0).optional(),
        estimatedMinutes: z.number().int().optional(),
        competencyLevel: z.enum([
          CompetencyLevel.BASIC,
          CompetencyLevel.INTERMEDIATE,
          CompetencyLevel.ADVANCED,
          CompetencyLevel.EXPERT,
        ]).optional(),
        keywords: z.array(z.string()).optional(),
        parentTopicId: z.string().nullable().optional(),
        status: z.enum([
          SystemStatus.ACTIVE,
          SystemStatus.INACTIVE,
          SystemStatus.ARCHIVED,
        ]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = new SubjectTopicService({
        prisma: ctx.prisma,
      });
      const { id, ...updateData } = input;
      
      // Convert null to undefined for string fields to match the type
      const sanitizedData: any = { ...updateData };
      if (sanitizedData.description === null) sanitizedData.description = undefined;
      if (sanitizedData.context === null) sanitizedData.context = undefined;
      if (sanitizedData.learningOutcomes === null) sanitizedData.learningOutcomes = undefined;
      
      return service.updateSubjectTopic(id, sanitizedData);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const service = new SubjectTopicService({
        prisma: ctx.prisma,
      });
      return service.deleteSubjectTopic(input.id);
    }),

  getHierarchy: protectedProcedure
    .input(z.object({ subjectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = new SubjectTopicService({
        prisma: ctx.prisma,
      });
      return service.getTopicHierarchy(input.subjectId);
    }),
}); 