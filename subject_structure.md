# Subject Structure Documentation

## Overview

This document explains the revised subject entity structure for our educational platform. The structure is designed to efficiently organize educational content while supporting thousands of subjects and topics.

## Entity Structure

### Subject (Top Level)

The `Subject` entity represents a high-level educational subject associated with a course. It serves as the container for all topic-level content.

**Key Attributes:**
- `id`: Unique identifier
- `code`: Unique subject code (e.g., "MATH101")
- `name`: Subject name (e.g., "Introduction to Calculus")
- `description`: Optional detailed description
- `credits`: Credit value for the subject
- `status`: Current status (ACTIVE, INACTIVE, etc.)
- `courseId`: Reference to the associated course
- `syllabus`: High-level syllabus structure (JSON)

**Relationships:**
- `course`: One-to-many relationship with Course
- `topics`: One-to-many relationship with SubjectTopic
- `activities`: One-to-many relationship with Activity (direct association)
- `assessments`: One-to-many relationship with Assessment (direct association)
- `teacherQualifications`: One-to-many relationship with TeacherSubjectQualification

### SubjectTopic

The `SubjectTopic` entity represents chapters, topics, and subtopics within a subject. It contains detailed educational metadata and supports hierarchical organization.

**Key Attributes:**
- `id`: Unique identifier
- `code`: Topic code (unique within a subject)
- `title`: Topic title
- `description`: Optional detailed description
- `context`: Educational context information
- `learningOutcomes`: Structured learning outcomes (JSON)
- `nodeType`: Type of node (CHAPTER, TOPIC, SUBTOPIC)
- `orderIndex`: Position within the subject or parent topic
- `estimatedMinutes`: Estimated learning time
- `competencyLevel`: Required competency level
- `keywords`: Searchable keywords/tags
- `status`: Current status
- `subjectId`: Reference to the parent subject
- `parentTopicId`: Optional reference to parent topic (for subtopics)

**Relationships:**
- `subject`: Many-to-one relationship with Subject
- `parentTopic`: Self-referential relationship for hierarchy
- `childTopics`: Self-referential relationship for hierarchy
- `topicActivities`: One-to-many relationship with TopicActivity
- `topicAssessments`: One-to-many relationship with TopicAssessment

### TopicActivity (Junction)

The `TopicActivity` entity creates a many-to-many relationship between topics and activities, allowing activities to be associated with specific topics.

**Key Attributes:**
- `id`: Unique identifier
- `topicId`: Reference to the associated topic
- `activityId`: Reference to the associated activity
- `orderIndex`: Position of the activity within the topic

**Relationships:**
- `topic`: Many-to-one relationship with SubjectTopic
- `activity`: Many-to-one relationship with Activity

### TopicAssessment (Junction)

The `TopicAssessment` entity creates a many-to-many relationship between topics and assessments, allowing assessments to be associated with specific topics.

**Key Attributes:**
- `id`: Unique identifier
- `topicId`: Reference to the associated topic
- `assessmentId`: Reference to the associated assessment
- `orderIndex`: Position of the assessment within the topic

**Relationships:**
- `topic`: Many-to-one relationship with SubjectTopic
- `assessment`: Many-to-one relationship with Assessment

## Hierarchical Structure

The subject structure supports a hierarchical organization of educational content:

1. **Subject**: Top-level container (e.g., "Mathematics")
2. **Chapters**: Major divisions within a subject (nodeType = CHAPTER)
3. **Topics**: Specific areas of study within chapters (nodeType = TOPIC)
4. **Subtopics**: Detailed components within topics (nodeType = SUBTOPIC)

This hierarchy is implemented through:
- The `nodeType` field in SubjectTopic
- The self-referential relationship between topics (`parentTopic` and `childTopics`)

## Content Organization

The structure supports flexible content organization through:

1. **Explicit Ordering**: `orderIndex` fields in SubjectTopic, TopicActivity, and TopicAssessment
2. **Rich Metadata**: Context, learning outcomes, competency levels, and keywords
3. **Hierarchical Relationships**: Parent-child relationships between topics

## Scalability Considerations

The structure is designed to scale efficiently for thousands of subjects and topics:

1. **Strategic Indexes**: Indexes on frequently queried fields
2. **Separation of Concerns**: Clear separation between subjects and topics
3. **Efficient Relationships**: Junction tables for many-to-many relationships
4. **Optimized Queries**: Support for efficient hierarchical queries

