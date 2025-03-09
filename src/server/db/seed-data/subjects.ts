import { SystemStatus } from "@prisma/client";

export interface SubjectSeedData {
  code: string;
  name: string;
  credits: number;
  status: SystemStatus;
  courseCode: string; // Reference to course by code
  syllabus?: Record<string, any>;
}

export const subjectsSeedData: SubjectSeedData[] = [
  // Mathematics subjects
  {
    code: "MATH101",
    name: "Introduction to Mathematics",
    credits: 3,
    status: SystemStatus.ACTIVE,
    courseCode: "MATH-BASIC",
    syllabus: {
      overview: "Fundamental mathematical concepts and operations",
      topics: [
        "Number Systems",
        "Basic Algebra",
        "Geometry Fundamentals",
        "Introduction to Statistics"
      ],
      assessmentMethods: ["Quizzes", "Midterm Exam", "Final Exam"]
    }
  },
  {
    code: "MATH201",
    name: "Calculus I",
    credits: 4,
    status: SystemStatus.ACTIVE,
    courseCode: "MATH-ADV",
    syllabus: {
      overview: "Introduction to differential and integral calculus",
      topics: [
        "Limits and Continuity",
        "Derivatives",
        "Applications of Derivatives",
        "Integrals",
        "Applications of Integrals"
      ],
      assessmentMethods: ["Weekly Problem Sets", "Midterm Exam", "Final Exam"]
    }
  },
  
  // Science subjects
  {
    code: "SCI101",
    name: "Introduction to Biology",
    credits: 3,
    status: SystemStatus.ACTIVE,
    courseCode: "SCI-BIO",
    syllabus: {
      overview: "Fundamental concepts in biology",
      topics: [
        "Cell Structure and Function",
        "Genetics",
        "Evolution",
        "Ecology"
      ],
      assessmentMethods: ["Lab Reports", "Quizzes", "Midterm Exam", "Final Exam"]
    }
  },
  {
    code: "SCI201",
    name: "Chemistry Fundamentals",
    credits: 4,
    status: SystemStatus.ACTIVE,
    courseCode: "SCI-CHEM",
    syllabus: {
      overview: "Basic principles of chemistry",
      topics: [
        "Atomic Structure",
        "Chemical Bonding",
        "Chemical Reactions",
        "Stoichiometry"
      ],
      assessmentMethods: ["Lab Reports", "Problem Sets", "Midterm Exam", "Final Exam"]
    }
  },
  
  // Language subjects
  {
    code: "ENG101",
    name: "English Composition",
    credits: 3,
    status: SystemStatus.ACTIVE,
    courseCode: "ENG-COMP",
    syllabus: {
      overview: "Fundamentals of writing and composition",
      topics: [
        "Grammar and Syntax",
        "Essay Structure",
        "Rhetorical Strategies",
        "Research Methods"
      ],
      assessmentMethods: ["Essays", "Reading Responses", "Research Paper"]
    }
  },
  {
    code: "ENG201",
    name: "Literature Analysis",
    credits: 3,
    status: SystemStatus.ACTIVE,
    courseCode: "ENG-LIT",
    syllabus: {
      overview: "Critical analysis of literary works",
      topics: [
        "Literary Genres",
        "Critical Theory",
        "Close Reading",
        "Literary History"
      ],
      assessmentMethods: ["Reading Responses", "Literary Analysis Essays", "Final Paper"]
    }
  },
  
  // Computer Science subjects
  {
    code: "CS101",
    name: "Introduction to Programming",
    credits: 3,
    status: SystemStatus.ACTIVE,
    courseCode: "CS-INTRO",
    syllabus: {
      overview: "Fundamentals of programming and problem-solving",
      topics: [
        "Variables and Data Types",
        "Control Structures",
        "Functions",
        "Basic Data Structures"
      ],
      assessmentMethods: ["Programming Assignments", "Quizzes", "Final Project"]
    }
  },
  {
    code: "CS201",
    name: "Data Structures and Algorithms",
    credits: 4,
    status: SystemStatus.ACTIVE,
    courseCode: "CS-ADV",
    syllabus: {
      overview: "Advanced data structures and algorithm design",
      topics: [
        "Arrays and Linked Lists",
        "Stacks and Queues",
        "Trees and Graphs",
        "Sorting and Searching Algorithms"
      ],
      assessmentMethods: ["Programming Assignments", "Algorithm Analysis", "Final Exam"]
    }
  }
]; 