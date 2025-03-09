import { PrismaClient, SystemStatus } from '@prisma/client';

export async function seedSubjects(prisma: PrismaClient) {
  console.log('Seeding subjects...');

  // Get courses to associate subjects with
  const courses = await prisma.course.findMany({
    take: 3,
    orderBy: { createdAt: 'asc' },
  });

  if (courses.length === 0) {
    console.log('No courses found. Skipping subject seeding.');
    return;
  }

  // Create subjects
  const subjects = [
    {
      code: 'MATH101',
      name: 'Introduction to Mathematics',
      credits: 3,
      courseId: courses[0].id,
      syllabus: {
        overview: 'This course provides an introduction to basic mathematical concepts.',
        objectives: [
          'Understand basic arithmetic operations',
          'Learn algebraic expressions',
          'Solve simple equations',
        ],
        assessmentMethods: [
          'Weekly quizzes (30%)',
          'Midterm exam (30%)',
          'Final exam (40%)',
        ],
      },
      status: SystemStatus.ACTIVE,
    },
    {
      code: 'ENG101',
      name: 'English Composition',
      credits: 3,
      courseId: courses[0].id,
      syllabus: {
        overview: 'This course focuses on developing writing skills.',
        objectives: [
          'Develop critical thinking skills',
          'Improve writing clarity and structure',
          'Learn proper citation methods',
        ],
        assessmentMethods: [
          'Essays (50%)',
          'Participation (20%)',
          'Final paper (30%)',
        ],
      },
      status: SystemStatus.ACTIVE,
    },
    {
      code: 'CS101',
      name: 'Introduction to Computer Science',
      credits: 4,
      courseId: courses[1].id,
      syllabus: {
        overview: 'This course introduces fundamental concepts of computer science.',
        objectives: [
          'Understand basic programming concepts',
          'Learn problem-solving techniques',
          'Develop simple applications',
        ],
        assessmentMethods: [
          'Programming assignments (40%)',
          'Midterm exam (25%)',
          'Final project (35%)',
        ],
      },
      status: SystemStatus.ACTIVE,
    },
    {
      code: 'BIO101',
      name: 'Introduction to Biology',
      credits: 4,
      courseId: courses[1].id,
      syllabus: {
        overview: 'This course covers the basic principles of biology.',
        objectives: [
          'Understand cell structure and function',
          'Learn about genetics and inheritance',
          'Explore ecosystem dynamics',
        ],
        assessmentMethods: [
          'Lab reports (30%)',
          'Quizzes (20%)',
          'Midterm exam (20%)',
          'Final exam (30%)',
        ],
      },
      status: SystemStatus.ACTIVE,
    },
    {
      code: 'HIST101',
      name: 'World History',
      credits: 3,
      courseId: courses[2].id,
      syllabus: {
        overview: 'This course examines major events and developments in world history.',
        objectives: [
          'Understand key historical periods',
          'Analyze historical documents',
          'Develop critical thinking about historical events',
        ],
        assessmentMethods: [
          'Research paper (30%)',
          'Midterm exam (30%)',
          'Final exam (30%)',
          'Participation (10%)',
        ],
      },
      status: SystemStatus.ACTIVE,
    },
  ];

  // Create subjects in database
  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: subject,
      create: subject,
    });
  }

  console.log(`Seeded ${subjects.length} subjects`);
} 