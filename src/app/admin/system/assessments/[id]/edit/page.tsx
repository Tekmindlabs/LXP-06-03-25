import { PageLayout } from '@/components/layout/page-layout';
import { AssessmentTemplateForm } from '@/components/assessment/template/assessment-template-form';

interface EditAssessmentPageProps {
  params: {
    id: string;
  };
}

export default function EditAssessmentPage({ params }: EditAssessmentPageProps) {
  return (
    <PageLayout
      title="Edit Assessment Template"
      description="Edit assessment template details"
      breadcrumbs={[
        { label: 'Academic', href: '/admin/academic' },
        { label: 'Assessment Templates', href: '/admin/academic/assessments' },
        { label: 'Edit Template', href: `/admin/academic/assessments/${params.id}/edit` },
      ]}
    >
      <AssessmentTemplateForm templateId={params.id} />
    </PageLayout>
  );
} 