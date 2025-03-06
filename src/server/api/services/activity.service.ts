import { TRPCError } from "@trpc/server";
import type { PrismaClient, ActivityType, SystemStatus, Prisma } from "@prisma/client";
import { SystemStatus as AppSystemStatus } from "../constants";
import type { PaginationInput, BaseFilters } from "../types/index";

interface ActivityServiceConfig {
  prisma: PrismaClient;
}

interface CreateActivityInput {
  title: string;
  description?: string;
  type: ActivityType;
  subjectId: string;
  classId: string;
  startDate?: Date;
  endDate?: Date;
  resources?: Record<string, unknown>[];
  status?: SystemStatus;
  content: Prisma.InputJsonValue;
}

interface UpdateActivityInput {
  title?: string;
  description?: string;
  type?: ActivityType;
  startDate?: Date;
  endDate?: Date;
  resources?: Record<string, unknown>[];
  status?: SystemStatus;
  content?: Prisma.InputJsonValue;
}

export class ActivityService {
  private prisma: PrismaClient;

  constructor(config: ActivityServiceConfig) {
    this.prisma = config.prisma;
  }

  /**
   * Create a new activity
   */
  async createActivity(input: CreateActivityInput) {
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

    // Check if class exists
    const classEntity = await this.prisma.class.findUnique({
      where: { id: input.classId },
    });

    if (!classEntity) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Class not found",
      });
    }

    // Validate dates if provided
    if (input.startDate && input.endDate && input.startDate > input.endDate) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Start date must be before end date",
      });
    }

    // Create activity
    const activity = await this.prisma.activity.create({
      data: {
        title: input.title,
        type: input.type,
        subjectId: input.subjectId,
        classId: input.classId,
        content: input.content,
        status: input.status || AppSystemStatus.ACTIVE,
      },
    });

    return activity;
  }

  /**
   * Get activity by ID with related data
   */
  async getActivity(id: string) {
    const activity = await this.prisma.activity.findUnique({
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
        class: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!activity) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Activity not found",
      });
    }

    return activity;
  }

  /**
   * Get paginated list of activities
   */
  async listActivities(
    pagination: PaginationInput,
    filters?: BaseFilters & { subjectId?: string; type?: ActivityType },
  ) {
    const { page = 1, pageSize = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const { status, search, subjectId, type } = filters || {};

    // Create the where condition
    const where: Prisma.ActivityWhereInput = {
      status: status as SystemStatus,
      subjectId,
      type,
    };

    // Add search condition if provided
    if (search) {
      where.title = { contains: search, mode: "insensitive" as Prisma.QueryMode };
    }

    const [total, items] = await Promise.all([
      this.prisma.activity.count({ where }),
      this.prisma.activity.findMany({
        where,
        include: {
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          class: {
            select: {
              id: true,
              code: true,
              name: true,
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
   * Update activity
   */
  async updateActivity(id: string, input: UpdateActivityInput) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Activity not found",
      });
    }

    // Validate dates if provided
    if (input.startDate && input.endDate && input.startDate > input.endDate) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Start date must be before end date",
      });
    }

    const updated = await this.prisma.activity.update({
      where: { id },
      data: {
        title: input.title,
        type: input.type as ActivityType,
        content: input.content,
        status: input.status,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Delete activity
   */
  async deleteActivity(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Activity not found",
      });
    }

    // Check if there are any submissions
    // If there are submissions, don't allow deletion
    // This would need to be implemented based on your submission model

    // Delete the activity
    await this.prisma.activity.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Activity not found",
      });
    }

    // Calculate statistics based on submissions
    // This would need to be implemented based on your submission model
    // For now, return placeholder data
    
    return {
      totalSubmissions: 0,
      completionRate: 0,
      averageScore: 0,
      status: {
        pending: 0,
        submitted: 0,
        graded: 0,
      },
    };
  }

  /**
   * Submit activity response
   */
  async submitActivityResponse(activityId: string, studentId: string, submission: Prisma.InputJsonValue) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Activity not found",
      });
    }

    // Here you would implement the logic to save the student's submission
    // This depends on how you're modeling submissions in your database
    
    return { success: true };
  }
} 