## Example Usage Scenarios

### Scenario 1: Creating a New Subject with Topics

1. Create a Subject record
2. Create Chapter-level SubjectTopic records linked to the Subject
3. Create Topic-level SubjectTopic records linked to their parent Chapters
4. Create Subtopic-level SubjectTopic records linked to their parent Topics

### Scenario 2: Associating Activities with Topics

1. Create an Activity record
2. Create TopicActivity records linking the Activity to relevant SubjectTopics
3. Set orderIndex to control the sequence of activities within each topic

### Scenario 3: Retrieving a Subject's Content Structure

1. Fetch the Subject record
2. Fetch all SubjectTopic records for the subject
3. Organize topics into a hierarchical structure based on parentTopicId
4. For each topic, fetch associated activities and assessments through junction tables

## Database Schema (Prisma)

```prisma
// Subject represents a course subject (high level)
model Subject {
  id                    String                        @id @default(cuid())
  code                  String                        @unique
  name                  String
  description           String?
  credits               Float                         @default(1.0)
  status                SystemStatus                  @default(ACTIVE)
  courseId              String
  syllabus              Json?                         // High-level syllabus structure
  createdAt             DateTime                      @default(now())
  updatedAt             DateTime                      @updatedAt
  
  // Relationships
  topics                SubjectTopic[]                // Topics within this subject
  activities            Activity[]                    // Activities directly tied to subject
  assessments           Assessment[]                  // Assessments directly tied to subject
  course                Course                        @relation(fields: [courseId], references: [id])
  teacherQualifications TeacherSubjectQualification[]

  @@index([courseId, status])
  @@map("subjects")
}

// Topics within subjects
model SubjectTopic {
  id                  String                @id @default(cuid())
  code                String                // Topic code (unique within subject)
  title               String                // Topic title
  description         String?               // Topic description
  context             String?               // Educational context
  learningOutcomes    Json?                 // Structured learning outcomes
  nodeType            SubjectNodeType       // CHAPTER, TOPIC, or SUBTOPIC
  orderIndex          Int                   // For ordering topics within a subject
  estimatedMinutes    Int?                  // Estimated learning time
  competencyLevel     CompetencyLevel?      // Required competency level
  keywords            String[]              // Searchable keywords
  status              SystemStatus          @default(ACTIVE)
  
  // Foreign keys
  subjectId           String                // Parent subject
  parentTopicId       String?               // Optional parent topic (for subtopics)
  
  // Timestamps
  createdAt           DateTime              @default(now())
  updatedAt           DateTime              @updatedAt
  
  // Relationships
  subject             Subject               @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  parentTopic         SubjectTopic?         @relation("TopicHierarchy", fields: [parentTopicId], references: [id])
  childTopics         SubjectTopic[]        @relation("TopicHierarchy")
  topicActivities     TopicActivity[]       // Activities linked to this topic
  topicAssessments    TopicAssessment[]     // Assessments linked to this topic

  @@unique([subjectId, code])
  @@index([subjectId, nodeType])
  @@index([parentTopicId])
  @@index([status])
  @@map("subject_topics")
}

// Junction table for topic-activity relationship
model TopicActivity {
  id                  String                @id @default(cuid())
  topicId             String
  activityId          String
  orderIndex          Int                   // For ordering activities within a topic
  createdAt           DateTime              @default(now())
  updatedAt           DateTime              @updatedAt
  
  // Relationships
  topic               SubjectTopic          @relation(fields: [topicId], references: [id], onDelete: Cascade)
  activity            Activity              @relation(fields: [activityId], references: [id], onDelete: Cascade)

  @@unique([topicId, activityId])
  @@index([activityId])
  @@map("topic_activities")
}

// Junction table for topic-assessment relationship
model TopicAssessment {
  id                  String                @id @default(cuid())
  topicId             String
  assessmentId        String
  orderIndex          Int                   // For ordering assessments within a topic
  createdAt           DateTime              @default(now())
  updatedAt           DateTime              @updatedAt
  
  // Relationships
  topic               SubjectTopic          @relation(fields: [topicId], references: [id], onDelete: Cascade)
  assessment          Assessment            @relation(fields: [assessmentId], references: [id], onDelete: Cascade)

  @@unique([topicId, assessmentId])
  @@index([assessmentId])
  @@map("topic_assessments")
}
``` 