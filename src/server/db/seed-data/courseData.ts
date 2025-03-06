import { PrismaClient, SystemStatus } from '@prisma/client';

export async function seedCourses(prisma: PrismaClient) {
  const program = await prisma.program.findFirst({
    where: { status: SystemStatus.ACTIVE }
  });

  if (!program) {
    console.log('No active program found. Please seed programs first.');
    return;
  }

  const courses = [
    {
      code: 'CS101',
      name: 'Introduction to Computer Science',
      description: 'Fundamental concepts of programming',
      level: 1,
      credits: 3.0,
      programId: program.id,
      status: SystemStatus.ACTIVE
    },
    {
      code: 'CS102',
      name: 'Data Structures',
      description: 'Basic data structures and algorithms',
      level: 1,
      credits: 3.0,
      programId: program.id,
      status: SystemStatus.ACTIVE
    },
    // Add more courses as needed
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { code: course.code },
      update: course,
      create: course
    });
  }

  console.log('Courses seeded successfully');
}

export async function seedSubjects(prisma: PrismaClient) {
  const course = await prisma.course.findFirst({
    where: { status: SystemStatus.ACTIVE }
  });

  if (!course) {
    console.log('No active course found. Please seed courses first.');
    return;
  }

  const subjects = [
    {
      code: 'CS101-1',
      name: 'Programming Basics',
      credits: 1.0,
      courseId: course.id,
      status: SystemStatus.ACTIVE
    },
    {
      code: 'CS101-2',
      name: 'Object-Oriented Programming',
      credits: 1.0,
      courseId: course.id,
      status: SystemStatus.ACTIVE
    },
    // Add more subjects as needed
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: subject,
      create: subject
    });
  }

  console.log('Subjects seeded successfully');
} 