-- CreateEnum
CREATE TYPE "SystemStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'DELETED', 'ARCHIVED_CURRENT_YEAR', 'ARCHIVED_PREVIOUS_YEAR', 'ARCHIVED_HISTORICAL');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('SYSTEM_ADMIN', 'SYSTEM_MANAGER', 'CAMPUS_ADMIN', 'CAMPUS_COORDINATOR', 'CAMPUS_TEACHER', 'CAMPUS_STUDENT', 'CAMPUS_PARENT');

-- CreateEnum
CREATE TYPE "AccessScope" AS ENUM ('SYSTEM', 'MULTI_CAMPUS', 'SINGLE_CAMPUS');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('PROGRAM', 'COURSE', 'SUBJECT', 'CLASS', 'ASSESSMENT', 'ACTIVITY', 'FACILITY');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('LECTURE', 'LAB', 'TUTORIAL', 'WORKSHOP', 'EXAM');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'GRADED', 'REVIEWED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AttendanceStatusType" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'LEAVE');

-- CreateEnum
CREATE TYPE "AcademicPeriodType" AS ENUM ('REGULAR', 'SUMMER', 'WINTER', 'SPECIAL');

-- CreateEnum
CREATE TYPE "AssessmentCategory" AS ENUM ('EXAM', 'QUIZ', 'ASSIGNMENT', 'PROJECT', 'PRACTICAL', 'CLASS_ACTIVITY');

-- CreateEnum
CREATE TYPE "GradingType" AS ENUM ('AUTOMATIC', 'MANUAL', 'HYBRID');

-- CreateEnum
CREATE TYPE "GradingScale" AS ENUM ('PERCENTAGE', 'LETTER_GRADE', 'GPA', 'CUSTOM');

-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('CLASSROOM', 'LABORATORY', 'WORKSHOP', 'LIBRARY', 'AUDITORIUM', 'OTHER');

-- CreateEnum
CREATE TYPE "SubjectNodeType" AS ENUM ('CHAPTER', 'TOPIC', 'SUBTOPIC');

-- CreateEnum
CREATE TYPE "CompetencyLevel" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "LearningObjectiveType" AS ENUM ('KNOWLEDGE', 'COMPREHENSION', 'APPLICATION', 'ANALYSIS', 'SYNTHESIS', 'EVALUATION');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ANNOUNCEMENT', 'ALERT', 'REMINDER', 'UPDATE', 'ACADEMIC', 'ADMINISTRATIVE', 'EVENT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationDeliveryType" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH', 'ALL');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('QUIZ', 'ASSIGNMENT', 'PROJECT', 'PRACTICE', 'HOMEWORK', 'OTHER');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('LOGIN', 'ASSESSMENT_SUBMISSION', 'ATTENDANCE_MARKED', 'GRADE_UPDATED', 'FEEDBACK_ADDED', 'RESOURCE_ACCESS', 'SYSTEM_ERROR', 'PERFORMANCE_METRIC', 'CLASS_CREATED', 'CLASS_UPDATED', 'ENROLLMENT_CHANGED', 'TEACHER_ASSIGNED', 'SCHEDULE_UPDATED', 'COURSE_CREATED', 'COURSE_UPDATED', 'COURSE_ARCHIVED', 'COURSE_ENROLLMENT_CHANGED');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('ACADEMIC_PERFORMANCE', 'BEHAVIORAL', 'ATTENDANCE', 'PARTICIPATION', 'IMPROVEMENT_AREA', 'ACHIEVEMENT', 'DISCIPLINARY');

