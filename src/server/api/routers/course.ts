import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { 
  CourseService, 
  createCourseSchema, 
  updateCourseSchema,
  courseQuerySchema,
  createSubjectSchema,
  updateSubjectSchema,
  createCourseCampusSchema,
  updateCourseCampusSchema,
  coursePrerequisiteSchema
} from "../services/course.service";
import { SystemStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { UserType } from "../constants";

// List courses input schema
const listCoursesInput = courseQuerySchema.extend({
  search: z.string().optional(),
  skip: z.number().optional(),
  take: z.number().optional()
});

export const courseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createCourseSchema)
    .mutation(async ({ ctx, input }) => {
      // Check user permissions
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create courses",
        });
      }

      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.createCourse(input);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.getCourse(input.id);
    }),

  update: protectedProcedure
    .input(updateCourseSchema)
    .mutation(async ({ ctx, input }) => {
      // Check user permissions
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update courses",
        });
      }

      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.updateCourse(input);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check user permissions
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete courses",
        });
      }

      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.deleteCourse(input.id);
    }),

  list: protectedProcedure
    .input(listCoursesInput)
    .query(async ({ ctx, input }) => {
      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.getCoursesByQuery(input);
    }),

  listByProgram: protectedProcedure
    .input(z.object({ programId: z.string() }))
    .query(async ({ ctx, input }) => {
      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.getCoursesByProgram(input.programId);
    }),

  // Subject endpoints
  createSubject: protectedProcedure
    .input(createSubjectSchema)
    .mutation(async ({ ctx, input }) => {
      // Check user permissions
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create subjects",
        });
      }

      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.createSubject(input);
    }),

  getSubject: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.getSubject(input.id);
    }),

  updateSubject: protectedProcedure
    .input(updateSubjectSchema)
    .mutation(async ({ ctx, input }) => {
      // Check user permissions
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update subjects",
        });
      }

      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.updateSubject(input);
    }),

  deleteSubject: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check user permissions
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete subjects",
        });
      }

      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.deleteSubject(input.id);
    }),

  listSubjects: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.getSubjectsByCourse(input.courseId);
    }),

  // Course Campus endpoints
  createCourseCampus: protectedProcedure
    .input(createCourseCampusSchema)
    .mutation(async ({ ctx, input }) => {
      // Check user permissions
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create course campus offerings",
        });
      }

      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.createCourseCampus(input);
    }),

  updateCourseCampus: protectedProcedure
    .input(updateCourseCampusSchema)
    .mutation(async ({ ctx, input }) => {
      // Check user permissions
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update course campus offerings",
        });
      }

      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.updateCourseCampus(input);
    }),

  // Course Prerequisites endpoints
  addPrerequisite: protectedProcedure
    .input(coursePrerequisiteSchema)
    .mutation(async ({ ctx, input }) => {
      // Check user permissions
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to add course prerequisites",
        });
      }

      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.addCoursePrerequisite(input);
    }),

  removePrerequisite: protectedProcedure
    .input(z.object({ 
      courseId: z.string(),
      prerequisiteId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Check user permissions
      if (
        ![
          UserType.SYSTEM_ADMIN,
          UserType.SYSTEM_MANAGER,
          UserType.CAMPUS_ADMIN,
          UserType.CAMPUS_COORDINATOR,
        ].includes(ctx.session.userType as UserType)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to remove course prerequisites",
        });
      }

      const courseService = new CourseService({ prisma: ctx.prisma });
      return courseService.removeCoursePrerequisite(input.courseId, input.prerequisiteId);
    })
}); 