import type { Prisma } from ".prisma/client";
import { SystemStatus } from "./user";
import { ServiceConfig } from "./prisma";

export interface CreateClassInput {
  code: string;
  name: string;
  courseCampusId: string;
  termId: string;
  minCapacity?: number;
  maxCapacity?: number;
  classTeacherId?: string;
  facilityId?: string;
  programCampusId?: string;
}

export interface UpdateClassInput {
  name?: string;
  minCapacity?: number;
  maxCapacity?: number;
  classTeacherId?: string;
  facilityId?: string;
  status?: SystemStatus;
}

export interface ClassFilters {
  courseCampusId?: string;
  termId?: string;
  classTeacherId?: string;
  facilityId?: string;
  programCampusId?: string;
  status?: SystemStatus;
  search?: string;
}

export interface EnrollStudentInput {
  classId: string;
  studentId: string;
  createdById: string;
}

export interface AssignTeacherInput {
  classId: string;
  teacherId: string;
}

export interface ClassServiceConfig extends ServiceConfig {
  defaultStatus?: SystemStatus;
  maxEnrollmentCapacity?: number;
} 