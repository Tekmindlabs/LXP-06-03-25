import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import { SystemStatus, AssessmentCategory, GradingType, GradingScale } from "../constants";
import type { PaginationInput, BaseFilters } from "../types";
import { Prisma } from "@prisma/client";

interface AssessmentServiceConfig {
  prisma: PrismaClient;
  defaultInstitutionId?: string;
  currentUserId?: string;
  defaultClassId?: string;
  defaultTermId?: string;
}

interface CreateAssessmentInput {
  title: string;
  description?: string;
  category: AssessmentCategory;
  subjectId: string;
  maxScore: number;
  weightage: number;
  gradingType: GradingType;
  gradingScale?: GradingScale;
  rubric?: Record<string, unknown>;
  dueDate?: Date;
  instructions?: string;
  resources?: Record<string, unknown>[];
  status?: SystemStatus;
}

interface UpdateAssessmentInput {
  title?: string;
  description?: string;
  category?: AssessmentCategory;
  maxScore?: number;
  weightage?: number;
  gradingType?: GradingType;
  gradingScale?: GradingScale;
  rubric?: Record<string, unknown>;
  dueDate?: Date;
  instructions?: string;
  resources?: Record<string, unknown>[];
  status?: SystemStatus;
}

export class AssessmentService {
  private prisma: PrismaClient;
  private config: AssessmentServiceConfig;

  constructor(config: AssessmentServiceConfig) {
    this.prisma = config.prisma;
    this.config = config;
  }

  /**
   * Create a new assessment
   */
  async createAssessment(input: CreateAssessmentInput) {
    // Check if subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: input.subjectId },
    });

    if (!subject) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Subject not found",
      });
    }

    // Validate weightage (should be between 0 and 100)
    if (input.weightage < 0 || input.weightage > 100) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Weightage must be between 0 and 100",
      });
    }

    // Check total weightage of all assessments in the subject
    const existingAssessments = await this.prisma.assessment.findMany({
      where: { subjectId: input.subjectId },
      select: { weightage: true },
    });

    const totalWeightage = existingAssessments.reduce(
      (sum: number, assessment: { weightage: number | null }) => sum + (assessment.weightage || 0),
      0,
    );

    if (totalWeightage + input.weightage > 100) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Total weightage of all assessments cannot exceed 100%",
      });
    }

    // Create assessment with explicit type casting
    const assessmentData = {
      title: input.title,
      maxScore: input.maxScore,
      weightage: input.weightage,
      gradingType: input.gradingType,
      gradingScale: input.gradingScale || null,
      rubric: input.rubric as Prisma.InputJsonValue,
      dueDate: input.dueDate || null,
      instructions: input.instructions || null,
      resources: input.resources as unknown as Prisma.InputJsonValue,
      status: input.status || SystemStatus.ACTIVE,
      // Use connect syntax for required relations
      subject: {
        connect: { id: input.subjectId }
      }
    };

    // Cast to unknown first, then to the required type
    const assessment = await this.prisma.assessment.create({
      data: assessmentData as unknown as Prisma.AssessmentCreateInput,
    });

    return assessment;
  }

  /**
   * Get assessment by ID with related data
   */
  async getAssessment(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        submissions: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
            score: true,
            student: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Assessment not found",
      });
    }

    return assessment;
  }

  /**
   * Get paginated list of assessments
   */
  async listAssessments(
    pagination: PaginationInput,
    filters?: BaseFilters & { subjectId?: string; category?: AssessmentCategory },
  ) {
    const { page = 1, pageSize = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const { status, search, subjectId, category } = filters || {};

    const where = {
      status: status as SystemStatus,
      subjectId,
      category,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
          { description: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      this.prisma.assessment.count({ where }),
      this.prisma.assessment.findMany({
        where,
        include: {
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          _count: {
            select: {
              submissions: true,
            },
          },
        },
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
  }

  /**
   * Update assessment
   */
  async updateAssessment(id: string, input: UpdateAssessmentInput) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        subject: {
          include: {
            assessments: {
              where: {
                NOT: {
                  id,
                },
              },
              select: {
                weightage: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Assessment not found",
      });
    }

    // If weightage is being updated, validate total weightage
    if (input.weightage !== undefined) {
      if (input.weightage < 0 || input.weightage > 100) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Weightage must be between 0 and 100",
        });
      }

      const totalOtherWeightage = assessment.subject.assessments.reduce(
        (sum: number, a: { weightage: number | null }) => sum + (a.weightage || 0),
        0,
      );

      if (totalOtherWeightage + input.weightage > 100) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Total weightage of all assessments cannot exceed 100%",
        });
      }
    }

    const updatedAssessment = await this.prisma.assessment.update({
      where: { id },
      data: {
        title: input.title,
        category: input.category,
        maxScore: input.maxScore,
        weightage: input.weightage,
        gradingType: input.gradingType,
        gradingScale: input.gradingScale,
        rubric: input.rubric as Prisma.InputJsonValue,
        dueDate: input.dueDate,
        instructions: input.instructions,
        resources: input.resources as unknown as Prisma.InputJsonValue,
        status: input.status,
        updatedAt: new Date(),
      } as Prisma.AssessmentUpdateInput,
    });

    return updatedAssessment;
  }

  /**
   * Delete assessment
   */
  async deleteAssessment(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Assessment not found",
      });
    }

    // Check if assessment has any submissions
    if (assessment._count.submissions > 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Cannot delete assessment with existing submissions",
      });
    }

    await this.prisma.assessment.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Get assessment statistics
   */
  async getAssessmentStats(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        submissions: {
          select: {
            status: true,
            score: true,
            submittedAt: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Assessment not found",
      });
    }

    // Calculate submission status distribution
    const submissionStatusDistribution = assessment.submissions.reduce(
      (acc: Record<string, number>, submission: { status: string }) => {
        acc[submission.status] = (acc[submission.status] || 0) + 1;
        return acc;
      },
      {},
    );

    // Calculate score distribution
    const scores = assessment.submissions
      .filter((s: { score: number | null }) => s.score !== null)
      .map((s: { score: number | null }) => s.score as number);

    const scoreStats = scores.length > 0 ? {
      min: Math.min(...scores),
      max: Math.max(...scores),
      average: scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
      median: scores.sort((a: number, b: number) => a - b)[Math.floor(scores.length / 2)],
    } : null;

    // Calculate submission timeline
    const submissionTimeline = assessment.submissions
      .filter((s: { submittedAt: Date | null }) => s.submittedAt !== null)
      .reduce((acc: Record<string, number>, submission: { submittedAt: Date | null }) => {
        const date = (submission.submittedAt as Date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalSubmissions: assessment._count.submissions,
      submissionStatusDistribution,
      scoreStats,
      submissionTimeline,
    };
  }
} 