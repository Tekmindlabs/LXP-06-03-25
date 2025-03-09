'use client';

import { useRouter } from "next/navigation";
import { TopicForm } from "~/components/admin/subjects/TopicForm";
import { Button } from "~/components/ui";
import { ArrowLeft } from "lucide-react";

export default function EditTopicPage({ params }: { params: { id: string; topicId: string } }) {
  const router = useRouter();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/admin/system/subjects/${params.id}`)}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subject
        </Button>
        <h1 className="text-2xl font-bold">Edit Topic</h1>
      </div>
      
      <TopicForm 
        subjectId={params.id} 
        topicId={params.topicId}
      />
    </div>
  );
} 