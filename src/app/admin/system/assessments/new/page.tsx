import { PageLayout } from '@/components/layout/page-layout';
import { AssessmentTemplateForm } from '@/components/assessment/template/assessment-template-form';

export default function NewAssessmentPage() {
  return (
    <PageLayout
      title="Create Assessment Template"
      description="Create a new assessment template"
      breadcrumbs={[
        { label: 'Academic', href: '/admin/academic' },
        { label: 'Assessment Templates', href: '/admin/academic/assessments' },
        { label: 'New Template', href: '/admin/academic/assessments/new' },
      ]}
    >
      <AssessmentTemplateForm />
    </PageLayout>
  );
} 