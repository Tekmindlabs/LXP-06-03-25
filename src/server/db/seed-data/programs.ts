import { PrismaClient, SystemStatus } from '@prisma/client';

export interface ProgramSeedData {
  code: string;
  name: string;
  type: string;
  level: number;
  duration: number;
  status: SystemStatus;
  institutionCode: string; // Reference to institution by code
  settings?: Record<string, any>;
  curriculum?: Record<string, any>;
}

export const programsSeedData: ProgramSeedData[] = [
  // Add your program seed data here
  {
    code: "MATH-PROG",
    name: "Mathematics",
    type: "UNDERGRADUATE",
    level: 1,
    duration: 48,
    status: SystemStatus.ACTIVE,
    institutionCode: "AIVY-UNIV",
    settings: {
      allowConcurrentEnrollment: true,
      requirePrerequisites: true,
      gradingScheme: "STANDARD"
    }
  },
  {
    code: "CS-PROG",
    name: "Computer Science",
    type: "UNDERGRADUATE",
    level: 1,
    duration: 48,
    status: SystemStatus.ACTIVE,
    institutionCode: "AIVY-UNIV",
    settings: {
      allowConcurrentEnrollment: true,
      requirePrerequisites: true,
      gradingScheme: "STANDARD"
    }
  },
  {
    code: "ENG-PROG",
    name: "English",
    type: "UNDERGRADUATE",
    level: 1,
    duration: 48,
    status: SystemStatus.ACTIVE,
    institutionCode: "AIVY-UNIV",
    settings: {
      allowConcurrentEnrollment: true,
      requirePrerequisites: true,
      gradingScheme: "STANDARD"
    }
  },
  {
    code: "SCI-PROG",
    name: "Science",
    type: "UNDERGRADUATE",
    level: 1,
    duration: 48,
    status: SystemStatus.ACTIVE,
    institutionCode: "AIVY-UNIV",
    settings: {
      allowConcurrentEnrollment: true,
      requirePrerequisites: true,
      gradingScheme: "STANDARD"
    }
  }
];

export async function seedPrograms(prisma: PrismaClient) {
  for (const programData of programsSeedData) {
    try {
      // Find the institution by code
      const institution = await prisma.institution.findUnique({
        where: { code: programData.institutionCode }
      });

      if (!institution) {
        console.log(`Institution with code ${programData.institutionCode} not found. Skipping program ${programData.code}`);
        continue;
      }

      // Check if program already exists
      const existingProgram = await prisma.program.findFirst({
        where: {
          code: programData.code,
          institutionId: institution.id
        }
      });

      if (existingProgram) {
        // Update existing program
        await prisma.program.update({
          where: { id: existingProgram.id },
          data: {
            name: programData.name,
            type: programData.type,
            level: programData.level,
            duration: programData.duration,
            status: programData.status,
            settings: programData.settings as any,
            curriculum: programData.curriculum as any
          }
        });
        console.log(`Program ${programData.code} updated successfully.`);
      } else {
        // Create new program
        await prisma.program.create({
          data: {
            code: programData.code,
            name: programData.name,
            type: programData.type,
            level: programData.level,
            duration: programData.duration,
            status: programData.status,
            institutionId: institution.id,
            settings: programData.settings as any,
            curriculum: programData.curriculum as any
          }
        });
        console.log(`Program ${programData.code} created successfully.`);
      }
    } catch (error) {
      console.error(`Error creating/updating program ${programData.code}:`, error);
    }
  }

  console.log('Programs seeding completed.');
} 