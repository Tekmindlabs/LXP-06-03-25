"use client";

import { useParams } from "next/navigation";
import { CourseForm } from "~/components/admin/courses/CourseForm";
import { Card } from "~/components/ui/atoms/card";
import { PageHeader } from "~/components/ui/atoms/page-header";
import { api } from "~/utils/api";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  const { data: course, isLoading } = api.course.get.useQuery({ id: courseId });

  if (isLoading) return <div>Loading...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Course"
        description="Modify course details and configuration"
      />
      <Card className="p-6">
        <CourseForm initialData={course} />
      </Card>
    </div>
  );
} 