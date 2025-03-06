import { PageLayout } from '@/components/layout/page-layout';
import { AssessmentTemplateList } from '@/components/assessment/template/assessment-template-list';

export default function AssessmentsPage() {
  return (
    <PageLayout
      title="Assessment Templates"
      description="Manage assessment templates for your institution"
      breadcrumbs={[
        { label: 'Academic', href: '/admin/academic' },
        { label: 'Assessment Templates', href: '/admin/academic/assessments' },
      ]}
    >
      <AssessmentTemplateList />
    </PageLayout>
  );
} 