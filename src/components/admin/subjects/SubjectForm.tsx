"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { SystemStatus } from "@/server/api/constants";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/feedback/toast";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";

const subjectSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  credits: z.number().min(0),
  courseId: z.string().min(1, "Course is required"),
  status: z.nativeEnum(SystemStatus).optional(),
  syllabus: z.record(z.any()).optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  initialData?: Partial<SubjectFormData>;
  subjectId?: string;
}

export function SubjectForm({
  initialData,
  subjectId,
}: SubjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!subjectId;

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      credits: initialData?.credits || 0,
      courseId: initialData?.courseId || "",
      status: initialData?.status || SystemStatus.ACTIVE,
      syllabus: initialData?.syllabus || {},
    },
  });

  const { data: coursesData } = api.course.list.useQuery({
    status: SystemStatus.ACTIVE,
  });

  const createSubject = api.subject.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subject created successfully",
        variant: "success",
      });
      router.push("/admin/system/subjects");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "error",
      });
    },
  });

  const updateSubject = api.subject.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subject updated successfully",
        variant: "success",
      });
      router.push("/admin/system/subjects");
    },
    onError: (error) => {
      console.error("Error updating subject:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update subject",
        variant: "error",
      });
    },
  });

  const handleSubmit = async (data: SubjectFormData) => {
    try {
      if (isEditing && subjectId) {
        updateSubject.mutate({
          id: subjectId,
          data: {
            name: data.name,
            status: data.status,
            credits: data.credits,
            syllabus: data.syllabus
          }
        });
      } else {
        createSubject.mutate({
          code: data.code,
          name: data.name,
          credits: data.credits,
          courseId: data.courseId,
          status: data.status,
          syllabus: data.syllabus
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "error",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="credits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credits</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {coursesData?.courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createSubject.isLoading || updateSubject.isLoading}>
          {isEditing ? "Update" : "Create"} Subject
        </Button>
      </form>
    </Form>
  );
} 