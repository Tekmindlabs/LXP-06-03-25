import { SystemStatus } from "@prisma/client";

/**
 * Seed data for institutions
 */
export const institutionsSeedData = [
  {
    name: "Aivy University",
    code: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
  },
  {
    name: "Tech Institute",
    code: "TECH-INST",
    status: SystemStatus.ACTIVE,
  },
  {
    name: "Global Learning Academy",
    code: "GLA-ACAD",
    status: SystemStatus.ACTIVE,
  },
  {
    name: "Arts & Humanities College",
    code: "ARTS-COLLEGE",
    status: SystemStatus.ACTIVE,
  },
  {
    name: "Medical Sciences University",
    code: "MED-UNIV",
    status: SystemStatus.ACTIVE,
  },
];