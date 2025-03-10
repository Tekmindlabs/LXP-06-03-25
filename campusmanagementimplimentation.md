# Campus Management Portal Implementation

## Overview

This document outlines the implementation plan for the Campus Management Portal, which will provide a comprehensive solution for managing all aspects of campus operations, including student enrollment, teacher management, program coordination, and course implementation. The portal is designed to align with the existing system architecture and extend the current functionality to support campus coordinators and program-specific course management.

## Current System Architecture

The current system has a robust foundation for campus management with the following components:

1. **Database Schema**:
   - Campus model with basic information (name, code, address, contact)
   - UserCampusAccess model for managing user access to campuses
   - ProgramCampus model for associating programs with campuses
   - CourseCampus model for implementing courses at specific campuses
   - Class model for managing classes within courses
   - Various user profiles (Student, Teacher, Coordinator)

2. **API Services**:
   - Campus Service with methods for managing campuses and related entities
   - Program Service for program management
   - Course Service for course management
   - User Service for user management and access control
   - Facility Service for managing campus facilities
   - Class Service for class management

3. **UI Components**:
   - Campus listing and detail pages
   - Program association UI
   - Facility management UI
   - Teacher and student management UI
   - Class management UI

## Enhanced Portal Structure

The enhanced Campus Management Portal will build upon the existing architecture with the following structure:

```
Campus Manager Portal
├── Dashboard
│   ├── Campus Overview
│   ├── Quick Stats
│   └── Recent Activities
│
├── Program Management
│   ├── Assigned Programs 
│   │   ├── Program List
│   │   └── Program Assignment
│   └── Program Courses
│       ├── Course Offerings
│       └── Course Implementation
│
├── Class Management
│   ├── Class Schedule
│   ├── New Class Creation
│   └── Class Details
│
├── User Management
│   ├── Campus Coordinators
│   │   ├── Coordinator List
│   │   ├── Coordinator Assignment
│   │   └── Access Management
│   ├── Teachers
│   │   ├── Teacher List
│   │   └── Teacher Assignment
│   └── Students
│       ├── Student List
│       ├── Student Enrollment
│       └── Student Management
│
└── Reports & Analytics
```

## Database Schema Enhancements

To support the enhanced portal functionality, the following schema enhancements are required:

1. **Coordinator Program Access**:
   ```prisma
   model CoordinatorProgramAccess {
     id            String       @id @default(cuid())
     coordinatorId String
     programId     String
     campusId      String
     permissions   Json
     status        SystemStatus @default(ACTIVE)
     createdAt     DateTime     @default(now())
     updatedAt     DateTime     @updatedAt
     deletedAt     DateTime?
     coordinator   CoordinatorProfile @relation(fields: [coordinatorId], references: [id])
     program       Program      @relation(fields: [programId], references: [id])
     campus        Campus       @relation(fields: [campusId], references: [id])

     @@unique([coordinatorId, programId, campusId])
     @@map("coordinator_program_access")
   }
   ```

2. **Course Implementation Status**:
   ```prisma
   model CourseImplementation {
     id              String       @id @default(cuid())
     courseCampusId  String
     coordinatorId   String?
     implementationStatus String
     startDate       DateTime
     endDate         DateTime?
     settings        Json?
     status          SystemStatus @default(ACTIVE)
     createdAt       DateTime     @default(now())
     updatedAt       DateTime     @updatedAt
     deletedAt       DateTime?
     courseCampus    CourseCampus @relation(fields: [courseCampusId], references: [id])
     coordinator     CoordinatorProfile? @relation(fields: [coordinatorId], references: [id])

     @@map("course_implementations")
   }
   ```

3. **Enhanced CoordinatorProfile**:
   ```prisma
   // Update to existing CoordinatorProfile model
   model CoordinatorProfile {
     id                 String                  @id @default(cuid())
     userId             String                  @unique
     department         String?
     qualifications     Json[]
     responsibilities   String[]
     managedPrograms    Json[]
     managedCourses     Json[]
     performance        Json?
     lastEvaluation     DateTime?
     createdAt          DateTime                @default(now())
     updatedAt          DateTime                @updatedAt
     user               User                    @relation(fields: [userId], references: [id])
     programAccess      CoordinatorProgramAccess[]
     courseImplementations CourseImplementation[]

     @@map("coordinator_profiles")
   }
   ```

