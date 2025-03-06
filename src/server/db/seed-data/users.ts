import { UserType, AccessScope, SystemStatus } from '@prisma/client';

/**
 * Seed data for users with different roles
 */
export const usersSeedData = [
  {
    email: 'admin@system.com',
    name: 'System Admin',
    username: 'sysadmin',
    userType: UserType.SYSTEM_ADMIN,
    accessScope: AccessScope.SYSTEM,
    status: SystemStatus.ACTIVE,
  },
  {
    email: 'manager@system.com',
    name: 'System Manager',
    username: 'sysmanager',
    userType: UserType.SYSTEM_MANAGER,
    accessScope: AccessScope.SYSTEM,
    status: SystemStatus.ACTIVE,
  },
  {
    email: 'admin@campus.com',
    name: 'Campus Admin',
    username: 'campadmin',
    userType: UserType.CAMPUS_ADMIN,
    accessScope: AccessScope.SINGLE_CAMPUS,
    status: SystemStatus.ACTIVE,
  },
  {
    email: 'coordinator@campus.com',
    name: 'Campus Coordinator',
    username: 'coordinator',
    userType: UserType.CAMPUS_COORDINATOR,
    accessScope: AccessScope.SINGLE_CAMPUS,
    status: SystemStatus.ACTIVE,
  },
  {
    email: 'teacher@campus.com',
    name: 'Campus Teacher',
    username: 'teacher',
    userType: UserType.CAMPUS_TEACHER,
    accessScope: AccessScope.SINGLE_CAMPUS,
    status: SystemStatus.ACTIVE,
  },
  {
    email: 'student@campus.com',
    name: 'Campus Student',
    username: 'student',
    userType: UserType.CAMPUS_STUDENT,
    accessScope: AccessScope.SINGLE_CAMPUS,
    status: SystemStatus.ACTIVE,
  },
  {
    email: 'parent@campus.com',
    name: 'Campus Parent',
    username: 'parent',
    userType: UserType.CAMPUS_PARENT,
    accessScope: AccessScope.SINGLE_CAMPUS,
    status: SystemStatus.ACTIVE,
  },
];

/**
 * Default password for all seeded users
 */
export const DEFAULT_USER_PASSWORD = 'password123';

/**
 * Test institution code used for seeding
 */
export const TEST_INSTITUTION_CODE = 'TEST_INST';

/**
 * Test campus code used for seeding
 */
export const TEST_CAMPUS_CODE = 'MAIN'; 