import { PrismaClient, AccessScope, EntityType, SystemStatus } from "@prisma/client";

export interface PermissionSeedData {
  code: string;
  name: string;
  description: string;
  scope: AccessScope;
  entityType?: EntityType;
  status: SystemStatus;
}

export const permissionsSeedData: PermissionSeedData[] = [
  // System Administration Permissions
  {
    code: "system.admin",
    name: "System Administration",
    description: "Full system administration access",
    scope: AccessScope.SYSTEM,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "system.settings",
    name: "System Settings",
    description: "Manage system-wide settings",
    scope: AccessScope.SYSTEM,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "system.users",
    name: "User Management",
    description: "Manage all users in the system",
    scope: AccessScope.SYSTEM,
    status: SystemStatus.ACTIVE,
  },
  
  // Program Management Permissions
  {
    code: "program.view",
    name: "View Programs",
    description: "View program details",
    scope: AccessScope.MULTI_CAMPUS,
    entityType: EntityType.PROGRAM,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "program.create",
    name: "Create Programs",
    description: "Create new programs",
    scope: AccessScope.SYSTEM,
    entityType: EntityType.PROGRAM,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "program.edit",
    name: "Edit Programs",
    description: "Edit existing programs",
    scope: AccessScope.SYSTEM,
    entityType: EntityType.PROGRAM,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "program.delete",
    name: "Delete Programs",
    description: "Delete programs",
    scope: AccessScope.SYSTEM,
    entityType: EntityType.PROGRAM,
    status: SystemStatus.ACTIVE,
  },
  
  // Course Management Permissions
  {
    code: "course.view",
    name: "View Courses",
    description: "View course details",
    scope: AccessScope.MULTI_CAMPUS,
    entityType: EntityType.COURSE,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "course.create",
    name: "Create Courses",
    description: "Create new courses",
    scope: AccessScope.MULTI_CAMPUS,
    entityType: EntityType.COURSE,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "course.edit",
    name: "Edit Courses",
    description: "Edit existing courses",
    scope: AccessScope.MULTI_CAMPUS,
    entityType: EntityType.COURSE,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "course.delete",
    name: "Delete Courses",
    description: "Delete courses",
    scope: AccessScope.MULTI_CAMPUS,
    entityType: EntityType.COURSE,
    status: SystemStatus.ACTIVE,
  },
  
  // Class Management Permissions
  {
    code: "class.view",
    name: "View Classes",
    description: "View class details",
    scope: AccessScope.SINGLE_CAMPUS,
    entityType: EntityType.CLASS,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "class.create",
    name: "Create Classes",
    description: "Create new classes",
    scope: AccessScope.SINGLE_CAMPUS,
    entityType: EntityType.CLASS,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "class.edit",
    name: "Edit Classes",
    description: "Edit existing classes",
    scope: AccessScope.SINGLE_CAMPUS,
    entityType: EntityType.CLASS,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "class.delete",
    name: "Delete Classes",
    description: "Delete classes",
    scope: AccessScope.SINGLE_CAMPUS,
    entityType: EntityType.CLASS,
    status: SystemStatus.ACTIVE,
  },
  
  // Assessment Permissions
  {
    code: "assessment.view",
    name: "View Assessments",
    description: "View assessment details",
    scope: AccessScope.SINGLE_CAMPUS,
    entityType: EntityType.ASSESSMENT,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "assessment.create",
    name: "Create Assessments",
    description: "Create new assessments",
    scope: AccessScope.SINGLE_CAMPUS,
    entityType: EntityType.ASSESSMENT,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "assessment.edit",
    name: "Edit Assessments",
    description: "Edit existing assessments",
    scope: AccessScope.SINGLE_CAMPUS,
    entityType: EntityType.ASSESSMENT,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "assessment.delete",
    name: "Delete Assessments",
    description: "Delete assessments",
    scope: AccessScope.SINGLE_CAMPUS,
    entityType: EntityType.ASSESSMENT,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "assessment.grade",
    name: "Grade Assessments",
    description: "Grade student assessments",
    scope: AccessScope.SINGLE_CAMPUS,
    entityType: EntityType.ASSESSMENT,
    status: SystemStatus.ACTIVE,
  },
  
  // Facility Management Permissions
  {
    code: "facility.view",
    name: "View Facilities",
    description: "View facility details",
    scope: AccessScope.SINGLE_CAMPUS,
    entityType: EntityType.FACILITY,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "facility.create",
    name: "Create Facilities",
    description: "Create new facilities",
    scope: AccessScope.SINGLE_CAMPUS,
    entityType: EntityType.FACILITY,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "facility.edit",
    name: "Edit Facilities",
    description: "Edit existing facilities",
    scope: AccessScope.SINGLE_CAMPUS,
    entityType: EntityType.FACILITY,
    status: SystemStatus.ACTIVE,
  },
  {
    code: "facility.delete",
    name: "Delete Facilities",
    description: "Delete facilities",
    scope: AccessScope.SINGLE_CAMPUS,
    entityType: EntityType.FACILITY,
    status: SystemStatus.ACTIVE,
  },
];

export async function seedPermissions(prisma: PrismaClient) {
  console.log("Seeding permissions...");
  
  for (const permissionData of permissionsSeedData) {
    // Check if permission already exists
    const existingPermission = await prisma.permission.findFirst({
      where: {
        code: permissionData.code,
      },
    });
    
    if (!existingPermission) {
      await prisma.permission.create({
        data: {
          code: permissionData.code,
          name: permissionData.name,
          description: permissionData.description,
          scope: permissionData.scope,
          entityType: permissionData.entityType,
          status: permissionData.status,
        },
      });
    }
  }
  
  console.log("Permissions seeded successfully");
} 