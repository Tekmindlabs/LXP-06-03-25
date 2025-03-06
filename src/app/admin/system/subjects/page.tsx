import { SubjectList } from "~/components/admin/subjects/SubjectList";
import { PageHeader } from "~/components/ui/atoms/page-header";

export default function SubjectsPage() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Subject Management"
        description="Manage your institution's subjects"
      />
      <SubjectList />
    </div>
  );
} 