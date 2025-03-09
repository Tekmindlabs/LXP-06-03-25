import { PrismaClient, SystemStatus } from '@prisma/client';

// Define course seed data with program codes
const coursesSeedData = [
  {
    code: 'CS101',
    name: 'Introduction to Computer Science',
    description: 'Fundamental concepts of programming',
    level: 1,
    credits: 3.0,
    programCode: 'CS-PROG', // Reference to program by code
    status: SystemStatus.ACTIVE
  },
  {
    code: 'CS102',
    name: 'Data Structures',
    description: 'Basic data structures and algorithms',
    level: 1,
    credits: 3.0,
    programCode: 'CS-PROG', // Reference to program by code
    status: SystemStatus.ACTIVE
  },
  {
    code: 'MATH101',
    name: 'Calculus I',
    description: 'Introduction to differential calculus',
    level: 1,
    credits: 4.0,
    programCode: 'MATH-PROG', // Reference to program by code
    status: SystemStatus.ACTIVE
  },
  {
    code: 'ENG101',
    name: 'English Composition',
    description: 'Fundamentals of writing and composition',
    level: 1,
    credits: 3.0,
    programCode: 'ENG-PROG', // Reference to program by code
    status: SystemStatus.ACTIVE
  }
];

export async function seedCourses(prisma: PrismaClient) {
  for (const courseData of coursesSeedData) {
    try {
      // Find the program by code
      const program = await prisma.program.findFirst({
        where: { code: courseData.programCode, status: SystemStatus.ACTIVE }
      });

      if (!program) {
        console.log(`Program with code ${courseData.programCode} not found. Skipping course ${courseData.code}`);
        continue;
      }

      // Check if course already exists
      const existingCourse = await prisma.course.findFirst({
        where: {
          code: courseData.code
        }
      });

      if (existingCourse) {
        // Update existing course
        await prisma.course.update({
          where: { id: existingCourse.id },
          data: {
            name: courseData.name,
            description: courseData.description,
            level: courseData.level,
            credits: courseData.credits,
            programId: program.id,
            status: courseData.status
          }
        });
        console.log(`Course ${courseData.code} updated successfully.`);
      } else {
        // Create new course
        await prisma.course.create({
          data: {
            code: courseData.code,
            name: courseData.name,
            description: courseData.description,
            level: courseData.level,
            credits: courseData.credits,
            programId: program.id,
            status: courseData.status
          }
        });
        console.log(`Course ${courseData.code} created successfully.`);
      }
    } catch (error) {
      console.error(`Error creating/updating course ${courseData.code}:`, error);
    }
  }

  console.log('Courses seeded successfully');
}

// Define subject seed data with course codes
const subjectsSeedData = [
  {
    code: 'CS101-1',
    name: 'Programming Basics',
    credits: 1.0,
    courseCode: 'CS101',
    status: SystemStatus.ACTIVE
  },
  {
    code: 'CS101-2',
    name: 'Object-Oriented Programming',
    credits: 1.0,
    courseCode: 'CS101',
    status: SystemStatus.ACTIVE
  },
  {
    code: 'CS102-1',
    name: 'Data Structures Fundamentals',
    credits: 1.5,
    courseCode: 'CS102',
    status: SystemStatus.ACTIVE
  },
  {
    code: 'MATH101-1',
    name: 'Limits and Derivatives',
    credits: 2.0,
    courseCode: 'MATH101',
    status: SystemStatus.ACTIVE
  },
  {
    code: 'MATH101-2',
    name: 'Applications of Derivatives',
    credits: 2.0,
    courseCode: 'MATH101',
    status: SystemStatus.ACTIVE
  }
];

export async function seedSubjects(prisma: PrismaClient) {
  for (const subjectData of subjectsSeedData) {
    try {
      // Find the course by code
      const course = await prisma.course.findFirst({
        where: { code: subjectData.courseCode, status: SystemStatus.ACTIVE }
      });

      if (!course) {
        console.log(`Course with code ${subjectData.courseCode} not found. Skipping subject ${subjectData.code}`);
        continue;
      }

      // Check if subject already exists
      const existingSubject = await prisma.subject.findFirst({
        where: {
          code: subjectData.code
        }
      });

      if (existingSubject) {
        // Update existing subject
        await prisma.subject.update({
          where: { id: existingSubject.id },
          data: {
            name: subjectData.name,
            credits: subjectData.credits,
            courseId: course.id,
            status: subjectData.status
          }
        });
        console.log(`Subject ${subjectData.code} updated successfully.`);
      } else {
        // Create new subject
        await prisma.subject.create({
          data: {
            code: subjectData.code,
            name: subjectData.name,
            credits: subjectData.credits,
            courseId: course.id,
            status: subjectData.status
          }
        });
        console.log(`Subject ${subjectData.code} created successfully.`);
      }
    } catch (error) {
      console.error(`Error creating/updating subject ${subjectData.code}:`, error);
    }
  }

  console.log('Subjects seeded successfully');
} 