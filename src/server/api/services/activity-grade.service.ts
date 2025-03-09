import { TRPCError } from "@trpc/server";
import { PrismaClient, SystemStatus } from "@prisma/client";
import { 
  CreateActivityGradeInput, 
  UpdateActivityGradeInput, 
  ActivityGradeFilters,
  BatchGradeActivitiesInput
} from "../types/activity";
import { Prisma } from "@prisma/client";
import { SYSTEM_CONFIG, SubmissionStatus } from "../constants";
import { v4 as uuidv4 } from 'uuid';

interface ActivityGradeServiceConfig {
  prisma: PrismaClient;
}

export class ActivityGradeService {
  private prisma: PrismaClient;

  constructor(config: ActivityGradeServiceConfig) {
    this.prisma = config.prisma;
  }

  /**
   * Create a new activity grade
   */
  async createActivityGrade(input: CreateActivityGradeInput) {
    try {
      // Validate activity exists
      const activityResult = await this.prisma.$queryRaw`
        SELECT * FROM "activities" WHERE id = ${input.activityId}
      `;
      
      const activity = (activityResult as any[])[0];
      if (!activity) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Activity not found',
        });
      }

      // Validate student exists
      const studentResult = await this.prisma.$queryRaw`
        SELECT * FROM "student_profiles" WHERE id = ${input.studentId}
      `;
      
      const student = (studentResult as any[])[0];
      if (!student) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Student not found',
        });
      }

      // Check if a grade already exists for this activity and student
      const existingGrade = await this.prisma.$queryRaw`
        SELECT id FROM "activity_grades"
        WHERE "activityId" = ${input.activityId}
        AND "studentId" = ${input.studentId}
      `;

      if (existingGrade && (existingGrade as any[]).length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Activity grade already exists for this student',
        });
      }

      // If score is provided and the activity is not gradable, throw error
      if (input.score !== undefined && !activity.isGradable) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot grade a non-gradable activity',
        });
      }

      // If score is provided, validate it
      if (input.score !== undefined && activity.maxScore !== null) {
        if (input.score < 0 || input.score > activity.maxScore) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Score must be between 0 and ${activity.maxScore}`,
          });
        }
      }

      // Create activity grade
      const id = uuidv4();
      const activityGrade = await this.prisma.$executeRaw`
        INSERT INTO "activity_grades" (
          "id", "activityId", "studentId", "score", "feedback", 
          "status", "submittedAt", "gradedAt", "gradedById", 
          "content", "attachments", "createdAt", "updatedAt"
        ) VALUES (
          ${id}, ${input.activityId}, ${input.studentId}, 
          ${input.score || null}, ${input.feedback || null}, 
          ${input.status || SubmissionStatus.SUBMITTED}, ${new Date()}, 
          ${input.score !== undefined ? new Date() : null}, ${input.gradedById || null}, 
          ${input.content ? JSON.stringify(input.content) : null}, 
          ${input.attachments ? JSON.stringify(input.attachments) : null}, 
          ${new Date()}, ${new Date()}
        )
      `;

      // Get the created grade
      const createdGrade = await this.prisma.$queryRaw`
        SELECT * FROM "activity_grades"
        WHERE "activityId" = ${input.activityId}
        AND "studentId" = ${input.studentId}
      `;

      const grade = (createdGrade as any[])[0];

      // Update student grade with activity grade
      await this.updateStudentGradeWithActivityGrade(grade);

      return grade;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create activity grade',
        cause: error,
      });
    }
  }

  /**
   * Get an activity grade by activity ID and student ID
   */
  async getActivityGrade(activityId: string, studentId: string) {
    try {
      const activityGrade = await this.prisma.$queryRaw`
        SELECT * FROM "activity_grades"
        WHERE "activityId" = ${activityId}
        AND "studentId" = ${studentId}
      `;

      if (!activityGrade || (activityGrade as any[]).length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Activity grade not found',
        });
      }

      return (activityGrade as any[])[0];
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get activity grade',
        cause: error,
      });
    }
  }

  /**
   * List activity grades with pagination and filtering
   */
  async listActivityGrades(
    pagination: { skip?: number; take?: number },
    filters?: ActivityGradeFilters,
  ) {
    try {
      const { skip = 0, take = 10 } = pagination;
      const { activityId, studentId, status, search } = filters || {};
      
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      
      if (activityId) {
        whereClause += ` AND "activityId" = $${params.length + 1}`;
        params.push(activityId);
      }
      
      if (studentId) {
        whereClause += ` AND "studentId" = $${params.length + 1}`;
        params.push(studentId);
      }
      
      if (status) {
        whereClause += ` AND "status" = $${params.length + 1}`;
        params.push(status);
      }
      
      if (search) {
        whereClause += ` AND (
          "id"::text ILIKE $${params.length + 1} OR
          "feedback" ILIKE $${params.length + 1}
        )`;
        params.push(`%${search}%`);
      }
      
      // Count total records
      const totalResult = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "activity_grades" ${Prisma.raw(whereClause)}
      `;
      const total = Number((totalResult as any[])[0].count);
      
      // Fetch data with pagination
      const activityGrades = await this.prisma.$queryRaw`
        SELECT * FROM "activity_grades" 
        ${Prisma.raw(whereClause)}
        ORDER BY "updatedAt" DESC
        LIMIT ${take} OFFSET ${skip}
      `;
      
      return {
        items: activityGrades,
        total,
        pageInfo: {
          hasNextPage: skip + take < total,
          hasPreviousPage: skip > 0,
        },
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to list activity grades',
        cause: error,
      });
    }
  }

  /**
   * Update an activity grade
   */
  async updateActivityGrade(activityId: string, studentId: string, input: UpdateActivityGradeInput) {
    try {
      // Check if activity grade exists
      const existingGrade = await this.prisma.$queryRaw`
        SELECT * FROM "activity_grades"
        WHERE "activityId" = ${activityId}
        AND "studentId" = ${studentId}
      `;

      if (!existingGrade || (existingGrade as any[]).length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Activity grade not found',
        });
      }

      // If score is being updated, validate activity is gradable
      if (input.score !== undefined) {
        const activityResult = await this.prisma.$queryRaw`
          SELECT * FROM "activities" WHERE id = ${activityId}
        `;
        
        const activity = (activityResult as any[])[0];
        if (!activity) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Activity not found',
          });
        }

        if (!activity.isGradable) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot grade a non-gradable activity',
          });
        }

        if (activity.maxScore !== null && (input.score < 0 || input.score > activity.maxScore)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Score must be between 0 and ${activity.maxScore}`,
          });
        }
      }

      // Update activity grade
      let updateFields = '';
      const updateParams: any[] = [];
      
      if (input.score !== undefined) {
        updateFields += `"score" = $${updateParams.length + 1}, `;
        updateParams.push(input.score);
      }
      
      if (input.feedback !== undefined) {
        updateFields += `"feedback" = $${updateParams.length + 1}, `;
        updateParams.push(input.feedback);
      }
      
      if (input.content !== undefined) {
        updateFields += `"content" = $${updateParams.length + 1}, `;
        updateParams.push(JSON.stringify(input.content));
      }
      
      if (input.attachments !== undefined) {
        updateFields += `"attachments" = $${updateParams.length + 1}, `;
        updateParams.push(JSON.stringify(input.attachments));
      }
      
      if (input.status !== undefined) {
        updateFields += `"status" = $${updateParams.length + 1}, `;
        updateParams.push(input.status);
      }
      
      if (input.gradedById !== undefined) {
        updateFields += `"gradedById" = $${updateParams.length + 1}, `;
        updateParams.push(input.gradedById);
      }
      
      if (input.score !== undefined) {
        updateFields += `"gradedAt" = $${updateParams.length + 1}, `;
        updateParams.push(new Date());
      }
      
      updateFields += `"updatedAt" = $${updateParams.length + 1}`;
      updateParams.push(new Date());
      
      const activityGrade = await this.prisma.$queryRaw`
        UPDATE "activity_grades"
        SET ${Prisma.raw(updateFields)}
        WHERE "activityId" = ${activityId}
        AND "studentId" = ${studentId}
        RETURNING *
      `;

      // Update student grade with activity grade
      await this.updateStudentGradeWithActivityGrade((activityGrade as any[])[0]);

      return (activityGrade as any[])[0];
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update activity grade',
        cause: error,
      });
    }
  }

  /**
   * Batch grade activities
   */
  async batchGradeActivities(input: BatchGradeActivitiesInput) {
    try {
      // Validate activity exists
      const activityResult = await this.prisma.$queryRaw`
        SELECT * FROM "activities" WHERE id = ${input.activityId}
      `;
      
      const activity = (activityResult as any[])[0];
      if (!activity) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Activity not found',
        });
      }

      if (!activity.isGradable) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot grade a non-gradable activity',
        });
      }

      // Validate scores
      if (activity.maxScore !== null) {
        for (const grade of input.grades) {
          if (grade.score < 0 || grade.score > activity.maxScore) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Score for student ${grade.studentId} must be between 0 and ${activity.maxScore}`,
            });
          }
        }
      }

      // Get existing grades for this activity
      const studentIds = input.grades.map(g => `'${g.studentId}'`).join(',');
      const existingGradesQuery = await this.prisma.$queryRaw`
        SELECT * FROM "activity_grades"
        WHERE "activityId" = ${input.activityId}
        AND "studentId" IN (${Prisma.raw(studentIds)})
      `;
      
      const existingGrades = existingGradesQuery as any[];
      const existingGradesMap = new Map(existingGrades.map(g => [g.studentId, g]));

      // Process each grade
      const results = [];
      for (const grade of input.grades) {
        if (existingGradesMap.has(grade.studentId)) {
          // Update existing grade
          const updatedGrade = await this.prisma.$queryRaw`
            UPDATE "activity_grades"
            SET 
              "score" = ${grade.score},
              "feedback" = ${grade.feedback || null},
              "status" = ${SubmissionStatus.GRADED},
              "gradedAt" = ${new Date()},
              "gradedById" = ${input.gradedById},
              "updatedAt" = ${new Date()}
            WHERE "activityId" = ${input.activityId}
            AND "studentId" = ${grade.studentId}
            RETURNING *
          `;
          
          results.push((updatedGrade as any[])[0]);
          
          // Update student grade
          await this.updateStudentGradeWithActivityGrade((updatedGrade as any[])[0]);
        } else {
          // Create new grade
          const id = uuidv4();
          const newGrade = await this.prisma.$queryRaw`
            INSERT INTO "activity_grades" (
              "id", "activityId", "studentId", "score", "feedback", 
              "status", "submittedAt", "gradedAt", "gradedById", 
              "createdAt", "updatedAt"
            ) VALUES (
              ${id}, ${input.activityId}, ${grade.studentId}, 
              ${grade.score}, ${grade.feedback || null}, 
              ${SubmissionStatus.GRADED}, ${new Date()}, ${new Date()}, 
              ${input.gradedById}, ${new Date()}, ${new Date()}
            )
            RETURNING *
          `;
          
          results.push((newGrade as any[])[0]);
          
          // Update student grade
          await this.updateStudentGradeWithActivityGrade((newGrade as any[])[0]);
        }
      }

      return results;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to batch grade activities',
        cause: error,
      });
    }
  }

  /**
   * Update student grade with activity grade
   */
  private async updateStudentGradeWithActivityGrade(activityGrade: any) {
    try {
      // Get activity to find class and subject
      const activityResult = await this.prisma.$queryRaw`
        SELECT * FROM "activities" WHERE id = ${activityGrade.activityId}
      `;
      
      const activity = (activityResult as any[])[0];
      if (!activity) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Activity not found',
        });
      }

      // Find grade book for this class
      const gradeBookResult = await this.prisma.$queryRaw`
        SELECT * FROM "grade_books"
        WHERE "classId" = ${activity.classId}
        AND "status" = ${SystemStatus.ACTIVE}
      `;
      
      const gradeBook = (gradeBookResult as any[])[0];
      if (!gradeBook) {
        // No grade book, so we can't update student grade
        return;
      }

      // Find student grade
      const studentGradeResult = await this.prisma.$queryRaw`
        SELECT * FROM "student_grades"
        WHERE "gradeBookId" = ${gradeBook.id}
        AND "studentId" = ${activityGrade.studentId}
      `;
      
      const studentGrade = (studentGradeResult as any[])[0];
      if (!studentGrade) {
        // No student grade, so we can't update
        return;
      }

      // Get all activity grades for this student in this class
      const activityGradesQuery = await this.prisma.$queryRaw`
        SELECT ag.* FROM "activity_grades" ag
        JOIN "activities" a ON ag."activityId" = a.id
        WHERE ag."studentId" = ${activityGrade.studentId}
        AND a."classId" = ${activity.classId}
      `;
      
      const activityGrades = activityGradesQuery as any[];

      // Group activity grades by topic
      const topicGrades: { [topicId: string]: { grades: any[], totalScore: number, totalWeight: number } } = {};

      for (const grade of activityGrades) {
        const actResult = await this.prisma.$queryRaw`
          SELECT * FROM "activities" WHERE id = ${grade.activityId}
        `;
        
        const act = (actResult as any[])[0];
        if (!act || !act.topicId) continue;

        if (!topicGrades[act.topicId]) {
          topicGrades[act.topicId] = { grades: [], totalScore: 0, totalWeight: 0 };
        }

        const weight = act.weightage || 1;
        const score = grade.score !== null ? (grade.score / (act.maxScore || 100)) * 100 : 0;
        
        topicGrades[act.topicId].grades.push(grade);
        topicGrades[act.topicId].totalScore += score * weight;
        topicGrades[act.topicId].totalWeight += weight;
      }

      // Update topic grades
      for (const topicId in topicGrades) {
        const data = topicGrades[topicId];
        const activityScore = data.totalWeight > 0 ? data.totalScore / data.totalWeight : 0;

        // Check if student topic grade exists
        const existingTopicGradeQuery = await this.prisma.$queryRaw`
          SELECT * FROM "student_topic_grades"
          WHERE "studentGradeId" = ${studentGrade.id}
          AND "topicId" = ${topicId}
        `;
        
        const existingTopicGrade = existingTopicGradeQuery as any[];

        if (existingTopicGrade && existingTopicGrade.length > 0) {
          // Update existing topic grade
          await this.prisma.$queryRaw`
            UPDATE "student_topic_grades"
            SET 
              "activityScore" = ${activityScore},
              "score" = ${this.calculateOverallScore(existingTopicGrade[0].assessmentScore || 0, activityScore)},
              "updatedAt" = ${new Date()}
            WHERE "studentGradeId" = ${studentGrade.id}
            AND "topicId" = ${topicId}
          `;
        } else {
          // Create new topic grade
          const id = uuidv4();
          await this.prisma.$queryRaw`
            INSERT INTO "student_topic_grades" (
              "id", "studentGradeId", "topicId", "activityScore", 
              "assessmentScore", "score", "createdAt", "updatedAt"
            ) VALUES (
              ${id}, ${studentGrade.id}, ${topicId}, 
              ${activityScore}, 0, ${activityScore}, ${new Date()}, ${new Date()}
            )
          `;
        }
      }

      // Prepare activity grades data for student grade
      const activityGradeData = activityGrades.map(grade => ({
        id: grade.id,
        activityId: grade.activityId,
        score: grade.score,
        status: grade.status,
        submittedAt: grade.submittedAt,
        gradedAt: grade.gradedAt,
      }));

      // Update student grade with activity grades
      await this.prisma.$queryRaw`
        UPDATE "student_grades"
        SET "activityGrades" = ${JSON.stringify(activityGradeData)},
            "updatedAt" = ${new Date()}
        WHERE "id" = ${studentGrade.id}
      `;

      return true;
    } catch (error) {
      console.error('Failed to update student grade with activity grade:', error);
      return false;
    }
  }

  /**
   * Calculate overall score from assessment and activity scores
   */
  private calculateOverallScore(assessmentScore: number, activityScore: number): number {
    // Default weights: 70% assessments, 30% activities
    const assessmentWeight = 0.7;
    const activityWeight = 0.3;
    
    return (assessmentScore * assessmentWeight) + (activityScore * activityWeight);
  }
} 