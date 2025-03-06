import { PageLayout } from '@/components/layout/page-layout';
import { AssessmentTemplateDetail } from '@/components/assessment/template/assessment-template-detail';

interface AssessmentDetailPageProps {
  params: {
    id: string;
  };
}

export default function AssessmentDetailPage({ params }: AssessmentDetailPageProps) {
  return (
    <PageLayout
      title="Assessment Template Details"
      description="View and manage assessment template details"
      breadcrumbs={[
        { label: 'Academic', href: '/admin/academic' },
        { label: 'Assessment Templates', href: '/admin/academic/assessments' },
        { label: 'Template Details', href: `/admin/academic/assessments/${params.id}` },
      ]}
    >
      <AssessmentTemplateDetail templateId={params.id} />
    </PageLayout>
  );
} 