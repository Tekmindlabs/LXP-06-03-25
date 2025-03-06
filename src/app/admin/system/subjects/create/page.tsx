import { SubjectForm } from "~/components/admin/subjects/SubjectForm";
import { Card } from "~/components/ui/atoms/card";
import { PageHeader } from "~/components/ui/atoms/page-header";

export default function CreateSubjectPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Subject"
        description="Add a new subject to your course"
      />
      <Card className="p-6">
        <SubjectForm />
      </Card>
    </div>
  );
} 