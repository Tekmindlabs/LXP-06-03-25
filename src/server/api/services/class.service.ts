import { TRPCError } from "@trpc/server";
import type { Prisma } from ".prisma/client";
import {
  CreateClassInput,
  UpdateClassInput,
  ClassFilters,
  EnrollStudentInput,
  AssignTeacherInput,
  ClassServiceConfig
} from "../types/class";
import { SystemStatus } from "../types/user";

export class ClassService {
  constructor(private config: ClassServiceConfig) {}

  // Class CRUD Operations
  async createClass(input: CreateClassInput) {
    const { prisma } = this.config;

    // Validate course campus
    const courseCampus = await prisma.courseCampus.findUnique({
      where: { id: input.courseCampusId }
    });

    if (!courseCampus) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Course campus not found"
      });
    }

    // Validate term
    const term = await prisma.term.findUnique({
      where: { id: input.termId }
    });

    if (!term) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Term not found"
      });
    }

    // Check for existing class code
    const existingClass = await prisma.class.findUnique({
      where: { code: input.code }
    });

    if (existingClass) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Class with this code already exists"
      });
    }

    // Create class
    const classData: Prisma.ClassCreateInput = {
      ...input,
      currentCount: 0,
      status: this.config.defaultStatus || SystemStatus.ACTIVE,
      courseCampus: {
        connect: { id: input.courseCampusId }
      },
      term: {
        connect: { id: input.termId }
      },
      ...(input.classTeacherId && {
        classTeacher: {
          connect: { id: input.classTeacherId }
        }
      }),
      ...(input.facilityId && {
        facility: {
          connect: { id: input.facilityId }
        }
      }),
      ...(input.programCampusId && {
        programCampus: {
          connect: { id: input.programCampusId }
        }
      })
    };

    const createdClass = await prisma.class.create({
      data: classData,
      include: {
        courseCampus: true,
        term: true,
        classTeacher: true,
        facility: true,
        programCampus: true
      }
    });

    return createdClass;
  }

  async getClass(id: string) {
    const { prisma } = this.config;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        courseCampus: {
          include: {
            course: true,
            campus: true
          }
        },
        term: true,
        classTeacher: true,
        facility: true,
        students: {
          include: {
            student: true
          }
        },
        teachers: {
          include: {
            teacher: true
          }
        },
        activities: true,
        assessments: true,
        attendance: true,
        timetables: true,
        gradeBooks: true
      }
    });

    if (!classData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Class not found"
      });
    }

    return classData;
  }

  async updateClass(id: string, input: UpdateClassInput) {
    const { prisma } = this.config;

    // Validate class exists
    const existingClass = await prisma.class.findUnique({
      where: { id }
    });

    if (!existingClass) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Class not found"
      });
    }

    // Update class
    const classData: Prisma.ClassUpdateInput = {
      ...input,
      ...(input.classTeacherId && {
        classTeacher: {
          connect: { id: input.classTeacherId }
        }
      }),
      ...(input.facilityId && {
        facility: {
          connect: { id: input.facilityId }
        }
      })
    };

    const updatedClass = await prisma.class.update({
      where: { id },
      data: classData,
      include: {
        courseCampus: true,
        term: true,
        classTeacher: true,
        facility: true
      }
    });

    return updatedClass;
  }

  async deleteClass(id: string) {
    const { prisma } = this.config;

    await prisma.class.update({
      where: { id },
      data: {
        status: SystemStatus.DELETED,
        deletedAt: new Date()
      }
    });
  }

  async listClasses(filters: ClassFilters, skip?: number, take?: number) {
    const { prisma } = this.config;

    const where: Prisma.ClassWhereInput = {
      courseCampusId: filters.courseCampusId,
      termId: filters.termId,
      classTeacherId: filters.classTeacherId,
      facilityId: filters.facilityId,
      programCampusId: filters.programCampusId,
      status: filters.status,
      OR: filters.search ? [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } }
      ] : undefined
    };

    const [total, classes] = await Promise.all([
      prisma.class.count({ where }),
      prisma.class.findMany({
        where,
        include: {
          courseCampus: {
            include: {
              course: true,
              campus: true
            }
          },
          term: true,
          classTeacher: true,
          facility: true,
          _count: {
            select: {
              students: true,
              teachers: true
            }
          }
        },
        skip,
        take,
        orderBy: [
          { code: 'asc' }
        ]
      })
    ]);

    return {
      total,
      items: classes
    };
  }

  // Enrollment Management
  async enrollStudent(input: EnrollStudentInput) {
    const { prisma } = this.config;

    // Validate class and check capacity
    const classData = await prisma.class.findUnique({
      where: { id: input.classId },
      select: {
        currentCount: true,
        maxCapacity: true,
        status: true
      }
    });

    if (!classData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Class not found"
      });
    }

    if (classData.status !== SystemStatus.ACTIVE) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Class is not active"
      });
    }

    const maxCapacity = classData.maxCapacity || this.config.maxEnrollmentCapacity || 30;
    if (classData.currentCount >= maxCapacity) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Class has reached maximum capacity"
      });
    }

    // Check if student exists
    const student = await prisma.studentProfile.findUnique({
      where: { id: input.studentId }
    });

    if (!student) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Student not found"
      });
    }

    // Create enrollment
    const enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId: input.studentId,
        classId: input.classId,
        status: SystemStatus.ACTIVE,
        createdById: input.createdById
      },
      include: {
        student: true,
        class: true
      }
    });

    // Update class count
    await prisma.class.update({
      where: { id: input.classId },
      data: {
        currentCount: {
          increment: 1
        }
      }
    });

    return enrollment;
  }

  async assignTeacher(input: AssignTeacherInput) {
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

    // Check if teacher exists
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: input.teacherId }
    });

    if (!teacher) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Teacher not found"
      });
    }

    // Create assignment
    const assignment = await prisma.teacherAssignment.create({
      data: {
        teacherId: input.teacherId,
        classId: input.classId,
        status: SystemStatus.ACTIVE
      },
      include: {
        teacher: true,
        class: true
      }
    });

    return assignment;
  }

  async removeStudent(classId: string, studentId: string) {
    const { prisma } = this.config;

    // Update enrollment status
    await prisma.studentEnrollment.update({
      where: {
        studentId_classId: {
          studentId,
          classId
        }
      },
      data: {
        status: SystemStatus.INACTIVE,
        endDate: new Date()
      }
    });

    // Update class count
    await prisma.class.update({
      where: { id: classId },
      data: {
        currentCount: {
          decrement: 1
        }
      }
    });
  }

  async removeTeacher(classId: string, teacherId: string) {
    const { prisma } = this.config;

    await prisma.teacherAssignment.update({
      where: {
        id: `${teacherId}_${classId}` // Assuming this is the composite key format
      },
      data: {
        status: SystemStatus.INACTIVE,
        endDate: new Date()
      }
    });
  }
} 