"use client";

import { useParams } from "next/navigation";
import { CourseForm } from "@/components/admin/courses/CourseForm";
import { Card } from "@/components/ui/data-display/card";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/trpc/react";
import { LoadingSpinner } from "@/components/ui/loading";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params?.id as string;

  const { data, isLoading } = api.course.getById.useQuery({ id: courseId });

  if (isLoading) return <LoadingSpinner />;
  if (!data?.course) return <div>Course not found</div>;

  // Transform the data to match the form's expected structure
  const courseData = {
    code: data.course.code,
    name: data.course.name,
    description: data.course.description || '',
    level: data.course.level,
    credits: data.course.credits,
    programId: data.course.programId,
    status: data.course.status,
    objectives: data.course.objectives || [],
    resources: data.course.resources || [],
    syllabus: data.course.syllabus || {}
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Course"
        description="Modify course details and configuration"
      />
      <Card className="p-6">
        <CourseForm 
          initialData={courseData} 
          courseId={courseId}
        />
      </Card>
    </div>
  );
} 