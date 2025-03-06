import { SystemStatus } from "@prisma/client";

/**
 * Seed data for campuses
 * Each campus references an institution by its code
 */
export const campusesSeedData = [
  {
    name: "Main Campus",
    code: "AIVY-MAIN",
    institutionCode: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
    address: {
      street: "123 University Avenue",
      city: "Academic City",
      state: "AC",
      postalCode: "12345",
      country: "USA"
    },
    contact: {
      phone: "+1 (555) 123-4567",
      email: "info@aivyuniversity.edu",
      website: "https://main.aivyuniversity.edu"
    }
  },
  {
    name: "Downtown Campus",
    code: "AIVY-DOWNTOWN",
    institutionCode: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
    address: {
      street: "456 Central Street",
      city: "Downtown",
      state: "DT",
      postalCode: "67890",
      country: "USA"
    },
    contact: {
      phone: "+1 (555) 234-5678",
      email: "downtown@aivyuniversity.edu",
      website: "https://downtown.aivyuniversity.edu"
    }
  },
  {
    name: "Tech Campus",
    code: "TECH-MAIN",
    institutionCode: "TECH-INST",
    status: SystemStatus.ACTIVE,
    address: {
      street: "789 Innovation Drive",
      city: "Tech Valley",
      state: "TV",
      postalCode: "54321",
      country: "USA"
    },
    contact: {
      phone: "+1 (555) 345-6789",
      email: "info@techinstitute.edu",
      website: "https://www.techinstitute.edu"
    }
  },
  {
    name: "Global Learning Center",
    code: "GLA-MAIN",
    institutionCode: "GLA-ACAD",
    status: SystemStatus.ACTIVE,
    address: {
      street: "101 International Boulevard",
      city: "Global City",
      state: "GC",
      postalCode: "98765",
      country: "USA"
    },
    contact: {
      phone: "+1 (555) 456-7890",
      email: "info@globallearning.edu",
      website: "https://www.globallearning.edu"
    }
  },
  {
    name: "Arts Campus",
    code: "ARTS-MAIN",
    institutionCode: "ARTS-COLLEGE",
    status: SystemStatus.ACTIVE,
    address: {
      street: "202 Creative Way",
      city: "Artsville",
      state: "AV",
      postalCode: "13579",
      country: "USA"
    },
    contact: {
      phone: "+1 (555) 567-8901",
      email: "arts@artscollege.edu",
      website: "https://www.artscollege.edu"
    }
  },
  {
    name: "Medical Campus",
    code: "MED-MAIN",
    institutionCode: "MED-UNIV",
    status: SystemStatus.ACTIVE,
    address: {
      street: "303 Health Avenue",
      city: "Medville",
      state: "MV",
      postalCode: "24680",
      country: "USA"
    },
    contact: {
      phone: "+1 (555) 678-9012",
      email: "medical@medicalsciences.edu",
      website: "https://www.medicalsciences.edu"
    }
  },
]; 