## API Implementation

### Campus Coordinator Management

```typescript
// Campus Coordinator Router
export const campusCoordinatorRouter = createTRPCRouter({
  // List coordinators for a campus
  listCampusCoordinators: protectedProcedure
    .input(z.object({
      campusId: z.string(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { campusId, page, pageSize, ...filters } = input;
      const service = new CampusService({ prisma: ctx.prisma });
      return service.getCampusCoordinators(
        campusId,
        { page, pageSize },
        filters,
      );
    }),

  // Assign coordinator to campus
  assignCoordinator: protectedProcedure
    .input(z.object({
      campusId: z.string(),
      userId: z.string(),
      roleType: z.nativeEnum(UserType).default(UserType.CAMPUS_COORDINATOR),
      startDate: z.date().default(() => new Date()),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const service = new CampusService({ prisma: ctx.prisma });
      return service.assignUserToCampus(input);
    }),

  // Assign program access to coordinator
  assignProgramToCoordinator: protectedProcedure
    .input(z.object({
      coordinatorId: z.string(),
      programId: z.string(),
      campusId: z.string(),
      permissions: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      const service = new CampusService({ prisma: ctx.prisma });
      return service.assignProgramToCoordinator(input);
    }),

  // Remove program access from coordinator
  removeProgramFromCoordinator: protectedProcedure
    .input(z.object({
      coordinatorId: z.string(),
      programId: z.string(),
      campusId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const service = new CampusService({ prisma: ctx.prisma });
      return service.removeProgramFromCoordinator(input);
    }),
});
```

### Program Management

```typescript
// Program Management Router
export const programManagementRouter = createTRPCRouter({
  // Get programs assigned to a campus
  getCampusPrograms: protectedProcedure
    .input(z.object({
      campusId: z.string(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { campusId, page, pageSize, ...filters } = input;
      const service = new ProgramService({ prisma: ctx.prisma });
      return service.getProgramsByCampus(
        campusId,
        { page, pageSize },
        filters,
      );
    }),

  // Get courses for a program at a campus
  getProgramCourses: protectedProcedure
    .input(z.object({
      programId: z.string(),
      campusId: z.string(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { programId, campusId, page, pageSize, ...filters } = input;
      const service = new CourseService({ prisma: ctx.prisma });
      return service.getCoursesByProgramCampus(
        programId,
        campusId,
        { page, pageSize },
        filters,
      );
    }),

  // Create course implementation for a campus
  createCourseImplementation: protectedProcedure
    .input(z.object({
      courseCampusId: z.string(),
      coordinatorId: z.string().optional(),
      implementationStatus: z.string(),
      startDate: z.date(),
      endDate: z.date().optional(),
      settings: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const service = new CourseService({ prisma: ctx.prisma });
      return service.createCourseImplementation(input);
    }),

  // Update course implementation
  updateCourseImplementation: protectedProcedure
    .input(z.object({
      id: z.string(),
      coordinatorId: z.string().optional(),
      implementationStatus: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      settings: z.record(z.any()).optional(),
      status: z.nativeEnum(SystemStatus).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const service = new CourseService({ prisma: ctx.prisma });
      return service.updateCourseImplementation(input.id, input);
    }),
});
```

### Class Management

```typescript
// Class Management Router
export const classManagementRouter = createTRPCRouter({
  // Get classes for a course implementation
  getImplementationClasses: protectedProcedure
    .input(z.object({
      courseImplementationId: z.string(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      status: z.nativeEnum(SystemStatus).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { courseImplementationId, page, pageSize, ...filters } = input;
      const service = new ClassService({ prisma: ctx.prisma });
      return service.getClassesByCourseImplementation(
        courseImplementationId,
        { page, pageSize },
        filters,
      );
    }),

  // Create class for a course implementation
  createImplementationClass: protectedProcedure
    .input(z.object({
      code: z.string(),
      name: z.string(),
      courseImplementationId: z.string(),
      termId: z.string(),
      facilityId: z.string().optional(),
      classTeacherId: z.string().optional(),
      minCapacity: z.number().default(1),
      maxCapacity: z.number().default(30),
      status: z.nativeEnum(SystemStatus).default(SystemStatus.ACTIVE),
    }))
    .mutation(async ({ input, ctx }) => {
      const service = new ClassService({ prisma: ctx.prisma });
      return service.createImplementationClass(input);
    }),
});
```

