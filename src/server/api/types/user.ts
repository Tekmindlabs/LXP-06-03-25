import type { Prisma } from ".prisma/client";
import { ServiceConfig } from "./prisma";

// Re-export enums from Prisma schema
export const SystemStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ARCHIVED: 'ARCHIVED',
  DELETED: 'DELETED',
  ARCHIVED_CURRENT_YEAR: 'ARCHIVED_CURRENT_YEAR',
  ARCHIVED_PREVIOUS_YEAR: 'ARCHIVED_PREVIOUS_YEAR',
  ARCHIVED_HISTORICAL: 'ARCHIVED_HISTORICAL'
} as const;

export const UserType = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  SYSTEM_MANAGER: 'SYSTEM_MANAGER',
  CAMPUS_ADMIN: 'CAMPUS_ADMIN',
  CAMPUS_COORDINATOR: 'CAMPUS_COORDINATOR',
  CAMPUS_TEACHER: 'CAMPUS_TEACHER',
  CAMPUS_STUDENT: 'CAMPUS_STUDENT',
  CAMPUS_PARENT: 'CAMPUS_PARENT'
} as const;

export const AccessScope = {
  SYSTEM: 'SYSTEM',
  MULTI_CAMPUS: 'MULTI_CAMPUS',
  SINGLE_CAMPUS: 'SINGLE_CAMPUS'
} as const;

export type SystemStatus = typeof SystemStatus[keyof typeof SystemStatus];
export type UserType = typeof UserType[keyof typeof UserType];
export type AccessScope = typeof AccessScope[keyof typeof AccessScope];

export interface CreateUserInput {
  name?: string;
  email?: string;
  username: string;
  phoneNumber?: string;
  password?: string;
  userType: UserType;
  accessScope: AccessScope;
  primaryCampusId?: string;
  institutionId: string;
  profileData?: Prisma.JsonValue;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  userType?: UserType;
  accessScope?: AccessScope;
  primaryCampusId?: string;
  status?: SystemStatus;
  profileData?: Prisma.JsonValue;
}

export interface CreateProfileInput {
  userId: string;
  enrollmentNumber?: string;
  currentGrade?: string;
  academicHistory?: Prisma.JsonValue;
  interests?: string[];
  achievements?: Prisma.JsonValue[];
  specialNeeds?: Prisma.JsonValue;
  guardianInfo?: Prisma.JsonValue;
}

export interface UpdateProfileInput {
  currentGrade?: string;
  academicHistory?: Prisma.JsonValue;
  interests?: string[];
  achievements?: Prisma.JsonValue[];
  specialNeeds?: Prisma.JsonValue;
  guardianInfo?: Prisma.JsonValue;
}

export interface UserServiceConfig extends ServiceConfig {
  defaultUserStatus?: SystemStatus;
  passwordHashRounds?: number;
}

export interface UserFilters {
  institutionId?: string;
  campusId?: string;
  userType?: UserType;
  status?: SystemStatus;
  search?: string;
}

export interface ProfileFilters {
  userId?: string;
  enrollmentNumber?: string;
  currentGrade?: string;
  status?: SystemStatus;
}

export interface UserWithProfile {
  id: string;
  name?: string;
  email?: string;
  username: string;
  userType: UserType;
  status: SystemStatus;
  studentProfile?: StudentProfileData;
  teacherProfile?: TeacherProfileData;
  coordinatorProfile?: CoordinatorProfileData;
}

interface BaseProfileData {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfileData extends BaseProfileData {
  enrollmentNumber: string;
  currentGrade?: string;
  academicHistory?: Prisma.JsonValue;
  interests: string[];
  achievements: Prisma.JsonValue[];
  specialNeeds?: Prisma.JsonValue;
  guardianInfo?: Prisma.JsonValue;
  attendanceRate?: number;
  academicScore?: number;
  participationRate?: number;
}

export interface TeacherProfileData extends BaseProfileData {
  specialization?: string;
  qualifications: Prisma.JsonValue[];
  certifications: Prisma.JsonValue[];
  experience: Prisma.JsonValue[];
  expertise: string[];
  publications: Prisma.JsonValue[];
  achievements: Prisma.JsonValue[];
  teachingLoad?: number;
  studentFeedbackScore?: number;
  attendanceRate?: number;
}

export interface CoordinatorProfileData extends BaseProfileData {
  department?: string;
  qualifications: Prisma.JsonValue[];
  responsibilities: string[];
  managedPrograms: Prisma.JsonValue[];
  managedCourses: Prisma.JsonValue[];
  performance?: Prisma.JsonValue;
} 