import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Card, Button, Input, Form, FormField, FormItem, FormLabel, FormControl } from "~/components/ui";

type Objective = {
  id: string;
  description: string;
  assessmentCriteria: string;
};

type LearningObjectivesProps = {
  subjectId: string;
  initialObjectives?: Objective[];
};

export const LearningObjectives = ({ subjectId, initialObjectives = [] }: LearningObjectivesProps) => {
  const form = useForm({
    defaultValues: {
      objectives: initialObjectives
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "objectives"
  });

  const addObjective = () => {
    append({ 
      id: Math.random().toString(), 
      description: '', 
      assessmentCriteria: '' 
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Learning Objectives</h3>
      <Form {...form}>
        <form className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border rounded">
              <FormField
                name={`objectives.${index}.description`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objective {index + 1}</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input {...field} placeholder="Enter learning objective" />
                        <Button 
                          type="button"
                          variant="destructive" 
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name={`objectives.${index}.assessmentCriteria`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Criteria</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter assessment criteria" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button type="button" onClick={addObjective}>
            Add Objective
          </Button>
        </form>
      </Form>
    </Card>
  );
}; 