import { PrismaClient } from '@prisma/client';
import { seedPrograms } from '../src/server/db/seed-data/programs';
import { seedCourses } from '../src/server/db/seed-data/courseData';
import { seedHolidays } from '../src/server/db/seed-data/holidays';
import { seedPermissions } from '../src/server/db/seed-data/permissions';
import { seedSubjects } from './seed/subjects';
import { seedTopics } from './seed/topics';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  try {
    console.log('Seeding permissions...');
    await seedPermissions(prisma);

    console.log('Seeding programs...');
    await seedPrograms(prisma);

    console.log('Seeding courses...');
    await seedCourses(prisma);

    console.log('Seeding subjects...');
    await seedSubjects(prisma);

    console.log('Seeding subject topics...');
    await seedTopics(prisma);

    console.log('Seeding holidays...');
    await seedHolidays(prisma);

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 