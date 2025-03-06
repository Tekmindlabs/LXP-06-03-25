import { z } from "zod";
import { useForm as useHookForm, useFieldArray as useHookFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/molecules/form";
import { Input } from "@/components/ui/atoms/input";
import { Button } from "@/components/ui/atoms/button";
import { Textarea } from "@/components/ui/forms/textarea";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/forms/select";
import { api } from "@/utils/api";
import { SystemStatus } from "@prisma/client";

const courseFormSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  level: z.number().min(1),
  credits: z.number().min(0.5),
  programId: z.string().min(1, "Program is required"),
  status: z.nativeEnum(SystemStatus).default(SystemStatus.ACTIVE),
  objectives: z.array(z.string()),
  resources: z.array(z.object({
    type: z.string(),
    requirement: z.string()
  })),
  syllabus: z.record(z.unknown())
});

type CourseFormProps = {
  initialData?: z.infer<typeof courseFormSchema>;
  onSubmit: (data: z.infer<typeof courseFormSchema>) => void;
  isLoading?: boolean;
};

interface Program {
  id: string;
  name: string;
  code: string;
  type: string;
  status: SystemStatus;
}

export const CourseForm = ({ initialData, onSubmit, isLoading }: CourseFormProps) => {
  const { data: programs } = api.program.list.useQuery({
    status: SystemStatus.ACTIVE
  });
  
  const form = useHookForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: initialData || {
      status: SystemStatus.ACTIVE,
      level: 1,
      credits: 1.0,
      objectives: [],
      resources: []
    },
  });

  const objectivesArray = useHookFieldArray({
    control: form.control,
    name: "objectives"
  });

  const resourcesArray = useHookFieldArray({
    control: form.control,
    name: "resources"
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Code</FormLabel>
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
                <FormLabel>Course Name</FormLabel>
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
          name="programId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {programs?.programs.map((program: Program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="credits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credits</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.5" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Course Objectives</h3>
          {objectivesArray.fields.map((field, index) => (
            <FormField
              key={field.id}
              name={`objectives.${index}`}
              control={form.control}
              render={({ field: objectiveField }) => (
                <FormItem>
                  <FormLabel>Objective {index + 1}</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input {...objectiveField} />
                      <Button 
                        type="button"
                        variant="destructive" 
                        size="sm"
                        onClick={() => objectivesArray.remove(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
          <Button 
            type="button" 
            onClick={() => objectivesArray.append("")}
          >
            Add Objective
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Resource Requirements</h3>
          {resourcesArray.fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-2 gap-4">
              <FormField
                name={`resources.${index}.type`}
                control={form.control}
                render={({ field: resourceField }) => (
                  <FormItem>
                    <FormLabel>Resource Type</FormLabel>
                    <FormControl>
                      <Input {...resourceField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={`resources.${index}.requirement`}
                control={form.control}
                render={({ field: requirementField }) => (
                  <FormItem>
                    <FormLabel>Requirement</FormLabel>
                    <FormControl>
                      <Input {...requirementField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button 
            type="button" 
            onClick={() => resourcesArray.append({ type: "", requirement: "" })}
          >
            Add Resource
          </Button>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(SystemStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Course"}
        </Button>
      </form>
    </Form>
  );
};