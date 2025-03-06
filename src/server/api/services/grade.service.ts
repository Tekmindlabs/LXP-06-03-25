import { TRPCError } from "@trpc/server";
import type { Prisma } from ".prisma/client";
import {
  CreateGradeBookInput,
  UpdateGradeBookInput,
  GradeBookFilters,
  CreateStudentGradeInput,
  UpdateStudentGradeInput,
  StudentGradeFilters,
  GradeServiceConfig
} from "../types/grade";
import { SystemStatus } from "../types/user";

export class GradeService {
  constructor(private config: GradeServiceConfig) {}

  // GradeBook CRUD Operations
  async createGradeBook(input: CreateGradeBookInput) {
    const { prisma } = this.config;

    // Validate class
    const classData = await prisma.class.findUnique({
      where: { id: input.classId }
    });

    if (!classData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Class not found"
      });
    }

    // Create grade book
    const gradeBook = await prisma.gradeBook.create({
      data: {
        classId: input.classId,
        termId: input.termId,
        calculationRules: input.calculationRules as Prisma.InputJsonValue,
        createdById: input.createdById
      },
      include: {
        class: true,
        studentGrades: {
          include: {
            student: true
          }
        }
      }
    });

    return gradeBook;
  }

  async getGradeBook(id: string) {
    const { prisma } = this.config;

    const gradeBook = await prisma.gradeBook.findUnique({
      where: { id },
      include: {
        class: true,
        studentGrades: {
          include: {
            student: true
          }
        }
      }
    });

    if (!gradeBook) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Grade book not found"
      });
    }

    return gradeBook;
  }

  async updateGradeBook(id: string, input: UpdateGradeBookInput) {
    const { prisma } = this.config;

    // Validate grade book exists
    const existingGradeBook = await prisma.gradeBook.findUnique({
      where: { id }
    });

    if (!existingGradeBook) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Grade book not found"
      });
    }

    // Update grade book
    const gradeBook = await prisma.gradeBook.update({
      where: { id },
      data: {
        calculationRules: input.calculationRules as Prisma.InputJsonValue,
        updatedById: input.updatedById
      },
      include: {
        class: true,
        studentGrades: {
          include: {
            student: true
          }
        }
      }
    });

    return gradeBook;
  }

  async deleteGradeBook(id: string) {
    const { prisma } = this.config;

    await prisma.gradeBook.delete({
      where: { id }
    });
  }

  async listGradeBooks(filters: GradeBookFilters, skip?: number, take?: number) {
    const { prisma } = this.config;

    const where: Prisma.GradeBookWhereInput = {
      classId: filters.classId,
      termId: filters.termId,
      AND: [
        filters.search ? {
          OR: [
            { id: { contains: filters.search } },
            { classId: { contains: filters.search } }
          ]
        } : {},
      ]
    };

    const [total, gradeBooks] = await Promise.all([
      prisma.gradeBook.count({ where }),
      prisma.gradeBook.findMany({
        where,
        include: {
          class: true,
          studentGrades: true
        },
        skip,
        take,
        orderBy: [
          { createdAt: 'desc' }
        ]
      })
    ]);

    return {
      total,
      items: gradeBooks
    };
  }

  // Student Grade Operations
  async createStudentGrade(input: CreateStudentGradeInput) {
    const { prisma } = this.config;

    // Validate grade book
    const gradeBook = await prisma.gradeBook.findUnique({
      where: { id: input.gradeBookId }
    });

    if (!gradeBook) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Grade book not found"
      });
    }

    // Validate student
    const student = await prisma.studentProfile.findUnique({
      where: { id: input.studentId }
    });

    if (!student) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Student not found"
      });
    }

    // Create student grade
    const studentGrade = await prisma.studentGrade.create({
      data: {
        gradeBookId: input.gradeBookId,
        studentId: input.studentId,
        assessmentGrades: input.assessmentGrades as Prisma.InputJsonValue,
        finalGrade: input.finalGrade,
        letterGrade: input.letterGrade,
        attendance: input.attendance,
        comments: input.comments,
        status: SystemStatus.ACTIVE
      },
      include: {
        gradeBook: true,
        student: true
      }
    });

    return studentGrade;
  }

  async updateStudentGrade(gradeBookId: string, studentId: string, input: UpdateStudentGradeInput) {
    const { prisma } = this.config;

    // Update student grade
    const studentGrade = await prisma.studentGrade.update({
      where: {
        gradeBookId_studentId: {
          gradeBookId,
          studentId
        }
      },
      data: {
        assessmentGrades: input.assessmentGrades as Prisma.InputJsonValue,
        finalGrade: input.finalGrade,
        letterGrade: input.letterGrade,
        attendance: input.attendance,
        comments: input.comments,
        status: input.status
      },
      include: {
        gradeBook: true,
        student: true
      }
    });

    return studentGrade;
  }

  async listStudentGrades(filters: StudentGradeFilters, skip?: number, take?: number) {
    const { prisma } = this.config;

    const where: Prisma.StudentGradeWhereInput = {
      gradeBookId: filters.gradeBookId,
      studentId: filters.studentId,
      status: filters.status as SystemStatus,
      finalGrade: filters.finalGrade ? {
        gte: filters.finalGrade
      } : undefined
    };

    const [total, studentGrades] = await Promise.all([
      prisma.studentGrade.count({ where }),
      prisma.studentGrade.findMany({
        where,
        include: {
          gradeBook: true,
          student: true
        },
        skip,
        take,
        orderBy: [
          { createdAt: 'desc' }
        ]
      })
    ]);

    return {
      total,
      items: studentGrades
    };
  }

  async calculateClassGrades(classId: string) {
    const { prisma } = this.config;

    const gradeBooks = await prisma.gradeBook.findMany({
      where: { classId },
      include: {
        studentGrades: true
      }
    });

    const calculatedGrades = gradeBooks.map(gradeBook => {
      const rules = gradeBook.calculationRules as { weights: Record<string, number> };
      const grades = gradeBook.studentGrades;

      const weightedGrades = grades.map(grade => {
        const assessmentGrades = grade.assessmentGrades as Record<string, number>;
        let totalWeightedScore = 0;
        let totalWeight = 0;

        Object.entries(assessmentGrades).forEach(([assessmentId, score]) => {
          const weight = rules.weights[assessmentId] || 1;
          totalWeightedScore += score * weight;
          totalWeight += weight;
        });

        return {
          studentId: grade.studentId,
          finalGrade: totalWeight > 0 ? totalWeightedScore / totalWeight : 0
        };
      });

      return {
        gradeBookId: gradeBook.id,
        grades: weightedGrades
      };
    });

    return calculatedGrades;
  }

  async getStudentProgress(studentId: string, classId: string) {
    const { prisma } = this.config;

    const gradeBooks = await prisma.gradeBook.findMany({
      where: { classId },
      include: {
        studentGrades: {
          where: { studentId }
        }
      }
    });

    const progress = gradeBooks.map(gradeBook => ({
      gradeBookId: gradeBook.id,
      grades: gradeBook.studentGrades
    }));

    return progress;
  }

  async createGrade(input: any) {
    // Placeholder for createGrade logic
    return {};
  }

  async getGrade(id: string) {
    const { prisma } = this.config;

    const grade = await prisma.studentGrade.findUnique({
      where: { id },
      include: {
        student: true,
        gradeBook: true,
      }
    });

    if (!grade) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Grade not found"
      });
    }

    return grade;
  }

  async listGrades(pagination: { page: number; pageSize: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }, filters: any) {
    const { prisma } = this.config;

    // Implement logic to handle pagination, sorting, and filtering
    const { page, pageSize, sortBy, sortOrder } = pagination;
    const where = { ...filters };

    const [total, grades] = await Promise.all([
      prisma.studentGrade.count({ where }),
      prisma.studentGrade.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
      }),
    ]);

    return { total, items: grades };
  }

  async updateGrade(id: string, data: any) {
    // Placeholder for updateGrade logic
    return {};
  }

  async deleteGrade(id: string) {
    // Placeholder for deleteGrade logic
    return {};
  }

  async getStudentStats(studentId: string) {
    // Placeholder for getStudentStats logic
    return {};
  }
} 