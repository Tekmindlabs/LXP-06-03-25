import { CourseList } from "~/components/admin/courses/CourseList";
import { PageHeader } from "~/components/ui/atoms/page-header";

export default function CoursesPage() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Course Management"
        description="Manage your institution's courses"
      />
      <CourseList />
    </div>
  );
} 