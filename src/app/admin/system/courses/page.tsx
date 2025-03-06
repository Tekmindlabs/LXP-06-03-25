"use client";

import { type FC } from 'react';
import { useRouter } from "next/navigation";
import { CourseList } from "~/components/admin/courses/CourseList";
import { Button } from "~/components/ui";
import { PageHeader } from "~/components/ui/atoms/page-header";

const CoursesPage: FC = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Courses"
        description="Manage your courses here"
      />
      
      <div className="container mx-auto">
        <CourseList />
      </div>
    </div>
  );
};

export default CoursesPage; 