"use client";

import { useParams } from "next/navigation";
import { SubjectForm } from "~/components/admin/subjects/SubjectForm";
import { Card } from "~/components/ui/atoms/card";
import { PageHeader } from "~/components/ui/atoms/page-header";
import { api } from "~/utils/api";

export default function EditSubjectPage() {
  const params = useParams();
  const subjectId = params.id as string;

  const { data: subject, isLoading } = api.subject.getById.useQuery({ id: subjectId });

  if (isLoading) return <div>Loading...</div>;
  if (!subject) return <div>Subject not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Subject"
        description="Modify subject details and configuration"
      />
      <Card className="p-6">
        <SubjectForm initialData={subject} />
      </Card>
    </div>
  );
} 