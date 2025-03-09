import { TRPCError } from "@trpc/server";
import type { PrismaClient, ActivityType, SystemStatus } from "@prisma/client";
import { SystemStatus as AppSystemStatus } from "../constants";
import type { PaginationInput, BaseFilters } from "../types/index";
import { CreateActivityInput, UpdateActivityInput } from "../types/activity";
import { SYSTEM_CONFIG, SubmissionStatus } from "../constants";
import { v4 as uuidv4 } from 'uuid';

interface ActivityServiceConfig {
  prisma: PrismaClient;
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
    try {
      // Validate subject exists
      const subjectResult = await this.prisma.$queryRaw`
        SELECT id FROM "subjects" WHERE id = ${input.subjectId}
      `;
      
      if (!subjectResult || (subjectResult as any[]).length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subject not found",
        });
      }

      // Validate class exists
      const classResult = await this.prisma.$queryRaw`
        SELECT id FROM "classes" WHERE id = ${input.classId}
      `;
      
      if (!classResult || (classResult as any[]).length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Class not found",
        });
      }

      // If topic ID is provided, validate it exists and belongs to the subject
      if (input.topicId) {
        const topicResult = await this.prisma.$queryRaw`
          SELECT id FROM "subject_topics" 
          WHERE id = ${input.topicId} AND "subjectId" = ${input.subjectId}
        `;
        
        if (!topicResult || (topicResult as any[]).length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Topic not found or does not belong to the subject",
          });
        }
      }

      // Create activity
      const id = uuidv4();
      const status = input.status || AppSystemStatus.ACTIVE;
      const isGradable = input.isGradable || false;
      
      await this.prisma.$executeRaw`
        INSERT INTO "activities" (
          "id", "title", "type", "status", "subjectId", "topicId", "classId", "content",
          "isGradable", "maxScore", "passingScore", "weightage", "gradingConfig",
          "createdAt", "updatedAt"
        ) VALUES (
          ${id}, ${input.title}, ${input.type}, ${status}, ${input.subjectId}, 
          ${input.topicId || null}, ${input.classId}, ${JSON.stringify(input.content)},
          ${isGradable}, ${input.maxScore || null}, ${input.passingScore || null}, 
          ${input.weightage || null}, ${input.gradingConfig ? JSON.stringify(input.gradingConfig) : null},
          ${new Date()}, ${new Date()}
        )
      `;

      // Get the created activity
      const activityResult = await this.prisma.$queryRaw`
        SELECT a.*, 
          s.title as "subjectTitle", 
          c.name as "className",
          t.title as "topicTitle", 
          t.code as "topicCode"
        FROM "activities" a
        LEFT JOIN "subjects" s ON a."subjectId" = s.id
        LEFT JOIN "classes" c ON a."classId" = c.id
        LEFT JOIN "subject_topics" t ON a."topicId" = t.id
        WHERE a.id = ${id}
      `;
      
      const activity = (activityResult as any[])[0];
      
      return {
        ...activity,
        subject: { title: activity.subjectTitle },
        class: { name: activity.className },
        topic: activity.topicId ? { 
          id: activity.topicId,
          title: activity.topicTitle,
          code: activity.topicCode
        } : null
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create activity",
        cause: error,
      });
    }
  }

  /**
   * Get an activity by ID
   */
  async getActivity(id: string) {
    try {
      const activityResult = await this.prisma.$queryRaw`
        SELECT a.*, 
          s.title as "subjectTitle", 
          c.name as "className",
          t.title as "topicTitle", 
          t.code as "topicCode",
          (SELECT COUNT(*) FROM "activity_grades" ag WHERE ag."activityId" = a.id) as "gradeCount"
        FROM "activities" a
        LEFT JOIN "subjects" s ON a."subjectId" = s.id
        LEFT JOIN "classes" c ON a."classId" = c.id
        LEFT JOIN "subject_topics" t ON a."topicId" = t.id
        WHERE a.id = ${id}
      `;
      
      if (!activityResult || (activityResult as any[]).length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Activity not found",
        });
      }
      
      const activity = (activityResult as any[])[0];
      
      return {
        ...activity,
        subject: { title: activity.subjectTitle },
        class: { name: activity.className },
        topic: activity.topicId ? { 
          id: activity.topicId,
          title: activity.topicTitle,
          code: activity.topicCode
        } : null,
        _count: {
          activityGrades: Number(activity.gradeCount)
        }
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get activity",
        cause: error,
      });
    }
  }

  /**
   * List activities with filtering and pagination
   */
  async listActivities(
    pagination: PaginationInput,
    filters?: BaseFilters & { 
      subjectId?: string; 
      topicId?: string;
      type?: ActivityType;
      isGradable?: boolean; 
    },
  ) {
    try {
      const { page = 1, pageSize = SYSTEM_CONFIG.DEFAULT_PAGE_SIZE } = pagination;
      const skip = (page - 1) * pageSize;
      const take = pageSize;
      
      const { subjectId, topicId, type, isGradable, status, search } = filters || {};
      
      // Build the WHERE clause as a string
      let whereClause = 'WHERE 1=1';
      
      if (status) {
        whereClause += ` AND a.status = '${status}'`;
      } else {
        whereClause += ` AND a.status = '${AppSystemStatus.ACTIVE}'`;
      }
      
      if (subjectId) {
        whereClause += ` AND a."subjectId" = '${subjectId}'`;
      }
      
      if (topicId) {
        whereClause += ` AND a."topicId" = '${topicId}'`;
      }
      
      if (type) {
        whereClause += ` AND a.type = '${type}'`;
      }
      
      if (isGradable !== undefined) {
        whereClause += ` AND a."isGradable" = ${isGradable}`;
      }
      
      if (search) {
        whereClause += ` AND (
          a.title ILIKE '%${search}%' OR
          s.title ILIKE '%${search}%' OR
          t.title ILIKE '%${search}%'
        )`;
      }
      
      // Count total records
      const totalResult = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM "activities" a
        LEFT JOIN "subjects" s ON a."subjectId" = s.id
        LEFT JOIN "subject_topics" t ON a."topicId" = t.id
        ${whereClause}
      `;
      
      const total = Number((totalResult as any[])[0].count);
      
      // Fetch data with pagination
      const activitiesResult = await this.prisma.$queryRaw`
        SELECT a.*, 
          s.title as "subjectTitle", 
          c.name as "className",
          t.title as "topicTitle", 
          t.code as "topicCode",
          (SELECT COUNT(*) FROM "activity_grades" ag WHERE ag."activityId" = a.id) as "gradeCount"
        FROM "activities" a
        LEFT JOIN "subjects" s ON a."subjectId" = s.id
        LEFT JOIN "classes" c ON a."classId" = c.id
        LEFT JOIN "subject_topics" t ON a."topicId" = t.id
        ${whereClause}
        ORDER BY a."createdAt" DESC
        LIMIT ${take} OFFSET ${skip}
      `;
      
      const activities = (activitiesResult as any[]).map(activity => ({
        ...activity,
        subject: { title: activity.subjectTitle },
        class: { name: activity.className },
        topic: activity.topicId ? { 
          id: activity.topicId,
          title: activity.topicTitle,
          code: activity.topicCode
        } : null,
        _count: {
          activityGrades: Number(activity.gradeCount)
        }
      }));
      
      return {
        items: activities,
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list activities",
        cause: error,
      });
    }
  }

  /**
   * Update an activity
   */
  async updateActivity(id: string, input: UpdateActivityInput) {
    try {
      // Check if activity exists
      const existingActivityResult = await this.prisma.$queryRaw`
        SELECT * FROM "activities" WHERE id = ${id}
      `;
      
      if (!existingActivityResult || (existingActivityResult as any[]).length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Activity not found",
        });
      }
      
      const existingActivity = (existingActivityResult as any[])[0];

      // If topicId is changed and provided, check if it exists and belongs to the subject
      if (input.topicId !== undefined && input.topicId !== existingActivity.topicId) {
        if (input.topicId !== null) {
          const topicResult = await this.prisma.$queryRaw`
            SELECT id, "subjectId" FROM "subject_topics"
            WHERE id = ${input.topicId}
          `;
          
          if (!topicResult || (topicResult as any[]).length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Topic not found",
            });
          }
          
          const topic = (topicResult as any[])[0];
          
          if (topic.subjectId !== existingActivity.subjectId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Topic does not belong to the activity's subject",
            });
          }
        }
      }

      // If changing to gradable, ensure maxScore is provided
      if (input.isGradable === true && !existingActivity.isGradable && input.maxScore === undefined && existingActivity.maxScore === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum score is required when making an activity gradable",
        });
      }

      // Build update query
      let updateFields = '';
      
      if (input.title !== undefined) {
        updateFields += `"title" = '${input.title}', `;
      }
      
      if (input.type !== undefined) {
        updateFields += `"type" = '${input.type}', `;
      }
      
      if (input.topicId !== undefined) {
        updateFields += `"topicId" = ${input.topicId === null ? 'NULL' : `'${input.topicId}'`}, `;
      }
      
      if (input.content !== undefined) {
        updateFields += `"content" = '${JSON.stringify(input.content)}', `;
      }
      
      if (input.isGradable !== undefined) {
        updateFields += `"isGradable" = ${input.isGradable}, `;
      }
      
      if (input.maxScore !== undefined) {
        updateFields += `"maxScore" = ${input.maxScore}, `;
      }
      
      if (input.passingScore !== undefined) {
        updateFields += `"passingScore" = ${input.passingScore}, `;
      }
      
      if (input.weightage !== undefined) {
        updateFields += `"weightage" = ${input.weightage}, `;
      }
      
      if (input.gradingConfig !== undefined) {
        updateFields += `"gradingConfig" = '${JSON.stringify(input.gradingConfig)}', `;
      }
      
      if (input.status !== undefined) {
        updateFields += `"status" = '${input.status}', `;
      }
      
      updateFields += `"updatedAt" = '${new Date().toISOString()}'`;
      
      // Update activity
      await this.prisma.$executeRaw`
        UPDATE "activities"
        SET ${updateFields}
        WHERE id = ${id}
      `;

      // Get updated activity
      const updatedActivityResult = await this.prisma.$queryRaw`
        SELECT a.*, 
          s.title as "subjectTitle", 
          c.name as "className",
          t.title as "topicTitle", 
          t.code as "topicCode",
          (SELECT COUNT(*) FROM "activity_grades" ag WHERE ag."activityId" = a.id) as "gradeCount"
        FROM "activities" a
        LEFT JOIN "subjects" s ON a."subjectId" = s.id
        LEFT JOIN "classes" c ON a."classId" = c.id
        LEFT JOIN "subject_topics" t ON a."topicId" = t.id
        WHERE a.id = ${id}
      `;
      
      const activity = (updatedActivityResult as any[])[0];
      
      return {
        ...activity,
        subject: { title: activity.subjectTitle },
        class: { name: activity.className },
        topic: activity.topicId ? { 
          id: activity.topicId,
          title: activity.topicTitle,
          code: activity.topicCode
        } : null,
        _count: {
          activityGrades: Number(activity.gradeCount)
        }
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update activity",
        cause: error,
      });
    }
  }

  /**
   * Delete an activity
   */
  async deleteActivity(id: string) {
    try {
      // Check if activity exists and has no submissions
      const existingActivityResult = await this.prisma.$queryRaw`
        SELECT a.*,
          (SELECT COUNT(*) FROM "activity_grades" ag WHERE ag."activityId" = a.id) as "gradeCount"
        FROM "activities" a
        WHERE a.id = ${id}
      `;
      
      if (!existingActivityResult || (existingActivityResult as any[]).length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Activity not found",
        });
      }
      
      const existingActivity = (existingActivityResult as any[])[0];

      // Check if activity has any submissions/grades
      if (Number(existingActivity.gradeCount) > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete activity with existing submissions. Archive it instead.",
        });
      }

      // Delete activity
      await this.prisma.$executeRaw`
        DELETE FROM "activities" WHERE id = ${id}
      `;

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete activity",
        cause: error,
      });
    }
  }

  /**
   * Get activity statistics for a class
   */
  async getActivityStats(classId: string) {
    try {
      // Get all activities for the class
      const activitiesResult = await this.prisma.$queryRaw`
        SELECT a.*,
          (SELECT COUNT(*) FROM "activity_grades" ag WHERE ag."activityId" = a.id) as "gradeCount"
        FROM "activities" a
        WHERE a."classId" = ${classId} AND a.status = ${AppSystemStatus.ACTIVE}
      `;
      
      const activities = activitiesResult as any[];

      // Get gradable activities and their completion stats
      const gradableActivities = activities.filter(a => a.isGradable);
      
      // Get total students in the class
      const studentCountResult = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "student_enrollments"
        WHERE "classId" = ${classId} AND status = ${AppSystemStatus.ACTIVE}
      `;
      
      const studentCount = Number((studentCountResult as any[])[0].count);

      // Calculate stats for each activity
      const activityStats = gradableActivities.map(activity => ({
        id: activity.id,
        title: activity.title,
        type: activity.type,
        maxScore: activity.maxScore,
        submissionCount: Number(activity.gradeCount),
        completionRate: studentCount > 0 ? (Number(activity.gradeCount) / studentCount) * 100 : 0,
      }));

      // Calculate overall stats
      const totalActivities = gradableActivities.length;
      const totalSubmissions = gradableActivities.reduce((sum, activity) => sum + Number(activity.gradeCount), 0);
      const averageCompletionRate = totalActivities > 0 
        ? gradableActivities.reduce((sum, activity) => sum + (Number(activity.gradeCount) / studentCount) * 100, 0) / totalActivities 
        : 0;

      return {
        activities: activityStats,
        summary: {
          totalActivities,
          totalSubmissions,
          averageCompletionRate,
          studentCount,
        },
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get activity statistics",
        cause: error,
      });
    }
  }

  /**
   * Submit a response to an activity
   */
  async submitActivityResponse(activityId: string, studentId: string, submission: any) {
    try {
      // Check if activity exists
      const activityResult = await this.prisma.$queryRaw`
        SELECT * FROM "activities" WHERE id = ${activityId}
      `;
      
      if (!activityResult || (activityResult as any[]).length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Activity not found",
        });
      }

      // Check if submission already exists
      const existingSubmissionResult = await this.prisma.$queryRaw`
        SELECT * FROM "activity_grades"
        WHERE "activityId" = ${activityId} AND "studentId" = ${studentId}
      `;
      
      const existingSubmission = existingSubmissionResult && (existingSubmissionResult as any[]).length > 0 
        ? (existingSubmissionResult as any[])[0] 
        : null;

      if (existingSubmission) {
        // Update existing submission
        await this.prisma.$executeRaw`
          UPDATE "activity_grades"
          SET 
            "content" = ${JSON.stringify(submission)},
            "status" = ${SubmissionStatus.SUBMITTED},
            "submittedAt" = ${new Date()},
            "updatedAt" = ${new Date()}
          WHERE "activityId" = ${activityId} AND "studentId" = ${studentId}
        `;
        
        // Get updated submission
        const updatedSubmissionResult = await this.prisma.$queryRaw`
          SELECT * FROM "activity_grades"
          WHERE "activityId" = ${activityId} AND "studentId" = ${studentId}
        `;
        
        return (updatedSubmissionResult as any[])[0];
      } else {
        // Create new submission
        const id = uuidv4();
        await this.prisma.$executeRaw`
          INSERT INTO "activity_grades" (
            "id", "activityId", "studentId", "content", "status", 
            "submittedAt", "createdAt", "updatedAt"
          ) VALUES (
            ${id}, ${activityId}, ${studentId}, ${JSON.stringify(submission)}, 
            ${SubmissionStatus.SUBMITTED}, ${new Date()}, ${new Date()}, ${new Date()}
          )
        `;
        
        // Get created submission
        const createdSubmissionResult = await this.prisma.$queryRaw`
          SELECT * FROM "activity_grades"
          WHERE "activityId" = ${activityId} AND "studentId" = ${studentId}
        `;
        
        return (createdSubmissionResult as any[])[0];
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to submit activity response",
        cause: error,
      });
    }
  }
} 