## Service Implementation

### Campus Service Enhancements

```typescript
// Add to CampusService class
export class CampusService extends ServiceBase {
  // ... existing methods

  // Get campus coordinators
  async getCampusCoordinators(
    campusId: string,
    pagination: PaginationParams,
    filters: Record<string, any> = {},
  ) {
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserCampusAccessWhereInput = {
      campusId,
      roleType: UserType.CAMPUS_COORDINATOR,
      status: filters.status || SystemStatus.ACTIVE,
      user: filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { email: { contains: filters.search, mode: "insensitive" } },
              { username: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : undefined,
    };

    const [total, items] = await Promise.all([
      this.prisma.userCampusAccess.count({ where }),
      this.prisma.userCampusAccess.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: {
            include: {
              coordinatorProfile: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // Assign program to coordinator
  async assignProgramToCoordinator({
    coordinatorId,
    programId,
    campusId,
    permissions,
  }: {
    coordinatorId: string;
    programId: string;
    campusId: string;
    permissions: string[];
  }) {
    // Check if coordinator exists
    const coordinator = await this.prisma.coordinatorProfile.findUnique({
      where: { id: coordinatorId },
    });

    if (!coordinator) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Coordinator not found",
      });
    }

    // Check if program-campus association exists
    const programCampus = await this.prisma.programCampus.findUnique({
      where: {
        programId_campusId: {
          programId,
          campusId,
        },
      },
    });

    if (!programCampus) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Program is not assigned to this campus",
      });
    }

    // Create or update coordinator program access
    return this.prisma.coordinatorProgramAccess.upsert({
      where: {
        coordinatorId_programId_campusId: {
          coordinatorId,
          programId,
          campusId,
        },
      },
      update: {
        permissions: permissions,
        status: SystemStatus.ACTIVE,
      },
      create: {
        coordinatorId,
        programId,
        campusId,
        permissions: permissions,
        status: SystemStatus.ACTIVE,
      },
    });
  }

  // Remove program from coordinator
  async removeProgramFromCoordinator({
    coordinatorId,
    programId,
    campusId,
  }: {
    coordinatorId: string;
    programId: string;
    campusId: string;
  }) {
    return this.prisma.coordinatorProgramAccess.update({
      where: {
        coordinatorId_programId_campusId: {
          coordinatorId,
          programId,
          campusId,
        },
      },
      data: {
        status: SystemStatus.INACTIVE,
        deletedAt: new Date(),
      },
    });
  }
}
```

### Course Service Enhancements

```typescript
// Add to CourseService class
export class CourseService extends ServiceBase {
  // ... existing methods

  // Get courses by program and campus
  async getCoursesByProgramCampus(
    programId: string,
    campusId: string,
    pagination: PaginationParams,
    filters: Record<string, any> = {},
  ) {
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const programCampus = await this.prisma.programCampus.findUnique({
      where: {
        programId_campusId: {
          programId,
          campusId,
        },
      },
    });

    if (!programCampus) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Program is not assigned to this campus",
      });
    }

    const where: Prisma.CourseCampusWhereInput = {
      programCampusId: programCampus.id,
      status: filters.status || SystemStatus.ACTIVE,
      course: filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { code: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : undefined,
    };

    const [total, items] = await Promise.all([
      this.prisma.courseCampus.count({ where }),
      this.prisma.courseCampus.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          course: true,
          courseImplementation: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // Create course implementation
  async createCourseImplementation(data: {
    courseCampusId: string;
    coordinatorId?: string;
    implementationStatus: string;
    startDate: Date;
    endDate?: Date;
    settings?: Record<string, any>;
  }) {
    // Check if course campus exists
    const courseCampus = await this.prisma.courseCampus.findUnique({
      where: { id: data.courseCampusId },
    });

    if (!courseCampus) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Course campus not found",
      });
    }

    // Check if coordinator exists if provided
    if (data.coordinatorId) {
      const coordinator = await this.prisma.coordinatorProfile.findUnique({
        where: { id: data.coordinatorId },
      });

      if (!coordinator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Coordinator not found",
        });
      }
    }

    return this.prisma.courseImplementation.create({
      data: {
        courseCampusId: data.courseCampusId,
        coordinatorId: data.coordinatorId,
        implementationStatus: data.implementationStatus,
        startDate: data.startDate,
        endDate: data.endDate,
        settings: data.settings,
      },
    });
  }

  // Update course implementation
  async updateCourseImplementation(
    id: string,
    data: {
      coordinatorId?: string;
      implementationStatus?: string;
      startDate?: Date;
      endDate?: Date;
      settings?: Record<string, any>;
      status?: SystemStatus;
    },
  ) {
    // Check if implementation exists
    const implementation = await this.prisma.courseImplementation.findUnique({
      where: { id },
    });

    if (!implementation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Course implementation not found",
      });
    }

    // Check if coordinator exists if provided
    if (data.coordinatorId) {
      const coordinator = await this.prisma.coordinatorProfile.findUnique({
        where: { id: data.coordinatorId },
      });

      if (!coordinator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Coordinator not found",
        });
      }
    }

    return this.prisma.courseImplementation.update({
      where: { id },
      data,
    });
  }
}
```

