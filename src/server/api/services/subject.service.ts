import { TRPCError } from "@trpc/server";
import { PrismaClient } from "@prisma/client";
import { SystemStatus } from "../constants";
import type { PaginationInput, BaseFilters } from "../types";
import { Prisma } from "@prisma/client";

interface SubjectServiceConfig {
  prisma: PrismaClient;
}

interface CreateSubjectInput {
  code: string;
  name: string;
  credits: number;
  courseId: string;
  syllabus?: Record<string, unknown>;
  status?: SystemStatus;
}

interface UpdateSubjectInput {
  name?: string;
  credits?: number;
  syllabus?: Record<string, unknown>;
  status?: SystemStatus;
}

export class SubjectService {
  private prisma: PrismaClient;

  constructor(config: SubjectServiceConfig) {
    this.prisma = config.prisma;
  }

  /**
   * Create a new subject
   * @param input Subject data
   * @returns Created subject
   */
  async createSubject(input: CreateSubjectInput) {
    // Create subject
    const subject = await this.prisma.subject.create({
      data: {
        code: input.code,
        name: input.name,
        credits: input.credits,
        courseId: input.courseId,
        syllabus: Prisma.JsonNull,
        status: input.status || SystemStatus.ACTIVE,
      },
    });

    return subject;
  }

  /**
   * Get a subject by ID
   * @param id Subject ID
   * @returns Subject data
   */
  async getSubject(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!subject) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Subject not found",
      });
    }

    return subject;
  }

  /**
   * List subjects with pagination and filtering
   * @param pagination Pagination options
   * @param filters Filter options
   * @returns Paginated list of subjects
   */
  async listSubjects(
    pagination: { skip?: number; take?: number },
    filters?: BaseFilters & { courseId?: string },
  ) {
    const { skip = 0, take = 10 } = pagination;
    const { search, status, courseId } = filters || {};

    // Build where clause
    let where: any = {};
    
    if (courseId) {
      where.courseId = courseId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } }
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.subject.count({ where }),
      this.prisma.subject.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
    ]);

    return { total, items };
  }

  /**
   * Update a subject
   * @param id Subject ID
   * @param input Updated subject data
   * @returns Updated subject
   */
  async updateSubject(id: string, input: UpdateSubjectInput) {
    // Check if subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Subject not found',
      });
    }

    // Update subject
    const data: any = {};
    
    if (input.name !== undefined) {
      data.name = input.name;
    }
    
    if (input.credits !== undefined) {
      data.credits = input.credits;
    }
    
    if (input.syllabus !== undefined) {
      data.syllabus = Prisma.JsonNull;
    }
    
    if (input.status !== undefined) {
      data.status = input.status;
    }

    const updatedSubject = await this.prisma.subject.update({
      where: { id },
      data
    });

    return updatedSubject;
  }

  /**
   * Delete subject
   */
  async deleteSubject(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            activities: true,
            assessments: true,
            teacherQualifications: true,
          },
        },
      },
    });

    if (!subject) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Subject not found",
      });
    }

    // Check if subject has any dependencies
    if (
      subject._count.activities > 0 ||
      subject._count.assessments > 0 ||
      subject._count.teacherQualifications > 0
    ) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Cannot delete subject with existing activities, assessments, or teacher qualifications",
      });
    }

    await this.prisma.subject.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Get subject statistics
   */
  async getSubjectStats(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            activities: true,
            assessments: true,
            teacherQualifications: true,
          },
        },
        activities: {
          select: {
            type: true,
          },
        },
        assessments: {
          select: {
            maxScore: true,
            weightage: true,
          },
        },
        teacherQualifications: {
          select: {
            level: true,
            isVerified: true,
          },
        },
      },
    });

    if (!subject) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Subject not found",
      });
    }

    // Calculate activity type distribution
    const activityTypeDistribution = subject.activities.reduce(
      (acc: Record<string, number>, activity: { type: string }) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      },
      {},
    );

    // Calculate teacher qualification level distribution
    const qualificationLevelDistribution = subject.teacherQualifications.reduce(
      (acc: Record<string, number>, qual: { level: string }) => {
        acc[qual.level] = (acc[qual.level] || 0) + 1;
        return acc;
      },
      {},
    );

    // Calculate total assessment weightage
    const totalWeightage = subject.assessments.reduce(
      (sum: number, assessment: { weightage: number | null }) => 
        sum + (assessment.weightage || 0),
      0,
    );

    return {
      counts: subject._count,
      activityTypeDistribution,
      qualificationLevelDistribution,
      totalWeightage,
      verifiedTeacherCount: subject.teacherQualifications.filter(
        (q: { isVerified: boolean }) => q.isVerified
      ).length,
    };
  }
} 