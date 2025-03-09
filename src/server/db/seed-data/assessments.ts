import { SystemStatus, AssessmentCategory, GradingType } from "@prisma/client";

// Define AssessmentStatus as it's not exported from @prisma/client
enum AssessmentStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED"
}

export interface AssessmentSeedData {
  title: string;
  description?: string;
  category: AssessmentCategory;
  gradingType: GradingType;
  maxScore: number;
  passingScore: number;
  weightage: number;
  dueDate?: Date;
  openDate?: Date;
  closeDate?: Date;
  status: AssessmentStatus;
  systemStatus: SystemStatus;
  subjectCode: string; // Reference to subject by code
  templateCode?: string; // Reference to template by code
  instructions?: string;
}

export const assessmentsSeedData: AssessmentSeedData[] = [
  // Mathematics assessments
  {
    title: "Algebra Fundamentals Quiz",
    description: "A quiz covering basic algebraic concepts",
    category: AssessmentCategory.QUIZ,
    gradingType: GradingType.AUTOMATIC,
    maxScore: 20,
    passingScore: 12,
    weightage: 5,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    openDate: new Date(),
    closeDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    status: AssessmentStatus.PUBLISHED,
    systemStatus: SystemStatus.ACTIVE,
    subjectCode: "MATH101",
    templateCode: "QUIZ-MCQ-BASIC",
    instructions: "Answer all questions. Each question is worth 2 points."
  },
  {
    title: "Calculus Midterm Exam",
    description: "Comprehensive examination of differential calculus",
    category: AssessmentCategory.EXAM,
    gradingType: GradingType.HYBRID,
    maxScore: 100,
    passingScore: 60,
    weightage: 20,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    openDate: new Date(new Date().setDate(new Date().getDate() + 13)),
    closeDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    status: AssessmentStatus.SCHEDULED,
    systemStatus: SystemStatus.ACTIVE,
    subjectCode: "MATH201",
    templateCode: "EXAM-MIDTERM",
    instructions: "The exam consists of multiple-choice questions, short-answer questions, and one essay. Show all work for partial credit."
  },
  
  // Science assessments
  {
    title: "Cell Biology Lab Report",
    description: "Laboratory report on cell structure observation",
    category: AssessmentCategory.ASSIGNMENT,
    gradingType: GradingType.MANUAL,
    maxScore: 100,
    passingScore: 60,
    weightage: 15,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 21)),
    status: AssessmentStatus.PUBLISHED,
    systemStatus: SystemStatus.ACTIVE,
    subjectCode: "SCI101",
    templateCode: "ASSIGNMENT-ESSAY",
    instructions: "Submit a comprehensive lab report including introduction, methods, results, discussion, and conclusion sections."
  },
  {
    title: "Chemistry Practical Assessment",
    description: "Hands-on assessment of laboratory techniques",
    category: AssessmentCategory.PRACTICAL,
    gradingType: GradingType.MANUAL,
    maxScore: 50,
    passingScore: 30,
    weightage: 15,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
    status: AssessmentStatus.PUBLISHED,
    systemStatus: SystemStatus.ACTIVE,
    subjectCode: "SCI201",
    templateCode: "PRACTICAL-LAB",
    instructions: "Follow all safety procedures. You will be assessed on technique, accuracy of results, and analysis."
  },
  
  // Language assessments
  {
    title: "Essay Writing Assignment",
    description: "Argumentative essay on a selected topic",
    category: AssessmentCategory.ASSIGNMENT,
    gradingType: GradingType.MANUAL,
    maxScore: 100,
    passingScore: 60,
    weightage: 15,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    status: AssessmentStatus.PUBLISHED,
    systemStatus: SystemStatus.ACTIVE,
    subjectCode: "ENG101",
    templateCode: "ASSIGNMENT-ESSAY",
    instructions: "Write a 1500-word argumentative essay on one of the provided topics. Include at least 5 scholarly sources."
  },
  {
    title: "Literary Analysis Final Exam",
    description: "Comprehensive examination of literary analysis techniques",
    category: AssessmentCategory.EXAM,
    gradingType: GradingType.HYBRID,
    maxScore: 100,
    passingScore: 60,
    weightage: 30,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    openDate: new Date(new Date().setDate(new Date().getDate() + 29)),
    closeDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    status: AssessmentStatus.SCHEDULED,
    systemStatus: SystemStatus.ACTIVE,
    subjectCode: "ENG201",
    templateCode: "EXAM-FINAL",
    instructions: "The exam consists of multiple-choice questions, short-answer questions, and two essays. You will have 3 hours to complete the exam."
  },
  
  // Computer Science assessments
  {
    title: "Programming Fundamentals Quiz",
    description: "Quiz on basic programming concepts",
    category: AssessmentCategory.QUIZ,
    gradingType: GradingType.AUTOMATIC,
    maxScore: 20,
    passingScore: 12,
    weightage: 5,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    openDate: new Date(),
    closeDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    status: AssessmentStatus.PUBLISHED,
    systemStatus: SystemStatus.ACTIVE,
    subjectCode: "CS101",
    templateCode: "QUIZ-MCQ-BASIC",
    instructions: "Answer all questions. Each question is worth 2 points."
  },
  {
    title: "Algorithm Implementation Project",
    description: "Group project to implement and analyze algorithms",
    category: AssessmentCategory.ASSIGNMENT,
    gradingType: GradingType.MANUAL,
    maxScore: 100,
    passingScore: 60,
    weightage: 25,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 28)),
    status: AssessmentStatus.PUBLISHED,
    systemStatus: SystemStatus.ACTIVE,
    subjectCode: "CS201",
    templateCode: "ASSIGNMENT-PROJECT",
    instructions: "In groups of 3-4, implement the assigned algorithms, analyze their time and space complexity, and prepare a presentation."
  }
]; 