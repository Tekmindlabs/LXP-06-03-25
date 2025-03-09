/**
 * Root Router
 * Combines all API routers
 */

import { TRPCError } from "@trpc/server";
import { createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { institutionRouter } from "./routers/institution";
import { campusRouter } from "./routers/campus";
import { programRouter } from "./routers/program";
import { courseRouter } from "./routers/course";
import { subjectRouter } from "./routers/subject";
import { classRouter } from "./routers/class";
import { assessmentRouter } from "./routers/assessment";
import { submissionRouter } from "./routers/submission";
import { feedbackRouter } from "./routers/feedback";
import { analyticsRouter } from "./routers/analytics";
import { activityRouter } from "./routers/activity";
import { fileStorageRouter } from "./routers/file-storage";
import { permissionRouter } from "./routers/permission";
import { curriculumRouter } from "./routers/curriculum";
import { termRouter } from "./routers/term";
import { scheduleRouter } from "./routers/schedule";
import { attendanceRouter } from "./routers/attendance";
import { gradeRouter } from "./routers/grade";
import { assignmentRouter } from "./routers/assignment";
import { resourceRouter } from "./routers/resource";
import { notificationRouter } from "./routers/notification";
import { docsRouter } from "./routers/docs";
import { enrollmentRouter } from "./routers/enrollment";
import { communicationRouter } from "./routers/communication";
import { exampleRouter } from "@/server/api/routers/example.router";
import { academicCycleRouter } from "./routers/academic-cycle.router";
import { gradingRouter } from "./routers/grading";
import { policyRouter } from "./routers/policy";
import { subjectTopicRouter } from "./routers/subjectTopic";
import { activityGradeRouter } from "./routers/activityGrade";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  institution: institutionRouter,
  campus: campusRouter,
  program: programRouter,
  course: courseRouter,
  subject: subjectRouter,
  class: classRouter,
  assessment: assessmentRouter,
  submission: submissionRouter,
  feedback: feedbackRouter,
  analytics: analyticsRouter,
  activity: activityRouter,
  fileStorage: fileStorageRouter,
  permission: permissionRouter,
  curriculum: curriculumRouter,
  term: termRouter,
  schedule: scheduleRouter,
  attendance: attendanceRouter,
  grade: gradeRouter,
  assignment: assignmentRouter,
  resource: resourceRouter,
  notification: notificationRouter,
  enrollment: enrollmentRouter,
  communication: communicationRouter,
  docs: docsRouter,
  example: exampleRouter,
  academicCycle: academicCycleRouter,
  grading: gradingRouter,
  policy: policyRouter,
  subjectTopic: subjectTopicRouter,
  activityGrade: activityGradeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter; 