-- CreateEnum
CREATE TYPE "FeedbackSeverity" AS ENUM ('POSITIVE', 'NEUTRAL', 'CONCERN', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'RESOLVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CourseCompletionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('FILE', 'FOLDER', 'LINK');

-- CreateEnum
CREATE TYPE "ResourceAccess" AS ENUM ('PRIVATE', 'SHARED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'GROUP', 'ANNOUNCEMENT', 'CLASS', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'DELETED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "password" TEXT,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "userType" "UserType" NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "dateOfBirth" TIMESTAMP(3),
    "profileData" JSONB,
    "accessScope" "AccessScope" NOT NULL DEFAULT 'SINGLE_CAMPUS',
    "primaryCampusId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "institutionId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" "AccessScope" NOT NULL,
    "entityType" "EntityType",
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "campusId" TEXT,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campuses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "institutionId" TEXT NOT NULL,
    "address" JSONB NOT NULL,
    "contact" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_campus_access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "roleType" "UserType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_campus_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "duration" INTEGER NOT NULL,
    "settings" JSONB,
    "curriculum" JSONB,
    "institutionId" TEXT NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_campus" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "program_campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "credits" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "programId" TEXT NOT NULL,
    "settings" JSONB,
    "syllabus" JSONB,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "courseId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "academicPeriodId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "courseId" TEXT NOT NULL,
    "syllabus" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_subject_qualifications" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_subject_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_subject_assignments" (
    "id" TEXT NOT NULL,
    "qualificationId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "courseCampusId" TEXT NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_subject_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetables" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "courseCampusId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timetables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_periods" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "type" "PeriodType" NOT NULL,
    "timetableId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "facilityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "timetable_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minCapacity" INTEGER NOT NULL DEFAULT 1,
    "maxCapacity" INTEGER NOT NULL DEFAULT 30,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "courseCampusId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "classTeacherId" TEXT,
    "facilityId" TEXT,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "programCampusId" TEXT,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrollmentNumber" TEXT NOT NULL,
    "currentGrade" TEXT,
    "academicHistory" JSONB,
    "interests" TEXT[],
    "achievements" JSONB[],
    "specialNeeds" JSONB,
    "guardianInfo" JSONB,
    "attendanceRate" DOUBLE PRECISION,
    "academicScore" DOUBLE PRECISION,
    "participationRate" DOUBLE PRECISION,
    "lastCounseling" TIMESTAMP(3),
    "lastParentMeeting" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT,
    "qualifications" JSONB[],
    "certifications" JSONB[],
    "experience" JSONB[],
    "expertise" TEXT[],
    "publications" JSONB[],
    "achievements" JSONB[],
    "teachingLoad" DOUBLE PRECISION,
    "studentFeedbackScore" DOUBLE PRECISION,
    "attendanceRate" DOUBLE PRECISION,
    "lastTraining" TIMESTAMP(3),
    "nextEvaluation" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coordinator_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT,
    "qualifications" JSONB[],
    "responsibilities" TEXT[],
    "managedPrograms" JSONB[],
    "managedCourses" JSONB[],
    "performance" JSONB,
    "lastEvaluation" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coordinator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "student_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_assignments" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "submissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "templateId" TEXT,
    "institutionId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "maxScore" DOUBLE PRECISION,
    "passingScore" DOUBLE PRECISION,
    "weightage" DOUBLE PRECISION,
    "gradingConfig" JSONB,
    "rubric" JSONB,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_submissions" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "content" JSONB,
    "attachments" JSONB,
    "score" DOUBLE PRECISION,
    "grade" TEXT,
    "status" "SubmissionStatus" NOT NULL,
    "gradingDetails" JSONB,
    "feedback" JSONB,
    "comments" TEXT,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "gradedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceStatusType" NOT NULL,
    "remarks" TEXT,
    "archiveDate" TIMESTAMP(3),
    "archiveStatus" "SystemStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FacilityType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "campusId" TEXT NOT NULL,
    "resources" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campus_features" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "settings" JSONB,
    "campusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campus_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_periods" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" "AcademicPeriodType" NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "AssessmentCategory" NOT NULL,
    "gradingType" "GradingType" NOT NULL,
    "gradingScale" "GradingScale" NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "passingScore" DOUBLE PRECISION NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL,
    "gradingConfig" JSONB,
    "rubric" JSONB,
    "autoGradingRules" JSONB,
    "institutionId" TEXT NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "assessment_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_books" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "calculationRules" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "grade_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_grades" (
    "id" TEXT NOT NULL,
    "gradeBookId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assessmentGrades" JSONB NOT NULL,
    "finalGrade" DOUBLE PRECISION,
    "letterGrade" TEXT,
    "attendance" DOUBLE PRECISION,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "archiveDate" TIMESTAMP(3),

    CONSTRAINT "student_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_base" (
    "id" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "severity" "FeedbackSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "academicYear" TEXT,
    "term" TEXT,
    "classId" TEXT,
    "tags" TEXT[],
    "attachments" JSONB,
    "createdById" TEXT NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "feedback_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_feedback" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "feedbackBaseId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "student_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_feedback" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "feedbackBaseId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "teacher_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_responses" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "responderId" TEXT NOT NULL,
    "studentFeedbackId" TEXT,
    "teacherFeedbackId" TEXT,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "feedback_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "eventType" "AnalyticsEventType" NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "campusId" TEXT,
    "metadata" JSONB NOT NULL,
    "sessionId" TEXT,
    "deviceInfo" JSONB,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_metrics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "institutionId" TEXT NOT NULL,
    "campusId" TEXT,
    "userId" TEXT,
    "dimensions" JSONB,
    "tags" JSONB,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "analytics_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalDevelopment" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "SystemStatus" NOT NULL,
    "certification" JSONB,

    CONSTRAINT "ProfessionalDevelopment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_campus" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "programCampusId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "course_campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_prerequisites" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_prerequisites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_course_completions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "CourseCompletionStatus" NOT NULL,
    "grade" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_course_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_schedules" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_schedule_periods" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "timetablePeriodId" TEXT NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_schedule_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_schedules" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_schedule_periods" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "timetablePeriodId" TEXT NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_schedule_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ResourceType" NOT NULL,
    "url" TEXT,
    "tags" TEXT[],
    "access" "ResourceAccess" NOT NULL DEFAULT 'PRIVATE',
    "settings" JSONB,
    "ownerId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_permissions" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "access" "ResourceAccess" NOT NULL,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "bucket" TEXT,
    "key" TEXT,
    "url" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "entityType" TEXT,
    "entityId" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "type" "ConversationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastReadMessageId" TEXT,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetToken_key" ON "users"("resetToken");

-- CreateIndex
CREATE INDEX "users_institutionId_email_idx" ON "users"("institutionId", "email");

-- CreateIndex
CREATE INDEX "users_institutionId_username_idx" ON "users"("institutionId", "username");

-- CreateIndex
CREATE INDEX "users_institutionId_status_idx" ON "users"("institutionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "user_permissions_userId_status_idx" ON "user_permissions"("userId", "status");

-- CreateIndex
CREATE INDEX "user_permissions_permissionId_campusId_idx" ON "user_permissions"("permissionId", "campusId");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_userId_permissionId_campusId_key" ON "user_permissions"("userId", "permissionId", "campusId");

-- CreateIndex
CREATE UNIQUE INDEX "campuses_code_key" ON "campuses"("code");

-- CreateIndex
CREATE INDEX "campuses_institutionId_code_idx" ON "campuses"("institutionId", "code");

-- CreateIndex
CREATE INDEX "user_campus_access_userId_status_idx" ON "user_campus_access"("userId", "status");

-- CreateIndex
CREATE INDEX "user_campus_access_campusId_roleType_idx" ON "user_campus_access"("campusId", "roleType");

-- CreateIndex
CREATE UNIQUE INDEX "user_campus_access_userId_campusId_key" ON "user_campus_access"("userId", "campusId");

-- CreateIndex
CREATE UNIQUE INDEX "programs_code_key" ON "programs"("code");

-- CreateIndex
CREATE INDEX "programs_institutionId_code_idx" ON "programs"("institutionId", "code");

-- CreateIndex
CREATE INDEX "programs_institutionId_status_idx" ON "programs"("institutionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "program_campus_programId_campusId_key" ON "program_campus"("programId", "campusId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE INDEX "courses_programId_code_idx" ON "courses"("programId", "code");

-- CreateIndex
CREATE INDEX "courses_programId_status_idx" ON "courses"("programId", "status");

-- CreateIndex
CREATE INDEX "courses_level_status_idx" ON "courses"("level", "status");

-- CreateIndex
CREATE INDEX "terms_academicYearId_startDate_endDate_idx" ON "terms"("academicYearId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "terms_academicPeriodId_startDate_endDate_idx" ON "terms"("academicPeriodId", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_subject_qualifications_teacherId_subjectId_key" ON "teacher_subject_qualifications"("teacherId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_subject_assignments_qualificationId_campusId_course_key" ON "teacher_subject_assignments"("qualificationId", "campusId", "courseCampusId");

-- CreateIndex
CREATE UNIQUE INDEX "timetables_classId_startDate_endDate_key" ON "timetables"("classId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "timetable_periods_dayOfWeek_startTime_endTime_idx" ON "timetable_periods"("dayOfWeek", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "timetable_periods_facilityId_dayOfWeek_idx" ON "timetable_periods"("facilityId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "timetable_periods_assignmentId_dayOfWeek_idx" ON "timetable_periods"("assignmentId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "classes_code_key" ON "classes"("code");

-- CreateIndex
CREATE INDEX "classes_courseCampusId_termId_idx" ON "classes"("courseCampusId", "termId");

-- CreateIndex
CREATE INDEX "classes_status_termId_idx" ON "classes"("status", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_enrollmentNumber_key" ON "student_profiles"("enrollmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_userId_key" ON "teacher_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "coordinator_profiles_userId_key" ON "coordinator_profiles"("userId");

-- CreateIndex
CREATE INDEX "student_enrollments_studentId_status_idx" ON "student_enrollments"("studentId", "status");

-- CreateIndex
CREATE INDEX "student_enrollments_classId_status_idx" ON "student_enrollments"("classId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollments_studentId_classId_key" ON "student_enrollments"("studentId", "classId");

-- CreateIndex
CREATE INDEX "teacher_assignments_status_classId_idx" ON "teacher_assignments"("status", "classId");

-- CreateIndex
CREATE INDEX "teacher_assignments_teacherId_status_idx" ON "teacher_assignments"("teacherId", "status");

-- CreateIndex
CREATE INDEX "activities_status_classId_idx" ON "activities"("status", "classId");

-- CreateIndex
CREATE INDEX "activities_subjectId_type_idx" ON "activities"("subjectId", "type");

-- CreateIndex
CREATE INDEX "assessments_institutionId_status_idx" ON "assessments"("institutionId", "status");

-- CreateIndex
CREATE INDEX "assessments_classId_status_idx" ON "assessments"("classId", "status");

-- CreateIndex
CREATE INDEX "assessments_templateId_status_idx" ON "assessments"("templateId", "status");

-- CreateIndex
CREATE INDEX "assessments_subjectId_status_idx" ON "assessments"("subjectId", "status");

-- CreateIndex
CREATE INDEX "assessments_classId_createdAt_idx" ON "assessments"("classId", "createdAt");

-- CreateIndex
CREATE INDEX "assessment_submissions_status_gradedAt_idx" ON "assessment_submissions"("status", "gradedAt");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_submissions_assessmentId_studentId_key" ON "assessment_submissions"("assessmentId", "studentId");

-- CreateIndex
CREATE INDEX "attendance_date_status_idx" ON "attendance"("date", "status");

-- CreateIndex
CREATE INDEX "attendance_status_archiveStatus_idx" ON "attendance"("status", "archiveStatus");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_studentId_classId_date_key" ON "attendance"("studentId", "classId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_code_key" ON "facilities"("code");

-- CreateIndex
CREATE UNIQUE INDEX "campus_features_campusId_key_key" ON "campus_features"("campusId", "key");

-- CreateIndex
CREATE INDEX "audit_logs_entityId_entityType_idx" ON "audit_logs"("entityId", "entityType");

-- CreateIndex
CREATE INDEX "audit_logs_userId_campusId_idx" ON "audit_logs"("userId", "campusId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_entityType_idx" ON "audit_logs"("createdAt", "entityType");

-- CreateIndex
CREATE INDEX "audit_logs_userId_entityType_createdAt_idx" ON "audit_logs"("userId", "entityType", "createdAt");

-- CreateIndex
CREATE INDEX "academic_periods_institutionId_startDate_endDate_idx" ON "academic_periods"("institutionId", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_templates_code_key" ON "assessment_templates"("code");

-- CreateIndex
CREATE INDEX "assessment_templates_institutionId_category_idx" ON "assessment_templates"("institutionId", "category");

-- CreateIndex
CREATE INDEX "assessment_templates_institutionId_gradingType_idx" ON "assessment_templates"("institutionId", "gradingType");

-- CreateIndex
CREATE UNIQUE INDEX "grade_books_classId_termId_key" ON "grade_books"("classId", "termId");

-- CreateIndex
CREATE INDEX "student_grades_studentId_createdAt_idx" ON "student_grades"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "student_grades_finalGrade_letterGrade_idx" ON "student_grades"("finalGrade", "letterGrade");

-- CreateIndex
CREATE UNIQUE INDEX "student_grades_gradeBookId_studentId_key" ON "student_grades"("gradeBookId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_code_key" ON "institutions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_code_key" ON "academic_years"("code");

-- CreateIndex
CREATE INDEX "academic_years_institutionId_startDate_endDate_idx" ON "academic_years"("institutionId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "feedback_base_createdById_idx" ON "feedback_base"("createdById");

-- CreateIndex
CREATE INDEX "feedback_base_type_idx" ON "feedback_base"("type");

-- CreateIndex
CREATE INDEX "feedback_base_severity_idx" ON "feedback_base"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "student_feedback_feedbackBaseId_key" ON "student_feedback"("feedbackBaseId");

-- CreateIndex
CREATE INDEX "student_feedback_studentId_idx" ON "student_feedback"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_feedback_feedbackBaseId_key" ON "teacher_feedback"("feedbackBaseId");

-- CreateIndex
CREATE INDEX "teacher_feedback_teacherId_idx" ON "teacher_feedback"("teacherId");

-- CreateIndex
CREATE INDEX "feedback_responses_responderId_idx" ON "feedback_responses"("responderId");

-- CreateIndex
CREATE INDEX "feedback_responses_studentFeedbackId_idx" ON "feedback_responses"("studentFeedbackId");

-- CreateIndex
CREATE INDEX "feedback_responses_teacherFeedbackId_idx" ON "feedback_responses"("teacherFeedbackId");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_timestamp_idx" ON "analytics_events"("eventType", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_userId_eventType_idx" ON "analytics_events"("userId", "eventType");

-- CreateIndex
CREATE INDEX "analytics_events_institutionId_timestamp_idx" ON "analytics_events"("institutionId", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_campusId_idx" ON "analytics_events"("timestamp", "campusId");

-- CreateIndex
CREATE INDEX "analytics_events_institutionId_campusId_timestamp_idx" ON "analytics_events"("institutionId", "campusId", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_metrics_name_timestamp_idx" ON "analytics_metrics"("name", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_metrics_institutionId_name_idx" ON "analytics_metrics"("institutionId", "name");

-- CreateIndex
CREATE INDEX "analytics_metrics_institutionId_name_timestamp_idx" ON "analytics_metrics"("institutionId", "name", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_metrics_institutionId_campusId_timestamp_idx" ON "analytics_metrics"("institutionId", "campusId", "timestamp");

-- CreateIndex
CREATE INDEX "ProfessionalDevelopment_teacherId_startDate_idx" ON "ProfessionalDevelopment"("teacherId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "course_campus_courseId_campusId_programCampusId_key" ON "course_campus"("courseId", "campusId", "programCampusId");

-- CreateIndex
CREATE UNIQUE INDEX "course_prerequisites_courseId_prerequisiteId_key" ON "course_prerequisites"("courseId", "prerequisiteId");

-- CreateIndex
CREATE INDEX "student_course_completions_status_completedAt_idx" ON "student_course_completions"("status", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "student_course_completions_studentId_courseId_key" ON "student_course_completions"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "teacher_schedules_teacherId_termId_idx" ON "teacher_schedules"("teacherId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_schedule_periods_scheduleId_timetablePeriodId_key" ON "teacher_schedule_periods"("scheduleId", "timetablePeriodId");

-- CreateIndex
CREATE INDEX "facility_schedules_facilityId_termId_idx" ON "facility_schedules"("facilityId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "facility_schedule_periods_scheduleId_timetablePeriodId_key" ON "facility_schedule_periods"("scheduleId", "timetablePeriodId");

-- CreateIndex
CREATE INDEX "resources_ownerId_idx" ON "resources"("ownerId");

-- CreateIndex
CREATE INDEX "resources_parentId_idx" ON "resources"("parentId");

-- CreateIndex
CREATE INDEX "resources_status_idx" ON "resources"("status");

-- CreateIndex
CREATE INDEX "resource_permissions_resourceId_idx" ON "resource_permissions"("resourceId");

-- CreateIndex
CREATE INDEX "resource_permissions_userId_idx" ON "resource_permissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_permissions_resourceId_userId_key" ON "resource_permissions"("resourceId", "userId");

-- CreateIndex
CREATE INDEX "files_ownerId_idx" ON "files"("ownerId");

-- CreateIndex
CREATE INDEX "files_entityType_entityId_idx" ON "files"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "files_status_idx" ON "files"("status");

-- CreateIndex
CREATE INDEX "conversations_status_idx" ON "conversations"("status");

-- CreateIndex
CREATE INDEX "conversation_participants_conversationId_idx" ON "conversation_participants"("conversationId");

-- CreateIndex
CREATE INDEX "conversation_participants_userId_idx" ON "conversation_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversationId_userId_key" ON "conversation_participants"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campuses" ADD CONSTRAINT "campuses_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_campus_access" ADD CONSTRAINT "user_campus_access_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_campus_access" ADD CONSTRAINT "user_campus_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_campus" ADD CONSTRAINT "program_campus_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_campus" ADD CONSTRAINT "program_campus_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms" ADD CONSTRAINT "terms_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "academic_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms" ADD CONSTRAINT "terms_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms" ADD CONSTRAINT "terms_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_qualifications" ADD CONSTRAINT "teacher_subject_qualifications_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_qualifications" ADD CONSTRAINT "teacher_subject_qualifications_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_assignments" ADD CONSTRAINT "teacher_subject_assignments_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_assignments" ADD CONSTRAINT "teacher_subject_assignments_courseCampusId_fkey" FOREIGN KEY ("courseCampusId") REFERENCES "course_campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_assignments" ADD CONSTRAINT "teacher_subject_assignments_qualificationId_fkey" FOREIGN KEY ("qualificationId") REFERENCES "teacher_subject_qualifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_courseCampusId_fkey" FOREIGN KEY ("courseCampusId") REFERENCES "course_campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_periods" ADD CONSTRAINT "timetable_periods_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "teacher_subject_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_periods" ADD CONSTRAINT "timetable_periods_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_periods" ADD CONSTRAINT "timetable_periods_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "timetables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "teacher_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_courseCampusId_fkey" FOREIGN KEY ("courseCampusId") REFERENCES "course_campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_programCampusId_fkey" FOREIGN KEY ("programCampusId") REFERENCES "program_campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_termId_fkey" FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coordinator_profiles" ADD CONSTRAINT "coordinator_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "assessment_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_termId_fkey" FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus_features" ADD CONSTRAINT "campus_features_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_periods" ADD CONSTRAINT "academic_periods_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_templates" ADD CONSTRAINT "assessment_templates_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_books" ADD CONSTRAINT "grade_books_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_books" ADD CONSTRAINT "grade_books_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_books" ADD CONSTRAINT "grade_books_termId_fkey" FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_books" ADD CONSTRAINT "grade_books_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grades" ADD CONSTRAINT "student_grades_gradeBookId_fkey" FOREIGN KEY ("gradeBookId") REFERENCES "grade_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grades" ADD CONSTRAINT "student_grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_base" ADD CONSTRAINT "feedback_base_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_base" ADD CONSTRAINT "feedback_base_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_feedback" ADD CONSTRAINT "student_feedback_feedbackBaseId_fkey" FOREIGN KEY ("feedbackBaseId") REFERENCES "feedback_base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_feedback" ADD CONSTRAINT "student_feedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_feedback" ADD CONSTRAINT "student_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_feedback" ADD CONSTRAINT "teacher_feedback_feedbackBaseId_fkey" FOREIGN KEY ("feedbackBaseId") REFERENCES "feedback_base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_feedback" ADD CONSTRAINT "teacher_feedback_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_feedback" ADD CONSTRAINT "teacher_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_responses" ADD CONSTRAINT "feedback_responses_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_responses" ADD CONSTRAINT "feedback_responses_studentFeedbackId_fkey" FOREIGN KEY ("studentFeedbackId") REFERENCES "student_feedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_responses" ADD CONSTRAINT "feedback_responses_teacherFeedbackId_fkey" FOREIGN KEY ("teacherFeedbackId") REFERENCES "teacher_feedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_metrics" ADD CONSTRAINT "analytics_metrics_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_metrics" ADD CONSTRAINT "analytics_metrics_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_metrics" ADD CONSTRAINT "analytics_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalDevelopment" ADD CONSTRAINT "ProfessionalDevelopment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_campus" ADD CONSTRAINT "course_campus_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_campus" ADD CONSTRAINT "course_campus_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_campus" ADD CONSTRAINT "course_campus_programCampusId_fkey" FOREIGN KEY ("programCampusId") REFERENCES "program_campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_completions" ADD CONSTRAINT "student_course_completions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_completions" ADD CONSTRAINT "student_course_completions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_schedules" ADD CONSTRAINT "teacher_schedules_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_schedules" ADD CONSTRAINT "teacher_schedules_termId_fkey" FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_schedule_periods" ADD CONSTRAINT "teacher_schedule_periods_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "teacher_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_schedule_periods" ADD CONSTRAINT "teacher_schedule_periods_timetablePeriodId_fkey" FOREIGN KEY ("timetablePeriodId") REFERENCES "timetable_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_schedules" ADD CONSTRAINT "facility_schedules_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_schedules" ADD CONSTRAINT "facility_schedules_termId_fkey" FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_schedule_periods" ADD CONSTRAINT "facility_schedule_periods_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "facility_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_schedule_periods" ADD CONSTRAINT "facility_schedule_periods_timetablePeriodId_fkey" FOREIGN KEY ("timetablePeriodId") REFERENCES "timetable_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
