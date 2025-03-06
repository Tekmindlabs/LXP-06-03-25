import { TRPCError } from "@trpc/server";
import { PrismaClient } from "@prisma/client";
import { SystemStatus, TermType, TermPeriod } from "../constants";
import type { ServiceConfig } from "../types/prisma";

interface TermServiceConfig extends ServiceConfig {
  prisma: PrismaClient;
  defaultStatus?: SystemStatus;
}

export interface CreateTermInput {
  code: string;
  name: string;
  description?: string;
  termType: TermType;
  termPeriod: TermPeriod;
  startDate: Date;
  endDate: Date;
  courseId: string;
  academicCycleId: string;
}

export interface TermFilters {
  courseId?: string;
  academicCycleId?: string;
  termType?: TermType;
  termPeriod?: TermPeriod;
  status?: SystemStatus;
  search?: string;
}

export class TermService {
  private readonly validPeriodsByType = {
    [TermType.SEMESTER]: [
      TermPeriod.FALL,
      TermPeriod.SPRING,
      TermPeriod.SUMMER,
      TermPeriod.WINTER
    ],
    [TermType.QUARTER]: [
      TermPeriod.FIRST_QUARTER,
      TermPeriod.SECOND_QUARTER,
      TermPeriod.THIRD_QUARTER,
      TermPeriod.FOURTH_QUARTER
    ],
    [TermType.TRIMESTER]: [
      TermPeriod.FIRST_TRIMESTER,
      TermPeriod.SECOND_TRIMESTER,
      TermPeriod.THIRD_TRIMESTER
    ],
    [TermType.THEME_BASED]: [
      TermPeriod.THEME_UNIT
    ],
    [TermType.CUSTOM]: [
      TermPeriod.FALL,
      TermPeriod.SPRING,
      TermPeriod.SUMMER,
      TermPeriod.WINTER,
      TermPeriod.FIRST_QUARTER,
      TermPeriod.SECOND_QUARTER,
      TermPeriod.THIRD_QUARTER,
      TermPeriod.FOURTH_QUARTER,
      TermPeriod.FIRST_TRIMESTER,
      TermPeriod.SECOND_TRIMESTER,
      TermPeriod.THIRD_TRIMESTER,
      TermPeriod.THEME_UNIT
    ]
  };

  constructor(private config: TermServiceConfig) {}

  async createTerm(input: CreateTermInput) {
    const { prisma } = this.config;

    // Validate term type and period combination
    this.validateTermTypeAndPeriod(input.termType, input.termPeriod);
    
    // Validate dates
    this.validateTermDates(input.startDate, input.endDate);

    // Check for existing term code
    const existingTerm = await prisma.term.findUnique({
      where: { code: input.code }
    });

    if (existingTerm) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Term with this code already exists"
      });
    }

    // Validate course exists
    const course = await prisma.course.findUnique({
      where: { id: input.courseId }
    });

    if (!course) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Course not found"
      });
    }

    // Validate academic cycle exists
    const academicCycle = await prisma.academicCycle.findUnique({
      where: { id: input.academicCycleId }
    });

    if (!academicCycle) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Academic cycle not found"
      });
    }

    // Create term
    const term = await prisma.term.create({
      data: {
        ...input,
        status: this.config.defaultStatus || SystemStatus.ACTIVE
      },
      include: {
        course: true,
        academicCycle: true
      }
    });

    return term;
  }

  async getTerm(id: string) {
    const { prisma } = this.config;

    const term = await prisma.term.findUnique({
      where: { id },
      include: {
        course: true,
        academicCycle: true,
        classes: true,
        assessments: true,
        facilitySchedules: true,
        gradeBooks: true,
        teacherSchedules: true
      }
    });

    if (!term) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Term not found"
      });
    }

    return term;
  }

  async updateTerm(id: string, data: Partial<CreateTermInput>) {
    const { prisma } = this.config;

    const term = await prisma.term.findUnique({
      where: { id }
    });

    if (!term) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Term not found"
      });
    }

    // Validate term type and period if being updated
    if (data.termType || data.termPeriod) {
      this.validateTermTypeAndPeriod(
        data.termType || term.termType,
        data.termPeriod || term.termPeriod
      );
    }

    // Validate dates if being updated
    if (data.startDate || data.endDate) {
      this.validateTermDates(
        data.startDate || term.startDate,
        data.endDate || term.endDate
      );
    }

    const updatedTerm = await prisma.term.update({
      where: { id },
      data,
      include: {
        course: true,
        academicCycle: true
      }
    });

    return updatedTerm;
  }

  async listTerms(filters: TermFilters, skip?: number, take?: number) {
    const { prisma } = this.config;

    const where = {
      courseId: filters.courseId,
      academicCycleId: filters.academicCycleId,
      termType: filters.termType,
      termPeriod: filters.termPeriod,
      status: filters.status,
      OR: filters.search ? [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } }
      ] : undefined
    };

    const [total, terms] = await Promise.all([
      prisma.term.count({ where }),
      prisma.term.findMany({
        where,
        include: {
          course: true,
          academicCycle: true,
          _count: {
            select: {
              classes: true,
              assessments: true
            }
          }
        },
        skip,
        take,
        orderBy: [
          { startDate: 'asc' }
        ]
      })
    ]);

    return {
      total,
      items: terms
    };
  }

  async deleteTerm(id: string) {
    const { prisma } = this.config;

    const term = await prisma.term.findUnique({
      where: { id },
      include: {
        classes: true,
        assessments: true,
        facilitySchedules: true,
        gradeBooks: true,
        teacherSchedules: true
      }
    });

    if (!term) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Term not found"
      });
    }

    // Check if term has any dependencies
    if (
      term.classes.length > 0 ||
      term.assessments.length > 0 ||
      term.facilitySchedules.length > 0 ||
      term.gradeBooks.length > 0 ||
      term.teacherSchedules.length > 0
    ) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Cannot delete term with existing dependencies"
      });
    }

    await prisma.term.delete({
      where: { id }
    });

    return term;
  }

  private validateTermTypeAndPeriod(type: TermType, period: TermPeriod) {
    const validPeriods = this.validPeriodsByType[type];
    if (!validPeriods?.includes(period)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Invalid period "${period}" for term type "${type}"`
      });
    }
  }

  private validateTermDates(startDate: Date, endDate: Date) {
    if (startDate >= endDate) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Term end date must be after start date"
      });
    }
  }
} 