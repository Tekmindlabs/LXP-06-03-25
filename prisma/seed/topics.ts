import { PrismaClient, SystemStatus } from '@prisma/client';
import { SubjectNodeType, CompetencyLevel } from '~/server/api/constants';

export async function seedTopics(prisma: PrismaClient) {
  console.log('Seeding subject topics...');

  try {
    // Get subjects to associate topics with
    const subjects = await prisma.subject.findMany({
      take: 5,
      orderBy: { createdAt: 'asc' },
    });

    if (subjects.length === 0) {
      console.log('No subjects found. Skipping topic seeding.');
      return;
    }

    // Math topics
    if (subjects[0]) {
      const mathSubjectId = subjects[0].id;
      
      // Create chapters - using raw SQL to avoid Prisma client model issues
      await prisma.$executeRaw`
        INSERT INTO "subject_topics" (
          "id", "code", "title", "description", "nodeType", "orderIndex", 
          "estimatedMinutes", "competencyLevel", "keywords", "subjectId", "status", 
          "createdAt", "updatedAt"
        ) 
        VALUES (
          gen_random_uuid(), 'CH1', 'Algebra', 'Introduction to algebraic concepts and operations', 
          'CHAPTER'::\"SubjectNodeType\", 0, 300, 'BASIC'::\"CompetencyLevel\", 
          ARRAY['algebra', 'equations', 'variables'], ${mathSubjectId}, 'ACTIVE'::\"SystemStatus\",
          NOW(), NOW()
        )
        ON CONFLICT ("subjectId", "code") DO UPDATE 
        SET "title" = 'Algebra'
      `;
      
      // Get the ID of the inserted/updated chapter
      const algebraChapterResult = await prisma.$queryRaw`
        SELECT id FROM "subject_topics" 
        WHERE "subjectId" = ${mathSubjectId} AND "code" = 'CH1'
      `;
      const algebraChapterId = (algebraChapterResult as any[])[0].id;
      
      await prisma.$executeRaw`
        INSERT INTO "subject_topics" (
          "id", "code", "title", "description", "nodeType", "orderIndex", 
          "estimatedMinutes", "competencyLevel", "keywords", "subjectId", "status", 
          "createdAt", "updatedAt"
        ) 
        VALUES (
          gen_random_uuid(), 'CH2', 'Geometry', 'Study of shapes, sizes, and properties of space', 
          'CHAPTER'::\"SubjectNodeType\", 1, 300, 'BASIC'::\"CompetencyLevel\", 
          ARRAY['geometry', 'shapes', 'angles'], ${mathSubjectId}, 'ACTIVE'::\"SystemStatus\",
          NOW(), NOW()
        )
        ON CONFLICT ("subjectId", "code") DO UPDATE 
        SET "title" = 'Geometry'
      `;
      
      // Get the ID of the inserted/updated chapter
      const geometryChapterResult = await prisma.$queryRaw`
        SELECT id FROM "subject_topics" 
        WHERE "subjectId" = ${mathSubjectId} AND "code" = 'CH2'
      `;
      const geometryChapterId = (geometryChapterResult as any[])[0].id;

      // Create topics under Algebra chapter
      await prisma.$executeRaw`
        INSERT INTO "subject_topics" (
          "id", "code", "title", "description", "nodeType", "orderIndex", 
          "estimatedMinutes", "competencyLevel", "keywords", "subjectId", "parentTopicId", "status", 
          "createdAt", "updatedAt"
        ) 
        VALUES (
          gen_random_uuid(), 'CH1.T1', 'Linear Equations', 'Solving equations of the form ax + b = c', 
          'TOPIC'::\"SubjectNodeType\", 0, 120, 'BASIC'::\"CompetencyLevel\", 
          ARRAY['linear equations', 'solving equations'], ${mathSubjectId}, ${algebraChapterId}, 'ACTIVE'::\"SystemStatus\",
          NOW(), NOW()
        )
        ON CONFLICT ("subjectId", "code") DO UPDATE 
        SET "title" = 'Linear Equations'
      `;

      await prisma.$executeRaw`
        INSERT INTO "subject_topics" (
          "id", "code", "title", "description", "nodeType", "orderIndex", 
          "estimatedMinutes", "competencyLevel", "keywords", "subjectId", "parentTopicId", "status", 
          "createdAt", "updatedAt"
        ) 
        VALUES (
          gen_random_uuid(), 'CH1.T2', 'Quadratic Equations', 'Solving equations of the form ax² + bx + c = 0', 
          'TOPIC'::\"SubjectNodeType\", 1, 180, 'INTERMEDIATE'::\"CompetencyLevel\", 
          ARRAY['quadratic equations', 'polynomials'], ${mathSubjectId}, ${algebraChapterId}, 'ACTIVE'::\"SystemStatus\",
          NOW(), NOW()
        )
        ON CONFLICT ("subjectId", "code") DO UPDATE 
        SET "title" = 'Quadratic Equations'
      `;

      // Create topics under Geometry chapter
      await prisma.$executeRaw`
        INSERT INTO "subject_topics" (
          "id", "code", "title", "description", "nodeType", "orderIndex", 
          "estimatedMinutes", "competencyLevel", "keywords", "subjectId", "parentTopicId", "status", 
          "createdAt", "updatedAt"
        ) 
        VALUES (
          gen_random_uuid(), 'CH2.T1', 'Triangles', 'Properties and theorems related to triangles', 
          'TOPIC'::\"SubjectNodeType\", 0, 150, 'BASIC'::\"CompetencyLevel\", 
          ARRAY['triangles', 'angles', 'sides'], ${mathSubjectId}, ${geometryChapterId}, 'ACTIVE'::\"SystemStatus\",
          NOW(), NOW()
        )
        ON CONFLICT ("subjectId", "code") DO UPDATE 
        SET "title" = 'Triangles'
      `;

      await prisma.$executeRaw`
        INSERT INTO "subject_topics" (
          "id", "code", "title", "description", "nodeType", "orderIndex", 
          "estimatedMinutes", "competencyLevel", "keywords", "subjectId", "parentTopicId", "status", 
          "createdAt", "updatedAt"
        ) 
        VALUES (
          gen_random_uuid(), 'CH2.T2', 'Circles', 'Properties and theorems related to circles', 
          'TOPIC'::\"SubjectNodeType\", 1, 150, 'BASIC'::\"CompetencyLevel\", 
          ARRAY['circles', 'radius', 'diameter'], ${mathSubjectId}, ${geometryChapterId}, 'ACTIVE'::\"SystemStatus\",
          NOW(), NOW()
        )
        ON CONFLICT ("subjectId", "code") DO UPDATE 
        SET "title" = 'Circles'
      `;
    }

    // Computer Science topics
    if (subjects.length >= 3) {
      const csSubjectId = subjects[2].id;
      
      // Create chapters
      await prisma.$executeRaw`
        INSERT INTO "subject_topics" (
          "id", "code", "title", "description", "nodeType", "orderIndex", 
          "estimatedMinutes", "competencyLevel", "keywords", "subjectId", "status", 
          "createdAt", "updatedAt"
        ) 
        VALUES (
          gen_random_uuid(), 'CH1', 'Programming Fundamentals', 'Introduction to programming concepts and practices', 
          'CHAPTER'::\"SubjectNodeType\", 0, 360, 'BASIC'::\"CompetencyLevel\", 
          ARRAY['programming', 'coding', 'algorithms'], ${csSubjectId}, 'ACTIVE'::\"SystemStatus\",
          NOW(), NOW()
        )
        ON CONFLICT ("subjectId", "code") DO UPDATE 
        SET "title" = 'Programming Fundamentals'
      `;
      
      const programmingChapterResult = await prisma.$queryRaw`
        SELECT id FROM "subject_topics" 
        WHERE "subjectId" = ${csSubjectId} AND "code" = 'CH1'
      `;
      const programmingChapterId = (programmingChapterResult as any[])[0].id;

      await prisma.$executeRaw`
        INSERT INTO "subject_topics" (
          "id", "code", "title", "description", "nodeType", "orderIndex", 
          "estimatedMinutes", "competencyLevel", "keywords", "subjectId", "status", 
          "createdAt", "updatedAt"
        ) 
        VALUES (
          gen_random_uuid(), 'CH2', 'Data Structures', 'Study of organizing and storing data efficiently', 
          'CHAPTER'::\"SubjectNodeType\", 1, 360, 'INTERMEDIATE'::\"CompetencyLevel\", 
          ARRAY['data structures', 'arrays', 'linked lists'], ${csSubjectId}, 'ACTIVE'::\"SystemStatus\",
          NOW(), NOW()
        )
        ON CONFLICT ("subjectId", "code") DO UPDATE 
        SET "title" = 'Data Structures'
      `;

      // Create topics under Programming Fundamentals chapter
      await prisma.$executeRaw`
        INSERT INTO "subject_topics" (
          "id", "code", "title", "description", "nodeType", "orderIndex", 
          "estimatedMinutes", "competencyLevel", "keywords", "subjectId", "parentTopicId", "status", 
          "createdAt", "updatedAt"
        ) 
        VALUES (
          gen_random_uuid(), 'CH1.T1', 'Variables and Data Types', 'Understanding variables and different data types in programming', 
          'TOPIC'::\"SubjectNodeType\", 0, 90, 'BASIC'::\"CompetencyLevel\", 
          ARRAY['variables', 'data types', 'programming basics'], ${csSubjectId}, ${programmingChapterId}, 'ACTIVE'::\"SystemStatus\",
          NOW(), NOW()
        )
        ON CONFLICT ("subjectId", "code") DO UPDATE 
        SET "title" = 'Variables and Data Types'
      `;
      
      const variablesTopicResult = await prisma.$queryRaw`
        SELECT id FROM "subject_topics" 
        WHERE "subjectId" = ${csSubjectId} AND "code" = 'CH1.T1'
      `;
      const variablesTopicId = (variablesTopicResult as any[])[0].id;

      // Create subtopics
      await prisma.$executeRaw`
        INSERT INTO "subject_topics" (
          "id", "code", "title", "description", "nodeType", "orderIndex", 
          "estimatedMinutes", "competencyLevel", "keywords", "subjectId", "parentTopicId", "status", 
          "createdAt", "updatedAt"
        ) 
        VALUES (
          gen_random_uuid(), 'CH1.T1.S1', 'Primitive Data Types', 'Understanding primitive data types like integers, floats, and booleans', 
          'SUBTOPIC'::\"SubjectNodeType\", 0, 45, 'BASIC'::\"CompetencyLevel\", 
          ARRAY['primitive types', 'integers', 'floats'], ${csSubjectId}, ${variablesTopicId}, 'ACTIVE'::\"SystemStatus\",
          NOW(), NOW()
        )
        ON CONFLICT ("subjectId", "code") DO UPDATE 
        SET "title" = 'Primitive Data Types'
      `;

      await prisma.$executeRaw`
        INSERT INTO "subject_topics" (
          "id", "code", "title", "description", "nodeType", "orderIndex", 
          "estimatedMinutes", "competencyLevel", "keywords", "subjectId", "parentTopicId", "status", 
          "createdAt", "updatedAt"
        ) 
        VALUES (
          gen_random_uuid(), 'CH1.T1.S2', 'Complex Data Types', 'Understanding complex data types like arrays and objects', 
          'SUBTOPIC'::\"SubjectNodeType\", 1, 45, 'BASIC'::\"CompetencyLevel\", 
          ARRAY['complex types', 'arrays', 'objects'], ${csSubjectId}, ${variablesTopicId}, 'ACTIVE'::\"SystemStatus\",
          NOW(), NOW()
        )
        ON CONFLICT ("subjectId", "code") DO UPDATE 
        SET "title" = 'Complex Data Types'
      `;
    }

    console.log('Subject topics seeded successfully');
  } catch (error) {
    console.error('Error seeding subject topics:', error);
  }
}

// Helper function to generate UUID
function generateUUID() {
  // Use PostgreSQL's built-in function instead of JavaScript implementation
  return 'gen_random_uuid()';
}

// Helper function to get topic ID by subject ID and code
async function getTopicId(prisma: PrismaClient, subjectId: string, code: string): Promise<string> {
  try {
    const result = await prisma.$queryRaw`
      SELECT id FROM "subject_topics" 
      WHERE "subjectId" = ${subjectId} AND "code" = ${code}
    `;
    
    if (Array.isArray(result) && result.length > 0) {
      return (result[0] as any).id;
    }
    
    throw new Error(`Topic not found: ${code} in subject ${subjectId}`);
  } catch (error) {
    console.error(`Error getting topic ID: ${error}`);
    throw error;
  }
} 