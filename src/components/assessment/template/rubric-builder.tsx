import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Card,
  Input,
  Button,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useToast
} from '@/components/ui';
import { Plus, GripVertical, X } from 'lucide-react';

interface RubricLevel {
  score: number;
  description: string;
}

interface RubricCriteria {
  criteria: string;
  weight: number;
  levels: RubricLevel[];
}

interface RubricBuilderProps {
  value: RubricCriteria[];
  onChange: (value: RubricCriteria[]) => void;
}

export function RubricBuilder({ value, onChange }: RubricBuilderProps) {
  const { toast } = useToast();

  const handleAddCriteria = () => {
    onChange([
      ...value,
      {
        criteria: '',
        weight: 0,
        levels: [
          { score: 0, description: '' },
          { score: 1, description: '' }
        ]
      }
    ]);
  };

  const handleRemoveCriteria = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleCriteriaChange = (index: number, field: keyof RubricCriteria, newValue: string | number) => {
    const updatedValue = [...value];
    updatedValue[index] = {
      ...updatedValue[index],
      [field]: newValue
    };
    onChange(updatedValue);
  };

  const handleLevelChange = (criteriaIndex: number, levelIndex: number, field: keyof RubricLevel, newValue: string | number) => {
    const updatedValue = [...value];
    updatedValue[criteriaIndex].levels[levelIndex] = {
      ...updatedValue[criteriaIndex].levels[levelIndex],
      [field]: newValue
    };
    onChange(updatedValue);
  };

  const handleAddLevel = (criteriaIndex: number) => {
    const updatedValue = [...value];
    const currentLevels = updatedValue[criteriaIndex].levels;
    const nextScore = currentLevels.length > 0 ? Math.max(...currentLevels.map(l => l.score)) + 1 : 0;
    
    updatedValue[criteriaIndex].levels.push({
      score: nextScore,
      description: ''
    });
    onChange(updatedValue);
  };

  const handleRemoveLevel = (criteriaIndex: number, levelIndex: number) => {
    const updatedValue = [...value];
    updatedValue[criteriaIndex].levels.splice(levelIndex, 1);
    onChange(updatedValue);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(value);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="rubric-criteria">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {value.map((criteria, criteriaIndex) => (
                <Draggable
                  key={criteriaIndex}
                  draggableId={`criteria-${criteriaIndex}`}
                  index={criteriaIndex}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          {...provided.dragHandleProps}
                          className="mt-8 cursor-move"
                        >
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <FormItem>
                              <FormLabel>Criteria</FormLabel>
                              <FormControl>
                                <Input
                                  value={criteria.criteria}
                                  onChange={(e) => handleCriteriaChange(criteriaIndex, 'criteria', e.target.value)}
                                  placeholder="Enter criteria"
                                />
                              </FormControl>
                            </FormItem>

                            <FormItem>
                              <FormLabel>Weight (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={criteria.weight}
                                  onChange={(e) => handleCriteriaChange(criteriaIndex, 'weight', Number(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-medium">Performance Levels</h4>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddLevel(criteriaIndex)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Level
                              </Button>
                            </div>

                            <div className="grid gap-2">
                              {criteria.levels.map((level, levelIndex) => (
                                <div
                                  key={levelIndex}
                                  className="grid gap-2 sm:grid-cols-[100px,1fr,auto]"
                                >
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        value={level.score}
                                        onChange={(e) => handleLevelChange(criteriaIndex, levelIndex, 'score', Number(e.target.value))}
                                        placeholder="Score"
                                      />
                                    </FormControl>
                                  </FormItem>

                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        value={level.description}
                                        onChange={(e) => handleLevelChange(criteriaIndex, levelIndex, 'description', e.target.value)}
                                        placeholder="Level description"
                                      />
                                    </FormControl>
                                  </FormItem>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveLevel(criteriaIndex, levelIndex)}
                                    disabled={criteria.levels.length <= 2}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCriteria(criteriaIndex)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        type="button"
        variant="outline"
        onClick={handleAddCriteria}
        className="w-full sm:w-auto"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Criteria
      </Button>
    </div>
  );
} 