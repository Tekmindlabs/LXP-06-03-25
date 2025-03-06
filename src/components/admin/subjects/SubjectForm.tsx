"use client";

import { useForm } from "react-hook-form";
import { Input } from "~/components/ui/atoms/input";
import { Button } from "~/components/ui/atoms/button";
import { api } from "~/trpc/react";
import { SystemStatus } from "@prisma/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const subjectSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  credits: z.number().min(0),
  courseId: z.string().min(1, "Course is required"),
  status: z.nativeEnum(SystemStatus),
  syllabus: z.record(z.any()).optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  initialData?: Partial<SubjectFormData>;
  onSubmit: (data: SubjectFormData) => Promise<void>;
  isLoading?: boolean;
}

export function SubjectForm({
  initialData,
  onSubmit,
  isLoading = false,
}: SubjectFormProps) {
  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      credits: initialData?.credits || 0,
      courseId: initialData?.courseId || "",
      status: initialData?.status || SystemStatus.ACTIVE,
      syllabus: initialData?.syllabus,
    },
  });

  const { data: coursesData } = api.course.getAll.useQuery({
    status: SystemStatus.ACTIVE,
  });

  const handleSubmit = async (data: SubjectFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Code"
          {...form.register("code")}
          error={form.formState.errors.code?.message}
        />
        <Input
          label="Name"
          {...form.register("name")}
          error={form.formState.errors.name?.message}
        />
      </div>

      <Input
        type="number"
        label="Credits"
        {...form.register("credits", { valueAsNumber: true })}
        error={form.formState.errors.credits?.message}
      />

      <select {...form.register("courseId")}>
        <option value="">Select a course</option>
        {coursesData?.courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
} 