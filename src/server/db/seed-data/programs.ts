import { PrismaClient, SystemStatus } from '@prisma/client';

export async function seedPrograms(prisma: PrismaClient) {
  console.log('Finding active institution...');
  const institution = await prisma.institution.findFirst({
    where: { status: SystemStatus.ACTIVE },
  });

  if (!institution) {
    console.log('No active institution found. Skipping program seeding.');
    return;
  }

  const programs = [
    {
      name: 'Bachelor of Computer Science',
      code: 'BCS',
      type: 'Undergraduate',
      level: 1,
      duration: 48,
      description: 'A comprehensive program covering computer science fundamentals and advanced topics.',
      status: SystemStatus.ACTIVE,
      institutionId: institution.id,
      settings: {
        creditRequirements: 120,
        allowConcurrentEnrollment: false,
        requirePrerequisites: true,
        gradingScheme: 'STANDARD',
      },
      curriculum: {
        terms: [
          {
            number: 1,
            name: 'First Year - Semester 1',
            minimumCredits: 15,
          },
          {
            number: 2,
            name: 'First Year - Semester 2',
            minimumCredits: 15,
          },
        ],
      },
    },
    {
      name: 'Master of Business Administration',
      code: 'MBA',
      type: 'Graduate',
      level: 2,
      duration: 24,
      description: 'Advanced business management and leadership program.',
      status: SystemStatus.ACTIVE,
      institutionId: institution.id,
      settings: {
        creditRequirements: 60,
        allowConcurrentEnrollment: false,
        requirePrerequisites: true,
        gradingScheme: 'STANDARD',
      },
      curriculum: {
        terms: [
          {
            number: 1,
            name: 'First Semester',
            minimumCredits: 12,
          },
          {
            number: 2,
            name: 'Second Semester',
            minimumCredits: 12,
          },
        ],
      },
    },
    {
      name: 'Diploma in Digital Marketing',
      code: 'DDM',
      type: 'Diploma',
      level: 1,
      duration: 12,
      description: 'Professional diploma focusing on digital marketing strategies and tools.',
      status: SystemStatus.ACTIVE,
      institutionId: institution.id,
      settings: {
        creditRequirements: 30,
        allowConcurrentEnrollment: true,
        requirePrerequisites: false,
        gradingScheme: 'STANDARD',
      },
      curriculum: {
        terms: [
          {
            number: 1,
            name: 'Term 1',
            minimumCredits: 15,
          },
          {
            number: 2,
            name: 'Term 2',
            minimumCredits: 15,
          },
        ],
      },
    },
  ];

  console.log('Creating/updating programs...');
  for (const program of programs) {
    try {
      // First try to find an existing program
      const existingProgram = await prisma.program.findFirst({
        where: {
          code: program.code,
          institutionId: program.institutionId,
        },
      });

      if (existingProgram) {
        await prisma.program.update({
          where: { id: existingProgram.id },
          data: program,
        });
        console.log(`Program ${program.code} updated successfully.`);
      } else {
        await prisma.program.create({
          data: program,
        });
        console.log(`Program ${program.code} created successfully.`);
      }
    } catch (error) {
      console.error(`Error creating/updating program ${program.code}:`, error);
    }
  }

  console.log('Programs seeding completed.');
} 