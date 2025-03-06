import { useState } from "react";
import { Modal } from "@/components/ui/feedback/modal";
import { CourseForm } from "./CourseForm";
import PrerequisiteConfig from "./PrerequisiteConfig";
import { 
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/navigation/tabs";
import { api } from "@/utils/api";
import { toast } from "@/components/ui/feedback/toast";
import { SystemStatus } from "@prisma/client";
import type { JsonValue } from "@prisma/client/runtime/library";

interface CourseData {
  code: string;
  name: string;
  description?: string;
  level: number;
  credits: number;
  programId: string;
  status: SystemStatus;
  objectives: string[];
  resources: Array<{
    type: string;
    requirement: string;
  }>;
  syllabus: Record<string, unknown>;
}

type CourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
};

export const CourseModal = ({ isOpen, onClose, courseId }: CourseModalProps) => {
  const [activeTab, setActiveTab] = useState("details");
  
  const utils = api.useContext();
  const { data: courseData } = api.course.get.useQuery(
    { id: courseId! },
    { enabled: !!courseId }
  );

  const createMutation = api.course.create.useMutation({
    onSuccess: () => {
      utils.course.list.invalidate();
      toast({
        title: "Success",
        description: "Course created successfully",
        variant: "success"
      });
      onClose();
    },
  });

  const updateMutation = api.course.update.useMutation({
    onSuccess: () => {
      utils.course.list.invalidate();
      toast({
        title: "Success",
        description: "Course updated successfully",
        variant: "success"
      });
      onClose();
    },
  });

  const handleSubmit = async (data: CourseData) => {
    if (courseId) {
      await updateMutation.mutateAsync({ id: courseId, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  // Transform API response to match CourseForm's expected format
  const formattedCourseData: CourseData | undefined = courseData?.course ? {
    code: courseData.course.code,
    name: courseData.course.name,
    description: courseData.course.description || '',
    level: courseData.course.level,
    credits: courseData.course.credits,
    programId: courseData.course.program.id,
    status: courseData.course.status as SystemStatus,
    objectives: (courseData.course.settings as Record<string, unknown>)?.objectives as string[] || [],
    resources: (courseData.course.settings as Record<string, unknown>)?.resources as Array<{ type: string; requirement: string }> || [],
    syllabus: courseData.course.syllabus as Record<string, unknown> || {}
  } : undefined;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          {courseId ? "Edit Course" : "Add Course"}
        </h2>

        {courseId ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList id="course-tabs" className="w-full">
              <TabsTrigger value="details">Course Details</TabsTrigger>
              <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <CourseForm
                initialData={formattedCourseData}
                onSubmit={handleSubmit}
                isLoading={updateMutation.isLoading}
              />
            </TabsContent>
            <TabsContent value="prerequisites" className="mt-4">
              <PrerequisiteConfig
                courseId={courseId}
                initialPrerequisites={courseData?.course.prerequisites?.map(p => p.prerequisiteId) || []}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <CourseForm
            onSubmit={handleSubmit}
            isLoading={createMutation.isLoading}
          />
        )}
      </div>
    </Modal>
  );
}; 
