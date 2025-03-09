import { PrismaClient, SystemStatus, HolidayType } from "@prisma/client";

export interface HolidaySeedData {
  name: string;
  description: string;
  date: Date;
  endDate?: Date;
  type: HolidayType;
  institutionCode: string;
  status: SystemStatus;
}

export const holidaysSeedData: HolidaySeedData[] = [
  // National holidays
  {
    name: "New Year's Day",
    description: "First day of the year in the Gregorian calendar",
    date: new Date("2023-01-01"),
    type: HolidayType.NATIONAL,
    institutionCode: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
  },
  {
    name: "Independence Day",
    description: "Celebration of national independence",
    date: new Date("2023-07-04"),
    type: HolidayType.NATIONAL,
    institutionCode: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
  },
  {
    name: "Labor Day",
    description: "Celebration of workers' contributions",
    date: new Date("2023-09-04"),
    type: HolidayType.NATIONAL,
    institutionCode: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
  },
  {
    name: "Thanksgiving Day",
    description: "Day of giving thanks for the blessings of the harvest",
    date: new Date("2023-11-23"),
    type: HolidayType.NATIONAL,
    institutionCode: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
  },
  
  // Academic holidays
  {
    name: "Spring Break",
    description: "Week-long break during the spring semester",
    date: new Date("2023-03-13"),
    endDate: new Date("2023-03-17"),
    type: HolidayType.ADMINISTRATIVE,
    institutionCode: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
  },
  {
    name: "Summer Break",
    description: "Break between spring and fall semesters",
    date: new Date("2023-05-15"),
    endDate: new Date("2023-08-20"),
    type: HolidayType.ADMINISTRATIVE,
    institutionCode: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
  },
  {
    name: "Winter Break",
    description: "Break between fall and spring semesters",
    date: new Date("2023-12-18"),
    endDate: new Date("2024-01-07"),
    type: HolidayType.ADMINISTRATIVE,
    institutionCode: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
  },
  
  // Institutional holidays
  {
    name: "Founder's Day",
    description: "Celebration of the institution's founding",
    date: new Date("2023-04-15"),
    type: HolidayType.INSTITUTIONAL,
    institutionCode: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
  },
  {
    name: "Commencement",
    description: "Graduation ceremony",
    date: new Date("2023-05-12"),
    type: HolidayType.INSTITUTIONAL,
    institutionCode: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
  },
  
  // Religious holidays
  {
    name: "Christmas",
    description: "Christian holiday celebrating the birth of Jesus",
    date: new Date("2023-12-25"),
    type: HolidayType.RELIGIOUS,
    institutionCode: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
  },
  {
    name: "Easter",
    description: "Christian holiday celebrating the resurrection of Jesus",
    date: new Date("2023-04-09"),
    type: HolidayType.RELIGIOUS,
    institutionCode: "AIVY-UNIV",
    status: SystemStatus.ACTIVE,
  },
];

export async function seedHolidays(prisma: PrismaClient) {
  console.log("Seeding holidays...");
  
  // Get the system admin user for creator reference
  const adminUser = await prisma.user.findFirst({
    where: {
      userType: "SYSTEM_ADMIN",
      status: SystemStatus.ACTIVE,
    },
  });
  
  if (!adminUser) {
    console.error("No admin user found for holiday creation");
    return;
  }
  
  // Get all institutions
  const institutions = await prisma.institution.findMany({
    where: {
      status: SystemStatus.ACTIVE,
    },
  });
  
  // Create holidays for each institution
  for (const institution of institutions) {
    const institutionHolidays = holidaysSeedData.filter(
      (holiday) => holiday.institutionCode === institution.code
    );
    
    for (const holidayData of institutionHolidays) {
      // Check if holiday already exists
      const existingHoliday = await prisma.holiday.findFirst({
        where: {
          name: holidayData.name,
          startDate: holidayData.date,
          type: holidayData.type,
        },
      });
      
      if (!existingHoliday) {
        await prisma.holiday.create({
          data: {
            name: holidayData.name,
            description: holidayData.description,
            startDate: holidayData.date,
            endDate: holidayData.endDate || holidayData.date, // Use date as endDate if not provided
            type: holidayData.type,
            status: holidayData.status,
            createdBy: adminUser.id, // Add the required creator field
            affectsAll: true,
          },
        });
      }
    }
  }
  
  console.log("Holidays seeded successfully");
} 