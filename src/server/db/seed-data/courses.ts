import { PrismaClient, SystemStatus } from "@prisma/client";

export interface CourseSeedData {
  code: string;
  name: string;
  description: string;
  level: number;
  credits: number;
  programCode: string;
  status: SystemStatus;
}

export const coursesSeedData: CourseSeedData[] = [
  // Computer Science Courses
  {
    code: "CS101",
    name: "Introduction to Computer Science",
    description: "Fundamental concepts of computer science, including algorithms, data structures, and problem-solving techniques.",
    level: 1,
    credits: 3,
    programCode: "CS-BSC",
    status: SystemStatus.ACTIVE,
  },
  {
    code: "CS201",
    name: "Data Structures and Algorithms",
    description: "Advanced data structures and algorithm design techniques, including analysis of algorithm efficiency.",
    level: 2,
    credits: 4,
    programCode: "CS-BSC",
    status: SystemStatus.ACTIVE,
  },
  {
    code: "CS301",
    name: "Database Systems",
    description: "Design and implementation of database systems, including relational models, SQL, and database management.",
    level: 3,
    credits: 3,
    programCode: "CS-BSC",
    status: SystemStatus.ACTIVE,
  },
  {
    code: "CS401",
    name: "Software Engineering",
    description: "Principles and practices of software engineering, including requirements analysis, design, testing, and project management.",
    level: 4,
    credits: 4,
    programCode: "CS-BSC",
    status: SystemStatus.ACTIVE,
  },
  
  // Business Administration Courses
  {
    code: "BUS101",
    name: "Introduction to Business",
    description: "Overview of business concepts, including management, marketing, finance, and entrepreneurship.",
    level: 1,
    credits: 3,
    programCode: "BUS-BBA",
    status: SystemStatus.ACTIVE,
  },
  {
    code: "BUS201",
    name: "Principles of Marketing",
    description: "Fundamentals of marketing, including market analysis, consumer behavior, and marketing strategies.",
    level: 2,
    credits: 3,
    programCode: "BUS-BBA",
    status: SystemStatus.ACTIVE,
  },
  {
    code: "BUS301",
    name: "Financial Management",
    description: "Principles of financial management, including financial analysis, capital budgeting, and investment decisions.",
    level: 3,
    credits: 4,
    programCode: "BUS-BBA",
    status: SystemStatus.ACTIVE,
  },
  {
    code: "BUS401",
    name: "Strategic Management",
    description: "Advanced concepts in strategic management, including competitive analysis, strategy formulation, and implementation.",
    level: 4,
    credits: 4,
    programCode: "BUS-BBA",
    status: SystemStatus.ACTIVE,
  },
  
  // Psychology Courses
  {
    code: "PSY101",
    name: "Introduction to Psychology",
    description: "Overview of psychological principles, theories, and research methods.",
    level: 1,
    credits: 3,
    programCode: "PSY-BA",
    status: SystemStatus.ACTIVE,
  },
  {
    code: "PSY201",
    name: "Developmental Psychology",
    description: "Study of human development across the lifespan, including cognitive, social, and emotional development.",
    level: 2,
    credits: 3,
    programCode: "PSY-BA",
    status: SystemStatus.ACTIVE,
  },
  {
    code: "PSY301",
    name: "Abnormal Psychology",
    description: "Study of psychological disorders, including diagnosis, causes, and treatment approaches.",
    level: 3,
    credits: 4,
    programCode: "PSY-BA",
    status: SystemStatus.ACTIVE,
  },
  {
    code: "PSY401",
    name: "Research Methods in Psychology",
    description: "Advanced research methods and statistical analysis in psychological research.",
    level: 4,
    credits: 4,
    programCode: "PSY-BA",
    status: SystemStatus.ACTIVE,
  },
];

export async function seedCourses(prisma: PrismaClient) {
  console.log("Seeding courses...");
  
  // Get all programs
  const programs = await prisma.program.findMany({
    where: {
      status: SystemStatus.ACTIVE,
    },
  });
  
  // Create courses for each program
  for (const program of programs) {
    const programCourses = coursesSeedData.filter(
      (course) => course.programCode === program.code
    );
    
    for (const courseData of programCourses) {
      // Check if course already exists
      const existingCourse = await prisma.course.findFirst({
        where: {
          code: courseData.code,
          programId: program.id,
        },
      });
      
      if (!existingCourse) {
        await prisma.course.create({
          data: {
            code: courseData.code,
            name: courseData.name,
            description: courseData.description,
            level: courseData.level,
            credits: courseData.credits,
            status: courseData.status,
            programId: program.id,
          },
        });
      }
    }
  }
  
  console.log("Courses seeded successfully");
} 