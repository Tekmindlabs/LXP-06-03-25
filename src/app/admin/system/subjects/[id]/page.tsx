"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/atoms/button";
import { Card } from "~/components/ui/atoms/card";
import { PageHeader } from "~/components/ui/atoms/page-header";
import { api } from "~/utils/api";

export default function ViewSubjectPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;

  const { data: subject, isLoading } = api.subject.getById.useQuery({ id: subjectId });

  if (isLoading) return <div>Loading...</div>;
  if (!subject) return <div>Subject not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title={subject.name}
          description={`Subject Code: ${subject.code}`}
        />
        <Button onClick={() => router.push(`/admin/system/subjects/${subjectId}/edit`)}>
          Edit Subject
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Subject Details</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Credits</dt>
              <dd className="mt-1">{subject.credits}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Course</dt>
              <dd className="mt-1">{subject.course.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">{subject.status}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Content Structure</h3>
          {/* Content Structure component will be added here */}
        </Card>
      </div>
    </div>
  );
} 