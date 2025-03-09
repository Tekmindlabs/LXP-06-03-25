import { Prisma, ActivityType, SystemStatus } from "@prisma/client";
import { ServiceConfig } from "./prisma";
import { SubmissionStatus } from "../constants";

export interface CreateActivityInput {
  title: string;
  description?: string;
  type: ActivityType;
  subjectId: string;
  topicId?: string; // New field for topic association
  classId: string;
  content: Prisma.InputJsonValue;
  // Grading fields
  isGradable?: boolean;
  maxScore?: number;
  passingScore?: number;
  weightage?: number;
  gradingConfig?: Prisma.InputJsonValue;
  status?: SystemStatus;
}

export interface UpdateActivityInput {
  title?: string;
  description?: string;
  type?: ActivityType;
  topicId?: string | null; // New field for topic association (null to remove)
  content?: Prisma.InputJsonValue;
  // Grading fields
  isGradable?: boolean;
  maxScore?: number;
  passingScore?: number;
  weightage?: number;
  gradingConfig?: Prisma.InputJsonValue;
  status?: SystemStatus;
}

export interface ActivityFilters {
  subjectId?: string;
  topicId?: string; // New field for topic filtering
  classId?: string;
  type?: ActivityType;
  isGradable?: boolean; // New field for filtering gradable activities
  search?: string;
  status?: SystemStatus;
}

export interface ActivityServiceConfig extends ServiceConfig {
  defaultStatus?: SystemStatus;
}

// Activity Grade types
export interface CreateActivityGradeInput {
  activityId: string;
  studentId: string;
  score?: number;
  feedback?: string;
  content?: Prisma.InputJsonValue;
  attachments?: Prisma.InputJsonValue;
  status?: SubmissionStatus;
  gradedById?: string;
}

export interface UpdateActivityGradeInput {
  score?: number;
  feedback?: string;
  content?: Prisma.InputJsonValue;
  attachments?: Prisma.InputJsonValue;
  status?: SubmissionStatus;
  gradedById?: string;
}

export interface ActivityGradeFilters {
  activityId?: string;
  studentId?: string;
  status?: SubmissionStatus;
  search?: string;
}

export interface BatchGradeActivitiesInput {
  activityId: string;
  grades: {
    studentId: string;
    score: number;
    feedback?: string;
  }[];
  gradedById: string;
} 