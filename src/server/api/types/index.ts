/**
 * Core API Types
 * This file contains common interfaces and types used across the API layer
 */

import { type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type GetServerSidePropsContext } from "next";
import { prisma } from "@/server/db";
import { getUserSession, type CustomSession } from "@/server/api/trpc";
import type {
  SystemStatus,
  UserType,
  AccessScope,
  EntityType,
  AnalyticsEventType,
  FeedbackType,
  FeedbackStatus,
  FeedbackSeverity,
  SubmissionStatus,
  GradingType,
  GradingScale,
  AssessmentCategory,
  DayOfWeek,
  PeriodType,
  FacilityType,
  AttendanceStatusType,
  CourseCompletionStatus,
  ActivityType,
  TermType,
  TermPeriod,
} from "../constants";

/**
 * Server context configuration
 */
interface CreateContextOptions {
  session: CustomSession | null;
  prisma: typeof prisma;
}

/**
 * Inner context creator - creates context without incoming request
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma: opts.prisma,
  };
};

/**
 * Context creator for API routes
 */
export const createTRPCContext = async (opts: { req?: Request }) => {
  // Get the session from the request
  const session = await getUserSession(opts.req);

  return createInnerTRPCContext({
    session,
    prisma,
  });
};

export type Context = inferAsyncReturnType<typeof createTRPCContext>;

/**
 * Common response types
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Common input types
 */
export interface PaginationInput {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DateRangeInput {
  startDate: Date;
  endDate: Date;
}

/**
 * Common filter types
 */
export interface BaseFilters {
  status?: SystemStatus | SubmissionStatus | AttendanceStatusType;
  search?: string;
}

export interface SubmissionFilters extends BaseFilters {
  studentId?: string;
  activityId?: string;
  assessmentId?: string;
}

export interface GradeFilters extends BaseFilters {
  studentId?: string;
  subjectId?: string;
  assessmentId?: string;
  activityId?: string;
  gradingType?: GradingType;
  gradingScale?: GradingScale;
}

/**
 * Error types
 */
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Audit types
 */
export interface AuditMetadata {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
}

/**
 * Permission types
 */
export interface PermissionCheck {
  entityType: string;
  action: string;
  entityId?: string;
  campusId?: string;
}

/**
 * Analytics types
 */
export interface AnalyticsEventInput {
  type: AnalyticsEventType;
  metadata: Record<string, unknown>;
  entityId?: string;
  campusId?: string;
}

/**
 * Cache configuration types
 */
export interface CacheConfig {
  ttl: number;
  key: string;
  namespace?: string;
}

// Custom user type for our session
export interface CustomUser {
  id: string;
  userType: UserType;
  accessScope: AccessScope | null;
  primaryCampusId: string | null;
}

export {
  UserType,
  SystemStatus,
  AccessScope,
  EntityType,
  AnalyticsEventType,
  FeedbackType,
  FeedbackStatus,
  FeedbackSeverity,
  SubmissionStatus,
  GradingType,
  GradingScale,
  AssessmentCategory,
  DayOfWeek,
  PeriodType,
  FacilityType,
  AttendanceStatusType,
  CourseCompletionStatus,
  ActivityType,
  TermType,
  TermPeriod,
} from "../constants"; 