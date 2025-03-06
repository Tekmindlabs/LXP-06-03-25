import { SystemStatus } from "@prisma/client";

/**
 * Seed data for academic cycles
 * Each academic cycle is associated with an institution by its code
 */
export const academicCyclesSeedData = [
  {
    name: "Academic Year 2023-2024",
    code: "AIVY-AY-2023-2024",
    description: "The academic year 2023-2024 for Aivy University",
    startDate: new Date("2023-09-01"),
    endDate: new Date("2024-06-30"),
    type: "ANNUAL",
    duration: 10, // 10 months
    status: SystemStatus.ACTIVE,
    institutionCode: "AIVY-UNIV",
  },
  {
    name: "Academic Year 2024-2025",
    code: "AIVY-AY-2024-2025",
    description: "The academic year 2024-2025 for Aivy University",
    startDate: new Date("2024-09-01"),
    endDate: new Date("2025-06-30"),
    type: "ANNUAL",
    duration: 10, // 10 months
    status: SystemStatus.ACTIVE,
    institutionCode: "AIVY-UNIV",
  },
  {
    name: "Fall Semester 2023",
    code: "TECH-FALL-2023",
    description: "Fall semester 2023 for Tech Institute",
    startDate: new Date("2023-09-01"),
    endDate: new Date("2023-12-20"),
    type: "SEMESTER",
    duration: 4, // 4 months
    status: SystemStatus.ACTIVE,
    institutionCode: "TECH-INST",
  },
  {
    name: "Spring Semester 2024",
    code: "TECH-SPRING-2024",
    description: "Spring semester 2024 for Tech Institute",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-05-15"),
    type: "SEMESTER",
    duration: 4, // 4 months
    status: SystemStatus.ACTIVE,
    institutionCode: "TECH-INST",
  },
  {
    name: "Summer Semester 2024",
    code: "TECH-SUMMER-2024",
    description: "Summer semester 2024 for Tech Institute",
    startDate: new Date("2024-06-01"),
    endDate: new Date("2024-08-15"),
    type: "SEMESTER",
    duration: 2.5, // 2.5 months
    status: SystemStatus.ACTIVE,
    institutionCode: "TECH-INST",
  },
  {
    name: "Trimester 1 2023-2024",
    code: "GLA-TRIM1-2023",
    description: "First trimester of 2023-2024 for Global Learning Academy",
    startDate: new Date("2023-09-01"),
    endDate: new Date("2023-12-15"),
    type: "TRIMESTER",
    duration: 3.5, // 3.5 months
    status: SystemStatus.ACTIVE,
    institutionCode: "GLA-ACAD",
  },
  {
    name: "Trimester 2 2023-2024",
    code: "GLA-TRIM2-2024",
    description: "Second trimester of 2023-2024 for Global Learning Academy",
    startDate: new Date("2024-01-10"),
    endDate: new Date("2024-04-15"),
    type: "TRIMESTER",
    duration: 3.5, // 3.5 months
    status: SystemStatus.ACTIVE,
    institutionCode: "GLA-ACAD",
  },
  {
    name: "Trimester 3 2023-2024",
    code: "GLA-TRIM3-2024",
    description: "Third trimester of 2023-2024 for Global Learning Academy",
    startDate: new Date("2024-05-01"),
    endDate: new Date("2024-08-15"),
    type: "TRIMESTER",
    duration: 3.5, // 3.5 months
    status: SystemStatus.ACTIVE,
    institutionCode: "GLA-ACAD",
  },
  {
    name: "Quarter 1 2023-2024",
    code: "ARTS-Q1-2023",
    description: "First quarter of 2023-2024 for Arts & Humanities College",
    startDate: new Date("2023-09-01"),
    endDate: new Date("2023-11-15"),
    type: "QUARTER",
    duration: 2.5, // 2.5 months
    status: SystemStatus.ACTIVE,
    institutionCode: "ARTS-COLLEGE",
  },
  {
    name: "Quarter 2 2023-2024",
    code: "ARTS-Q2-2023",
    description: "Second quarter of 2023-2024 for Arts & Humanities College",
    startDate: new Date("2023-11-20"),
    endDate: new Date("2024-02-05"),
    type: "QUARTER",
    duration: 2.5, // 2.5 months
    status: SystemStatus.ACTIVE,
    institutionCode: "ARTS-COLLEGE",
  },
  {
    name: "Quarter 3 2023-2024",
    code: "ARTS-Q3-2024",
    description: "Third quarter of 2023-2024 for Arts & Humanities College",
    startDate: new Date("2024-02-10"),
    endDate: new Date("2024-04-25"),
    type: "QUARTER",
    duration: 2.5, // 2.5 months
    status: SystemStatus.ACTIVE,
    institutionCode: "ARTS-COLLEGE",
  },
  {
    name: "Quarter 4 2023-2024",
    code: "ARTS-Q4-2024",
    description: "Fourth quarter of 2023-2024 for Arts & Humanities College",
    startDate: new Date("2024-05-01"),
    endDate: new Date("2024-07-15"),
    type: "QUARTER",
    duration: 2.5, // 2.5 months
    status: SystemStatus.ACTIVE,
    institutionCode: "ARTS-COLLEGE",
  },
  {
    name: "Medical Program 2023-2024",
    code: "MED-PROG-2023-2024",
    description: "Medical program cycle for 2023-2024 at Medical Sciences University",
    startDate: new Date("2023-08-15"),
    endDate: new Date("2024-07-31"),
    type: "CUSTOM",
    duration: 11.5, // 11.5 months
    status: SystemStatus.ACTIVE,
    institutionCode: "MED-UNIV",
  },
]; 