### Class Service Enhancements

```typescript
// Add to ClassService class
export class ClassService extends ServiceBase {
  // ... existing methods

  // Get classes by course implementation
  async getClassesByCourseImplementation(
    courseImplementationId: string,
    pagination: PaginationParams,
    filters: Record<string, any> = {},
  ) {
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const implementation = await this.prisma.courseImplementation.findUnique({
      where: { id: courseImplementationId },
      include: { courseCampus: true },
    });

    if (!implementation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Course implementation not found",
      });
    }

    const where: Prisma.ClassWhereInput = {
      courseCampusId: implementation.courseCampusId,
      status: filters.status || SystemStatus.ACTIVE,
      OR: filters.search
        ? [
            { name: { contains: filters.search, mode: "insensitive" } },
            { code: { contains: filters.search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [total, items] = await Promise.all([
      this.prisma.class.count({ where }),
      this.prisma.class.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          term: true,
          facility: true,
          classTeacher: {
            include: {
              user: true,
            },
          },
          _count: {
            select: {
              students: true,
              teachers: true,
              activities: true,
              assessments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // Create class for a course implementation
  async createImplementationClass(data: {
    code: string;
    name: string;
    courseImplementationId: string;
    termId: string;
    facilityId?: string;
    classTeacherId?: string;
    minCapacity?: number;
    maxCapacity?: number;
    status?: SystemStatus;
  }) {
    // Get course implementation
    const implementation = await this.prisma.courseImplementation.findUnique({
      where: { id: data.courseImplementationId },
      include: { courseCampus: true },
    });

    if (!implementation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Course implementation not found",
      });
    }

    // Check if term exists
    const term = await this.prisma.term.findUnique({
      where: { id: data.termId },
    });

    if (!term) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Term not found",
      });
    }

    // Check if facility exists if provided
    if (data.facilityId) {
      const facility = await this.prisma.facility.findUnique({
        where: { id: data.facilityId },
      });

      if (!facility) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Facility not found",
        });
      }
    }

    // Check if teacher exists if provided
    if (data.classTeacherId) {
      const teacher = await this.prisma.teacherProfile.findUnique({
        where: { id: data.classTeacherId },
      });

      if (!teacher) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Teacher not found",
        });
      }
    }

    return this.prisma.class.create({
      data: {
        code: data.code,
        name: data.name,
        courseCampusId: implementation.courseCampusId,
        termId: data.termId,
        facilityId: data.facilityId,
        classTeacherId: data.classTeacherId,
        minCapacity: data.minCapacity || 1,
        maxCapacity: data.maxCapacity || 30,
        status: data.status || SystemStatus.ACTIVE,
        programCampusId: implementation.courseCampus.programCampusId,
      },
    });
  }
}
```

## Access Control Implementation

The access control system will be enhanced to support campus coordinators with program-specific permissions:

