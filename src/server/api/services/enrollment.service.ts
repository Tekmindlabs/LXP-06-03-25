/**
 * Enrollment Service
 * Handles operations related to student enrollments
 */

import { SystemStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ServiceBase } from "./service-base";

// Enrollment creation schema
export const createEnrollmentSchema = z.object({
  studentId: z.string(),
  classId: z.string(),
  startDate: z.date().optional(),
  createdById: z.string(),
  notes: z.string().optional(),
});

// Enrollment update schema
export const updateEnrollmentSchema = z.object({
  id: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(SystemStatus).optional(),
});

// Bulk enrollment schema
export const bulkEnrollmentSchema = z.object({
  studentIds: z.array(z.string()),
  classId: z.string(),
  startDate: z.date().optional(),
  createdById: z.string(),
  notes: z.string().optional(),
});

export class EnrollmentService extends ServiceBase {
  /**
   * Creates a new student enrollment
   * @param data Enrollment data
   * @returns Created enrollment
   */
  async createEnrollment(data: z.infer<typeof createEnrollmentSchema>) {
    try {
      // Check if student exists
      const student = await this.prisma.studentProfile.findUnique({
        where: { id: data.studentId },
      });

      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      // Check if class exists
      const classEntity = await this.prisma.class.findUnique({
        where: { id: data.classId },
      });

      if (!classEntity) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Class not found",
        });
      }

      // Check if enrollment already exists
      const existingEnrollment = await this.prisma.studentEnrollment.findFirst({
        where: {
          studentId: data.studentId,
          classId: data.classId,
          status: {
            in: [SystemStatus.ACTIVE, SystemStatus.INACTIVE],
          },
        },
      });

      if (existingEnrollment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Student is already enrolled in this class",
        });
      }

      // Create the enrollment
      const enrollment = await this.prisma.studentEnrollment.create({
        data: {
          student: {
            connect: { id: data.studentId },
          },
          class: {
            connect: { id: data.classId },
          },
          startDate: data.startDate || new Date(),
          status: SystemStatus.ACTIVE,
          createdBy: {
            connect: { id: data.createdById },
          },
          updatedBy: {
            connect: { id: data.createdById },
          },
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return {
        success: true,
        enrollment,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create enrollment",
        cause: error,
      });
    }
  }

  /**
   * Gets an enrollment by ID
   * @param id Enrollment ID
   * @returns Enrollment
   */
  async getEnrollment(id: string) {
    try {
      const enrollment = await this.prisma.studentEnrollment.findUnique({
        where: { id },
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              code: true,
              term: {
                select: {
                  id: true,
                  name: true,
                  startDate: true,
                  endDate: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          updatedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!enrollment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Enrollment not found",
        });
      }

      return {
        success: true,
        enrollment,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get enrollment",
        cause: error,
      });
    }
  }

  /**
   * Updates an enrollment
   * @param data Enrollment update data
   * @param updatedById ID of the user making the update
   * @returns Updated enrollment
   */
  async updateEnrollment(data: z.infer<typeof updateEnrollmentSchema>, updatedById: string) {
    try {
      // Check if enrollment exists
      const existingEnrollment = await this.prisma.studentEnrollment.findUnique({
        where: { id: data.id },
      });

      if (!existingEnrollment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Enrollment not found",
        });
      }

      // Update the enrollment
      const enrollment = await this.prisma.studentEnrollment.update({
        where: { id: data.id },
        data: {
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
          updatedBy: {
            connect: { id: updatedById },
          },
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return {
        success: true,
        enrollment,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update enrollment",
        cause: error,
      });
    }
  }

  /**
   * Deletes an enrollment (soft delete)
   * @param id Enrollment ID
   * @param updatedById ID of the user making the deletion
   * @returns Success status
   */
  async deleteEnrollment(id: string, updatedById: string) {
    try {
      // Check if enrollment exists
      const existingEnrollment = await this.prisma.studentEnrollment.findUnique({
        where: { id },
      });

      if (!existingEnrollment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Enrollment not found",
        });
      }

      // Soft delete the enrollment
      await this.prisma.studentEnrollment.update({
        where: { id },
        data: {
          status: SystemStatus.DELETED,
          updatedBy: {
            connect: { id: updatedById },
          },
        },
      });

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete enrollment",
        cause: error,
      });
    }
  }

  /**
   * Gets enrollments by class ID
   * @param classId Class ID
   * @returns Enrollments
   */
  async getEnrollmentsByClass(classId: string) {
    try {
      const enrollments = await this.prisma.studentEnrollment.findMany({
        where: {
          classId,
          status: SystemStatus.ACTIVE,
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          student: {
            user: {
              name: "asc",
            },
          },
        },
      });

      return {
        success: true,
        enrollments,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get enrollments by class",
        cause: error,
      });
    }
  }

  /**
   * Gets enrollments by student ID
   * @param studentId Student ID
   * @returns Enrollments
   */
  async getEnrollmentsByStudent(studentId: string) {
    try {
      const enrollments = await this.prisma.studentEnrollment.findMany({
        where: {
          studentId,
          status: SystemStatus.ACTIVE,
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              code: true,
              term: {
                select: {
                  id: true,
                  name: true,
                  startDate: true,
                  endDate: true,
                },
              },
              courseCampus: {
                select: {
                  id: true,
                  course: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          class: {
            name: "asc",
          },
        },
      });

      return {
        success: true,
        enrollments,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get enrollments by student",
        cause: error,
      });
    }
  }

  /**
   * Creates multiple enrollments in bulk
   * @param data Bulk enrollment data
   * @returns Created enrollments
   */
  async bulkEnroll(data: z.infer<typeof bulkEnrollmentSchema>) {
    try {
      // Check if class exists
      const classEntity = await this.prisma.class.findUnique({
        where: { id: data.classId },
      });

      if (!classEntity) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Class not found",
        });
      }

      // Check if all students exist
      const students = await this.prisma.studentProfile.findMany({
        where: {
          id: {
            in: data.studentIds,
          },
        },
      });

      if (students.length !== data.studentIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more students not found",
        });
      }

      // Check for existing enrollments
      const existingEnrollments = await this.prisma.studentEnrollment.findMany({
        where: {
          studentId: {
            in: data.studentIds,
          },
          classId: data.classId,
          status: {
            in: [SystemStatus.ACTIVE, SystemStatus.INACTIVE],
          },
        },
      });

      // Filter out students who are already enrolled
      const alreadyEnrolledStudentIds = existingEnrollments.map((e) => e.studentId);
      const studentsToEnroll = data.studentIds.filter(
        (id) => !alreadyEnrolledStudentIds.includes(id)
      );

      if (studentsToEnroll.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "All students are already enrolled in this class",
        });
      }

      // Create enrollments for remaining students
      const enrollments = await Promise.all(
        studentsToEnroll.map((studentId) =>
          this.prisma.studentEnrollment.create({
            data: {
              student: {
                connect: { id: studentId },
              },
              class: {
                connect: { id: data.classId },
              },
              startDate: data.startDate || new Date(),
              status: SystemStatus.ACTIVE,
              createdBy: {
                connect: { id: data.createdById },
              },
              updatedBy: {
                connect: { id: data.createdById },
              },
            },
          })
        )
      );

      return {
        success: true,
        enrollments,
        totalEnrolled: enrollments.length,
        alreadyEnrolled: alreadyEnrolledStudentIds.length,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to bulk enroll students",
        cause: error,
      });
    }
  }
} 