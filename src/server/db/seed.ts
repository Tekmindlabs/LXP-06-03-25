import { PrismaClient, UserType, AccessScope } from "@prisma/client";
import { hash } from "bcryptjs";
import { institutionsSeedData } from "./seed-data/institutions";
import { campusesSeedData } from "./seed-data/campuses";
import { academicCyclesSeedData } from "./seed-data/academic-cycles";
import { usersSeedData, DEFAULT_USER_PASSWORD, TEST_INSTITUTION_CODE, TEST_CAMPUS_CODE } from "./seed-data/users";

const prisma = new PrismaClient();

/**
 * Main seed function that combines all seed data
 */
async function main() {
  console.log("Starting database seeding...");

  // ===== PART 1: Seed institutions and campuses from seed data =====
  console.log("Seeding institutions...");
  for (const institution of institutionsSeedData) {
    await prisma.institution.upsert({
      where: { code: institution.code },
      update: institution,
      create: institution,
    });
  }
  console.log(`Seeded ${institutionsSeedData.length} institutions`);

  // Create a test institution if it doesn't exist in seed data
  const testInstitution = await prisma.institution.upsert({
    where: { code: TEST_INSTITUTION_CODE },
    update: {
      name: 'Test Institution',
      status: 'ACTIVE',
    },
    create: {
      name: 'Test Institution',
      code: TEST_INSTITUTION_CODE,
      status: 'ACTIVE',
    },
  });

  // Seed campuses
  console.log("Seeding campuses...");
  for (const campus of campusesSeedData) {
    const { institutionCode, ...campusData } = campus;
    
    // Find the institution by code
    const institution = await prisma.institution.findUnique({
      where: { code: institutionCode },
    });

    if (!institution) {
      console.warn(`Institution with code ${institutionCode} not found. Skipping campus ${campus.code}`);
      continue;
    }

    await prisma.campus.upsert({
      where: { code: campus.code },
      update: {
        ...campusData,
        institutionId: institution.id,
      },
      create: {
        ...campusData,
        institutionId: institution.id,
      },
    });
  }
  console.log(`Seeded ${campusesSeedData.length} campuses`);

  // Create a test campus
  const testCampus = await prisma.campus.upsert({
    where: { code: TEST_CAMPUS_CODE },
    update: {
      name: 'Main Campus',
      status: 'ACTIVE',
      institutionId: testInstitution.id,
      address: {
        street: '123 Campus St',
        city: 'Campus City',
        state: 'Campus State',
        country: 'Campus Country',
        postalCode: '12345',
      },
      contact: {
        phone: '1234567890',
        email: 'campus@institution.com',
      },
    },
    create: {
      institutionId: testInstitution.id,
      name: 'Main Campus',
      code: TEST_CAMPUS_CODE,
      status: 'ACTIVE',
      address: {
        street: '123 Campus St',
        city: 'Campus City',
        state: 'Campus State',
        country: 'Campus Country',
        postalCode: '12345',
      },
      contact: {
        phone: '1234567890',
        email: 'campus@institution.com',
      },
    },
  });

  // ===== PART 2: Seed users =====
  console.log("Seeding users...");
  const hashedPassword = await hash(DEFAULT_USER_PASSWORD, 12);

  // Create admin users for each institution
  const institutionAdmins = [];
  for (const institution of institutionsSeedData) {
    const institutionObj = await prisma.institution.findUnique({
      where: { code: institution.code },
    });

    if (!institutionObj) continue;

    const adminEmail = `admin@${institution.code.toLowerCase()}.edu`;
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: `${institution.name} Admin`,
        username: `admin_${institution.code.toLowerCase()}`,
        userType: UserType.ADMINISTRATOR,
        accessScope: AccessScope.MULTI_CAMPUS,
        status: 'ACTIVE',
      },
      create: {
        email: adminEmail,
        name: `${institution.name} Admin`,
        username: `admin_${institution.code.toLowerCase()}`,
        userType: UserType.ADMINISTRATOR,
        accessScope: AccessScope.MULTI_CAMPUS,
        password: hashedPassword,
        status: 'ACTIVE',
        institutionId: institutionObj.id,
      },
    });
    
    institutionAdmins.push(adminUser);
  }

  // Seed regular users
  for (const userData of usersSeedData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        username: userData.username,
        userType: userData.userType,
        accessScope: userData.accessScope,
        status: userData.status,
      },
      create: {
        email: userData.email,
        name: userData.name,
        username: userData.username,
        userType: userData.userType,
        accessScope: userData.accessScope,
        password: hashedPassword,
        status: userData.status,
        institutionId: testInstitution.id,
      },
    });

    // Create campus access for users with SINGLE_CAMPUS access scope
    if (userData.accessScope === 'SINGLE_CAMPUS') {
      await prisma.userCampusAccess.upsert({
        where: {
          userId_campusId: {
            userId: user.id,
            campusId: testCampus.id,
          },
        },
        update: {
          status: 'ACTIVE',
          roleType: userData.userType,
        },
        create: {
          userId: user.id,
          campusId: testCampus.id,
          status: 'ACTIVE',
          roleType: userData.userType,
        },
      });
    }
  }
  console.log(`Seeded ${usersSeedData.length + institutionAdmins.length} users`);

  // ===== PART 3: Seed academic cycles =====
  console.log("Seeding academic cycles...");
  for (const cycle of academicCyclesSeedData) {
    const { institutionCode, ...cycleData } = cycle;
    
    // Find the institution by code
    const institution = await prisma.institution.findUnique({
      where: { code: institutionCode },
    });

    if (!institution) {
      console.warn(`Institution with code ${institutionCode} not found. Skipping academic cycle ${cycle.code}`);
      continue;
    }

    // Find the admin user for this institution
    const adminUser = await prisma.user.findFirst({
      where: {
        institutionId: institution.id,
        userType: UserType.ADMINISTRATOR,
      },
    });

    // If no admin user found, use any user of the institution
    const creator = adminUser || await prisma.user.findFirst({
      where: {
        institutionId: institution.id,
      },
    });

    if (!creator) {
      console.warn(`No user found for institution ${institutionCode}. Skipping academic cycle ${cycle.code}`);
      continue;
    }

    await prisma.academicCycle.upsert({
      where: { code: cycle.code },
      update: {
        ...cycleData,
        institutionId: institution.id,
        updatedBy: creator.id,
      },
      create: {
        ...cycleData,
        institutionId: institution.id,
        createdBy: creator.id,
        updatedBy: creator.id,
      },
    });
  }
  console.log(`Seeded ${academicCyclesSeedData.length} academic cycles`);

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 