```typescript
// Permission constants for campus management
export const CAMPUS_PERMISSIONS = {
  // Program Management
  MANAGE_PROGRAMS: 'program.campus.manage',
  VIEW_PROGRAMS: 'program.campus.view',
  
  // Course Management
  MANAGE_COURSES: 'course.campus.manage',
  VIEW_COURSES: 'course.campus.view',
  
  // Coordinator Management
  MANAGE_COORDINATORS: 'coordinator.campus.manage',
  VIEW_COORDINATORS: 'coordinator.campus.view',
  
  // Class Management
  MANAGE_CLASSES: 'class.campus.manage',
  VIEW_CLASSES: 'class.campus.view',
  
  // Teacher Management
  MANAGE_TEACHERS: 'teacher.campus.manage',
  VIEW_TEACHERS: 'teacher.campus.view',
  
  // Student Management
  MANAGE_STUDENTS: 'student.campus.manage',
  VIEW_STUDENTS: 'student.campus.view',
};

// Authorization middleware for campus coordinators
export const hasCoordinatorAccess = async (
  ctx: Context,
  programId: string,
  campusId: string,
  requiredPermission: string,
) => {
  if (ctx.session.userType === UserType.SYSTEM_ADMIN) {
    return true;
  }

  if (ctx.session.userType !== UserType.CAMPUS_COORDINATOR) {
    return false;
  }

  const coordinator = await ctx.prisma.coordinatorProfile.findFirst({
    where: { userId: ctx.session.userId },
  });

  if (!coordinator) {
    return false;
  }

  const programAccess = await ctx.prisma.coordinatorProgramAccess.findUnique({
    where: {
      coordinatorId_programId_campusId: {
        coordinatorId: coordinator.id,
        programId,
        campusId,
      },
    },
  });

  if (!programAccess) {
    return false;
  }

  return (programAccess.permissions as string[]).includes(requiredPermission);
};
```

## UI Implementation

The UI implementation will follow the existing design patterns and components, with the following key screens:

1. **Dashboard**:
   - Campus overview with key metrics
   - Quick access to programs, courses, and classes
   - Recent activities and notifications

2. **Program Management**:
   - Program list with filtering and search
   - Program details with courses and implementation status
   - Program assignment to campus

3. **Course Management**:
   - Course list by program
   - Course implementation details
   - Course offering creation and management

4. **Class Management**:
   - Class list by course
   - Class creation and scheduling
   - Class details with students and activities

5. **User Management**:
   - Coordinator management
   - Teacher management
   - Student management

## Implementation Flow

The implementation will follow this logical flow:

1. **Database Schema Updates**:
   - Add CoordinatorProgramAccess model
   - Add CourseImplementation model
   - Update CoordinatorProfile model

2. **API Implementation**:
   - Enhance Campus Service with coordinator management
   - Enhance Program Service with program-campus management
   - Enhance Course Service with course implementation
   - Enhance Class Service with implementation-specific classes

3. **Access Control Implementation**:
   - Define coordinator-specific permissions
   - Implement authorization middleware
   - Update existing endpoints with proper access control

4. **UI Implementation**:
   - Create dashboard for campus managers
   - Implement program management screens
   - Implement course management screens
   - Implement class management screens
   - Implement user management screens

## Integration with Existing Systems

The Campus Management Portal will integrate with the following existing systems:

1. **Authentication System**:
   - User authentication and session management
   - Role-based access control

2. **Academic Calendar**:
   - Term management and scheduling
   - Holiday and event integration

3. **Assessment System**:
   - Course assessments and grading
   - Student performance tracking

4. **Facility Management**:
   - Classroom and resource allocation
   - Facility scheduling

## Testing Strategy

The implementation will be tested using the following approach:

1. **Unit Testing**:
   - Test individual service methods
   - Test access control logic

2. **Integration Testing**:
   - Test API endpoints with various scenarios
   - Test database interactions

3. **End-to-End Testing**:
   - Test complete user flows
   - Test UI components and interactions

## Deployment Plan

The deployment will follow these steps:

1. **Database Migration**:
   - Create and apply schema migrations
   - Validate data integrity

2. **API Deployment**:
   - Deploy updated services and routers
   - Configure access control

3. **UI Deployment**:
   - Deploy new UI components
   - Configure navigation and routing

4. **User Training**:
   - Provide documentation for campus managers
   - Conduct training sessions for coordinators

## Conclusion

The Campus Management Portal implementation builds upon the existing system architecture to provide a comprehensive solution for managing campus operations. By extending the current functionality with coordinator-specific features and program-course management, the portal will enable efficient management of educational programs, courses, and classes across multiple campuses.

The implementation follows best practices for code organization, error handling, and user experience, ensuring a robust and maintainable solution. The modular design allows for easy extension and customization to meet specific institutional requirements. 