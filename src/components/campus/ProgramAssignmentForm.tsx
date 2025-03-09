'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Program } from "@prisma/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/forms/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/forms/select";
import { DatePicker } from "@/components/ui/forms/date-picker";
import { useToast } from "@/components/ui/feedback/toast";
import { api } from "@/trpc/react";

// Form schema
const formSchema = z.object({
  programId: z.string({
    required_error: "Please select a program",
  }),
  startDate: z.date({
    required_error: "Please select a start date",
  }),
  endDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProgramAssignmentFormProps {
  campusId: string;
  availablePrograms: Program[];
  selectedProgramId?: string;
  returnUrl: string;
}

export function ProgramAssignmentForm({
  campusId,
  availablePrograms,
  selectedProgramId,
  returnUrl,
}: ProgramAssignmentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programId: selectedProgramId || "",
      startDate: new Date(),
      endDate: undefined,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      // Your submission logic here
      
      toast({
        title: "Success",
        description: "Program assigned successfully",
        variant: "default",
      });
      
      router.push(returnUrl);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign program",
        variant: "default",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Assign Program</CardTitle>
            <CardDescription>
              Select a program to assign to this campus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="programId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePrograms.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    When will this program start at this campus?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (Optional)</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    When will this program end at this campus? Leave blank for indefinite.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              Assign Program
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
} 
