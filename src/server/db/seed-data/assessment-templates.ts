import { SystemStatus, AssessmentCategory, GradingType } from "@prisma/client";

export interface AssessmentTemplateSeedData {
  code: string;
  title: string;
  description?: string;
  category: AssessmentCategory;
  gradingType: GradingType;
  maxScore: number;
  passingScore: number;
  weightage: number;
  gradingConfig?: Record<string, any>;
  rubric?: Record<string, any>;
  autoGradingRules?: Record<string, any>;
  institutionCode: string; // Reference to institution by code
  status: SystemStatus;
  // Note: gradingScaleId will be set in the seed.ts file
}

export const assessmentTemplatesSeedData: AssessmentTemplateSeedData[] = [
  // Quiz templates
  {
    code: "QUIZ-MCQ-BASIC",
    title: "Basic Multiple Choice Quiz",
    category: AssessmentCategory.QUIZ,
    gradingType: GradingType.AUTOMATIC,
    maxScore: 20,
    passingScore: 12,
    weightage: 5,
    gradingConfig: {
      pointsPerQuestion: 2,
      penaltyForWrongAnswer: 0,
      allowPartialCredit: false
    },
    autoGradingRules: {
      gradeImmediately: true,
      showCorrectAnswers: true,
      showExplanations: true
    },
    institutionCode: "AIVY",
    status: SystemStatus.ACTIVE
  },
  {
    code: "QUIZ-MIXED-ADV",
    title: "Advanced Mixed Format Quiz",
    category: AssessmentCategory.QUIZ,
    gradingType: GradingType.HYBRID,
    maxScore: 50,
    passingScore: 30,
    weightage: 10,
    gradingConfig: {
      sections: [
        { type: "mcq", pointsPerQuestion: 2, count: 10 },
        { type: "shortAnswer", pointsPerQuestion: 5, count: 6 }
      ],
      allowPartialCredit: true
    },
    institutionCode: "AIVY",
    status: SystemStatus.ACTIVE
  },
  
  // Assignment templates
  {
    code: "ASSIGNMENT-ESSAY",
    title: "Essay Assignment",
    category: AssessmentCategory.ASSIGNMENT,
    gradingType: GradingType.MANUAL,
    maxScore: 100,
    passingScore: 60,
    weightage: 15,
    rubric: {
      criteria: [
        {
          name: "Content",
          description: "Depth and relevance of content",
          weight: 40,
          levels: [
            { score: 40, description: "Excellent: Comprehensive and insightful" },
            { score: 30, description: "Good: Thorough and relevant" },
            { score: 20, description: "Satisfactory: Basic understanding demonstrated" },
            { score: 10, description: "Needs Improvement: Superficial or irrelevant" }
          ]
        },
        {
          name: "Organization",
          description: "Structure and flow of ideas",
          weight: 30,
          levels: [
            { score: 30, description: "Excellent: Logical and cohesive" },
            { score: 20, description: "Good: Generally organized" },
            { score: 10, description: "Needs Improvement: Disorganized or confusing" }
          ]
        },
        {
          name: "Language",
          description: "Grammar, vocabulary, and style",
          weight: 30,
          levels: [
            { score: 30, description: "Excellent: Sophisticated and error-free" },
            { score: 20, description: "Good: Clear with minor errors" },
            { score: 10, description: "Needs Improvement: Frequent errors that impede understanding" }
          ]
        }
      ]
    },
    institutionCode: "AIVY",
    status: SystemStatus.ACTIVE
  },
  {
    code: "ASSIGNMENT-PROJECT",
    title: "Group Project Assignment",
    category: AssessmentCategory.ASSIGNMENT,
    gradingType: GradingType.MANUAL,
    maxScore: 100,
    passingScore: 60,
    weightage: 25,
    rubric: {
      criteria: [
        {
          name: "Research",
          description: "Quality and depth of research",
          weight: 25,
          levels: [
            { score: 25, description: "Excellent: Comprehensive and well-sourced" },
            { score: 20, description: "Good: Adequate research with reliable sources" },
            { score: 15, description: "Satisfactory: Basic research conducted" },
            { score: 10, description: "Needs Improvement: Minimal or unreliable research" }
          ]
        },
        {
          name: "Analysis",
          description: "Critical thinking and analysis",
          weight: 25,
          levels: [
            { score: 25, description: "Excellent: Insightful and thorough analysis" },
            { score: 20, description: "Good: Clear analysis with some insight" },
            { score: 15, description: "Satisfactory: Basic analysis present" },
            { score: 10, description: "Needs Improvement: Minimal or superficial analysis" }
          ]
        },
        {
          name: "Presentation",
          description: "Quality of presentation and delivery",
          weight: 25,
          levels: [
            { score: 25, description: "Excellent: Engaging and professional" },
            { score: 20, description: "Good: Clear and organized" },
            { score: 15, description: "Satisfactory: Basic presentation skills" },
            { score: 10, description: "Needs Improvement: Difficult to follow or unprofessional" }
          ]
        },
        {
          name: "Collaboration",
          description: "Evidence of teamwork and equal contribution",
          weight: 25,
          levels: [
            { score: 25, description: "Excellent: Seamless integration of contributions" },
            { score: 20, description: "Good: Evidence of collaboration" },
            { score: 15, description: "Satisfactory: Some collaboration evident" },
            { score: 10, description: "Needs Improvement: Uneven contribution or poor integration" }
          ]
        }
      ]
    },
    institutionCode: "AIVY",
    status: SystemStatus.ACTIVE
  },
  
  // Exam templates
  {
    code: "EXAM-MIDTERM",
    title: "Midterm Examination",
    category: AssessmentCategory.EXAM,
    gradingType: GradingType.HYBRID,
    maxScore: 100,
    passingScore: 60,
    weightage: 20,
    gradingConfig: {
      sections: [
        { type: "mcq", pointsPerQuestion: 2, count: 25 },
        { type: "shortAnswer", pointsPerQuestion: 5, count: 5 },
        { type: "essay", pointsPerQuestion: 15, count: 1 }
      ],
      allowPartialCredit: true
    },
    institutionCode: "AIVY",
    status: SystemStatus.ACTIVE
  },
  {
    code: "EXAM-FINAL",
    title: "Final Examination",
    category: AssessmentCategory.EXAM,
    gradingType: GradingType.HYBRID,
    maxScore: 100,
    passingScore: 60,
    weightage: 30,
    gradingConfig: {
      sections: [
        { type: "mcq", pointsPerQuestion: 1, count: 40 },
        { type: "shortAnswer", pointsPerQuestion: 5, count: 6 },
        { type: "essay", pointsPerQuestion: 10, count: 2 }
      ],
      allowPartialCredit: true
    },
    institutionCode: "AIVY",
    status: SystemStatus.ACTIVE
  },
  
  // Practical assessment templates
  {
    code: "PRACTICAL-LAB",
    title: "Laboratory Practical Assessment",
    category: AssessmentCategory.PRACTICAL,
    gradingType: GradingType.MANUAL,
    maxScore: 50,
    passingScore: 30,
    weightage: 15,
    rubric: {
      criteria: [
        {
          name: "Procedure",
          description: "Following correct laboratory procedures",
          weight: 30,
          levels: [
            { score: 30, description: "Excellent: Precise and methodical" },
            { score: 20, description: "Good: Generally correct procedures" },
            { score: 10, description: "Needs Improvement: Significant procedural errors" }
          ]
        },
        {
          name: "Results",
          description: "Accuracy of results",
          weight: 40,
          levels: [
            { score: 40, description: "Excellent: Accurate and precise results" },
            { score: 30, description: "Good: Minor inaccuracies" },
            { score: 20, description: "Satisfactory: Some significant errors" },
            { score: 10, description: "Needs Improvement: Major errors or invalid results" }
          ]
        },
        {
          name: "Analysis",
          description: "Interpretation and analysis of results",
          weight: 30,
          levels: [
            { score: 30, description: "Excellent: Insightful analysis and interpretation" },
            { score: 20, description: "Good: Adequate analysis" },
            { score: 10, description: "Needs Improvement: Minimal or incorrect analysis" }
          ]
        }
      ]
    },
    institutionCode: "AIVY",
    status: SystemStatus.ACTIVE
  }
]; 